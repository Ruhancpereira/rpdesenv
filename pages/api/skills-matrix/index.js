import { requireAuth } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";
import { getSkillsMatrix } from "@/lib/operational-analytics";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await requireAuth(req, res, ["ADMIN", "COORDENADOR", "GERENTE", "DIRETORIA"]);
  if (!user) return;

  const matrix = await getSkillsMatrix();
  res.status(200).json(matrix);
}
