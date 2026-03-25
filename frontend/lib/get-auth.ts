import { cookies } from "next/headers";
import { verifyToken } from "./auth";
import { findUserById, sanitizeUser } from "./db";

type AuthResult = {
  user: ReturnType<typeof sanitizeUser>;
  tenantId: string;
  role: string;
};

export async function getAuth(): Promise<AuthResult | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = findUserById(payload.sub);
  if (!user) return null;

  const tenantId = cookieStore.get("trydelta_tenant")?.value ?? payload.tenant_id;

  return {
    user: sanitizeUser(user),
    tenantId,
    role: user.role,
  };
}
