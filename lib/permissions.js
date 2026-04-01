import { canViewRoute } from "@/lib/access";

export const NAV_ITEMS = [
  { key: "dashboardExecutivo", label: "Dashboard Executivo", href: "/dashboard/executivo" },
  { key: "dashboardOperacional", label: "Dashboard Operacional", href: "/dashboard/operacional" },
  { key: "dashboardCS", label: "Dashboard CS / NPS", href: "/dashboard/cs" },
  { key: "gargalos", label: "Gargalos Operacionais", href: "/gargalos" },
  { key: "clientesRisco", label: "Clientes em Risco", href: "/clientes-risco" },
  { key: "colaboradores", label: "Colaboradores", href: "/colaboradores" },
  { key: "clientes", label: "Clientes", href: "/clientes" },
  { key: "modulos", label: "Cores e Módulos", href: "/modulos" },
  { key: "skillsMatrix", label: "Matriz de Skills", href: "/skills-matrix" },
  { key: "projetos", label: "Projetos", href: "/projetos" },
  { key: "kanban", label: "Kanban Implantação", href: "/implantacao-kanban" },
  { key: "timeline", label: "Timeline Projetos", href: "/projetos-timeline" },
  { key: "agenda", label: "Agenda e Alocação", href: "/agenda" },
  { key: "capacity", label: "Capacity Planning", href: "/capacity" },
  { key: "health", label: "Health Score", href: "/health-score" },
  { key: "nps", label: "NPS", href: "/nps" },
  { key: "tarefas", label: "Tarefas", href: "/tarefas" },
  { key: "relatorios", label: "Relatórios", href: "/relatorios" },
];

export function getVisibleNavItems(role) {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => canViewRoute(role, item.key));
}

