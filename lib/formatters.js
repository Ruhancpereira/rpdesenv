const riskLabel = {
  BAIXO: "Baixo",
  MEDIO: "Médio",
  ALTO: "Alto",
  CRITICO: "Crítico",
};

const projectStatusLabel = {
  PLANEJADO: "Planejado",
  EM_ANDAMENTO: "Em andamento",
  ATRASADO: "Atrasado",
  BLOQUEADO: "Bloqueado",
  CONCLUIDO: "Concluído",
};

const priorityLabel = {
  BAIXA: "Baixa",
  MEDIA: "Média",
  ALTA: "Alta",
  CRITICA: "Crítica",
};

const taskStatusLabel = {
  ABERTA: "Aberta",
  EM_ANDAMENTO: "Em andamento",
  BLOQUEADA: "Bloqueada",
  CONCLUIDA: "Concluída",
};

export function formatDateBR(value) {
  return fmtDate(value);
}

export function formatDate(value) {
  return fmtDate(value);
}

export function formatHourRange(start, end) {
  if (!start && !end) return "-";
  return `${start || "--:--"} - ${end || "--:--"}`;
}

export function formatNumberBR(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatPercent(value) {
  return fmtPercent(value);
}

export function formatHours(value) {
  return fmtHours(value);
}

export function formatRiskLabel(value) {
  return fmtRisk(value);
}

export function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleDateString("pt-BR");
}

export function fmtPercent(value) {
  const num = Number(value || 0);
  return `${num.toFixed(0)}%`;
}

export function fmtRisk(value) {
  return riskLabel[value] || value || "-";
}

export function fmtProjectStatus(value) {
  return projectStatusLabel[value] || value || "-";
}

export function fmtPriority(value) {
  return priorityLabel[value] || value || "-";
}

export function fmtTaskStatus(value) {
  return taskStatusLabel[value] || value || "-";
}

export function fmtHours(value) {
  const num = Number(value || 0);
  return `${num.toFixed(1)}h`;
}
