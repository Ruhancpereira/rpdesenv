import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { parseBody, methodNotAllowed } from "@/lib/http";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"]);
    return;
  }

  try {
    const body = await parseBody(req);
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      res.status(400).json({ error: "Informe e-mail e senha." });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.active || user.passwordHash !== hashPassword(password)) {
      res.status(401).json({ error: "Credenciais inválidas." });
      return;
    }

    setSessionCookie(res, { userId: user.id, role: user.role });
    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Falha ao autenticar.", details: error.message });
  }
}
