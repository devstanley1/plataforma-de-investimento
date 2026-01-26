const { supabase } = require('./_supabase');
const { handleCors, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return sendJson(res, 401, { message: 'Token ausente.' });
  }

  if (!supabase) {
    return sendJson(res, 500, { message: 'Supabase não configurado.' });
  }

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return sendJson(res, 401, { message: 'Token inválido.' });
  }

  const user = {
    id: data.user.id,
    name: data.user.user_metadata?.name || null,
    email: data.user.email
  };

  return sendJson(res, 200, { user });
};
