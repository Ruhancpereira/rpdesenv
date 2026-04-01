import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

function riskByScore(score) {
  if (score >= 80) return "BAIXO";
  if (score >= 65) return "MEDIO";
  if (score >= 45) return "ALTO";
  return "CRITICO";
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res, ["ADMIN", "CS", "GERENTE", "DIRETORIA", "COORDENADOR"]);
    if (!user) return;

    const entries = await prisma.healthScore.findMany({
      include: {
        client: { select: { tradeName: true } },
        project: { select: { name: true } },
        csOwner: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const items = entries.map((entry) => ({
      id: entry.id,
      client: entry.client.tradeName,
      project: entry.project.name,
      csOwner: entry.csOwner.name,
      score: entry.score,
      status: entry.status,
      escalationRisk: entry.escalationRisk,
      engagement: entry.engagement,
      scheduleAdherence: entry.scheduleAdherence,
      meetingPresence: entry.meetingPresence,
      openPendencies: entry.openPendencies,
      progressPerception: entry.progressPerception,
      notes: entry.notes,
      updatedAt: entry.updatedAt,
    }));

    return res.status(200).json({ items });
  }

  if (req.method === "POST") {
    const user = await requireAuth(req, res, ["ADMIN", "CS", "GERENTE"]);
    if (!user) return;

    const body = await parseBody(req);
    const {
      clientId,
      projectId,
      csOwnerId,
      engagement,
      scheduleAdherence,
      meetingPresence,
      openPendencies,
      progressPerception,
      notes,
    } = body;

    if (!clientId || !projectId || !csOwnerId) {
      return res.status(400).json({ error: "Cliente, projeto e CS responsável são obrigatórios." });
    }

    const weights = {
      engagement: 0.25,
      scheduleAdherence: 0.25,
      meetingPresence: 0.2,
      progressPerception: 0.2,
      openPendencies: 0.1,
    };

    const pendencyScore = Math.max(0, 100 - Number(openPendencies || 0) * 8);
    const score =
      Number(engagement || 0) * weights.engagement +
      Number(scheduleAdherence || 0) * weights.scheduleAdherence +
      Number(meetingPresence || 0) * weights.meetingPresence +
      Number(progressPerception || 0) * weights.progressPerception +
      pendencyScore * weights.openPendencies;

    const status = riskByScore(score);

    const created = await prisma.healthScore.create({
      data: {
        clientId,
        projectId,
        csOwnerId,
        score,
        status,
        escalationRisk: score < 55,
        engagement: Number(engagement || 0),
        scheduleAdherence: Number(scheduleAdherence || 0),
        meetingPresence: Number(meetingPresence || 0),
        openPendencies: Number(openPendencies || 0),
        progressPerception: Number(progressPerception || 0),
        notes,
      },
    });

    if (score < 55) {
      await prisma.task.create({
        data: {
          title: "Ação de recuperação por health score crítico",
          description: "Definir plano de recuperação com cliente em risco.",
          responsibleId: csOwnerId,
          dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
          priority: "ALTA",
          status: "ABERTA",
          origin: "HEALTH_SCORE",
          clientId,
          projectId,
          healthScoreId: created.id,
        },
      });
    }

    return res.status(201).json(created);
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}

