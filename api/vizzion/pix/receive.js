const { handleCors, readJsonBody, sendJson } = require('../../_utils');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const publicKey = process.env.VIZZION_PUBLIC_KEY;
  const secretKey = process.env.VIZZION_SECRET_KEY;
  const callbackUrl = process.env.VIZZION_WEBHOOK_URL;

  if (!publicKey || !secretKey) {
    return sendJson(res, 500, { message: 'Vizzion Pay não configurada.' });
  }

  const body = await readJsonBody(req);
  const amount = Number(body.amount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return sendJson(res, 400, { message: 'Valor inválido.' });
  }

  if (!body?.client?.name || !body?.client?.phone) {
    return sendJson(res, 400, { message: 'Nome e telefone são obrigatórios.' });
  }

  const document = String(body.document || body.cpf || body?.client?.cpf || '').replace(/\D/g, '');
  if (!document || document.length !== 11) {
    return sendJson(res, 400, { message: 'Documento (CPF) obrigatório.' });
  }

  const identifier = body.identifier || `PIX-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();

  const payload = {
    identifier,
    amount,
    document,
    cpf: document,
    documentType: 'CPF',
    documentNumber: document,
    client: {
      name: body.client.name,
      phone: body.client.phone,
      email: body.client.email || null,
      cpf: document,
      document,
      documentType: 'CPF',
      documentNumber: document
    },
    metadata: body.metadata || { source: 'site' },
  };

  if (callbackUrl) {
    payload.callbackUrl = callbackUrl;
  }

  try {
    const response = await fetch('https://app.vizzionpay.com/api/v1/gateway/pix/receive', {
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
        message: data?.message || 'Erro ao criar cobrança PIX.',
        details: data || null
      });
    }

    if (supabase) {
      const metadata = payload?.metadata || {};
      const userId = metadata?.userId || metadata?.user_id || null;
      if (userId) {
        await supabase.from('payments').insert({
          user_id: userId,
          amount,
          currency: 'BRL',
          status: 'PENDING',
          gateway_reference: identifier,
          payment_method: 'PIX'
        });

        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'DEPOSIT',
          amount,
          currency: 'BRL',
          status: 'PENDING',
          description: 'Depósito PIX criado'
        });
      }
    }

    return sendJson(res, 201, data);
  } catch (error) {
    return sendJson(res, 500, {
      message: 'Falha ao comunicar com a Vizzion Pay.',
      details: error?.message || 'Erro de rede'
    });
  }
};
