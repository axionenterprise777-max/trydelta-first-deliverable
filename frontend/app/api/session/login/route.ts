import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, sanitizeUser, getDb } from "@/lib/db";
import { signToken } from "@/lib/auth";

function pickTenant(user: { tenant_id: string; role: string }, tenantId?: string) {
  const db = getDb();
  if (tenantId && user.role === "admin") {
    return db.tenants.find((t) => t.id === tenantId) ?? db.tenants.find((t) => t.id === user.tenant_id);
  }
  return db.tenants.find((t) => t.id === user.tenant_id);
}

export async function POST(request: Request) {
  let email = "";
  let password = "";
  let tenantId: string | undefined;

  try {
    const body = (await request.json()) as { email?: string; password?: string; tenant_id?: string };
    email = body.email?.trim() ?? "";
    password = body.password ?? "";
    tenantId = body.tenant_id;
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ message: "email e password sao obrigatorios." }, { status: 400 });
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ message: "Credenciais invalidas." }, { status: 401 });
  }

  const tenant = pickTenant(user, tenantId);

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenant_id: tenant?.id ?? user.tenant_id,
  });

  const safeUser = sanitizeUser(user);

  const nextResponse = NextResponse.json({ user: safeUser, tenant });
  nextResponse.cookies.set("trydelta_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  nextResponse.cookies.set("trydelta_tenant", tenant?.id ?? user.tenant_id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  nextResponse.cookies.set("trydelta_user", user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return nextResponse;
}
