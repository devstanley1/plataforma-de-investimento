const { supabase } = require('../_supabase');
const { handleCors, sendJson } = require('../_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
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
  // Listar solicitações pendentes
  const { data, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true });
  if (error) {
    return sendJson(res, 500, { error: error.message });
  }
  return sendJson(res, 200, { data });
};
