import { canViewRoute } from "@/lib/access";
import { getSessionUser } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"]);
    return;
  }

  const user = await getSessionUser(req);
  if (!user) {
    res.status(200).json({ user: null, allowed: false });
    return;
  }

  const routeKey = String(req.query.routeKey || "").trim();
  const allowed = routeKey ? canViewRoute(user.role, routeKey) : true;
  res.status(200).json({ user, allowed });
}
