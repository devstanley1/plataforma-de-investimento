const { bcrypt, createToken, db, handleCors, readJsonBody, sendJson } = require('./_utils');

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

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const result = await db.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [name, String(email).toLowerCase(), phone || null, passwordHash]
    );
    const user = result.rows[0];
    const token = createToken(user);
    return sendJson(res, 201, { token, user });
  } catch (err) {
    if (err && err.code === '23505') {
      return sendJson(res, 409, { message: 'Email já cadastrado.' });
    }
    return sendJson(res, 500, { message: 'Erro ao criar conta.' });
  }
};
