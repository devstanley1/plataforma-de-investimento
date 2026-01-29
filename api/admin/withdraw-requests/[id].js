const { supabase } = require('../../_supabase');
const { handleCors, sendJson, readJsonBody } = require('../../_utils');

async function processWithdraw(id, approve, reason = null) {
  // Buscar a solicitação
  const { data: req, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !req) return { error: error?.message || 'Solicitação não encontrada.' };

  if (!approve) {
    // Reprovar
    const { error: updateError } = await supabase
      .from('withdraw_requests')
      .update({ status: 'REJECTED', admin_reason: reason })
      .eq('id', id);
    if (updateError) return { error: updateError.message };
    return { ok: true };
  }

  // Aprovar: enviar para VizzionPay
  const publicKey = process.env.VIZZION_PUBLIC_KEY;
  const secretKey = process.env.VIZZION_SECRET_KEY;
  const payoutUrl = process.env.VIZZION_PAYOUT_URL || 'https://app.vizzionpay.com/api/v1/gateway/pix/send';
  const payload = {
    identifier: req.id,
    amount: req.amount,
    document: req.document,
    cpf: req.document,
    pixKey: req.pix_key,
    pixKeyType: req.pix_key_type,
    client: { name: 'Investidor', cpf: req.document, document: req.document, documentType: 'CPF' },
    metadata: { source: 'admin' }
  };
  let vizzion_response = null;
  let status = 'PAID';
  try {
    const response = await fetch(payoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': publicKey,
        'x-secret-key': secretKey
      },
      body: JSON.stringify(payload)
    });
    vizzion_response = await response.json();
    if (!response.ok) status = 'FAILED';
  } catch (e) {
    status = 'FAILED';
    vizzion_response = { error: e.message };
  }
  await supabase
    .from('withdraw_requests')
    .update({ status, vizzion_response })
    .eq('id', id);
  return { ok: true, status, vizzion_response };
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  const method = req.method?.toUpperCase();
  const id = req.url.split('/').slice(-2)[0];
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendJson(res, 401, { message: 'Token de autenticação ausente.' });
  }
  const accessToken = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return sendJson(res, 401, { message: 'Usuário não autenticado.' });
  }
  const userId = userData.user.id;
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single();
  if (profileError || !profile?.is_admin) {
    return sendJson(res, 403, { message: 'Acesso restrito a administradores.' });
  }
  if (method === 'POST' && req.url.endsWith('/approve')) {
    const result = await processWithdraw(id, true);
    if (result.error) return sendJson(res, 500, { error: result.error });
    return sendJson(res, 200, { message: 'Saque aprovado e enviado para VizzionPay.', ...result });
  }
  if (method === 'POST' && req.url.endsWith('/reject')) {
    const body = await readJsonBody(req);
    const result = await processWithdraw(id, false, body.reason);
    if (result.error) return sendJson(res, 500, { error: result.error });
    return sendJson(res, 200, { message: 'Saque reprovado.', ...result });
  }
  return sendJson(res, 405, { message: 'Método não permitido.' });
};
