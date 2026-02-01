const { supabase } = require('../../../_supabase');
const { handleCors, sendJson } = require('../../../_utils');

async function processWithdraw(id) {
  // Buscar a solicitação
  const { data: req, error } = await supabase
    .from('withdraw_requests')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !req) {
    console.error('[VIZZION][APROVACAO][ERRO] Solicitação não encontrada:', { id, error });
    return { error: error?.message || 'Solicitação não encontrada.' };
  }

  // Buscar perfil do usuário solicitante para obter nome e telefone
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('name, phone')
    .eq('id', req.user_id)
    .single();

  const clientName = userProfile?.name || 'Investidor';
  const clientPhone = userProfile?.phone || '00000000000';

  // LOG: dados da solicitação
  console.log('[VIZZION][APROVACAO] Saque aprovado:', { id, req });

  // Aprovar: enviar para VizzionPay
  const publicKey = process.env.VIZZION_PUBLIC_KEY;
  const secretKey = process.env.VIZZION_SECRET_KEY;
  const callbackUrl = process.env.VIZZION_WEBHOOK_URL || 'https://netflix-investimento.vercel.app/api/vizzion/webhook';

  // URL CORRETA conforme documentação oficial
  const payoutUrl = process.env.VIZZION_PAYOUT_URL || 'https://app.vizzionpay.com/api/v1/gateway/transfers';

  // Verificar se as credenciais estão configuradas
  if (!publicKey || !secretKey) {
    console.error('[VIZZION][APROVACAO][ERRO] Credenciais não configuradas');
    vizzion_response = {
      error: 'Credenciais Vizzion não configuradas. Configure VIZZION_PUBLIC_KEY e VIZZION_SECRET_KEY no Vercel.',
      status: 'MANUAL_APPROVAL_REQUIRED'
    };
    status = 'PAID'; // Aprovar manualmente se não houver credenciais

    // Atualizar banco
    await supabase
      .from('withdraw_requests')
      .update({ status, vizzion_response })
      .eq('id', id);

    return { ok: true, status, vizzion_response, warning: 'Aprovado manualmente - Vizzion não configurada' };
  }

  // Usar o valor líquido se existir, senão o valor bruto (compatibilidade retroativa)
  const finalAmount = req.net_amount ? Number(req.net_amount) : Number(req.amount);

  // Payload conforme documentação oficial da Vizzion
  const payload = {
    identifier: `${req.id}-${Date.now()}`,
    callbackUrl: callbackUrl,
    amount: finalAmount,
    discountFeeOfReceiver: false, // Você paga a taxa, não o recebedor
    pix: {
      type: (req.pix_key_type || 'cpf').toLowerCase(), // cpf, cnpj, phone, email, random
      key: req.pix_key
    },
    owner: {
      ip: '192.168.1.1', // IP do usuário (pode ser fixo ou dinâmico)
      name: clientName.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), // Remove acentos
      document: {
        type: req.document.length === 11 ? 'cpf' : 'cnpj',
        number: req.document
      }
    }
  };

  let vizzion_response = null;
  let status = 'PAID';
  try {
    console.log('[VIZZION][APROVACAO] Enviando para VizzionPay:', {
      payoutUrl,
      publicKey: publicKey ? `${publicKey.substring(0, 10)}...` : 'MISSING',
      secretKey: secretKey ? 'CONFIGURED' : 'MISSING',
      payload
    });

    // Adicionar timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

    try {
      const response = await fetch(payoutUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Headers corretos conforme documentação
          'x-public-key': publicKey,
          'x-secret-key': secretKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let responseText = await response.text();
      console.log('[VIZZION][APROVACAO] Response Status:', response.status, response.statusText);
      console.log('[VIZZION][APROVACAO] Response Text:', responseText);

      try {
        vizzion_response = JSON.parse(responseText);
      } catch (parseErr) {
        vizzion_response = {
          raw: responseText,
          httpStatus: response.status,
          httpStatusText: response.statusText,
          parseError: parseErr.message
        };
        console.error('[VIZZION][APROVACAO] Resposta não-JSON da VizzionPay:', {
          responseText,
          status: response.status,
          statusText: response.statusText
        });
      }
      console.log('[VIZZION][APROVACAO] Resposta VizzionPay:', vizzion_response);

      // Verificar status do withdraw na resposta
      if (vizzion_response?.withdraw?.status === 'COMPLETED') {
        status = 'PAID';
      } else if (vizzion_response?.withdraw?.status === 'CANCELED') {
        status = 'FAILED';
      } else if (vizzion_response?.withdraw?.status === 'PENDING' || vizzion_response?.withdraw?.status === 'PROCESSING') {
        status = 'PROCESSING';
      } else if (!response.ok) {
        status = 'FAILED';
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (e) {
    status = 'FAILED';
    vizzion_response = {
      error: e.message,
      errorType: e.name,
      errorStack: e.stack,
      timestamp: new Date().toISOString()
    };
    console.error('[VIZZION][APROVACAO] Erro ao enviar para VizzionPay:', {
      error: e.message,
      type: e.name,
      stack: e.stack
    });
  }
  try {
    const { error: updateError } = await supabase
      .from('withdraw_requests')
      .update({ status, vizzion_response })
      .eq('id', id);
    if (updateError) {
      console.error('[VIZZION][APROVACAO][ERRO] Falha ao atualizar status do saque:', { id, updateError });
      return { error: updateError.message };
    }
    console.log('[VIZZION][APROVACAO] Status do saque atualizado com sucesso:', { id, status });
  } catch (e) {
    console.error('[VIZZION][APROVACAO][ERRO] Exceção ao atualizar status do saque:', { id, error: e.message });
    return { error: e.message };
  }
  return { ok: true, status, vizzion_response };
}

module.exports = async (req, res) => {
  if (handleCors(req, res)) return;
  const method = req.method?.toUpperCase();
  if (method !== 'POST') {
    return sendJson(res, 405, { message: 'Método não permitido.' });
  }
  const id = req.url.split('/').slice(-2)[0];
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
  const result = await processWithdraw(id);
  if (result.error) return sendJson(res, 500, { error: result.error });
  return sendJson(res, 200, { message: 'Saque aprovado e enviado para VizzionPay.', ...result });
};
