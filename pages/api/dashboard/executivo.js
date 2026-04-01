import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";

function calculateNps(entries) {
  if (!entries.length) return 0;
  const promoters = entries.filter((e) => e.score >= 9).length;
  const detractors = entries.filter((e) => e.score <= 6).length;
  return Math.round(((promoters - detractors) / entries.length) * 100);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "DIRETORIA", "COORDENADOR", "GERENTE"]);
  if (!user) return;

  const [
    projects,
    healthScores,
    allocations,
    collaborators,
    npsEntries,
    alerts,
    clients,
    modules,
  ] = await Promise.all([
    prisma.project.findMany({ include: { client: true } }),
    prisma.healthScore.findMany(),
    prisma.allocation.findMany(),
    prisma.collaborator.findMany(),
    prisma.npsEntry.findMany(),
    prisma.automationAlert.findMany({ where: { resolved: false } }),
    prisma.client.findMany(),
    prisma.businessModule.findMany({ include: { skills: true } }),
  ]);

  const activeProjects = projects.filter((p) => p.status !== "CONCLUIDO");
  const riskyProjects = projects.filter((p) => ["ALTO", "CRITICO"].includes(p.projectRisk));
  const onTimeRate = projects.length
    ? Math.round(
        (projects.filter((p) => p.status !== "ATRASADO").length / projects.length) * 100,
      )
    : 0;

  const avgHealth = healthScores.length
    ? Math.round(
        healthScores.reduce((acc, item) => acc + item.score, 0) / healthScores.length,
      )
    : 0;

  const monthlyHours = allocations.reduce((acc, item) => acc + item.allocatedHours, 0);
  const totalUsefulCapacity = collaborators.reduce((acc, c) => acc + c.usefulCapacity, 0);
  const avgTeamCapacity = totalUsefulCapacity
    ? Math.round((monthlyHours / totalUsefulCapacity) * 100)
    : 0;

  const overloaded = await prisma.collaborator.findMany({
    include: {
      allocations: true,
    },
  });
  const overloadedCount = overloaded.filter((c) => {
    const hours = c.allocations.reduce((acc, a) => acc + a.allocatedHours, 0);
    return c.usefulCapacity > 0 && hours > c.usefulCapacity;
  }).length;

  const redClients = clients.filter((c) => ["ALTO", "CRITICO"].includes(c.currentRisk)).length;
  const modulesAtRisk = modules.filter((m) => {
    const specialists = m.skills.filter((s) => s.level >= 4).length;
    return specialists < m.minimumCapacitated;
  }).length;

  res.status(200).json({
    metrics: {
      projetosAtivos: activeProjects.length,
      projetosEmRisco: riskyProjects.length,
      taxaNoPrazo: onTimeRate,
      npsGeral: calculateNps(npsEntries),
      healthScoreMedio: avgHealth,
      capacidadeMediaTime: avgTeamCapacity,
      consultoresSobrecarregados: overloadedCount,
      modulosComMaiorRisco: modulesAtRisk,
      clientesVermelhos: redClients,
      alertasAbertos: alerts.length,
    },
    alertas: alerts.slice(0, 8),
  });
}
