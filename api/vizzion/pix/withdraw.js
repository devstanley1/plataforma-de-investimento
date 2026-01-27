const { handleCors, readJsonBody, sendJson } = require('../../_utils');

function normalizeDocument(value) {
  return String(value || '').replace(/\D/g, '');
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  const method = req.method?.toUpperCase();
  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const publicKey = process.env.VIZZION_PUBLIC_KEY;
  const secretKey = process.env.VIZZION_SECRET_KEY;
  const payoutUrl = process.env.VIZZION_PAYOUT_URL || 'https://app.vizzionpay.com/api/v1/gateway/pix/send';

  if (!publicKey || !secretKey) {
    return sendJson(res, 500, { message: 'Vizzion Pay não configurada.' });
  }

  const body = await readJsonBody(req);
  const amount = Number(body.amount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return sendJson(res, 400, { message: 'Valor inválido.' });
  }

  const document = normalizeDocument(body.document || body.cpf || body?.client?.cpf);
  if (!document || document.length !== 11) {
    return sendJson(res, 400, { message: 'Documento (CPF) obrigatório.' });
  }

  const identifier = body.identifier || `PIX-OUT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  const pixKey = body.pixKey || document;
  const pixKeyType = body.pixKeyType || 'CPF';

  const payload = {
    identifier,
    amount,
    document,
    cpf: document,
    pixKey,
    pixKeyType,
    client: {
      name: body?.client?.name || 'Investidor Netflix',
      phone: body?.client?.phone || '+55 00 00000-0000',
      email: body?.client?.email || null,
      cpf: document,
      document,
      documentNumber: document,
      documentType: 'CPF'
    },
    metadata: body.metadata || { source: 'site' }
  };

  try {
    const response = await fetch(payoutUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-public-key': publicKey,
        'x-secret-key': secretKey
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return sendJson(res, response.status, {
        message: data?.message || 'Erro ao solicitar retirada.',
        details: data || null
      });
    }

    return sendJson(res, 201, data);
  } catch (error) {
    return sendJson(res, 500, { message: 'Falha ao comunicar com a Vizzion Pay.' });
  }
};
