# Configuração DNS para GitHub Pages

## ⚠️ IMPORTANTE: Limitação do GitHub Pages com Next.js

GitHub Pages serve apenas arquivos estáticos. Para Next.js funcionar, precisamos:
1. Fazer export estático (tem limitações)
2. OU usar Vercel/Netlify (recomendado - suporte nativo ao Next.js)

## 📋 Configuração DNS no Cloudflare

### 1. No Cloudflare (tela que você está vendo):

**Mantenha os registros A atuais** (os 4 registros A com os IPs 185.199.xxx.xxx) - esses são os IPs do GitHub Pages.

**Ações necessárias:**
- ✅ Deixe os 4 registros A com Proxy **DESLIGADO** (DNS only - nuvem cinza)
- ✅ O registro CNAME `www` deve apontar para: `Ruhancpereira.github.io` (com proxy DESLIGADO)
- ✅ Os registros NS devem permanecer como estão (DNS only)

### 2. Registros DNS corretos para GitHub Pages:

```
Tipo: A
Nome: @ (ou rpdesenv.com.br)
Conteúdo: 185.199.108.153
Proxy: DNS only (desligado - nuvem cinza)
TTL: Auto

Tipo: A
Nome: @
Conteúdo: 185.199.109.153
Proxy: DNS only

Tipo: A
Nome: @
Conteúdo: 185.199.110.153
Proxy: DNS only

Tipo: A
Nome: @
Conteúdo: 185.199.111.153
Proxy: DNS only

Tipo: CNAME
Nome: www
Conteúdo: Ruhancpereira.github.io
Proxy: DNS only
```

### 3. No GitHub Pages:

1. Vá em Settings > Pages do seu repositório
2. Em "Source", selecione a branch `main` e pasta `/ (root)`
3. Em "Custom domain", adicione: `rpdesenv.com.br`
4. Marque "Enforce HTTPS"

## 🔄 Alternativa Recomendada: Vercel

Para Next.js, Vercel é muito mais fácil e tem suporte nativo:

1. Acesse https://vercel.com
2. Conecte seu repositório GitHub
3. Configure o domínio personalizado
4. Vercel gerencia automaticamente o build e deploy

## 📝 Nota sobre DNS

Os IPs que você viu (13.248.243.5 e 76.223.105.230) são da GoDaddy porque os nameservers ainda estão apontando para lá. Após configurar no Cloudflare, você precisa:

1. Mudar os nameservers na GoDaddy para os do Cloudflare
2. Cloudflare fornecerá novos nameservers (algo como ns1.cloudflare.com)

