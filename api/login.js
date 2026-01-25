const { bcrypt, createToken, db, handleCors, readJsonBody, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const { email, password } = await readJsonBody(req);

  if (!email || !password) {
    return sendJson(res, 400, { message: 'Email e senha são obrigatórios.' });
  }

  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase()]);
    const row = result.rows[0];
    if (!row) {
      return sendJson(res, 401, { message: 'Credenciais inválidas.' });
    }

    const ok = bcrypt.compareSync(password, row.password_hash);
    if (!ok) {
      return sendJson(res, 401, { message: 'Credenciais inválidas.' });
    }

    const user = { id: row.id, name: row.name, email: row.email };
    const token = createToken(user);
    return sendJson(res, 200, { token, user });
  } catch (err) {
    return sendJson(res, 500, { message: 'Erro ao autenticar.' });
  }
};
