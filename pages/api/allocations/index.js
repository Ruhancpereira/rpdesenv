import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

function toDateOnlyString(date) {
  return date.toISOString().slice(0, 10);
}

function weekBounds() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "CONSULTOR"]);
    if (!user) return;

    const { start, end } = weekBounds();

    const allocations = await prisma.allocation.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        collaborator: { select: { id: true, name: true, usefulCapacity: true } },
        client: { select: { id: true, tradeName: true } },
        project: { select: { id: true, name: true } },
        core: { select: { id: true, name: true } },
        module: { select: { id: true, name: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });

    const byCollaboratorDate = new Map();
    const alerts = [];

    for (const item of allocations) {
      const key = `${item.collaboratorId}-${toDateOnlyString(item.date)}`;
      if (!byCollaboratorDate.has(key)) byCollaboratorDate.set(key, []);
      byCollaboratorDate.get(key).push(item);
    }

    for (const [, rows] of byCollaboratorDate.entries()) {
      rows.sort((a, b) => a.startTime.localeCompare(b.startTime));
      let totalHours = 0;
      const modules = new Set();
      const projects = new Set();

      for (let i = 0; i < rows.length; i += 1) {
        const curr = rows[i];
        totalHours += curr.allocatedHours;
        modules.add(curr.moduleId);
        projects.add(curr.projectId);
        if (i > 0 && curr.startTime < rows[i - 1].endTime) {
          alerts.push({
            type: "CONFLITO_AGENDA",
            severity: "ALTO",
            collaborator: curr.collaborator.name,
            message: `Conflito de agenda entre ${rows[i - 1].startTime}-${rows[i - 1].endTime} e ${curr.startTime}-${curr.endTime}`,
            date: toDateOnlyString(curr.date),
          });
        }
      }

      const usefulDaily = (rows[0].collaborator.usefulCapacity || 120) / 20;
      if (totalHours > usefulDaily) {
        alerts.push({
          type: "SOBRECARGA",
          severity: "CRITICO",
          collaborator: rows[0].collaborator.name,
          message: `Capacidade útil diária excedida (${totalHours}h / ${usefulDaily.toFixed(1)}h)`,
          date: toDateOnlyString(rows[0].date),
        });
      }

      if (rows.length >= 4) {
        alerts.push({
          type: "FRAGMENTACAO",
          severity: "MEDIO",
          collaborator: rows[0].collaborator.name,
          message: "Muitas trocas de contexto no mesmo dia.",
          date: toDateOnlyString(rows[0].date),
        });
      }

      if (projects.size >= 3 || modules.size >= 3) {
        alerts.push({
          type: "MULTIPLOS_CONTEXTO",
          severity: "MEDIO",
          collaborator: rows[0].collaborator.name,
          message: "Atuação simultânea em muitos projetos/módulos.",
          date: toDateOnlyString(rows[0].date),
        });
      }
    }

    res.status(200).json({ allocations, alerts });
    return;
  }

  if (req.method === "POST") {
    const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE"]);
    if (!user) return;

    const body = await parseBody(req);
    const created = await prisma.allocation.create({
      data: {
        collaboratorId: body.collaboratorId,
        clientId: body.clientId,
        projectId: body.projectId,
        coreId: body.coreId,
        moduleId: body.moduleId,
        activityType: body.activityType,
        date: new Date(body.date),
        startTime: body.startTime,
        endTime: body.endTime,
        allocatedHours: Number(body.allocatedHours || 0),
        location: body.location,
        city: body.city,
        requester: body.requester,
        priority: body.priority || "MEDIA",
        agendaStatus: body.agendaStatus || "PLANEJADA",
        notes: body.notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        entityType: "ALLOCATION",
        entityId: created.id,
        action: "CREATE",
        details: `Alocação criada por ${user.name}`,
        userId: user.id,
      },
    });

    res.status(201).json(created);
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
