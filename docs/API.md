# Documentação da API

## 🔗 Base URL
As funções ficam em `/api` (Vercel Functions).

## 🔐 Autenticação
Autenticação é gerida pelo Supabase Auth. Use o `access_token` retornado pelo Supabase no header:

```
Authorization: Bearer <access_token>
```

## 📚 Endpoints

### GET /api/health
Verifica se a API está ativa.

**Response:**
```json
{ "status": "ok" }
```

### POST /api/register
Cria uma conta via Supabase Auth.

**Body:**
```json
{
  "name": "João Silva",
  "email": "user@example.com",
  "password": "password123",
  "phone": "+5511999999999"
}
```

**Response:**
```json
{
  "token": "access_token_ou_null",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "user@example.com"
  }
}
```

### POST /api/login
Autentica um usuário via Supabase Auth.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "access_token_ou_null",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "user@example.com"
  }
}
```

### GET /api/me
Retorna os dados do usuário autenticado.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "user@example.com"
  }
}
```

#### GET /investments/portfolio/summary
Obter resumo da carteira

**Response:**
```json
{
  "summary": {
    "totalInvested": 50000.00,
    "totalEarned": 2500.00,
    "totalValue": 52500.00,
    "activeInvestments": 3,
    "maturedInvestments": 2,
    "totalInvestments": 5
  },
  "portfolioByType": {
    "CDB": {
      "count": 2,
      "totalAmount": 30000.00,
      "totalEarned": 1500.00
    }
  }
}
```

### Transações

#### GET /payments/transactions
Listar transações do usuário

**Query Parameters:**
- `type` (opcional): DEPOSIT, WITHDRAWAL, INVESTMENT, REFUND, COMMISSION
- `status` (opcional): PENDING, COMPLETED, FAILED, CANCELLED

### Pagamentos

#### POST /payments/deposit
Criar depósito

**Body:**
```json
{
  "amount": 1000.00,
  "paymentMethod": "PIX"
}
```

#### POST /payments/withdraw
Criar saque

**Body:**
```json
{
  "amount": 500.00,
  "bankAccount": {
    "bankCode": "001",
    "accountNumber": "12345",
    "agency": "1234",
    "accountType": "CHECKING"
  }
}
```

#### GET /payments/deposit-methods
Listar métodos de depósito

**Response:**
```json
[
  {
    "id": "PIX",
    "name": "PIX",
    "description": "Pagamento instantâneo via PIX",
    "minAmount": 10,
    "maxAmount": 10000,
    "fee": 0,
    "processingTime": "Instant"
  }
]
```

### Referrals

#### POST /referrals/create-code
Criar código de referral

**Body:**
```json
{
  "code": "REF123"
}
```

#### GET /referrals/my-codes
Listar códigos do usuário

#### GET /referrals/commissions
Listar comissões

#### GET /referrals/stats
Obter estatísticas de referral

**Response:**
```json
{
  "totalCodes": 2,
  "totalUses": 5,
  "totalCommissions": 250.00,
  "pendingCommissions": 1,
  "referrals": [
    {
      "code": "REF123",
      "usesCount": 3,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Webhooks

#### POST /webhooks/ghostpay
Endpoint para webhooks do Ghostpay

**Headers:**
```
X-Ghostpay-Signature: signature
Content-Type: application/json
```

**Body:**
```json
{
  "event": "payment.completed",
  "data": {
    "id": "payment_id",
    "reference": "internal_reference",
    "amount": 1000.00,
    "status": "completed"
  }
}
```

## 📊 Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Dados inválidos
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `409` - Conflito
- `422` - Erro de validação
- `500` - Erro interno do servidor

## 🔍 Filtros e Paginação

### Paginação
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

### Filtros de Data
- `createdAt[gte]`: Data maior ou igual
- `createdAt[lte]`: Data menor ou igual
- `createdAt[between]`: Entre duas datas

### Ordenação
- `sort`: Campo para ordenação
- `order`: ASC ou DESC

## 🚨 Tratamento de Erros

### Formato de Erro
```json
{
  "error": "ValidationError",
  "message": "Dados inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email é obrigatório"
    }
  ]
}
```

### Tipos de Erro
- `ValidationError`: Erro de validação
- `AuthenticationError`: Erro de autenticação
- `AuthorizationError`: Erro de autorização
- `NotFoundError`: Recurso não encontrado
- `ConflictError`: Conflito de dados
- `InternalError`: Erro interno

## 🔒 Rate Limiting

- **Limite:** 100 requests por minuto
- **Headers de resposta:**
  - `X-RateLimit-Limit`: Limite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## 📝 Logs e Monitoramento

### Logs Estruturados
```json
{
  "timestamp": "2024-01-01T00:00:00Z",
  "level": "info",
  "message": "User logged in",
  "userId": "uuid",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

### Métricas Disponíveis
- Requests por segundo
- Tempo de resposta
- Taxa de erro
- Uso de memória
- Conexões de banco
