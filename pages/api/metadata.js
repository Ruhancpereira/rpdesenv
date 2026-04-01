import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, ["GET"]);

  const user = await requireAuth(req, res, []);
  if (!user) return;

  const [collaborators, clients, projects, cores, modules] = await Promise.all([
    prisma.collaborator.findMany({
      where: { status: true },
      select: { id: true, name: true, roleTitle: true },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      select: { id: true, tradeName: true },
      orderBy: { tradeName: "asc" },
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.core.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.businessModule.findMany({
      select: { id: true, name: true, coreId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  res.status(200).json({
    collaborators,
    clients,
    projects,
    cores,
    modules,
  });
}
