# Vizzion Pay - Configuração Correta (Atualizado)

## ✅ Correções Aplicadas

Baseado na **documentação oficial da Vizzion**, o código foi atualizado com:

### 1. URL Correta
- ❌ Antes: `https://api.vizzionpay.com/v1/pix/payout`
- ✅ Agora: `https://app.vizzionpay.com/api/v1/gateway/transfers`

### 2. Headers Corretos
- ❌ Antes: `Authorization: Basic base64(key:secret)`
- ✅ Agora: `x-public-key` e `x-secret-key`

### 3. Payload Correto
```javascript
{
  identifier: "saque-123",
  callbackUrl: "https://seu-site.com/api/vizzion/webhook",
  amount: 100.00,
  discountFeeOfReceiver: false,
  pix: {
    type: "cpf",  // cpf, cnpj, phone, email, random
    key: "12345678900"
  },
  owner: {
    ip: "192.168.1.1",
    name: "Nome do Cliente",  // Sem acentos
    document: {
      type: "cpf",  // ou "cnpj"
      number: "12345678900"
    }
  }
}
```

## ⚠️ Importante: Restrição de IP

A Vizzion **exige que você cadastre o IP** da aplicação nas configurações da conta.

**Problema:** Vercel usa IPs dinâmicos, então a integração direta não funciona.

## Soluções:

### Opção 1: Proxy com IP Fixo (~$5/mês)
Use DigitalOcean, Railway ou similar para criar um proxy com IP fixo.

### Opção 2: Pedir à Vizzion para Remover Restrição
Entre em contato: suporte@vizzionpay.com

### Opção 3: Modo Manual (Atual - Grátis)
O sistema já funciona aprovando saques no painel. Você processa o PIX manualmente.

## Variáveis de Ambiente no Vercel

```
VIZZION_PUBLIC_KEY=sua_chave_publica
VIZZION_SECRET_KEY=sua_chave_secreta
VIZZION_WEBHOOK_URL=https://seu-site.vercel.app/api/vizzion/webhook
```

## Status de Resposta

A Vizzion retorna:
- `PENDING` - Aguardando processamento
- `PROCESSING` - Em processamento
- `COMPLETED` - Concluído ✅
- `CANCELED` - Cancelado/Falhou ❌

O código já trata todos esses status automaticamente.

## Próximos Passos

1. ✅ Código atualizado com formato correto
2. ⏳ Cadastrar IP na Vizzion (ou usar proxy)
3. ⏳ Testar integração
4. ⏳ Verificar webhook funcionando

## Documentação Oficial

https://app.vizzionpay.com/docs
