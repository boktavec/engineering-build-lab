import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type { Request, Response, NextFunction } from "express";

export type User = { subject: string; username: string; roles: string[] };
declare global {
  namespace Express { interface Request { user?: User } }
}

const issuer = process.env.OIDC_ISSUER ?? "http://localhost:8080/realms/engineering";
const jwks = createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, jwks, {
    issuer,
    audience: "internal-api",
    algorithms: ["RS256"]
  });
  return payload;
}

export function authenticate(verify = verifyAccessToken) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const [scheme, token, extra] = (req.header("authorization") ?? "").split(" ");
    if (scheme !== "Bearer" || !token || extra) return res.status(401).json({ error: "Bearer token required" });
    try {
      const payload = await verify(token);
      const roles = (payload.realm_access as { roles?: unknown } | undefined)?.roles;
      req.user = {
        subject: payload.sub!,
        username: String(payload.preferred_username ?? ""),
        roles: Array.isArray(roles) ? roles.filter((role): role is string => typeof role === "string") : []
      };
      next();
    } catch {
      res.status(401).json({ error: "Invalid or expired access token" });
    }
  };
}

export function requireRole(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.roles.includes(role)) return res.status(403).json({ error: "Insufficient permission" });
    next();
  };
}
