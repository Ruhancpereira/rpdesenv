# Requisitos Apple Developer – Site e URL de Suporte

Este guia ajuda a deixar seu site em conformidade com o que a Apple exige para aprovação no Apple Developer Program.

## O que a Apple exige

1. **Site com conteúdo real** – Não pode aparecer a página do registrador (GoDaddy, etc.). O site deve mostrar conteúdo da sua organização.
2. **URL de suporte pública** – Os clientes precisam conseguir entrar em contato (dúvidas, suporte a apps). O domínio deve estar ligado à sua organização.

## Passos para cumprir

### 1. Colocar o site no ar (hospedagem)

O domínio que você informou hoje está mostrando a **página padrão da GoDaddy**. É preciso **hospedar** o site em um serviço e **apontar o domínio** para essa hospedagem.

**Opção recomendada: Vercel (Next.js)**

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Conecte o repositório do GitHub deste projeto.
3. Faça o deploy. A Vercel vai gerar uma URL (ex: `rp-desenv-site.vercel.app`).
4. No painel da Vercel, adicione seu **domínio próprio** (o que você comprou na GoDaddy).

**Outras opções:** Netlify, GitHub Pages (com export estático), ou hospedagem que suporte Node.js.

### 2. Configurar o domínio na GoDaddy (DNS)

Depois de hospedar o site (ex: na Vercel), você precisa **mudar o DNS** na GoDaddy para que, ao acessar `seudominio.com`, abra o seu site e não a página da GoDaddy.

1. Acesse [godaddy.com](https://www.godaddy.com) → Meus Produtos → Domínios → seu domínio.
2. Abra **Gerenciar DNS** (ou “DNS”).
3. Siga as instruções da sua hospedagem:
   - **Vercel:** adicione os registros que a Vercel indicar (geralmente um tipo **A** apontando para o IP da Vercel, ou um **CNAME** para `cname.vercel-dns.com`).
4. Remova ou não use a “página em construção” / “website builder” da GoDaddy para esse domínio; o tráfego deve ir para a Vercel (ou outro host).

Assim, quando a Apple (ou qualquer pessoa) acessar o seu domínio, verá o site da **RP Sistemas** e não a página do registrador.

### 3. Dados de contato no site

No código do site já existe uma seção **Contato e Suporte** com:

- Email (Suporte)
- Telefone
- Endereço

**Você deve:**

1. Em `Components/sections/ContactSection.jsx`, trocar:
   - `contato@seudominio.com.br` pelo **e-mail real** de suporte da sua organização.
   - O **telefone** pelo número real (e o `href` do `tel:` no mesmo arquivo).
   - O **endereço** se for diferente.
2. Garantir que esse e-mail seja acessado e respondido (a Apple pode testar).

### 4. O que informar na nova inscrição da Apple

Quando for **reenviar a inscrição** em [developer.apple.com/programs/enroll/](https://developer.apple.com/programs/enroll/):

- **URL do site:** use seu domínio principal (ex: `https://seudominio.com.br`).
- **URL de suporte:** pode ser a mesma do site ou o link direto para a seção de contato, por exemplo:  
  `https://seudominio.com.br/#contact`  
  (a seção de contato do site tem `id="contact"`).

Assim a Apple verá:

- Um site com conteúdo da empresa (sobre, serviços, contato).
- Uma URL de suporte pública onde os clientes podem entrar em contato.

### Resumo

| Item              | Ação |
|-------------------|------|
| Conteúdo do site  | Já ajustado: todas as seções (Sobre, Serviços, Contato, etc.) aparecem na home. |
| Suporte/contato   | Seção “Contato e Suporte” com email e telefone; atualize com dados reais. |
| Domínio           | Hospedar o site (ex: Vercel) e configurar DNS na GoDaddy para apontar para essa hospedagem. |
| Nova inscrição    | Usar a URL do seu domínio e a URL de suporte (ex: `https://seudominio.com.br/#contact`). |

Se quiser, depois de fazer o deploy e o DNS, podemos revisar juntos o que a Apple vai ver ao acessar o link.
