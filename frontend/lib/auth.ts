import crypto from "node:crypto";

// ── JWT implementation using native Node.js crypto ─────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || "trydelta-mvp-secret-change-in-production";
const JWT_EXPIRES_IN = 60 * 60 * 12; // 12 hours

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  tenant_id: string;
  iat: number;
  exp: number;
};

function base64url(data: Buffer | string): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64url");
}

function base64urlDecode(data: string): Buffer {
  return Buffer.from(data, "base64url");
}

export function signToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + JWT_EXPIRES_IN,
  };

  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(fullPayload));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${headerB64}.${payloadB64}`)
    .digest();

  return `${headerB64}.${payloadB64}.${base64url(signature)}`;
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest();

    const actualSig = base64urlDecode(signatureB64);

    if (!crypto.timingSafeEqual(expectedSig, actualSig)) return null;

    const payload = JSON.parse(base64urlDecode(payloadB64).toString("utf-8")) as JwtPayload;

    if (payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)trydelta_session=([^;]*)/);
  return match ? match[1] : null;
}

export function getTenantFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)trydelta_tenant=([^;]*)/);
  return match ? match[1] : null;
}
