import { prisma } from "@/lib/prisma";
import { methodNotAllowed, parseBody } from "@/lib/http";
import { requireAuth } from "@/lib/auth";

export default async function handler(req, res) {
  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "CS", "DIRETORIA"]);
  if (!user) return;

  if (req.method === "GET") {
    const clients = await prisma.client.findMany({
      include: { projects: { select: { id: true, status: true } } },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ items: clients });
  }

  if (req.method === "POST") {
    if (!["ADMIN", "COORDENADOR", "GERENTE", "CS"].includes(user.role)) {
      return res.status(403).json({ error: "Sem permissão para criar clientes." });
    }

    try {
      const body = await parseBody(req);
      const created = await prisma.client.create({
        data: {
          corporateName: body.corporateName,
          tradeName: body.tradeName,
          segment: body.segment,
          companySize: body.companySize,
          city: body.city,
          state: body.state,
          mainContact: body.mainContact,
          executiveSponsor: body.executiveSponsor || null,
          implementationStatus: body.implementationStatus || "PLANEJADO",
          currentRisk: body.currentRisk || "MEDIO",
          startDate: new Date(body.startDate),
          goLiveForecast: new Date(body.goLiveForecast),
          notes: body.notes || null,
        },
      });

      return res.status(201).json(created);
    } catch (error) {
      return res.status(400).json({ error: "Falha ao criar cliente.", details: error.message });
    }
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}

