// API de teste para diagnosticar conexão com Vizzion
const { handleCors, sendJson } = require('./_utils');

module.exports = async (req, res) => {
    if (handleCors(req, res)) return;

    const publicKey = process.env.VIZZION_PUBLIC_KEY;
    const secretKey = process.env.VIZZION_SECRET_KEY;
    const payoutUrl = process.env.VIZZION_PAYOUT_URL || 'https://api.vizzionpay.com/v1/pix/payout';

    // Diagnóstico 1: Verificar se as credenciais existem
    const diagnostico = {
        timestamp: new Date().toISOString(),
        credenciais: {
            publicKey: publicKey ? `${publicKey.substring(0, 15)}...` : 'NÃO CONFIGURADA',
            secretKey: secretKey ? 'CONFIGURADA' : 'NÃO CONFIGURADA',
            payoutUrl: payoutUrl
        },
        testes: []
    };

    if (!publicKey || !secretKey) {
        diagnostico.erro = 'Credenciais não configuradas no Vercel';
        return sendJson(res, 200, diagnostico);
    }

    // Diagnóstico 2: Testar conexão básica
    try {
        const basicAuth = Buffer.from(`${publicKey}:${secretKey}`).toString('base64');

        const testPayload = {
            identifier: `test-${Date.now()}`,
            amount: 1.00,
            document: '12345678900',
            cpf: '12345678900',
            pixKey: '12345678900',
            pixKeyType: 'cpf',
            client: { name: 'Teste', cpf: '12345678900', document: '12345678900', documentType: 'CPF' }
        };

        console.log('[TEST-VIZZION] Tentando conectar:', payoutUrl);

        const response = await fetch(payoutUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Basic ${basicAuth}`
            },
            body: JSON.stringify(testPayload)
        });

        const responseText = await response.text();

        diagnostico.testes.push({
            tipo: 'Conexão HTTP',
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseText.substring(0, 500) // Primeiros 500 caracteres
        });

        try {
            const jsonResponse = JSON.parse(responseText);
            diagnostico.testes.push({
                tipo: 'Parse JSON',
                sucesso: true,
                resposta: jsonResponse
            });
        } catch (e) {
            diagnostico.testes.push({
                tipo: 'Parse JSON',
                sucesso: false,
                erro: e.message,
                respostaRaw: responseText
            });
        }

    } catch (error) {
        diagnostico.testes.push({
            tipo: 'Erro de Conexão',
            erro: error.message,
            tipo_erro: error.name,
            stack: error.stack
        });
    }

    return sendJson(res, 200, diagnostico);
};
