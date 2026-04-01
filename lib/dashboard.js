import { prisma } from "@/lib/prisma";

function toPercentage(value, total) {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
}

function computeNps(entries) {
  if (entries.length === 0) return 0;
  const promoters = entries.filter((n) => n.classification === "PROMOTOR").length;
  const detractors = entries.filter((n) => n.classification === "DETRATOR").length;
  return Number((((promoters - detractors) / entries.length) * 100).toFixed(1));
}

function riskRank(risk) {
  const map = { BAIXO: 1, MEDIO: 2, ALTO: 3, CRITICO: 4 };
  return map[risk] || 2;
}

function riskFromHealth(projectRisk, avgHealthRisk) {
  const rank = Math.max(riskRank(projectRisk), riskRank(avgHealthRisk || "BAIXO"));
  if (rank >= 4) return "CRITICO";
  if (rank >= 3) return "ALTO";
  if (rank >= 2) return "MEDIO";
  return "BAIXO";
}

function dashboardSummaryFromCapacity(capacityRows) {
  const total = capacityRows.length;
  if (!total) return { mediumOccupation: 0, overloaded: 0 };

  const mediumOccupation =
    capacityRows.reduce((acc, row) => acc + row.occupationPercent, 0) / total;
  const overloaded = capacityRows.filter((row) => row.occupationPercent > 100).length;

  return {
    mediumOccupation: Number(mediumOccupation.toFixed(1)),
    overloaded,
  };
}

export async function computeCapacityData() {
  const collaborators = await prisma.collaborator.findMany({
    where: { status: true },
    include: {
      allocations: true,
      consultantProjects: true,
      skills: { include: { module: true, core: true } },
    },
  });

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const startOfMonth = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), 1);
  const endOfMonth = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth() + 1, 1);

  const rows = collaborators.map((collab) => {
    const weekAllocations = collab.allocations.filter(
      (a) => a.date >= startOfWeek && a.date < endOfWeek,
    );
    const monthAllocations = collab.allocations.filter(
      (a) => a.date >= startOfMonth && a.date < endOfMonth,
    );
    const weekHours = weekAllocations.reduce((sum, a) => sum + a.allocatedHours, 0);
    const monthHours = monthAllocations.reduce((sum, a) => sum + a.allocatedHours, 0);
    const occupationPercent = Number(((weekHours / collab.usefulCapacity) * 100).toFixed(1));
    const overloadPercent = Number(Math.max(occupationPercent - 100, 0).toFixed(1));
    const slack = Number((collab.usefulCapacity - weekHours).toFixed(1));
    const simultaneousProjects = new Set(weekAllocations.map((a) => a.projectId)).size;
    const simultaneousModules = new Set(weekAllocations.map((a) => a.moduleId)).size;
    const fragmentationIndex = new Set(weekAllocations.map((a) => `${a.date.toISOString().slice(0, 10)}-${a.clientId}`))
      .size;
    const semaphore =
      occupationPercent <= 80 ? "VERDE" : occupationPercent <= 100 ? "AMARELO" : "VERMELHO";

    return {
      collaboratorId: collab.id,
      collaboratorName: collab.name,
      coreCoverage: new Set(collab.skills.map((s) => s.core.name)).size,
      moduleCoverage: new Set(collab.skills.map((s) => s.module.name)).size,
      nominalCapacity: collab.nominalCapacity,
      usefulCapacity: collab.usefulCapacity,
      weekHours,
      monthHours,
      occupationPercent,
      overloadPercent,
      slack,
      simultaneousProjects,
      simultaneousModules,
      fragmentationIndex,
      semaphore,
    };
  });

  const moduleCoverage = await prisma.businessModule.findMany({
    include: { skills: true, core: true },
  });

  const singlePoints = moduleCoverage
    .map((module) => {
      const specialists = module.skills.filter((s) => s.level >= 4).length;
      const capacitated = module.skills.filter((s) => s.level >= 3).length;
      return {
        moduleId: module.id,
        module: module.name,
        core: module.core.name,
        specialists,
        capacitated,
        minimumRequired: module.minimumCapacitated,
        singlePoint: specialists <= 1,
        lowCoverage: capacitated < module.minimumCapacitated,
      };
    })
    .filter((item) => item.singlePoint || item.lowCoverage);

  return { rows, singlePoints };
}

export async function getExecutiveDashboardData() {
  const [projects, healthScores, npsEntries, alerts] = await Promise.all([
    prisma.project.findMany({
      include: {
        client: true,
        manager: true,
        healthScores: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
    prisma.healthScore.findMany(),
    prisma.npsEntry.findMany(),
    prisma.automationAlert.findMany({ where: { resolved: false } }),
  ]);

  const capacity = await computeCapacityData();
  const capacitySummary = dashboardSummaryFromCapacity(capacity.rows);
  const activeProjects = projects.filter((p) => p.status !== "CONCLUIDO");
  const inRisk = projects.filter((p) => ["ALTO", "CRITICO"].includes(p.projectRisk));
  const delayed = projects.filter((p) => p.status === "ATRASADO");
  const onTimeRate = toPercentage(activeProjects.length - delayed.length, activeProjects.length || 1);
  const averageHealthScore =
    healthScores.length === 0
      ? 0
      : Number(
          (
            healthScores.reduce((acc, row) => acc + row.score, 0) / healthScores.length
          ).toFixed(1),
        );

  const clientsRed = new Set(
    projects
      .filter((project) => {
        const latestHealth = project.healthScores[0];
        const risk = riskFromHealth(project.projectRisk, latestHealth?.status);
        return ["ALTO", "CRITICO"].includes(risk);
      })
      .map((p) => p.client.tradeName),
  );

  const modulesAtRisk = capacity.singlePoints.slice(0, 5);

  return {
    kpis: {
      activeProjects: activeProjects.length,
      projectsAtRisk: inRisk.length,
      onTimeRate,
      overallNps: computeNps(npsEntries),
      averageHealthScore,
      mediumCapacity: capacitySummary.mediumOccupation,
      overloadedConsultants: capacitySummary.overloaded,
      modulesAtRisk: modulesAtRisk.length,
      redClients: clientsRed.size,
    },
    highlights: {
      topAlerts: alerts.slice(0, 6),
      modulesAtRisk,
      criticalProjects: projects
        .filter((p) => ["ALTO", "CRITICO"].includes(p.projectRisk))
        .map((p) => ({
          id: p.id,
          name: p.name,
          client: p.client.tradeName,
          risk: p.projectRisk,
          progress: p.progressPercent,
          targetEndDate: p.targetEndDate,
        })),
    },
  };
}

export async function getOperationalDashboardData() {
  const [allocations, projects, tasks] = await Promise.all([
    prisma.allocation.findMany({
      include: {
        collaborator: true,
        project: true,
        client: true,
        module: true,
        core: true,
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 200,
    }),
    prisma.project.findMany({ include: { phases: true, client: true } }),
    prisma.task.findMany({ where: { status: { not: "CONCLUIDA" } } }),
  ]);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekAllocations = allocations.filter((a) => a.date >= weekStart && a.date < weekEnd);
  const totalHours = weekAllocations.reduce((sum, a) => sum + a.allocatedHours, 0);

  const conflicts = weekAllocations.filter((current, index, arr) => {
    return arr.some((other, otherIndex) => {
      if (index === otherIndex) return false;
      if (current.collaboratorId !== other.collaboratorId) return false;
      if (current.date.toDateString() !== other.date.toDateString()) return false;
      return current.startTime < other.endTime && other.startTime < current.endTime;
    });
  });

  const delayedClients = projects
    .filter((project) => project.status === "ATRASADO")
    .map((project) => project.client.tradeName);

  const blockedPhases = projects
    .flatMap((project) =>
      project.phases
        .filter((phase) => phase.status === "BLOQUEADA")
        .map((phase) => ({
          project: project.name,
          phase: phase.name,
          impediments: phase.impediments,
        })),
    )
    .slice(0, 8);

  const reworkHours = weekAllocations
    .filter((a) => a.activityType === "RETRABALHO")
    .reduce((sum, a) => sum + a.allocatedHours, 0);

  return {
    kpis: {
      weekAgendaCount: weekAllocations.length,
      conflicts: conflicts.length,
      allocatedHours: Number(totalHours.toFixed(1)),
      idleHours: Number(Math.max(0, 640 - totalHours).toFixed(1)),
      reworkHours: Number(reworkHours.toFixed(1)),
      delayedClients: delayedClients.length,
      blockedPhases: blockedPhases.length,
      criticalPendencies: tasks.filter((t) => t.priority === "CRITICA").length,
    },
    weekAgenda: weekAllocations.slice(0, 20).map((a) => ({
      id: a.id,
      date: a.date,
      collaborator: a.collaborator.name,
      client: a.client.tradeName,
      project: a.project.name,
      module: a.module.name,
      core: a.core.name,
      activityType: a.activityType,
      startTime: a.startTime,
      endTime: a.endTime,
      allocatedHours: a.allocatedHours,
      location: a.location,
      agendaStatus: a.agendaStatus,
    })),
    blockedPhases,
  };
}

export async function getCsDashboardData() {
  const [healthScores, npsEntries, tasks, projects] = await Promise.all([
    prisma.healthScore.findMany({
      include: { client: true, project: true, csOwner: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.npsEntry.findMany({
      include: { client: true, project: true, treatmentOwner: true },
      orderBy: { date: "desc" },
    }),
    prisma.task.findMany({
      where: { origin: { in: ["NPS", "HEALTH_SCORE", "AUTOMACAO", "RISCO"] } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.project.findMany({ include: { client: true } }),
  ]);

  const healthDistribution = {
    verde: healthScores.filter((h) => h.score >= 75).length,
    amarelo: healthScores.filter((h) => h.score >= 50 && h.score < 75).length,
    vermelho: healthScores.filter((h) => h.score < 50).length,
  };

  const riskClients = new Set(
    healthScores.filter((h) => h.escalationRisk || h.score < 50).map((h) => h.client.tradeName),
  ).size;

  const detractors = npsEntries.filter((n) => n.classification === "DETRATOR");
  const openDetractors = detractors.filter((n) => n.treatmentStatus !== "CONCLUIDO");
  const npsByPhase = Object.entries(
    npsEntries.reduce((acc, item) => {
      if (!acc[item.phase]) acc[item.phase] = [];
      acc[item.phase].push(item);
      return acc;
    }, {}),
  ).map(([phase, entries]) => ({
    phase,
    nps: computeNps(entries),
    responses: entries.length,
  }));

  const averageTreatmentTimeDays =
    detractors.length === 0
      ? 0
      : Number(
          (
            detractors.reduce((acc, nps) => {
              const diff = (new Date() - new Date(nps.date)) / (1000 * 60 * 60 * 24);
              return acc + diff;
            }, 0) / detractors.length
          ).toFixed(1),
        );

  const projectsInRisk = projects.filter((p) => ["ALTO", "CRITICO"].includes(p.projectRisk)).length;

  return {
    kpis: {
      clientsGreen: healthDistribution.verde,
      clientsYellow: healthDistribution.amarelo,
      clientsRed: healthDistribution.vermelho,
      clientsAtRisk: riskClients,
      overallNps: computeNps(npsEntries),
      openDetractors: openDetractors.length,
      pendingActionPlans: tasks.filter((t) => t.status !== "CONCLUIDA").length,
      projectsInRisk,
      averageTreatmentTimeDays,
    },
    healthScores: healthScores.slice(0, 20).map((h) => ({
      id: h.id,
      client: h.client.tradeName,
      project: h.project.name,
      csOwner: h.csOwner.name,
      score: h.score,
      status: h.status,
      escalationRisk: h.escalationRisk,
      engagement: h.engagement,
      scheduleAdherence: h.scheduleAdherence,
      openPendencies: h.openPendencies,
      createdAt: h.createdAt,
    })),
    npsByPhase,
    latestNps: npsEntries.slice(0, 20),
  };
}

