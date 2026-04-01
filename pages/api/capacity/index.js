import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"]);
  if (!user) return;

  const collaborators = await prisma.collaborator.findMany({
    where: { status: true },
    include: {
      allocations: true,
      consultantProjects: { include: { project: true } },
      skills: { include: { module: true, core: true } },
    },
    orderBy: { name: "asc" },
  });

  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const byCollaborator = collaborators.map((collab) => {
    const weekHours = collab.allocations
      .filter((a) => new Date(a.date) >= weekStart)
      .reduce((acc, a) => acc + a.allocatedHours, 0);

    const monthHours = collab.allocations
      .filter((a) => new Date(a.date) >= monthStart)
      .reduce((acc, a) => acc + a.allocatedHours, 0);

    const occupancy = collab.usefulCapacity > 0 ? (monthHours / collab.usefulCapacity) * 100 : 0;
    const overload = Math.max(0, occupancy - 100);
    const slack = Math.max(0, collab.usefulCapacity - monthHours);

    const uniqueProjects = new Set(collab.consultantProjects.map((cp) => cp.projectId)).size;
    const uniqueModules = new Set(collab.allocations.map((a) => a.moduleId)).size;

    const dayCount = {};
    collab.allocations.forEach((a) => {
      const key = new Date(a.date).toISOString().slice(0, 10);
      dayCount[key] = (dayCount[key] || 0) + 1;
    });
    const fragIdx = Object.values(dayCount).length
      ? Object.values(dayCount).reduce((acc, q) => acc + q, 0) / Object.values(dayCount).length
      : 0;

    return {
      id: collab.id,
      nome: collab.name,
      capacidadeNominal: collab.nominalCapacity,
      capacidadeUtil: collab.usefulCapacity,
      horasSemana: Number(weekHours.toFixed(1)),
      horasMes: Number(monthHours.toFixed(1)),
      ocupacaoPercentual: Number(occupancy.toFixed(1)),
      sobrecargaPercentual: Number(overload.toFixed(1)),
      folgaDisponivel: Number(slack.toFixed(1)),
      projetosSimultaneos: uniqueProjects,
      modulosSimultaneos: uniqueModules,
      indiceFragmentacao: Number(fragIdx.toFixed(2)),
      semaforo: occupancy > 100 ? "vermelho" : occupancy > 80 ? "amarelo" : "verde",
    };
  });

  const byCore = await prisma.core.findMany({
    include: {
      allocations: true,
      skills: true,
      modules: true,
    },
  });

  const coreView = byCore.map((core) => ({
    core: core.name,
    horas: Number(core.allocations.reduce((acc, a) => acc + a.allocatedHours, 0).toFixed(1)),
    cobertura: core.skills.length,
    modulos: core.modules.length,
  }));

  const byModule = await prisma.businessModule.findMany({
    include: {
      allocations: true,
      skills: true,
    },
  });

  const moduleView = byModule.map((mod) => {
    const level4Count = mod.skills.filter((s) => s.level === 4).length;
    const alertSinglePoint = level4Count <= 1;
    const skillCoverageGap = mod.skills.length < mod.minimumCapacitated;

    return {
      modulo: mod.name,
      horas: Number(mod.allocations.reduce((acc, a) => acc + a.allocatedHours, 0).toFixed(1)),
      pessoasCapacitadas: mod.skills.length,
      minimoRecomendado: mod.minimumCapacitated,
      singlePointOfFailure: alertSinglePoint,
      baixaCobertura: skillCoverageGap,
      dependenciaEspecialista: alertSinglePoint,
      requerCrossTraining: skillCoverageGap || alertSinglePoint,
    };
  });

  res.status(200).json({
    byCollaborator,
    byCore: coreView,
    byModule: moduleView,
  });
}
