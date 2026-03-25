# Deploy TarjaDOC

## Variáveis de Ambiente Obrigatórias

No Coolify, adicione estas variáveis:

```env
# Banco (use a URL interna do PostgreSQL do Coolify)
DATABASE_URL=postgres://postgres:SUA_SENHA@HOST:5432/tarjadoc

# JWT (gere uma chave segura)
JWT_SECRET=cole-uma-chave-muito-segura-aqui-minimo-32-caracteres

# Stripe (obtenha em stripe.com)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email SMTP Hostinger
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@seudominio.com
SMTP_PASS=sua-senha
SMTP_FROM="TarjaDOC" <seu-email@seudominio.com>

# App
NODE_ENV=production
APP_URL=https://seudominio.com
PORT=3000

# Admin (opcional)
ADMIN_EMAIL=adm@tarjadoc.tech
ADMIN_PASSWORD=@Fbtv!9061!?
```

## Deploy no Coolify

1. New App → GitHub → `canalbackeend/tarjadoc`
2. Build Pack: **Nixpacks** (NodeJS)
3. Start Command: `npm run start`
4. Adicione as variáveis acima
5. Deploy!

## Criar Banco

1. No terminal do PostgreSQL Coolify:
```bash
psql -U postgres -c "CREATE DATABASE tarjadoc;"
```

O app cria as tabelas automaticamente no primeiro启动!

## Criar Admin

Se não criar automaticamente, defina:
```
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=sua-senha
```
E reinicie o app.
