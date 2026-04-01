import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

const WRITE_ROLES = ["ADMIN", "COORDENADOR", "GERENTE", "CS"];

export default async function handler(req, res) {
  if (req.method === "GET") {
    const user = await requireAuth(req, res, []);
    if (!user) return;

    const data = await prisma.task.findMany({
      include: {
        responsible: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        client: { select: { id: true, tradeName: true } },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
      take: 300,
    });

    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const user = await requireAuth(req, res, WRITE_ROLES);
    if (!user) return;

    const body = await parseBody(req);
    if (!body.title || !body.responsibleId || !body.dueDate || !body.origin) {
      return res.status(400).json({
        error: "Título, responsável, prazo e origem são obrigatórios.",
      });
    }

    const created = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        responsibleId: body.responsibleId,
        dueDate: new Date(body.dueDate),
        priority: body.priority || "MEDIA",
        status: body.status || "ABERTA",
        origin: body.origin,
        clientId: body.clientId || null,
        projectId: body.projectId || null,
        comments: body.comments || null,
      },
    });

    return res.status(201).json(created);
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
