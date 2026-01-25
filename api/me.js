const jwt = require('jsonwebtoken');
const { handleCors, sendJson } = require('./_utils');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

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

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return sendJson(res, 200, { user: payload });
  } catch (e) {
    return sendJson(res, 401, { message: 'Token inválido.' });
  }
};
