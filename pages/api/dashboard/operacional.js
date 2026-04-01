import { prisma } from "@/lib/prisma";
import { methodNotAllowed } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "CONSULTOR"]);
  if (!user) return;

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const [allocationsWeek, delayedProjects, blockedPhases, criticalTasks] = await Promise.all([
    prisma.allocation.findMany({
      where: { date: { gte: weekStart, lte: weekEnd } },
      include: { collaborator: true, client: true, project: true, module: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
    prisma.project.findMany({
      where: { status: "ATRASADO" },
      include: { client: true },
    }),
    prisma.projectPhase.findMany({
      where: { status: "BLOQUEADA" },
      include: { project: true },
    }),
    prisma.task.findMany({
      where: {
        status: { in: ["ABERTA", "EM_ANDAMENTO", "BLOQUEADA"] },
        priority: { in: ["ALTA", "CRITICA"] },
      },
      include: { project: true, client: true },
      orderBy: { dueDate: "asc" },
      take: 8,
    }),
  ]);

  const allocationsByConsultorAndDate = new Map();
  const collisions = [];
  let totalHours = 0;

  for (const allocation of allocationsWeek) {
    totalHours += allocation.allocatedHours;
    const key = `${allocation.collaboratorId}_${allocation.date.toISOString().split("T")[0]}`;
    if (!allocationsByConsultorAndDate.has(key)) {
      allocationsByConsultorAndDate.set(key, []);
    }
    allocationsByConsultorAndDate.get(key).push(allocation);
  }

  for (const allocs of allocationsByConsultorAndDate.values()) {
    const sorted = [...allocs].sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 0; i < sorted.length - 1; i += 1) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.endTime > next.startTime) {
        collisions.push({
          collaborator: current.collaborator.name,
          date: current.date,
          currentProject: current.project.name,
          nextProject: next.project.name,
          rangeA: `${current.startTime} - ${current.endTime}`,
          rangeB: `${next.startTime} - ${next.endTime}`,
        });
      }
    }
  }

  const retrabalho = allocationsWeek.filter((a) => a.activityType === "RETRABALHO").length;
  const ociosidadeEstimada = Math.max(0, 40 * 5 - totalHours);

  res.status(200).json({
    metrics: {
      agendaSemana: allocationsWeek.length,
      conflitos: collisions.length,
      horasAlocadas: totalHours,
      horasOciosasEstimadas: ociosidadeEstimada,
      retrabalho,
      clientesComAtraso: delayedProjects.length,
      fasesTravadas: blockedPhases.length,
      pendenciasCriticas: criticalTasks.length,
    },
    collisions,
    allocationsWeek,
    delayedProjects,
    blockedPhases,
    criticalTasks,
  });
}
