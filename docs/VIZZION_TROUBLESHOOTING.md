# Troubleshooting: Erro "fetch failed" da Vizzion

## Erro Atual
```json
{
  "error": "fetch failed"
}
```

## Possíveis Causas

### 1. Credenciais Não Configuradas ⚠️
**Mais Provável**

As variáveis de ambiente não estão configuradas no Vercel.

**Solução:**
1. Acesse: **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Adicione:
   ```
   VIZZION_PUBLIC_KEY=sua_chave_aqui
   VIZZION_SECRET_KEY=sua_chave_aqui
   ```
3. **Redeploy** o projeto

### 2. Problema de Rede/DNS
O servidor Vercel não consegue alcançar `api.vizzionpay.com`

**Verificar:**
- A Vizzion está online?
- Há firewall bloqueando?

### 3. URL Incorreta
Mesmo com a correção, a URL pode estar errada.

**URLs Oficiais da Vizzion:**
- Produção: `https://api.vizzionpay.com/v1/pix/payout`
- Sandbox: `https://sandbox.vizzionpay.com/v1/pix/payout`

### 4. Certificado SSL
Problema com certificado HTTPS.

## Solução Temporária: Modo Manual

Enquanto não resolve a integração com Vizzion, você pode aprovar saques manualmente.

Adicione esta variável de ambiente:
```
VIZZION_MOCK_MODE=true
```

Ou edite o código para forçar aprovação:

```javascript
// Em approve.js, linha ~48
status = 'PAID';
vizzion_response = { 
  message: 'Aprovado manualmente - Vizzion em configuração',
  manual: true 
};
```

## Verificar Logs Detalhados

Após o próximo deploy, os logs mostrarão:

```
[VIZZION][APROVACAO] Enviando para VizzionPay: { 
  payoutUrl: '...', 
  publicKey: 'abc123...', 
  secretKey: 'CONFIGURED' 
}
[VIZZION][APROVACAO] Response Status: 200 OK
[VIZZION][APROVACAO] Response Text: {...}
```

Isso ajudará a identificar o problema exato.

## Próximos Passos

1. ✅ URLs corrigidas (você já fez)
2. ⏳ Configurar credenciais no Vercel
3. ⏳ Fazer redeploy
4. ⏳ Testar novamente
5. ⏳ Verificar logs no Vercel

## Contato Vizzion

Se o problema persistir:
- Documentação: https://docs.vizzionpay.com
- Suporte: suporte@vizzionpay.com
- Verifique se sua conta está ativa
