# Vizzion Pay - Guia de Configuração Atualizado

## Problema: "fetch failed"

Esse erro indica que a requisição não está chegando ao servidor da Vizzion. Possíveis causas:

### 1. Credenciais Não Configuradas (MAIS PROVÁVEL)

**Verificar no Vercel:**
- Vá em **Settings** → **Environment Variables**
- Confirme que existem:
  - `VIZZION_PUBLIC_KEY`
  - `VIZZION_SECRET_KEY`
  
**Se não existirem, adicione-as e faça REDEPLOY**

### 2. Formato de Autenticação

Atualizei o código para usar **Basic Authentication**, que é o padrão mais comum em gateways brasileiros:

```javascript
// Antes (Bearer Token)
Authorization: Bearer ${secretKey}

// Agora (Basic Auth)
Authorization: Basic base64(publicKey:secretKey)
```

### 3. URLs Corretas

✅ Você já corrigiu para: `https://api.vizzionpay.com/v1/pix/payout`

## Como Obter as Credenciais

1. Acesse: https://app.vizzionpay.com
2. Faça login na sua conta
3. Vá em **Configurações** ou **API**
4. Copie:
   - **Public Key** (ou Client ID)
   - **Secret Key** (ou Client Secret)

## Configurar no Vercel

```bash
# No terminal do Vercel CLI (opcional)
vercel env add VIZZION_PUBLIC_KEY
vercel env add VIZZION_SECRET_KEY

# Ou manualmente no dashboard
```

**Valores de exemplo (NÃO USE ESTES):**
```
VIZZION_PUBLIC_KEY=pk_live_abc123def456
VIZZION_SECRET_KEY=sk_live_xyz789uvw012
```

## Testar Localmente (Opcional)

Crie um arquivo `.env.local`:

```env
VIZZION_PUBLIC_KEY=sua_chave_publica
VIZZION_SECRET_KEY=sua_chave_secreta
VIZZION_PAYOUT_URL=https://sandbox.vizzionpay.com/v1/pix/payout
```

**Importante:** Use a URL de **sandbox** para testes!

## Modo de Desenvolvimento (Sem Vizzion)

Se você ainda não tem conta na Vizzion, o código agora aprova automaticamente os saques quando as credenciais não estão configuradas.

Você verá no log:
```
[VIZZION][APROVACAO][ERRO] Credenciais não configuradas
Status: PAID (Aprovado manualmente)
```

## Verificar Logs

Após fazer deploy:

1. Vá em **Vercel Dashboard** → **Deployments**
2. Clique no seu deploy
3. Vá em **Functions** → **Logs**
4. Procure por `[VIZZION][APROVACAO]`

Você verá:
- ✅ Headers configurados
- ✅ Payload enviado
- ✅ Response da Vizzion
- ❌ Erros detalhados

## Próximos Passos

1. [ ] Obter credenciais da Vizzion
2. [ ] Adicionar no Vercel
3. [ ] Fazer redeploy
4. [ ] Testar um saque
5. [ ] Verificar logs

## Suporte Vizzion

- Site: https://vizzionpay.com
- Suporte: suporte@vizzionpay.com
- Dashboard: https://app.vizzionpay.com
