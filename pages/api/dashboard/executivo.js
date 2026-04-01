import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";

const DAY_MS = 24 * 60 * 60 * 1000;

function calculateNps(entries) {
  if (!entries.length) return 0;
  const promoters = entries.filter((e) => e.score >= 9).length;
  const detractors = entries.filter((e) => e.score <= 6).length;
  return Math.round(((promoters - detractors) / entries.length) * 100);
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function riskToSemaforo(risk) {
  if (risk === "CRITICO" || risk === "ALTO") return "VERMELHO";
  if (risk === "MEDIO") return "AMARELO";
  return "VERDE";
}

function occupancyToSemaforo(occupancy) {
  if (occupancy > 100) return "VERMELHO";
  if (occupancy > 80) return "AMARELO";
  return "VERDE";
}

function severityWeight(severity) {
  if (severity === "CRITICO") return 4;
  if (severity === "ALTO") return 3;
  if (severity === "MEDIO") return 2;
  return 1;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE"]);
  if (!user) return;

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    projects,
    healthScores,
    collaborators,
    npsEntries,
    alerts,
    clients,
    modules,
  ] = await Promise.all([
    prisma.project.findMany({ include: { client: true } }),
    prisma.healthScore.findMany(),
    prisma.collaborator.findMany({
      where: { status: true },
      include: {
        allocations: {
          where: {
            date: {
              gte: monthStart,
              lt: monthEnd,
            },
          },
        },
      },
    }),
    prisma.npsEntry.findMany(),
    prisma.automationAlert.findMany({ where: { resolved: false } }),
    prisma.client.findMany(),
    prisma.businessModule.findMany({
      include: {
        core: true,
        skills: true,
        allocations: {
          where: {
            date: {
              gte: monthStart,
              lt: monthEnd,
            },
          },
        },
      },
    }),
  ]);

  const activeProjects = projects.filter((p) => p.status !== "CONCLUIDO");
  const delayedProjects = activeProjects.filter(
    (p) => p.status === "ATRASADO" || p.targetEndDate < now,
  );
  const riskyProjects = activeProjects.filter(
    (p) =>
      ["ALTO", "CRITICO"].includes(p.projectRisk) ||
      p.status === "ATRASADO" ||
      p.status === "BLOQUEADO",
  );
  const avgDelayDays = delayedProjects.length
    ? Number(
        (
          delayedProjects.reduce((sum, project) => {
            const delay = Math.max(0, project.status === "ATRASADO" ? now - project.targetEndDate : 0);
            const overdue = Math.max(0, now - project.targetEndDate);
            return sum + Math.max(delay, overdue) / DAY_MS;
          }, 0) / delayedProjects.length
        ).toFixed(1),
      )
    : 0;
  const onTimeRate = activeProjects.length
    ? Math.round(
        (activeProjects.filter(
          (p) =>
            p.status !== "ATRASADO" &&
            p.status !== "BLOQUEADO" &&
            p.targetEndDate >= now,
        ).length /
          activeProjects.length) *
          100,
      )
    : 0;

  const avgHealth = healthScores.length
    ? Number(
        (
          healthScores.reduce((acc, item) => acc + Number(item.score || 0), 0) /
          healthScores.length
        ).toFixed(1),
      )
    : 0;

  const capacityByCollaborator = collaborators
    .map((collaborator) => {
      const usefulCapacity = Number(collaborator.usefulCapacity || 0);
      const monthHours = collaborator.allocations.reduce(
        (acc, item) => acc + Number(item.allocatedHours || 0),
        0,
      );
      const occupancy = usefulCapacity > 0 ? (monthHours / usefulCapacity) * 100 : 0;
      const semaforo = occupancyToSemaforo(occupancy);
      return {
        collaboratorId: collaborator.id,
        collaborator: collaborator.name,
        capacidadeUtil: Number(usefulCapacity.toFixed(1)),
        horasAlocadasMes: Number(monthHours.toFixed(1)),
        ocupacaoMes: Number(occupancy.toFixed(1)),
        sobrecargaHoras: Number(Math.max(0, monthHours - usefulCapacity).toFixed(1)),
        semaforo,
      };
    })
    .sort((a, b) => b.ocupacaoMes - a.ocupacaoMes);

  const monthlyHours = capacityByCollaborator.reduce((acc, item) => acc + item.horasAlocadasMes, 0);
  const totalUsefulCapacity = capacityByCollaborator.reduce((acc, item) => acc + item.capacidadeUtil, 0);
  const avgTeamCapacity = totalUsefulCapacity
    ? Math.round((monthlyHours / totalUsefulCapacity) * 100)
    : 0;

  const capacityDistribution = {
    VERDE: capacityByCollaborator.filter((c) => c.semaforo === "VERDE").length,
    AMARELO: capacityByCollaborator.filter((c) => c.semaforo === "AMARELO").length,
    VERMELHO: capacityByCollaborator.filter((c) => c.semaforo === "VERMELHO").length,
  };
  const collaboratorsOverloaded = capacityByCollaborator.filter((c) => c.ocupacaoMes > 100);

  const moduleRiskRanking = modules
    .map((module) => {
      const specialists = module.skills.filter((s) => s.level >= 4).length;
      const autonomous = module.skills.filter((s) => s.level >= 3).length;
      const demandMonth = module.allocations.reduce((sum, a) => sum + Number(a.allocatedHours || 0), 0);
      const gap = Math.max(0, Number(module.minimumCapacitated || 0) - autonomous);
      const score = Math.min(
        100,
        gap * 30 +
          (specialists <= 1 ? 35 : 0) +
          (demandMonth >= 140 ? 25 : demandMonth >= 90 ? 18 : demandMonth >= 40 ? 10 : 4),
      );
      const severidade =
        score >= 75 ? "CRITICO" : score >= 55 ? "ALTO" : score >= 30 ? "MEDIO" : "BAIXO";
      return {
        moduleId: module.id,
        modulo: module.name,
        core: module.core?.name || "-",
        especialistas: specialists,
        autonomia: autonomous,
        minimo: module.minimumCapacitated,
        gap,
        demandaMes: Number(demandMonth.toFixed(1)),
        riscoScore: Number(score.toFixed(1)),
        severidade,
        semaforo: riskToSemaforo(severidade),
      };
    })
    .sort((a, b) => b.riscoScore - a.riscoScore);

  const projectsByClient = projects.reduce((acc, project) => {
    if (!acc.has(project.clientId)) acc.set(project.clientId, []);
    acc.get(project.clientId).push(project);
    return acc;
  }, new Map());
  const healthByClient = healthScores.reduce((acc, entry) => {
    if (!acc.has(entry.clientId)) acc.set(entry.clientId, []);
    acc.get(entry.clientId).push(Number(entry.score || 0));
    return acc;
  }, new Map());
  const npsByClient = npsEntries.reduce((acc, entry) => {
    if (!acc.has(entry.clientId)) acc.set(entry.clientId, []);
    acc.get(entry.clientId).push(entry);
    return acc;
  }, new Map());

  const clientRiskRanking = clients
    .map((client) => {
      const clientProjects = projectsByClient.get(client.id) || [];
      const clientDelayed = clientProjects.filter(
        (project) =>
          project.status === "ATRASADO" ||
          (project.status !== "CONCLUIDO" && project.targetEndDate < now),
      ).length;
      const healthValues = healthByClient.get(client.id) || [];
      const avgClientHealth = healthValues.length
        ? healthValues.reduce((sum, item) => sum + item, 0) / healthValues.length
        : 0;
      const clientNpsEntries = npsByClient.get(client.id) || [];
      const clientNps = calculateNps(clientNpsEntries);
      const baseRiskScore =
        client.currentRisk === "CRITICO"
          ? 80
          : client.currentRisk === "ALTO"
            ? 65
            : client.currentRisk === "MEDIO"
              ? 35
              : 10;
      const riskScore = Math.min(
        100,
        baseRiskScore +
          (avgClientHealth < 55 ? 25 : avgClientHealth < 70 ? 12 : 0) +
          (clientNps < 0 ? 20 : clientNps < 30 ? 10 : 0) +
          Math.min(20, clientDelayed * 10),
      );
      const risco = riskScore >= 75 ? "CRITICO" : riskScore >= 55 ? "ALTO" : riskScore >= 35 ? "MEDIO" : "BAIXO";
      return {
        clientId: client.id,
        client: client.tradeName,
        segmento: client.segment,
        healthScore: Number(avgClientHealth.toFixed(1)),
        nps: clientNps,
        projetosAtrasados: clientDelayed,
        risco,
        riscoScore: Number(riskScore.toFixed(1)),
        semaforo: riskToSemaforo(risco),
      };
    })
    .sort((a, b) => b.riscoScore - a.riscoScore);

  const operationalBottlenecks = [
    ...delayedProjects.map((project) => {
      const delayDays = Math.max(1, Math.round((now - project.targetEndDate) / DAY_MS));
      const severidade = delayDays >= 30 ? "CRITICO" : delayDays >= 15 ? "ALTO" : "MEDIO";
      return {
        tipo: "Projeto em atraso",
        item: project.name,
        impacto: `${delayDays} dias`,
        severidade,
        semaforo: riskToSemaforo(severidade),
        detalhe: `${project.client?.tradeName || "-"} | fase ${project.currentPhase}`,
        score: delayDays * severityWeight(severidade),
      };
    }),
    ...collaboratorsOverloaded.map((collaborator) => {
      const over = Math.max(0, collaborator.ocupacaoMes - 100);
      const severidade = over >= 30 ? "CRITICO" : over >= 15 ? "ALTO" : "MEDIO";
      return {
        tipo: "Sobrecarga de capacidade",
        item: collaborator.collaborator,
        impacto: `${collaborator.ocupacaoMes.toFixed(1)}%`,
        severidade,
        semaforo: riskToSemaforo(severidade),
        detalhe: `${collaborator.sobrecargaHoras.toFixed(1)}h acima da capacidade útil`,
        score: over * severityWeight(severidade),
      };
    }),
    ...moduleRiskRanking
      .filter((module) => module.severidade !== "BAIXO")
      .map((module) => ({
        tipo: "Gargalo de módulo",
        item: module.modulo,
        impacto: `${module.riscoScore.toFixed(1)} pts`,
        severidade: module.severidade,
        semaforo: riskToSemaforo(module.severidade),
        detalhe: `${module.core} | gap ${module.gap} | N4 ${module.especialistas}`,
        score: module.riscoScore * severityWeight(module.severidade),
      })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ score, ...item }) => item);

  res.status(200).json({
    metrics: {
      projetosAtivos: activeProjects.length,
      projetosEmRisco: riskyProjects.length,
      atrasoMedioDias: avgDelayDays,
      taxaNoPrazo: onTimeRate,
      npsGeral: calculateNps(npsEntries),
      healthScoreMedio: avgHealth,
      capacidadeMediaTime: avgTeamCapacity,
      colaboradoresSobrecarregados: collaboratorsOverloaded.length,
      modulosComMaiorRisco: moduleRiskRanking.filter((m) => ["CRITICO", "ALTO"].includes(m.severidade))
        .length,
      clientesCriticos: clientRiskRanking.filter((c) => ["CRITICO", "ALTO"].includes(c.risco)).length,
      alertasAbertos: alerts.length,
    },
    distribution: {
      capacidade: {
        total: capacityByCollaborator.length,
        verde: capacityDistribution.VERDE,
        amarelo: capacityDistribution.AMARELO,
        vermelho: capacityDistribution.VERMELHO,
      },
    },
    capacityByCollaborator: capacityByCollaborator.slice(0, 12),
    overloadedCollaborators: collaboratorsOverloaded.slice(0, 8),
    topModulesRisk: moduleRiskRanking.slice(0, 8),
    criticalClients: clientRiskRanking.filter((c) => ["CRITICO", "ALTO"].includes(c.risco)).slice(0, 8),
    operationalBottlenecks,
    alertas: alerts.slice(0, 8),
  });
}
