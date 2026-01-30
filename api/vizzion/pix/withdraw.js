const { handleCors, readJsonBody, sendJson } = require('../../_utils');

function normalizeDocument(value) {
  return String(value || '').replace(/\D/g, '');
}

const { supabase } = require('../../_supabase');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  const method = req.method?.toUpperCase();
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const publicKey = process.env.VIZZION_PUBLIC_KEY;
  const secretKey = process.env.VIZZION_SECRET_KEY;
  const payoutUrl = process.env.VIZZION_PAYOUT_URL || 'https://app.vizzionpay.com/api/v1/gateway/transfers';

  if (!publicKey || !secretKey) {
    return sendJson(res, 500, { message: 'Vizzion Pay não configurada.' });
  }

  const body = await readJsonBody(req);
  const amount = Number(body.amount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return sendJson(res, 400, { message: 'Valor inválido.' });
  }

  const document = normalizeDocument(body.document || body.cpf || body?.client?.cpf);
  if (!document || document.length !== 11) {
    return sendJson(res, 400, { message: 'Documento (CPF) obrigatório.' });
  }

  // Validação da senha de retirada
  const password = body.password;
  if (!password) {
    return sendJson(res, 400, { message: 'Senha de retirada obrigatória.' });
  }

  // Recuperar usuário autenticado pelo token de sessão
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendJson(res, 401, { message: 'Token de autenticação ausente.' });
  }
  const accessToken = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !userData?.user) {
    return sendJson(res, 401, { message: 'Usuário não autenticado.' });
  }
  const userEmail = userData.user.email;

  // Tentar autenticar o usuário usando o e-mail e a senha informada
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: userEmail,
    password: String(password)
  });
  if (loginError || !loginData?.user) {
    return sendJson(res, 401, { message: 'Senha de retirada incorreta.' });
  }

  const pixKey = body.pixKey || document;
  const pixKeyType = body.pixKeyType || 'CPF';

  // Registrar solicitação de saque na tabela withdraw_requests
  const { data: withdrawData, error: withdrawError } = await supabase
    .from('withdraw_requests')
    .insert([
      {
        user_id: userData.user.id,
        amount,
        currency: 'BRL',
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        document,
        status: 'PENDING',
      }
    ])
    .select()
    .single();

  if (withdrawError) {
    return sendJson(res, 500, { message: 'Erro ao registrar solicitação de saque.', error: withdrawError.message });
  }

  return sendJson(res, 201, {
    message: 'Solicitação de saque registrada e aguardando aprovação.',
    withdraw_request: withdrawData
  });
};
