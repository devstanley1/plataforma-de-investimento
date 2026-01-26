const { supabase } = require('./_supabase');
const { handleCors, readJsonBody, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const { email, password } = await readJsonBody(req);

  if (!email || !password) {
    return sendJson(res, 400, { message: 'Email e senha são obrigatórios.' });
  }

  if (!supabase) {
    return sendJson(res, 500, { message: 'Supabase não configurado.' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email).toLowerCase(),
    password: String(password)
  });

  if (error || !data?.user) {
    return sendJson(res, 401, { message: 'Credenciais inválidas.' });
  }

  const user = {
    id: data.user.id,
    name: data.user.user_metadata?.name || null,
    email: data.user.email
  };

  return sendJson(res, 200, { token: data.session?.access_token || null, user });
};
