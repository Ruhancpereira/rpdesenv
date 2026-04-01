# Agrosys Ops - Gestão da Operação de Implantação

Sistema web completo para gestão da operação de implantação de software no agronegócio, com foco em previsibilidade operacional, capacidade, experiência do cliente, NPS e Customer Success de implantação.

## Stack

- Next.js 14 (Pages Router)
- React 18
- Tailwind CSS
- Prisma ORM
- SQLite (desenvolvimento)
- Autenticação por sessão via cookie HttpOnly
- Controle de acesso por perfil (RBAC)

## Módulos entregues

- Login e autenticação
- Dashboard Executivo
- Dashboard Operacional
- Dashboard CS / NPS
- Cadastro de Colaboradores
- Cadastro de Clientes
- Cores e Módulos
- Projetos de Implantação
- Agenda e Alocação (com alertas de conflito/sobrecarga/fragmentação)
- Capacity Planning
- Health Score
- NPS com classificação automática e automações
- Tarefas e Planos de Ação
- Relatórios com exportação CSV (base para Excel)

## Perfis de acesso

- Administrador
- Coordenador de Operações
- Gerente de Implantação
- Consultor de Implantação
- Customer Success de Implantação
- Diretoria

## Execução local

Pré-requisitos:

- Node.js 18+
- npm

Instalação:

```bash
npm install
```

Banco e dados de exemplo:

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Aplicação: `http://localhost:3000`

## Usuários de demonstração

Senha padrão para todos: `agrosys123`

- admin@agrosys.com.br
- coordenador@agrosys.com.br
- gerente@agrosys.com.br
- consultor@agrosys.com.br
- cs@agrosys.com.br
- diretoria@agrosys.com.br

## Build e validação

```bash
npm run lint
npm run build
```

## Estrutura técnica relevante

- `prisma/schema.prisma`: modelo de dados completo (colaboradores, clientes, projetos, fases, módulos, alocações, tarefas, NPS, health score, alertas e auditoria)
- `prisma/seed.js`: massa de dados realista
- `pages/api/**`: APIs REST dos módulos
- `pages/**`: telas do sistema
- `lib/access.js`: mapa de permissões por rota/perfil
- `lib/auth.js`: autenticação e sessão
- `lib/page-helpers.js`: proteção de páginas SSR

## Preparado para integrações futuras

A arquitetura foi estruturada para evoluir com integrações em:

- E-mail
- WhatsApp
- Google Calendar
- Power BI
- ERP/CRM





