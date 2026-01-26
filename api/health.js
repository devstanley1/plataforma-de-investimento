const { supabase, SUPABASE_ANON_KEY, SUPABASE_URL } = require('./_supabase');
const { handleCors, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return sendJson(res, 500, { status: 'error', message: 'Supabase não configurado.' });
  }

  if (!supabase) {
    return sendJson(res, 500, { status: 'error', message: 'Cliente Supabase indisponível.' });
  }

  return sendJson(res, 200, { status: 'ok' });
};
