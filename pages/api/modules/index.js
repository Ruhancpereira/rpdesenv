import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";
import { appendAudit } from "@/lib/audit";

export default async function handler(req, res) {
  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE"]);
  if (!user) return;

  if (req.method === "GET") {
    const cores = await prisma.core.findMany({
      include: {
        modules: {
          include: {
            submodules: true,
            skills: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ cores });
    return;
  }

  if (req.method === "POST") {
    try {
      const body = await parseBody(req);
      const type = body?.type;

      if (type === "core") {
        const core = await prisma.core.create({
          data: {
            name: body.name,
            description: body.description || null,
            criticality: body.criticality || "MEDIO",
          },
        });
        await appendAudit({
          entityType: "CORE",
          entityId: core.id,
          action: "CREATE",
          details: `Core criado: ${core.name}`,
          userId: user.id,
        });
        res.status(201).json(core);
        return;
      }

      if (type === "module") {
        const moduleData = await prisma.businessModule.create({
          data: {
            name: body.name,
            coreId: body.coreId,
            criticality: body.criticality || "MEDIO",
            minimumCapacitated: Number(body.minimumCapacitated || 1),
          },
        });
        await appendAudit({
          entityType: "MODULE",
          entityId: moduleData.id,
          action: "CREATE",
          details: `Módulo criado: ${moduleData.name}`,
          userId: user.id,
        });
        res.status(201).json(moduleData);
        return;
      }

      if (type === "submodule") {
        const submodule = await prisma.submodule.create({
          data: {
            name: body.name,
            moduleId: body.moduleId,
            criticality: body.criticality || "MEDIO",
          },
        });
        await appendAudit({
          entityType: "SUBMODULE",
          entityId: submodule.id,
          action: "CREATE",
          details: `Submódulo criado: ${submodule.name}`,
          userId: user.id,
        });
        res.status(201).json(submodule);
        return;
      }

      res.status(400).json({ error: "Tipo inválido. Use core, module ou submodule." });
    } catch (error) {
      res.status(400).json({ error: "Falha ao criar registro de módulo/core.", details: error.message });
    }
    return;
  }

  methodNotAllowed(res, ["GET", "POST"]);
}
