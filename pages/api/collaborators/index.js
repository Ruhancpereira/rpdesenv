import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

function parseFloatSafe(value, fallback = 0) {
  const num = Number.parseFloat(value);
  return Number.isFinite(num) ? num : fallback;
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"]);
    if (!user) return;

    const items = await prisma.collaborator.findMany({
      include: {
        skills: {
          include: {
            core: true,
            module: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ items });
    return;
  }

  if (req.method === "POST") {
    const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE"]);
    if (!user) return;

    const body = await parseBody(req);

    if (!body.name || !body.email || !body.roleTitle || !body.cityRegion) {
      res.status(400).json({ error: "Preencha os campos obrigatórios do colaborador." });
      return;
    }

    try {
      const item = await prisma.collaborator.create({
        data: {
          name: body.name,
          roleTitle: body.roleTitle,
          status: body.status ?? true,
          dailyHours: parseFloatSafe(body.dailyHours, 8),
          weeklyHours: parseFloatSafe(body.weeklyHours, 40),
          nominalCapacity: parseFloatSafe(body.nominalCapacity, 160),
          usefulCapacity: parseFloatSafe(body.usefulCapacity, 128),
          email: body.email,
          phone: body.phone || null,
          managerName: body.managerName || null,
          notes: body.notes || null,
          cityRegion: body.cityRegion,
          canTravel: Boolean(body.canTravel),
          remoteEnabled: Boolean(body.remoteEnabled),
        },
      });

      await prisma.auditLog.create({
        data: {
          entityType: "COLLABORATOR",
          entityId: item.id,
          action: "CREATE",
          details: `Colaborador ${item.name} cadastrado`,
          userId: user.id,
        },
      });

      res.status(201).json({ item });
    } catch (error) {
      if (error.code === "P2002") {
        res.status(409).json({ error: "Já existe um colaborador com esse e-mail." });
        return;
      }
      res.status(500).json({ error: "Erro ao criar colaborador." });
    }
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
