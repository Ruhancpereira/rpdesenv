import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";
import { getCapacityAnalytics, upsertSpofAlerts } from "@/lib/operational-analytics";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"]);
  if (!user) return;

  await upsertSpofAlerts(user.id);
  const data = await getCapacityAnalytics();
  res.status(200).json({
    byCore: data.byCore || [],
    byModule: data.byModule || [],
  });
}
