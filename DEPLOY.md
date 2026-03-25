# Deploy TarjaDOC no Coolify

## 1. Preparar o Banco de Dados (PostgreSQL)

### Opção A: Usar PostgreSQL do Coolify
1. No painel do Coolify, vá em **Databases**
2. Clique em **Add Database** → selecione **PostgreSQL**
3. Anote as credenciais (host, port, user, password, database name)

### Opção B: Usar PostgreSQL da Hostinger
1. Acesse o painel da Hostinger (hPanel)
2. Vá em **Databases** → **PostgreSQL**
3. Crie um banco de dados `tarjadoc`
4. Anote: host, port, user, password

---

## 2. Configurar Variáveis de Ambiente

No Coolify, vá em **Environment Variables** e adicione:

```env
# Banco de Dados
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/tarjadoc

# JWT (gere uma chave segura - mínimo 32 caracteres)
JWT_SECRET=tarjadoc-aqui-cole-uma-chave-segura-grande-32

# Stripe (obtenha no Stripe Dashboard)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SMTP Hostinger)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@tarjadoc.beend.tech
SMTP_PASS=sua-senha-do-email
SMTP_FROM="TarjaDOC" <seu-email@tarjadoc.beend.tech>

# App
NODE_ENV=production
APP_URL=https://tarjadoc.beend.tech
```

---

## 3. Configurar o Deploy no Coolify

1. **Create New App** → selecione **GitHub**
2. Selecione o repositório `canalbackeend/tarjadoc`
3. Configure:
   - **Build Pack**: Select → **Nixpacks** (ou Docker)
   - **Start Command**: `npm run start`

4. Adicione os **Environment Variables** do passo 2

5. Clique em **Deploy**

---

## 4. Inicializar o Banco

Após o primeiro deploy, execute o script de inicialização do banco:

1. No Coolify, vá em **Jobs** → **New Job**
2. Command: `npm run db:init`
3. Variables: adicione as mesmas variáveis de ambiente
4. Execute

---

## 5. Criar Admin Inicial

Conecte ao container (via Terminal no Coolify) e crie o admin:

```bash
npm run db:init
```

Ou manualmente:
```bash
ADMIN_EMAIL=admin@tarjadoc.com ADMIN_PASSWORD=senha123 npm run db:init
```

---

## 6. Configurar Stripe Webhook

1. Acesse [Stripe Dashboard](https://dashboard.stripe.com)
2. Vá em **Developers** → **Webhooks**
3. Clique em **Add endpoint**
4. URL: `https://tarjadoc.beend.tech/api/webhook`
5. Events: selecione `checkout.session.completed` e `customer.subscription.deleted`
6. Copie o **Signing secret** e adicione na variável `STRIPE_WEBHOOK_SECRET`

---

## 7. Configurar Domínio (opcional)

1. No Coolify, vá em **Settings** → **Domains**
2. Adicione: `tarjadoc.beend.tech`
3. Configure o DNS na Hostinger conforme instruções do Coolify

---

## Troubleshooting

### Erro de conexão com banco
- Verifique se `DATABASE_URL` está correta
- Confirme que o PostgreSQL está aceitar conexões externas

### Emails não funcionam
- Verifique credenciais SMTP
- Confirme que a porta 587 está liberada

###Build falha
- Execute `npm run build` localmente para testar
- Verifique se todas as dependências estão no `package.json`
