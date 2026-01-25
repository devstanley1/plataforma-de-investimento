# Diagrama ER - Banco de Dados

```mermaid
erDiagram
    Users {
        string id PK
        string email UK
        string password_hash
        string name
        string phone
        boolean is_email_verified
        enum kyc_status
        string referral_code_id FK
        datetime created_at
        datetime updated_at
    }

    Wallets {
        string id PK
        string user_id FK
        decimal balance
        string currency
        datetime updated_at
    }

    InvestmentProducts {
        string id PK
        string name
        enum type
        string description
        decimal nominal_rate
        string currency
        decimal min_investment
        int maturity_days
        enum status
        datetime created_at
        datetime updated_at
    }

    Investments {
        string id PK
        string user_id FK
        string product_id FK
        decimal amount
        decimal earned_amount
        datetime start_date
        datetime end_date
        enum status
        datetime created_at
        datetime updated_at
    }

    Transactions {
        string id PK
        string user_id FK
        enum type
        decimal amount
        string currency
        enum status
        string ghostpay_reference
        string description
        datetime created_at
        datetime updated_at
    }

    Referrals {
        string id PK
        string code UK
        string owner_user_id FK
        boolean is_active
        int uses_count
        datetime created_at
        datetime updated_at
    }

    ReferralCommissions {
        string id PK
        string referral_id FK
        string referred_user_id FK
        decimal amount
        decimal percent
        string deposit_id FK
        enum status
        datetime created_at
        datetime settled_at
    }

    Payments {
        string id PK
        string user_id FK
        decimal amount
        string currency
        enum status
        string gateway_reference
        string payment_method
        datetime created_at
        datetime updated_at
    }

    Webhooks {
        string id PK
        string event_type
        json payload_json
        datetime received_at
        datetime processed_at
        enum status
    }

    Users ||--o| Wallets : "has"
    Users ||--o{ Investments : "makes"
    Users ||--o{ Transactions : "performs"
    Users ||--o{ Payments : "makes"
    Users ||--o| Referrals : "owns"
    Users ||--o{ ReferralCommissions : "earns"
    Users }o--|| Referrals : "referred_by"

    InvestmentProducts ||--o{ Investments : "used_in"

    Referrals ||--o{ ReferralCommissions : "generates"
    Referrals }o--o| Users : "refers"

    Investments }o--|| InvestmentProducts : "invests_in"
    Investments }o--|| Users : "belongs_to"

    Transactions }o--|| Users : "belongs_to"

    Payments }o--|| Users : "belongs_to"

    ReferralCommissions }o--|| Referrals : "from"
    ReferralCommissions }o--|| Users : "paid_to"
```

## Descrição das Entidades

### Users
- **id**: Identificador único do usuário (UUID)
- **email**: Email único do usuário
- **password_hash**: Senha criptografada com bcrypt
- **name**: Nome completo do usuário
- **phone**: Telefone (opcional)
- **is_email_verified**: Status de verificação do email
- **kyc_status**: Status da verificação KYC (PENDING, VERIFIED, REJECTED, EXPIRED)
- **referral_code_id**: Código de referral usado no cadastro (opcional)

### Wallets
- **id**: Identificador único da carteira
- **user_id**: Referência ao usuário proprietário
- **balance**: Saldo atual da carteira
- **currency**: Moeda da carteira (padrão: BRL)

### InvestmentProducts
- **id**: Identificador único do produto
- **name**: Nome do produto de investimento
- **type**: Tipo do produto (CDB, LCI, LCA, TESOURO_SELIC, TESOURO_IPCA, TESOURO_PREFIXADO)
- **description**: Descrição do produto
- **nominal_rate**: Taxa nominal anual
- **currency**: Moeda do produto
- **min_investment**: Valor mínimo de investimento
- **maturity_days**: Prazo de vencimento em dias
- **status**: Status do produto (ACTIVE, INACTIVE, SUSPENDED)

### Investments
- **id**: Identificador único do investimento
- **user_id**: Referência ao usuário investidor
- **product_id**: Referência ao produto investido
- **amount**: Valor investido
- **earned_amount**: Valor dos rendimentos
- **start_date**: Data de início do investimento
- **end_date**: Data de vencimento
- **status**: Status do investimento (ACTIVE, MATURED, CANCELLED)

### Transactions
- **id**: Identificador único da transação
- **user_id**: Referência ao usuário
- **type**: Tipo da transação (DEPOSIT, WITHDRAWAL, INVESTMENT, REFUND, COMMISSION)
- **amount**: Valor da transação
- **currency**: Moeda da transação
- **status**: Status da transação (PENDING, COMPLETED, FAILED, CANCELLED)
- **ghostpay_reference**: Referência do Ghostpay (opcional)
- **description**: Descrição da transação

### Referrals
- **id**: Identificador único do referral
- **code**: Código único do referral
- **owner_user_id**: Referência ao usuário proprietário do código
- **is_active**: Status ativo do código
- **uses_count**: Número de usos do código

### ReferralCommissions
- **id**: Identificador único da comissão
- **referral_id**: Referência ao código de referral
- **referred_user_id**: Referência ao usuário que recebe a comissão
- **amount**: Valor da comissão
- **percent**: Percentual da comissão
- **deposit_id**: Referência ao depósito que gerou a comissão
- **status**: Status da comissão (PENDING, SETTLED, CANCELLED)
- **settled_at**: Data de liquidação da comissão

### Payments
- **id**: Identificador único do pagamento
- **user_id**: Referência ao usuário
- **amount**: Valor do pagamento
- **currency**: Moeda do pagamento
- **status**: Status do pagamento (PENDING, COMPLETED, FAILED, CANCELLED, REFUNDED)
- **gateway_reference**: Referência do gateway de pagamento
- **payment_method**: Método de pagamento utilizado

### Webhooks
- **id**: Identificador único do webhook
- **event_type**: Tipo do evento recebido
- **payload_json**: Dados do webhook em JSON
- **received_at**: Data de recebimento
- **processed_at**: Data de processamento
- **status**: Status do processamento (PENDING, PROCESSED, FAILED)

## Relacionamentos

1. **Users ↔ Wallets**: Um usuário tem uma carteira (1:1)
2. **Users ↔ Investments**: Um usuário pode ter vários investimentos (1:N)
3. **Users ↔ Transactions**: Um usuário pode ter várias transações (1:N)
4. **Users ↔ Payments**: Um usuário pode ter vários pagamentos (1:N)
5. **Users ↔ Referrals**: Um usuário pode ter vários códigos de referral (1:N)
6. **Users ↔ ReferralCommissions**: Um usuário pode receber várias comissões (1:N)
7. **InvestmentProducts ↔ Investments**: Um produto pode ser usado em vários investimentos (1:N)
8. **Referrals ↔ ReferralCommissions**: Um código pode gerar várias comissões (1:N)
9. **Referrals ↔ Users**: Um código pode referenciar um usuário (1:1)

## Índices Recomendados

- `Users.email` (único)
- `Referrals.code` (único)
- `Transactions.user_id`
- `Investments.user_id`
- `Payments.user_id`
- `ReferralCommissions.referred_user_id`
- `Webhooks.event_type`
- `Webhooks.received_at`
