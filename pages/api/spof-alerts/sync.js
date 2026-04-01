import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";
import { upsertSpofAlerts } from "@/lib/operational-analytics";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE"]);
  if (!user) return;

  const result = await upsertSpofAlerts(user.id);
  res.status(200).json(result);
}

