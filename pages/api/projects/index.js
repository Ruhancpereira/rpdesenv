import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

const READ_ROLES = ["ADMIN", "COORDENADOR", "GERENTE", "CS", "DIRETORIA", "CONSULTOR"];
const WRITE_ROLES = ["ADMIN", "COORDENADOR", "GERENTE"];
const PHASES = [
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

export default async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res, READ_ROLES);
    if (!user) return;

    const rows = await prisma.project.findMany({
      include: {
        client: { select: { tradeName: true } },
        manager: { select: { name: true } },
        csOwner: { select: { name: true } },
        consultants: { include: { collaborator: { select: { name: true } } } },
      },
      orderBy: { targetEndDate: "asc" },
    });

    res.status(200).json(rows);
    return;
  }

  if (req.method === "POST") {
    const user = await requireAuth(req, res, WRITE_ROLES);
    if (!user) return;

    try {
      const body = await parseBody(req);
      const {
        name,
        clientId,
        managerId,
        csOwnerId,
        status,
        currentPhase,
        priority,
        criticality,
        startDate,
        targetEndDate,
        progressPercent,
        projectRisk,
        consultantIds,
        clientPending,
        internalPending,
        notes,
      } = body;

      if (!name || !clientId || !managerId || !csOwnerId || !startDate || !targetEndDate) {
        res.status(400).json({ error: "Preencha os campos obrigatórios." });
        return;
      }

      const created = await prisma.project.create({
        data: {
          name,
          clientId,
          managerId,
          csOwnerId,
          status: status || "PLANEJADO",
          currentPhase: currentPhase || "pré-kickoff",
          priority: priority || "MEDIA",
          criticality: criticality || "MEDIO",
          startDate: new Date(startDate),
          targetEndDate: new Date(targetEndDate),
          progressPercent: Number(progressPercent ?? 0),
          projectRisk: projectRisk || "MEDIO",
          clientPending: clientPending || null,
          internalPending: internalPending || null,
          notes: notes || null,
          consultants: {
            create: Array.isArray(consultantIds)
              ? consultantIds.map((collaboratorId) => ({ collaboratorId }))
              : [],
          },
          phases: {
            create: PHASES.map((phaseName) => ({
              name: phaseName,
              checklist: "Checklist padrão da fase",
              responsibleId: managerId,
              plannedDate: new Date(startDate),
              status: phaseName === (currentPhase || "pré-kickoff") ? "EM_ANDAMENTO" : "NAO_INICIADA",
            })),
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          entityType: "PROJECT",
          entityId: created.id,
          action: "CREATE",
          details: `Projeto ${created.name} criado`,
          userId: user.id,
        },
      });

      const fullCreated = await prisma.project.findUnique({
        where: { id: created.id },
        include: {
          client: { select: { tradeName: true } },
          manager: { select: { name: true } },
          csOwner: { select: { name: true } },
          consultants: { include: { collaborator: { select: { name: true } } } },
        },
      });

      res.status(201).json(fullCreated);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Falha ao criar projeto." });
    }
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
