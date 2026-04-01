import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "CS", "GERENTE", "DIRETORIA"]);
  if (!user) return;

  const [healthScores, npsEntries, openDetractors, openTasks] = await Promise.all([
    prisma.healthScore.findMany({
      include: {
        client: { select: { tradeName: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.npsEntry.findMany({
      include: {
        project: { select: { name: true } },
      },
    }),
    prisma.npsEntry.count({
      where: {
        classification: "DETRATOR",
        treatmentStatus: { not: "CONCLUIDO" },
      },
    }),
    prisma.task.count({
      where: {
        origin: { in: ["NPS", "HEALTH_SCORE", "AUTOMACAO"] },
        status: { in: ["ABERTA", "EM_ANDAMENTO", "BLOQUEADA"] },
      },
    }),
  ]);

  const totalHs = healthScores.length || 1;
  const byStatus = {
    verde: healthScores.filter((hs) => hs.score >= 75).length,
    amarelo: healthScores.filter((hs) => hs.score >= 55 && hs.score < 75).length,
    vermelho: healthScores.filter((hs) => hs.score < 55).length,
  };

  const npsByPhase = npsEntries.reduce((acc, item) => {
    const current = acc[item.phase] || { total: 0, count: 0 };
    current.total += item.score;
    current.count += 1;
    acc[item.phase] = current;
    return acc;
  }, {});

  const npsPhaseArray = Object.entries(npsByPhase).map(([phase, data]) => ({
    phase,
    media: Number((data.total / data.count).toFixed(2)),
    respostas: data.count,
  }));

  const npsScore =
    npsEntries.length === 0
      ? 0
      : Math.round(
          ((npsEntries.filter((n) => n.classification === "PROMOTOR").length -
            npsEntries.filter((n) => n.classification === "DETRATOR").length) /
            npsEntries.length) *
            100,
        );

  res.status(200).json({
    summary: {
      clientesVerdes: byStatus.verde,
      clientesAmarelos: byStatus.amarelo,
      clientesVermelhos: byStatus.vermelho,
      percentualVerde: Number(((byStatus.verde / totalHs) * 100).toFixed(1)),
      npsGeral: npsScore,
      detratoresAbertos: openDetractors,
      planosPendentes: openTasks,
    },
    npsPorEtapa: npsPhaseArray,
    healthDetalhado: healthScores.map((hs) => ({
      id: hs.id,
      cliente: hs.client.tradeName,
      score: hs.score,
      engajamento: hs.engagement,
      aderenciaCronograma: hs.scheduleAdherence,
      pendencias: hs.openPendencies,
      riscoEscalada: hs.escalationRisk,
    })),
  });
}

