# 🚀 Guia de Deploy no Vercel (Gratuito)

## ✅ O Vercel é 100% Gratuito para seu caso!

O plano Hobby (gratuito) do Vercel oferece:
- ✅ Hospedagem ilimitada
- ✅ Domínio personalizado gratuito
- ✅ HTTPS automático
- ✅ Deploy automático do GitHub
- ✅ Suporte nativo ao Next.js
- ✅ CDN global

## 📋 Passo a Passo

### 1. Criar conta no Vercel

1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel a acessar seus repositórios

### 2. Importar seu repositório

1. No dashboard do Vercel, clique em "Add New..." > "Project"
2. Encontre o repositório `rpdesenv` e clique em "Import"
3. O Vercel detectará automaticamente que é Next.js
4. **Não precisa alterar nenhuma configuração!**
5. Clique em "Deploy"

### 3. Aguardar o primeiro deploy

- O Vercel fará o build automaticamente
- Em 2-3 minutos seu site estará online
- Você receberá uma URL tipo: `rpdesenv-xxx.vercel.app`

### 4. Configurar domínio personalizado

1. No dashboard do projeto, vá em **Settings** > **Domains**
2. Clique em **Add Domain**
3. Digite: `rpdesenv.com.br`
4. Clique em **Add**
5. O Vercel mostrará as instruções de DNS

### 5. Configurar DNS no Cloudflare

O Vercel fornecerá um registro CNAME. No Cloudflare, você precisa:

#### Opção 1: Domínio raiz (rpdesenv.com.br)
```
Tipo: A
Nome: @ (ou rpdesenv.com.br)
Conteúdo: 76.76.21.21
Proxy: DNS only (desligado)
TTL: Auto
```

E também:
```
Tipo: A
Nome: @
Conteúdo: 76.223.126.88
Proxy: DNS only
TTL: Auto
```

#### Opção 2: Apenas www (mais simples)
```
Tipo: CNAME
Nome: www
Conteúdo: cname.vercel-dns.com
Proxy: DNS only (desligado)
TTL: Auto
```

**Importante:** O Vercel mostrará os valores exatos após adicionar o domínio!

### 6. Aguardar propagação DNS

- Pode levar de alguns minutos a 48 horas
- Normalmente funciona em 5-30 minutos
- O Vercel verificará automaticamente quando estiver pronto

### 7. HTTPS Automático

- O Vercel configura HTTPS automaticamente
- Não precisa fazer nada!
- Em alguns minutos após o DNS propagar, o HTTPS estará ativo

## 🔄 Deploy Automático

Após a configuração inicial:
- Toda vez que você fizer `git push` para o GitHub
- O Vercel detecta automaticamente
- Faz build e deploy em 2-3 minutos
- **Tudo automático!**

## 📝 Resumo

1. ✅ Vercel = 100% gratuito
2. ✅ Domínio personalizado = gratuito
3. ✅ HTTPS = automático e gratuito
4. ✅ Deploy = automático a cada push
5. ✅ Next.js = suporte nativo perfeito

## 🎯 Vantagens sobre GitHub Pages

- ✅ Suporte completo ao Next.js (SSR, API routes, etc.)
- ✅ Deploy mais rápido
- ✅ Melhor performance (Edge Network)
- ✅ Configuração mais simples
- ✅ Preview deployments para cada PR

## ❓ Precisa de ajuda?

Se tiver alguma dúvida durante o processo, me avise!

