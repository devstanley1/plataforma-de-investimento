# Configuração da Vizzion Pay - Guia Completo

## Problema Atual

Erro: `"NOT_FOUND"` com status 404

**Causa**: A URL da API da Vizzion está incorreta ou as variáveis de ambiente não estão configuradas.

## Solução

### 1. Configurar Variáveis de Ambiente no Vercel

Acesse: **Vercel Dashboard** → **Seu Projeto** → **Settings** → **Environment Variables**

Adicione as seguintes variáveis:

```
VIZZION_PUBLIC_KEY=sua_chave_publica_aqui
VIZZION_SECRET_KEY=sua_chave_secreta_aqui
VIZZION_PAYOUT_URL=https://api.vizzionpay.com/v1/pix/payout
VIZZION_WEBHOOK_TOKEN=seu_token_webhook_aqui
```

### 2. URLs Corretas da Vizzion

**Produção:**
- Payout (Saques): `https://api.vizzionpay.com/v1/pix/payout`
- Recebimento: `https://api.vizzionpay.com/v1/pix/receive`

**Sandbox/Teste:**
- Payout: `https://sandbox.vizzionpay.com/v1/pix/payout`
- Recebimento: `https://sandbox.vizzionpay.com/v1/pix/receive`

### 3. Obter Credenciais

1. Acesse o painel da Vizzion Pay
2. Vá em **Configurações** → **API Keys**
3. Copie:
   - Public Key
   - Secret Key
   - Webhook Token

### 4. Testar Configuração

Após configurar as variáveis:

1. Faça um **Redeploy** no Vercel
2. Tente aprovar um saque de teste
3. Verifique os logs no Vercel para confirmar

## Modo de Teste (Sem Vizzion)

Se você ainda não tem credenciais da Vizzion, pode desabilitar temporariamente a integração:

### Opção 1: Aprovar Manualmente

Edite `api/admin/withdraw-requests/[id]/approve.js` e comente a chamada da Vizzion:

```javascript
// Comentar linhas 49-85 (chamada da Vizzion)
// Forçar status PAID
status = 'PAID';
vizzion_response = { message: 'Aprovado manualmente (modo teste)' };
```

### Opção 2: Usar Mock

Adicione esta variável de ambiente:

```
VIZZION_MOCK_MODE=true
```

E o código já detectará e simulará aprovação automática.

## Verificar Logs

No Vercel, vá em **Deployments** → **Seu Deploy** → **Functions** → **Logs**

Procure por:
```
[VIZZION][APROVACAO] Enviando para VizzionPay
```

Isso mostrará a URL e payload sendo enviados.

## Contato Vizzion

Se precisar de suporte:
- Site: https://vizzionpay.com
- Documentação: https://docs.vizzionpay.com
- Suporte: suporte@vizzionpay.com
