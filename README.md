# RP Desenv - Site Portfolio

Site portfolio profissional desenvolvido com Next.js, React e Tailwind CSS, incluindo animações avançadas e efeitos visuais interativos.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **React 18** - Biblioteca UI
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Lucide React** - Ícones
- **Sonner** - Notificações Toast

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🛠️ Instalação

1. **Clone o repositório** (se aplicável)

2. **Instale as dependências:**
```bash
npm install
```
ou
```bash
yarn install
```

## 🧪 Como Testar

### Modo Desenvolvimento

Para rodar o projeto em modo de desenvolvimento:

```bash
npm run dev
```

ou

```bash
yarn dev
```

O site estará disponível em: `http://localhost:3000`

### Build de Produção

Para criar um build de produção:

```bash
npm run build
```

Para iniciar o servidor de produção:

```bash
npm start
```

### Lint

Para verificar o código:

```bash
npm run lint
```

## 📁 Estrutura do Projeto

```
RPDesenvSite/
├── Components/          # Componentes React
│   ├── effects/        # Efeitos visuais (Cursor, Particles, etc)
│   ├── navigation/     # Navegação (Navbar)
│   ├── sections/       # Seções da página
│   └── ui/            # Componentes UI reutilizáveis
├── Pages/              # Páginas (Home)
├── Layout.js          # Layout principal
├── lib/               # Utilitários
├── pages/             # Páginas Next.js
├── styles/            # Estilos globais
└── package.json       # Dependências
```

## ✨ Funcionalidades

- ✨ Design moderno e responsivo
- 🎨 Animações suaves com Framer Motion
- 🖱️ Cursor customizado interativo
- ✨ Background de partículas animadas
- 📱 Totalmente responsivo
- 🎯 Navegação suave entre seções
- 📧 Formulário de contato
- 🎭 Efeitos 3D em cards
- 🔘 Botões com efeitos magnéticos e glow

## 🔧 Configuração

O projeto está configurado com:

- **Path Aliases**: `@/` aponta para a raiz do projeto
- **Tailwind CSS**: Configurado e pronto para uso
- **PostCSS**: Processamento de CSS
- **JSConfig**: Configuração de paths e aliases

## 📝 Notas

- O projeto usa a estrutura de Pages Router do Next.js
- Todos os componentes estão em JSX
- O Tailwind CSS está configurado para escanear os arquivos corretos
- O Layout global está definido em `Layout.js`

## 🐛 Solução de Problemas

### Erro de módulo não encontrado

Certifique-se de que todas as dependências foram instaladas:
```bash
npm install
```

### Erro de path alias (@/)

Verifique se o `jsconfig.json` está correto e reinicie o servidor de desenvolvimento.

### Estilos não aparecem

Certifique-se de que o `styles/globals.css` está sendo importado no `_app.js`.

## 📄 Licença

Este projeto é de uso pessoal/portfólio.





