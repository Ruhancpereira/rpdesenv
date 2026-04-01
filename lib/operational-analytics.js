import { prisma } from "@/lib/prisma";

function startOfWeek(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  d.setDate(d.getDate() - diffToMonday);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfWeek(date = new Date()) {
  const s = startOfWeek(date);
  const e = new Date(s);
  e.setDate(e.getDate() + 7);
  return e;
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function clampPercent(n) {
  return Math.max(0, Math.min(999, Number(n || 0)));
}

function classifyCapacity(percent) {
  if (percent > 100) return "VERMELHO";
  if (percent > 80) return "AMARELO";
  return "VERDE";
}

function buildCapacitySeries(allocations, usefulCapacity, periods, mode) {
  return periods.map((period) => {
    const total = allocations
      .filter((a) => a.date >= period.start && a.date < period.end)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0);
    const denominator =
      mode === "WEEK"
        ? Math.max(1, Number(usefulCapacity || 0) / 4)
        : Math.max(1, Number(usefulCapacity || 0));
    const occupancy = clampPercent((total / denominator) * 100);
    return {
      label: period.label,
      horas: Number(total.toFixed(1)),
      ocupacao: Number(occupancy.toFixed(1)),
      semaforo: classifyCapacity(occupancy),
    };
  });
}

function periodWindow(mode = "WEEK", count = 8) {
  const now = new Date();
  const windows = [];

  if (mode === "MONTH") {
    const base = startOfMonth(now);
    for (let i = count - 1; i >= 0; i -= 1) {
      const s = new Date(base.getFullYear(), base.getMonth() - i, 1);
      const e = new Date(base.getFullYear(), base.getMonth() - i + 1, 1);
      windows.push({
        start: s,
        end: e,
        label: `${String(s.getMonth() + 1).padStart(2, "0")}/${s.getFullYear()}`,
      });
    }
    return windows;
  }

  const baseWeek = startOfWeek(now);
  for (let i = count - 1; i >= 0; i -= 1) {
    const s = new Date(baseWeek);
    s.setDate(baseWeek.getDate() - i * 7);
    const e = new Date(s);
    e.setDate(s.getDate() + 7);
    windows.push({
      start: s,
      end: e,
      label: `${String(s.getDate()).padStart(2, "0")}/${String(
        s.getMonth() + 1,
      ).padStart(2, "0")}`,
    });
  }
  return windows;
}

export async function getCapacityAnalytics() {
  const [collaborators, cores, modules] = await Promise.all([
    prisma.collaborator.findMany({
      where: { status: true },
      include: {
        allocations: true,
        consultantProjects: true,
        skills: {
          include: {
            core: true,
            module: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.core.findMany({
      include: {
        allocations: true,
        modules: true,
        skills: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.businessModule.findMany({
      include: {
        core: true,
        allocations: true,
        skills: {
          include: {
            collaborator: {
              select: { id: true, name: true, status: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const weekStart = startOfWeek();
  const weekEnd = endOfWeek();
  const monthStart = startOfMonth();
  const monthEnd = endOfMonth();

  const byCollaborator = collaborators.map((c) => {
    const weekHours = c.allocations
      .filter((a) => a.date >= weekStart && a.date < weekEnd)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0);
    const monthHours = c.allocations
      .filter((a) => a.date >= monthStart && a.date < monthEnd)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0);
    const weeklyCapacity = Math.max(1, Number(c.usefulCapacity || 0) / 4);
    const weekOccupancy = clampPercent((weekHours / weeklyCapacity) * 100);
    const monthOccupancy = clampPercent((monthHours / Math.max(1, c.usefulCapacity)) * 100);
    const projects = new Set(c.allocations.map((a) => a.projectId)).size;
    const modulesCount = new Set(c.allocations.map((a) => a.moduleId)).size;
    const contextByDay = {};
    for (const item of c.allocations) {
      const key = item.date.toISOString().slice(0, 10);
      contextByDay[key] = contextByDay[key] || new Set();
      contextByDay[key].add(`${item.projectId}-${item.moduleId}`);
    }
    const fragmentation =
      Object.values(contextByDay).length === 0
        ? 0
        : Object.values(contextByDay).reduce((sum, set) => sum + set.size, 0) /
          Object.values(contextByDay).length;

    return {
      id: c.id,
      nome: c.name,
      capacidadeNominal: Number(c.nominalCapacity || 0),
      capacidadeUtil: Number(c.usefulCapacity || 0),
      horasSemana: Number(weekHours.toFixed(1)),
      horasMes: Number(monthHours.toFixed(1)),
      ocupacaoSemana: Number(weekOccupancy.toFixed(1)),
      ocupacaoMes: Number(monthOccupancy.toFixed(1)),
      sobrecargaSemana: Number(Math.max(0, weekOccupancy - 100).toFixed(1)),
      sobrecargaMes: Number(Math.max(0, monthOccupancy - 100).toFixed(1)),
      folgaSemana: Number(Math.max(0, weeklyCapacity - weekHours).toFixed(1)),
      folgaMes: Number(Math.max(0, Number(c.usefulCapacity || 0) - monthHours).toFixed(1)),
      projetosSimultaneos: projects,
      modulosSimultaneos: modulesCount,
      indiceFragmentacao: Number(fragmentation.toFixed(2)),
      semaforoSemana: classifyCapacity(weekOccupancy),
      semaforoMes: classifyCapacity(monthOccupancy),
    };
  });

  const byCore = cores.map((core) => {
    const weekHours = core.allocations
      .filter((a) => a.date >= weekStart && a.date < weekEnd)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0);
    const monthHours = core.allocations
      .filter((a) => a.date >= monthStart && a.date < monthEnd)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0);
    return {
      id: core.id,
      core: core.name,
      horasSemana: Number(weekHours.toFixed(1)),
      horasMes: Number(monthHours.toFixed(1)),
      coberturaSkills: core.skills.length,
      totalModulos: core.modules.length,
      densidadeSkills: Number((core.skills.length / Math.max(1, core.modules.length)).toFixed(2)),
    };
  });

  const moduleBottlenecks = modules.map((mod) => {
    const specialists = mod.skills.filter((s) => s.level >= 4).length;
    const autonomous = mod.skills.filter((s) => s.level >= 3).length;
    const weekDemand = mod.allocations
      .filter((a) => a.date >= weekStart && a.date < weekEnd)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0);
    const monthDemand = mod.allocations
      .filter((a) => a.date >= monthStart && a.date < monthEnd)
      .reduce((sum, a) => sum + Number(a.allocatedHours), 0);
    const gap = Math.max(0, mod.minimumCapacitated - autonomous);
    const severity =
      specialists <= 1
        ? "CRITICO"
        : gap > 0
          ? "ALTO"
          : weekDemand > 40
            ? "MEDIO"
            : "BAIXO";
    return {
      id: mod.id,
      modulo: mod.name,
      core: mod.core.name,
      demandaSemana: Number(weekDemand.toFixed(1)),
      demandaMes: Number(monthDemand.toFixed(1)),
      especialistas: specialists,
      autonomia: autonomous,
      minimo: mod.minimumCapacitated,
      gap,
      spof: specialists <= 1,
      severidade: severity,
      alerta:
        specialists <= 1
          ? "Dependência de especialista único"
          : gap > 0
            ? "Cobertura abaixo do mínimo"
            : "Sem gargalo crítico",
    };
  });

  const weekPeriods = periodWindow("WEEK", 8);
  const monthPeriods = periodWindow("MONTH", 6);
  const capacitySeries = byCollaborator
    .slice(0, 12)
    .map((row) => {
      const source = collaborators.find((c) => c.id === row.id);
      return {
        collaboratorId: row.id,
        collaboratorName: row.nome,
        weekly: buildCapacitySeries(source?.allocations || [], source?.usefulCapacity, weekPeriods, "WEEK"),
        monthly: buildCapacitySeries(source?.allocations || [], source?.usefulCapacity, monthPeriods, "MONTH"),
      };
    });

  return {
    byCollaborator,
    byCore,
    byModule: moduleBottlenecks,
    weeklyPeriods: weekPeriods.map((p) => p.label),
    monthlyPeriods: monthPeriods.map((p) => p.label),
    capacitySeries,
  };
}

export async function getSkillsMatrix() {
  const [collaborators, modules] = await Promise.all([
    prisma.collaborator.findMany({
      where: { status: true },
      include: {
        skills: {
          include: { module: true, core: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.businessModule.findMany({
      include: {
        core: true,
        skills: true,
      },
      orderBy: [{ core: { name: "asc" } }, { name: "asc" }],
    }),
  ]);

  const rows = collaborators.map((col) => {
    const map = {};
    for (const skill of col.skills) {
      map[skill.moduleId] = skill.level;
    }
    return {
      collaboratorId: col.id,
      collaborator: col.name,
      roleTitle: col.roleTitle,
      cityRegion: col.cityRegion,
      modules: modules.map((mod) => ({
        moduleId: mod.id,
        module: mod.name,
        core: mod.core.name,
        level: map[mod.id] || 0,
      })),
    };
  });

  const moduleCoverage = modules.map((mod) => {
    const coverage = [1, 2, 3, 4].map((level) => ({
      level,
      total: mod.skills.filter((s) => s.level === level).length,
    }));
    const specialists = mod.skills.filter((s) => s.level >= 4).length;
    const autonomous = mod.skills.filter((s) => s.level >= 3).length;
    return {
      moduleId: mod.id,
      module: mod.name,
      core: mod.core.name,
      minimum: mod.minimumCapacitated,
      specialists,
      autonomous,
      spof: specialists <= 1,
      lowCoverage: autonomous < mod.minimumCapacitated,
      coverage,
    };
  });

  return {
    modules: modules.map((m) => ({
      id: m.id,
      name: m.name,
      core: m.core.name,
      minimum: m.minimumCapacitated,
    })),
    rows,
    moduleCoverage,
  };
}

function npsScoreFromEntries(entries) {
  if (!entries.length) return 0;
  const promoters = entries.filter((e) => e.classification === "PROMOTOR").length;
  const detractors = entries.filter((e) => e.classification === "DETRATOR").length;
  return Number((((promoters - detractors) / entries.length) * 100).toFixed(1));
}

function riskBandFromScore(score) {
  if (score < 50) return "CRITICO";
  if (score < 65) return "ALTO";
  if (score < 75) return "MEDIO";
  return "BAIXO";
}

export async function getClientRiskPanel() {
  const [clients, healthScores, npsEntries, projects] = await Promise.all([
    prisma.client.findMany({
      include: { projects: true },
      orderBy: { tradeName: "asc" },
    }),
    prisma.healthScore.findMany({
      include: { client: true, project: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.npsEntry.findMany({
      include: { client: true, project: true },
      orderBy: { date: "desc" },
    }),
    prisma.project.findMany({
      include: { client: true },
    }),
  ]);

  const items = clients.map((client) => {
    const clientHealth = healthScores.filter((h) => h.clientId === client.id);
    const latestHealth = clientHealth[0];
    const avgHealth =
      clientHealth.length === 0
        ? 0
        : clientHealth.reduce((sum, h) => sum + Number(h.score), 0) / clientHealth.length;
    const clientNpsEntries = npsEntries.filter((n) => n.clientId === client.id);
    const nps = npsScoreFromEntries(clientNpsEntries);
    const detractors = clientNpsEntries.filter((n) => n.classification === "DETRATOR").length;
    const delayedProjects = projects.filter((p) => p.clientId === client.id && p.status === "ATRASADO").length;
    const riskFromHealth = riskBandFromScore(avgHealth);
    const risk =
      delayedProjects > 0 || detractors > 0 || avgHealth < 55
        ? "ALTO"
        : ["ALTO", "CRITICO"].includes(riskFromHealth)
          ? riskFromHealth
          : client.currentRisk;
    return {
      clientId: client.id,
      client: client.tradeName,
      segment: client.segment,
      city: `${client.city}/${client.state}`,
      healthScore: Number(avgHealth.toFixed(1)),
      latestHealthStatus: latestHealth?.status || riskBandFromScore(avgHealth),
      nps,
      detractors,
      delayedProjects,
      risk,
      goLiveForecast: client.goLiveForecast,
      implementationStatus: client.implementationStatus,
    };
  });

  items.sort((a, b) => {
    const rank = { CRITICO: 4, ALTO: 3, MEDIO: 2, BAIXO: 1 };
    return (rank[b.risk] || 1) - (rank[a.risk] || 1);
  });

  return {
    summary: {
      totalClients: items.length,
      red: items.filter((i) => ["ALTO", "CRITICO"].includes(i.risk)).length,
      yellow: items.filter((i) => i.risk === "MEDIO").length,
      green: items.filter((i) => i.risk === "BAIXO").length,
      avgHealth:
        items.length === 0
          ? 0
          : Number((items.reduce((sum, i) => sum + i.healthScore, 0) / items.length).toFixed(1)),
      avgNps:
        items.length === 0
          ? 0
          : Number((items.reduce((sum, i) => sum + i.nps, 0) / items.length).toFixed(1)),
    },
    items,
  };
}

export async function getProjectExecutionViews() {
  const projects = await prisma.project.findMany({
    include: {
      client: true,
      phases: {
        include: {
          responsible: { select: { name: true } },
        },
        orderBy: { plannedDate: "asc" },
      },
      manager: { select: { name: true } },
      csOwner: { select: { name: true } },
    },
    orderBy: { targetEndDate: "asc" },
  });

  const phases = [
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

  const kanban = phases.map((phase) => ({
    phase,
    projects: projects
      .filter((p) => p.currentPhase === phase)
      .map((p) => ({
        id: p.id,
        project: p.name,
        client: p.client.tradeName,
        progress: p.progressPercent,
        risk: p.projectRisk,
        priority: p.priority,
        status: p.status,
        targetEndDate: p.targetEndDate,
        manager: p.manager?.name || "-",
        cs: p.csOwner?.name || "-",
      })),
  }));

  const timeline = projects.map((project) => ({
    projectId: project.id,
    project: project.name,
    client: project.client.tradeName,
    status: project.status,
    risk: project.projectRisk,
    currentPhase: project.currentPhase,
    startDate: project.startDate,
    targetEndDate: project.targetEndDate,
    phases: project.phases.map((phase) => ({
      phaseId: phase.id,
      name: phase.name,
      status: phase.status,
      plannedDate: phase.plannedDate,
      actualDate: phase.actualDate,
      responsible: phase.responsible?.name || "-",
      impediments: phase.impediments,
    })),
  }));

  return { kanban, timeline };
}

export async function upsertSpofAlerts(userId = null) {
  const modules = await prisma.businessModule.findMany({
    include: {
      skills: true,
    },
  });

  const activeSpof = modules
    .map((mod) => {
      const specialists = mod.skills.filter((s) => s.level >= 4).length;
      return {
        moduleId: mod.id,
        moduleName: mod.name,
        specialists,
        spof: specialists <= 1,
      };
    })
    .filter((m) => m.spof);

  const openAlerts = await prisma.automationAlert.findMany({
    where: {
      type: "SINGLE_POINT_OF_FAILURE",
      resolved: false,
    },
  });

  const openByModule = new Map(openAlerts.map((a) => [a.moduleId, a]));
  const activeByModule = new Map(activeSpof.map((a) => [a.moduleId, a]));

  const toCreate = activeSpof.filter((a) => !openByModule.has(a.moduleId));
  const toResolve = openAlerts.filter((a) => a.moduleId && !activeByModule.has(a.moduleId));

  if (toCreate.length > 0) {
    await prisma.automationAlert.createMany({
      data: toCreate.map((item) => ({
        type: "SINGLE_POINT_OF_FAILURE",
        severity: "CRITICO",
        message: `Módulo ${item.moduleName} com dependência de especialista único (${item.specialists}).`,
        moduleId: item.moduleId,
      })),
    });
  }

  if (toResolve.length > 0) {
    await prisma.automationAlert.updateMany({
      where: {
        id: { in: toResolve.map((r) => r.id) },
      },
      data: { resolved: true },
    });
  }

  if (userId) {
    await prisma.auditLog.create({
      data: {
        entityType: "AUTOMATION",
        entityId: "SPOF",
        action: "SYNC",
        details: `SPOF sync: ${toCreate.length} alertas criados, ${toResolve.length} resolvidos.`,
        userId,
      },
    });
  }

  return {
    created: toCreate.length,
    resolved: toResolve.length,
    active: activeSpof.length,
  };
}
