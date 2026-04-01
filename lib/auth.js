import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const AUTH_COOKIE = "agrosys_session";

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payload) {
  const secret = process.env.AUTH_SECRET || "fallback-secret";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return signature;
}

export function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function createToken(sessionData) {
  const payload = base64url(JSON.stringify(sessionData));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function verifyToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return null;
  }

  const [payload, signature] = token.split(".");
  const expected = sign(payload);
  if (signature !== expected) return null;

  try {
    const decoded = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function parseCookies(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return {};
  return cookieHeader.split(";").reduce((acc, cookiePart) => {
    const [key, ...rest] = cookiePart.trim().split("=");
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export function getSessionFromReq(req) {
  const cookies = parseCookies(req);
  const token = cookies[AUTH_COOKIE];
  return verifyToken(token);
}

export function setSessionCookie(res, sessionData) {
  const token = createToken(sessionData);
  const isProd = process.env.NODE_ENV === "production";
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${isProd ? "; Secure" : ""}`,
  );
}

export function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
}

export async function requireAuth(req, res, allowedRoles = []) {
  const session = getSessionFromReq(req);
  if (!session?.userId) {
    res.status(401).json({ error: "Não autenticado." });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!user || !user.active) {
    res.status(401).json({ error: "Usuário inválido ou inativo." });
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    res.status(403).json({ error: "Acesso negado para este perfil." });
    return null;
  }

  return user;
}

export async function getSessionUser(req) {
  const session = getSessionFromReq(req);
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!user || !user.active) return null;
  return user;
}

