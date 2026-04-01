import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";
import { getClientRiskPanel } from "@/lib/operational-analytics";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, [
    "ADMIN",
    "CS",
    "GERENTE",
    "COORDENADOR",
    "DIRETORIA",
  ]);
  if (!user) return;

  const payload = await getClientRiskPanel();
  res.status(200).json(payload);
}

