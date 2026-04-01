import { canViewRoute } from "@/lib/access";

export const NAV_ITEMS = [
  { key: "dashboardExecutivo", label: "Dashboard Executivo", href: "/dashboard/executivo" },
  { key: "dashboardOperacional", label: "Dashboard Operacional", href: "/dashboard/operacional" },
  { key: "dashboardCS", label: "Dashboard CS / NPS", href: "/dashboard/cs" },
  { key: "colaboradores", label: "Colaboradores", href: "/colaboradores" },
  { key: "clientes", label: "Clientes", href: "/clientes" },
  { key: "modulos", label: "Cores e Módulos", href: "/modulos" },
  { key: "projetos", label: "Projetos", href: "/projetos" },
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

