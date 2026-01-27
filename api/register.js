const { supabase } = require('./_supabase');
const { handleCors, readJsonBody, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const { name, email, password, phone } = await readJsonBody(req);

  if (!name || !email || !password) {
    return sendJson(res, 400, { message: 'Nome, email e senha são obrigatórios.' });
  }

  if (password.length < 6) {
    return sendJson(res, 400, { message: 'Senha deve ter pelo menos 6 caracteres.' });
  }

  if (!supabase) {
    return sendJson(res, 500, { message: 'Supabase não configurado.' });
  }

  const referralCode = `CONV-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  const { data, error } = await supabase.auth.signUp({
    email: String(email).toLowerCase(),
    password: String(password),
    options: {
      data: {
        name: String(name).trim(),
        phone: phone ? String(phone).trim() : null,
        referral_code: referralCode
      }
    }
  });

  if (error) {
    if (String(error.message || '').toLowerCase().includes('already')) {
      return sendJson(res, 409, { message: 'Email já cadastrado.' });
    }
    return sendJson(res, 500, { message: 'Erro ao criar conta.' });
  }

  const user = data.user
    ? {
        id: data.user.id,
        name: data.user.user_metadata?.name || null,
        email: data.user.email
      }
    : null;

  return sendJson(res, 201, { token: data.session?.access_token || null, user });
};
