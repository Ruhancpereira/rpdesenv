export const profileLabels = {
  ADMIN: "Administrador",
  COORDENADOR: "Coordenador de Operações",
  GERENTE: "Gerente de Implantação",
  CONSULTOR: "Consultor de Implantação",
  CS: "Customer Success de Implantação",
  DIRETORIA: "Diretoria",
};

export function canViewRoute(userRole, routeKey) {
  const permissions = {
    dashboardExecutivo: ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE"],
    dashboardOperacional: ["ADMIN", "COORDENADOR", "GERENTE", "CONSULTOR"],
    dashboardCS: ["ADMIN", "CS", "GERENTE", "DIRETORIA"],
    colaboradores: ["ADMIN", "COORDENADOR", "GERENTE"],
    clientes: ["ADMIN", "COORDENADOR", "GERENTE", "CS"],
    modulos: ["ADMIN", "COORDENADOR", "GERENTE"],
    projetos: ["ADMIN", "COORDENADOR", "GERENTE", "CS"],
    agenda: ["ADMIN", "COORDENADOR", "GERENTE", "CONSULTOR"],
    capacity: ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"],
    health: ["ADMIN", "CS", "GERENTE", "DIRETORIA"],
    nps: ["ADMIN", "CS", "GERENTE", "DIRETORIA"],
    tarefas: ["ADMIN", "COORDENADOR", "GERENTE", "CONSULTOR", "CS"],
    relatorios: ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE", "CS"],
  };

  return (permissions[routeKey] || []).includes(userRole);
}
