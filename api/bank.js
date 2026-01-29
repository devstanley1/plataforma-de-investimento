const { supabase } = require('./_supabase');
const { handleCors, readJsonBody, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  const method = req.method?.toUpperCase();
  if (method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

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

  const body = await readJsonBody(req);
  // Exemplo de campos: nome, cpfCnpj, banco, agencia, conta, tipoConta, pixKey
  const { nome, cpfCnpj, banco, agencia, conta, tipoConta, pixKey } = body;

  // Salvar dados bancários na tabela profiles (ou crie uma tabela bank_accounts se preferir)
  const { error } = await supabase
    .from('profiles')
    .update({
      bank_name: banco,
      bank_account: conta,
      bank_agency: agencia,
      bank_type: tipoConta,
      bank_pix_key: pixKey,
      bank_holder: nome,
      bank_cpf_cnpj: cpfCnpj
    })
    .eq('id', userId);

  if (error) {
    return sendJson(res, 500, { message: 'Erro ao salvar dados bancários.' });
  }

  return sendJson(res, 200, { message: 'Dados bancários salvos com sucesso.' });
};
