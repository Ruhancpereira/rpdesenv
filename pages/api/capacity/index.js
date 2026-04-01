import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";
import {
  getCapacityAnalytics,
  getSkillsMatrix,
  getClientRiskPanel,
  getProjectExecutionViews,
  upsertSpofAlerts,
} from "@/lib/operational-analytics";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"]);
  if (!user) return;
  const [capacity, matrix, riskPanel, execution, spofSync] = await Promise.all([
    getCapacityAnalytics(),
    getSkillsMatrix(),
    getClientRiskPanel(),
    getProjectExecutionViews(),
    upsertSpofAlerts(user.id),
  ]);

  res.status(200).json({
    ...capacity,
    skillsMatrix: matrix,
    riskPanel,
    execution,
    automation: {
      spofSync,
    },
  });
}
