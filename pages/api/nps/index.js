import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

function classifyNps(score) {
  if (score >= 9) return "PROMOTOR";
  if (score >= 7) return "NEUTRO";
  return "DETRATOR";
}

async function createAutomationTaskForNps(entry, userId) {
  const project = await prisma.project.findUnique({
    where: { id: entry.projectId },
    include: { manager: true, csOwner: true },
  });

  if (!project) return;

  if (entry.classification === "DETRATOR") {
    await prisma.task.create({
      data: {
        title: `Recuperação de detrator - ${project.name}`,
        description: "Caso criado automaticamente após registro de NPS detrator.",
        responsibleId: project.managerId,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
        priority: "CRITICA",
        origin: "AUTOMACAO",
        status: "ABERTA",
        clientId: entry.clientId,
        projectId: entry.projectId,
        npsId: entry.id,
      },
    });
  } else if (entry.classification === "NEUTRO") {
    await prisma.task.create({
      data: {
        title: `Plano de melhoria de NPS - ${project.name}`,
        description: "Plano de melhoria automático para NPS neutro.",
        responsibleId: project.csOwnerId,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        priority: "ALTA",
        origin: "NPS",
        status: "ABERTA",
        clientId: entry.clientId,
        projectId: entry.projectId,
        npsId: entry.id,
      },
    });
  } else if (entry.classification === "PROMOTOR") {
    await prisma.task.create({
      data: {
        title: `Captar depoimento/case - ${project.name}`,
        description: "Oportunidade criada automaticamente para promotor.",
        responsibleId: project.csOwnerId,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
        priority: "MEDIA",
        origin: "AUTOMACAO",
        status: "ABERTA",
        clientId: entry.clientId,
        projectId: entry.projectId,
        npsId: entry.id,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      entityType: "NPS",
      entityId: entry.id,
      action: "CREATE",
      details: `NPS registrado (${entry.classification}) e automação executada.`,
      userId,
    },
  });
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res, ["ADMIN", "CS", "GERENTE", "DIRETORIA"]);
    if (!user) return;

    const entries = await prisma.npsEntry.findMany({
      include: {
        client: { select: { tradeName: true } },
        project: { select: { name: true } },
        treatmentOwner: { select: { name: true } },
      },
      orderBy: { date: "desc" },
    });

    return res.status(200).json(entries);
  }

  if (req.method === "POST") {
    const user = await requireAuth(req, res, ["ADMIN", "CS", "GERENTE"]);
    if (!user) return;

    try {
      const body = await parseBody(req);
      const score = Number(body.score || 0);
      const classification = classifyNps(score);

      const entry = await prisma.npsEntry.create({
        data: {
          clientId: body.clientId,
          projectId: body.projectId,
          phase: body.phase,
          date: body.date ? new Date(body.date) : new Date(),
          score,
          comment: body.comment || null,
          mainReason: body.mainReason || "Não informado",
          reasonCategory: body.reasonCategory || "Geral",
          treatmentOwnerId: body.treatmentOwnerId || null,
          actionPlan: body.actionPlan || null,
          treatmentStatus: classification === "DETRATOR" ? "EM_TRATAMENTO" : "ABERTO",
          classification,
        },
      });

      await createAutomationTaskForNps(entry, user.id);

      return res.status(201).json(entry);
    } catch (error) {
      return res.status(400).json({ error: "Não foi possível salvar NPS.", details: error.message });
    }
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
