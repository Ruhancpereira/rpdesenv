export const PROJECT_PHASES = [
  "pré-kickoff",
  "kickoff",
  "discovery",
  "saneamento",
  "parametrização",
  "treinamento",
  "homologação",
  "go-live",
  "estabilização",
  "handover",
];

export const PHASE_OPTIONS = PROJECT_PHASES;

export const PROJECT_STATUSES = [
  { value: "PLANEJADO", label: "Planejado" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "ATRASADO", label: "Atrasado" },
  { value: "BLOQUEADO", label: "Bloqueado" },
  { value: "CONCLUIDO", label: "Concluído" },
];

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUSES.map((item) => item.value);

export const RISK_LEVELS = [
  { value: "BAIXO", label: "Baixo" },
  { value: "MEDIO", label: "Médio" },
  { value: "ALTO", label: "Alto" },
  { value: "CRITICO", label: "Crítico" },
];

export const RISK_OPTIONS = RISK_LEVELS.map((item) => item.value);
export const RISK_LEVEL_OPTIONS = RISK_LEVELS;

export const PRIORITIES = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Média" },
  { value: "ALTA", label: "Alta" },
  { value: "CRITICA", label: "Crítica" },
];

export const PRIORITY_OPTIONS = PRIORITIES.map((item) => item.value);

export const ACTIVITY_TYPES = [
  { value: "IMPLANTACAO_PRODUTIVA", label: "Implantação produtiva" },
  { value: "REUNIAO_CLIENTE", label: "Reunião com cliente" },
  { value: "REUNIAO_INTERNA", label: "Reunião interna" },
  { value: "DESLOCAMENTO", label: "Deslocamento" },
  { value: "TREINAMENTO", label: "Treinamento" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "SUPORTE_PROJETO", label: "Suporte ao projeto" },
  { value: "RETRABALHO", label: "Retrabalho" },
  { value: "CONTINGENCIA", label: "Contingência" },
];

export const ACTIVITY_TYPE_OPTIONS = ACTIVITY_TYPES;

export const AGENDA_STATUSES = [
  { value: "PLANEJADA", label: "Planejada" },
  { value: "CONFIRMADA", label: "Confirmada" },
  { value: "EXECUTADA", label: "Executada" },
  { value: "CANCELADA", label: "Cancelada" },
];

export const AGENDA_STATUS_OPTIONS = AGENDA_STATUSES.map((item) => item.value);

export const ALLOCATION_LOCATIONS = [
  { value: "REMOTO", label: "Remoto" },
  { value: "PRESENCIAL", label: "Presencial" },
];

export const ALLOCATION_LOCATION_OPTIONS = ALLOCATION_LOCATIONS.map((item) => item.value);

export const TASK_ORIGINS = [
  { value: "PROJETO", label: "Projeto" },
  { value: "CLIENTE", label: "Cliente" },
  { value: "NPS", label: "NPS" },
  { value: "RISCO", label: "Risco" },
  { value: "HEALTH_SCORE", label: "Health Score" },
  { value: "PENDENCIA", label: "Pendência" },
  { value: "AUTOMACAO", label: "Automação" },
];

export const TASK_ORIGIN_OPTIONS = TASK_ORIGINS.map((item) => item.value);

export const TASK_STATUSES = [
  { value: "ABERTA", label: "Aberta" },
  { value: "EM_ANDAMENTO", label: "Em andamento" },
  { value: "BLOQUEADA", label: "Bloqueada" },
  { value: "CONCLUIDA", label: "Concluída" },
];

export const TASK_STATUS_OPTIONS = TASK_STATUSES.map((item) => item.value);
