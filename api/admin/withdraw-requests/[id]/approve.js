const { supabase } = require('../../../_supabase');
const { handleCors, sendJson } = require('../../../_utils');

async function processWithdraw(id) {
  // Buscar a solicitação
  const { data: req, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !req) {
    console.error('[VIZZION][APROVACAO][ERRO] Solicitação não encontrada:', { id, error });
    return { error: error?.message || 'Solicitação não encontrada.' };
  }

  // LOG: dados da solicitação
  console.log('[VIZZION][APROVACAO] Saque aprovado:', { id, req });

  // Aprovar: enviar para VizzionPay
  const publicKey = process.env.VIZZION_PUBLIC_KEY;
  const secretKey = process.env.VIZZION_SECRET_KEY;
  const payoutUrl = process.env.VIZZION_PAYOUT_URL || 'https://app.vizzionpay.com/api/v1/gateway/transfers';
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
    console.log('[VIZZION][APROVACAO] Enviando para VizzionPay:', { payoutUrl, publicKey, payload });
    const response = await fetch(payoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': publicKey,
        'x-secret-key': secretKey
      },
      body: JSON.stringify(payload)
    });
    let responseText = await response.text();
    try {
      vizzion_response = JSON.parse(responseText);
    } catch (parseErr) {
      vizzion_response = { raw: responseText, parseError: parseErr.message };
      console.error('[VIZZION][APROVACAO] Resposta não-JSON da VizzionPay:', responseText);
    }
    console.log('[VIZZION][APROVACAO] Resposta VizzionPay:', vizzion_response);
    if (!response.ok) status = 'FAILED';
  } catch (e) {
    status = 'FAILED';
    vizzion_response = { error: e.message };
    console.error('[VIZZION][APROVACAO] Erro ao enviar para VizzionPay:', e);
  }
  try {
    const { error: updateError } = await supabase
      .from('withdraw_requests')
      .update({ status, vizzion_response })
      .eq('id', id);
    if (updateError) {
      console.error('[VIZZION][APROVACAO][ERRO] Falha ao atualizar status do saque:', { id, updateError });
      return { error: updateError.message };
    }
    console.log('[VIZZION][APROVACAO] Status do saque atualizado com sucesso:', { id, status });
  } catch (e) {
    console.error('[VIZZION][APROVACAO][ERRO] Exceção ao atualizar status do saque:', { id, error: e.message });
    return { error: e.message };
  }
  return { ok: true, status, vizzion_response };
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  const method = req.method?.toUpperCase();
  if (method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }
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
  const result = await processWithdraw(id);
  if (result.error) return sendJson(res, 500, { error: result.error });
  return sendJson(res, 200, { message: 'Saque aprovado e enviado para VizzionPay.', ...result });
};
