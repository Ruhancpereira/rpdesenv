export const chapters = [
  { id: "hero", label: "Início" },
  { id: "craft", label: "Ofício" },
  { id: "services", label: "Sistemas" },
  { id: "method", label: "Método" },
  { id: "work", label: "Frentes" },
  { id: "contact", label: "Suporte" },
];

export const craftLayers = [
  {
    index: "01",
    title: "Domínio",
    text: "Antes do código, o mapa: atores, regras, exceções e o que não pode falhar quando o sistema estiver em uso.",
    note: "linguagem do negócio · estados · bordas",
  },
  {
    index: "02",
    title: "Arquitetura",
    text: "Fronteiras nítidas entre interface, regras e dados. Contratos estáveis para o sistema crescer sem se desfazer.",
    note: "módulos · APIs · permissões",
  },
  {
    index: "03",
    title: "Construção",
    text: "Código legível, testes no fluxo crítico e integrações que a operação consegue acompanhar — não só a equipe que escreveu.",
    note: "fluxo crítico · integração · revisão",
  },
  {
    index: "04",
    title: "Operação",
    text: "Observabilidade, suporte e evolução. O sistema continua fazendo sentido depois do go-live, quando o uso real aparece.",
    note: "monitoração · suporte · evolução",
  },
];

export const services = [
  {
    index: "01",
    title: "Sistemas web",
    text: "Plataformas, portais e painéis com autenticação, permissões e fluxos que a operação usa todos os dias.",
    layers: ["Interface", "API", "Sessão"],
  },
  {
    index: "02",
    title: "Aplicativos",
    text: "Apps para iOS e Android com fluxos claros, publicação e um canal de suporte visível para quem usa.",
    layers: ["iOS", "Android", "Publicação"],
  },
  {
    index: "03",
    title: "Sistemas empresariais",
    text: "ERP, CRM e ferramentas internas desenhadas em cima das regras do negócio — não de um template genérico.",
    layers: ["Regras", "Papéis", "Rotina"],
  },
  {
    index: "04",
    title: "Nuvem",
    text: "Ambientes, deploy e escala com rastreio. O sistema sobe, volta e é operável por quem fica depois da entrega.",
    layers: ["Ambientes", "Deploy", "Backup"],
  },
  {
    index: "05",
    title: "Inteligência aplicada",
    text: "Automação e leitura de dados onde isso reduz trabalho real. Modelo a serviço do processo, não o contrário.",
    layers: ["Automação", "Dados", "Assistentes"],
  },
  {
    index: "06",
    title: "Segurança",
    text: "Acesso, trilha e proteção de dados tratados como parte do desenho — desde o primeiro fluxo, não como remendo.",
    layers: ["Acesso", "Auditoria", "Dados"],
  },
];

export const method = [
  {
    index: "01",
    title: "Escuta",
    text: "Entendemos a operação como ela é: quem decide, onde trava, o que já foi tentado e qual resultado importa.",
  },
  {
    index: "02",
    title: "Modelo",
    text: "Traduzimos isso em entidades, estados e regras. O desenho fica visível antes de a interface ganhar forma.",
  },
  {
    index: "03",
    title: "Contratos",
    text: "Definimos como as partes conversam: telas, APIs, permissões e integrações com o que já existe na empresa.",
  },
  {
    index: "04",
    title: "Construção",
    text: "Implementamos em ciclos curtos, com o fluxo crítico coberto e espaço para ajustar o que o uso revela.",
  },
  {
    index: "05",
    title: "Operação",
    text: "Entregamos com suporte, leitura do que acontece em produção e um caminho claro para a próxima evolução.",
  },
];

export const works = [
  {
    index: "01",
    area: "Web",
    title: "Plataformas de venda",
    text: "Catálogo, pedido, pagamento e estoque no mesmo fluxo — com estado consistente entre o que o cliente vê e o que a operação processa.",
    tags: ["React", "Node.js", "PostgreSQL"],
  },
  {
    index: "02",
    area: "Mobile",
    title: "Operação em campo",
    text: "Aplicativos de entrega e rotina externa, com rastreio, status e um caminho de suporte quando o uso sai do cenário feliz.",
    tags: ["iOS", "Android", "Tempo real"],
  },
  {
    index: "03",
    area: "Sistemas",
    title: "Gestão empresarial",
    text: "Módulos de venda, estoque, financeiro e pessoas compartilhando a mesma linguagem de dados e de permissão.",
    tags: ["Domínio", "Permissões", "Rotinas"],
  },
  {
    index: "04",
    area: "Web",
    title: "Painéis de decisão",
    text: "Leitura operacional em tempo hábil: indicadores que nascem do sistema, não de uma planilha paralela.",
    tags: ["Next.js", "Dados", "Leitura"],
  },
  {
    index: "05",
    area: "Mobile",
    title: "Produtos financeiros",
    text: "Controle, categorização e metas com trilha do que mudou — porque em dinheiro o estado precisa ser explicável.",
    tags: ["Estado", "Trilha", "Mobile"],
  },
  {
    index: "06",
    area: "Sistemas",
    title: "Relacionamento",
    text: "CRM com automação que respeita o processo comercial, em vez de empurrar o time para dentro da ferramenta.",
    tags: ["CRM", "Automação", "Histórico"],
  },
];

export const stats = [
  { value: "150+", label: "Projetos entregues" },
  { value: "50+", label: "Clientes" },
  { value: "8+", label: "Anos em produção" },
  { value: "99%", label: "Satisfação" },
];

export const contactInfo = [
  {
    label: "Email de suporte",
    value: "contato@rpsistemas.cloud",
    href: "mailto:contato@rpsistemas.cloud",
  },
  {
    label: "Telefone",
    value: "+55 (48) 98851-9790",
    href: "tel:+5548988519790",
  },
  {
    label: "Endereço",
    value: "Criciúma, SC — Brasil",
    href: null,
  },
];
