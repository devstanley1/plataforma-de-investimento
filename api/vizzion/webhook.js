const { readJsonBody, sendJson } = require('../_utils');
const { supabase } = require('../_supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const payload = await readJsonBody(req);
  const expectedToken = process.env.VIZZION_WEBHOOK_TOKEN;

  if (expectedToken && payload?.token !== expectedToken) {
    return sendJson(res, 401, { message: 'Token inválido.' });
  }

  if (supabase) {
    try {
      await supabase.from('webhooks').insert({
        event_type: payload?.event || 'unknown',
        payload_json: payload,
        status: 'RECEIVED'
      });
    } catch (error) {
      return sendJson(res, 500, { message: 'Falha ao registrar webhook.' });
    }
  }

  return sendJson(res, 200, { status: 'ok' });
};
