import { clearSessionCookie } from "@/lib/auth";
import { methodNotAllowed } from "@/lib/http";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  clearSessionCookie(res);
  res.status(200).json({ ok: true });
}
