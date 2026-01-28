const { handleCors, readJsonBody, sendJson } = require('../_utils');
const { supabase } = require('../_supabase');

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;

  if (req.method === 'GET') {
    return sendJson(res, 200, { status: 'ok' });
  }

  const method = req.method?.toUpperCase();

  if (method !== 'POST' && method !== 'PUT' && method !== 'PATCH') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }

  const payload = await readJsonBody(req);
  const expectedToken = process.env.VIZZION_WEBHOOK_TOKEN;
  const payloadToken = String(payload?.token || '').trim();
  if (expectedToken && expectedToken !== payloadToken) {
    return sendJson(res, 401, { message: 'Token inválido.' });
  }

  if (supabase) {
    try {
      await supabase.from('webhooks').insert({
        event_type: payload?.event || payload?.type || 'unknown',
        payload_json: payload,
        status: 'RECEIVED'
      });
    } catch (error) {
      return sendJson(res, 500, { message: 'Falha ao registrar webhook.' });
    }
  }

  const statusRaw =
    payload?.status ||
    payload?.data?.status ||
    payload?.payment?.status ||
    payload?.data?.payment?.status ||
    payload?.data?.pix?.status ||
    '';
  const eventRaw = payload?.event || payload?.type || '';
  const normalized = `${statusRaw || eventRaw}`.toUpperCase();
  const isPaid = ['PAID', 'PAID_OUT', 'PAIDOUT', 'COMPLETED', 'CONFIRMED', 'APPROVED', 'SUCCESS', 'RECEIVED', 'SETTLED', 'PAGO']
    .some((value) => normalized.includes(value));

  if (supabase && isPaid) {
    const metadata =
      payload?.metadata ||
      payload?.data?.metadata ||
      payload?.pix?.metadata ||
      payload?.data?.pix?.metadata ||
      payload?.payment?.metadata ||
      payload?.data?.payment?.metadata ||
      payload?.data?.client?.metadata ||
      {};

    let userId =
      metadata?.userId ||
      metadata?.user_id ||
      payload?.userId ||
      payload?.user_id ||
      payload?.data?.userId ||
      payload?.data?.user_id ||
      payload?.data?.client?.userId ||
      payload?.data?.client?.user_id ||
      payload?.trackProps?.userId ||
      null;

    // Buscar userId em transaction.identifier ou client.id se não encontrado
    if (!userId) {
      userId = payload?.transaction?.identifier || payload?.client?.id || null;
    }

    const rawAmount =
      payload?.data?.amount?.value ||
      payload?.data?.amount ||
      payload?.amount ||
      payload?.data?.value ||
      payload?.payment?.amount ||
      payload?.data?.payment?.amount ||
      payload?.pix?.amount ||
      payload?.data?.pix?.amount ||
      payload?.data?.paidAmount ||
      payload?.data?.receivedAmount ||
      0;

    const amount = Number(String(rawAmount).replace(',', '.'));
    const reference =
      payload?.data?.id ||
      payload?.id ||
      payload?.payment?.id ||
      payload?.data?.payment?.id ||
      payload?.data?.reference ||
      payload?.data?.identifier ||
      payload?.data?.pix?.identifier ||
      null;

    if (userId && Number.isFinite(amount) && amount > 0) {
      try {
        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('id,balance')
          .eq('user_id', userId)
          .maybeSingle();

        if (walletError && walletError.code !== 'PGRST116') {
          return sendJson(res, 500, { message: 'Falha ao buscar carteira.' });
        }

        const currentBalance = Number(wallet?.balance || 0);
        const newBalance = currentBalance + amount;

        if (wallet?.id) {
          const { error: updateError } = await supabase
            .from('wallets')
            .update({ balance: newBalance, currency: 'BRL' })
            .eq('id', wallet.id);

          if (updateError) {
            return sendJson(res, 500, { message: 'Falha ao atualizar carteira.' });
          }
        } else {
          const { error: insertError } = await supabase
            .from('wallets')
            .insert({ user_id: userId, balance: newBalance, currency: 'BRL' });

          if (insertError) {
            return sendJson(res, 500, { message: 'Falha ao criar carteira.' });
          }
        }

        await supabase.from('payments').insert({
          user_id: userId,
          amount,
          currency: 'BRL',
          status: 'COMPLETED',
          gateway_reference: reference,
          payment_method: 'PIX'
        });

        await supabase.from('transactions').insert({
          user_id: userId,
          type: 'DEPOSIT',
          amount,
          currency: 'BRL',
          status: 'COMPLETED',
          description: 'Depósito PIX confirmado'
        });
      } catch (error) {
        return sendJson(res, 500, { message: 'Falha ao processar webhook.' });
      }
    }
  }

  return sendJson(res, 200, { status: 'ok' });
};
