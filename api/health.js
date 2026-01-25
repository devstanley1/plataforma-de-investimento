const { db, handleCors, sendJson } = require('./_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  try {
    await db.query('SELECT 1');
    return sendJson(res, 200, { status: 'ok' });
  } catch (err) {
    return sendJson(res, 500, { status: 'error', message: 'Banco indisponível.' });
  }
};
