# Documentação da API

## 🔗 Base URL
```
http://localhost:3001
```

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Inclua o token no header:

```
Authorization: Bearer <access_token>
```

## 📚 Endpoints

### Autenticação

#### POST /auth/register
Registrar novo usuário

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "João Silva",
  "phone": "+5511999999999",
  "referralCode": "REF123"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "João Silva",
    "kycStatus": "PENDING"
  },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

#### POST /auth/login
Fazer login

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/refresh
Renovar token de acesso

**Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Usuários

#### GET /users/me
Obter perfil do usuário atual

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "João Silva",
  "phone": "+5511999999999",
  "isEmailVerified": true,
  "kycStatus": "VERIFIED",
  "wallet": {
    "balance": 10000.00,
    "currency": "BRL"
  }
}
```

#### PATCH /users/me
Atualizar perfil

**Body:**
```json
{
  "name": "João Silva Santos",
  "phone": "+5511888888888"
}
```

#### POST /users/kyc/verify
Submeter verificação KYC

**Body:**
```json
{
  "documentNumber": "12345678901",
  "fullName": "João Silva",
  "birthDate": "1990-01-01",
  "email": "user@example.com",
  "phone": "+5511999999999",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234567"
}
```

### Produtos

#### GET /products
Listar produtos de investimento

**Query Parameters:**
- `status` (opcional): ACTIVE, INACTIVE, SUSPENDED

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "CDB Banco XYZ",
    "type": "CDB",
    "description": "CDB com rendimento de 12% ao ano",
    "nominalRate": 0.12,
    "currency": "BRL",
    "minInvestment": 1000.00,
    "maturityDays": 365,
    "status": "ACTIVE"
  }
]
```

#### GET /products/:id
Obter produto específico

#### GET /products/:id/calculate-yield
Calcular rendimento

**Query Parameters:**
- `amount`: Valor do investimento
- `days` (opcional): Período em dias

**Response:**
```json
{
  "product": {
    "id": "uuid",
    "name": "CDB Banco XYZ",
    "type": "CDB",
    "nominalRate": 0.12
  },
  "investment": {
    "amount": 10000,
    "days": 365
  },
  "yield": {
    "grossYield": 1200.00,
    "taxAmount": 270.00,
    "netYield": 930.00,
    "totalAmount": 10930.00,
    "taxRate": 0.225,
    "dailyRate": 0.000329,
    "annualRate": 0.12
  }
}
```

### Investimentos

#### POST /investments
Criar novo investimento

**Body:**
```json
{
  "productId": "uuid",
  "amount": 10000.00
}
```

#### GET /investments
Listar investimentos do usuário

**Query Parameters:**
- `status` (opcional): ACTIVE, MATURED, CANCELLED

#### GET /investments/:id
Obter investimento específico

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
