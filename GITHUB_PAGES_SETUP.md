# Configuração GitHub Pages para Next.js

## ⚠️ Limitação

GitHub Pages não suporta Next.js completamente. Você tem duas opções:

### Opção 1: Export Estático (Limitado)
- Funciona apenas para sites estáticos
- Não suporta API Routes, SSR dinâmico, etc.
- Requer configuração especial

### Opção 2: Vercel (Recomendado)
- Suporte nativo ao Next.js
- Deploy automático
- HTTPS gratuito
- Mais fácil de configurar

## 📦 Preparação para GitHub Pages (Export Estático)

Se ainda assim quiser usar GitHub Pages, siga:

1. Instalar dependência:
```bash
npm install --save-dev gh-pages
```

2. Adicionar scripts ao package.json:
```json
{
  "scripts": {
    "export": "next build && next export",
    "deploy": "npm run export && gh-pages -d out"
  }
}
```

3. Atualizar next.config.js:
```js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true
  }
}
```

4. Deploy:
```bash
npm run deploy
```

