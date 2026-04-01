import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";
import {
  getCapacityAnalytics,
  getClientRiskPanel,
  getProjectExecutionViews,
  upsertSpofAlerts,
} from "@/lib/operational-analytics";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA", "CS"]);
  if (!user) return;

  await upsertSpofAlerts(user.id);
  const [capacity, risks, execution] = await Promise.all([
    getCapacityAnalytics(),
    getClientRiskPanel(),
    getProjectExecutionViews(),
  ]);

  const criticalModules = capacity.byModule.filter((m) => m.severidade === "CRITICO").length;
  const overloadedConsultants = capacity.byCollaborator.filter(
    (c) => c.ocupacaoSemana > 100 || c.ocupacaoMes > 100,
  ).length;
  const blockedProjects = execution.timeline.filter((p) => p.status === "BLOQUEADO").length;

  res.status(200).json({
    summary: {
      criticalModules,
      overloadedConsultants,
      blockedProjects,
      highRiskClients: risks.summary.red || 0,
      avgHealth: risks.summary.avgHealth || 0,
      avgNps: risks.summary.avgNps || 0,
    },
    capacity,
    risks,
    execution,
  });
}
