import { NextResponse } from "next/server";

import { login } from "../../../../lib/mock-store";

export async function POST(request: Request) {
  let payload: { email?: string; password?: string; tenant_id?: string } | null = null;
  try {
    payload = (await request.json()) as { email?: string; password?: string; tenant_id?: string };
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  if (!payload?.email || !payload?.password) {
    return NextResponse.json({ message: "email e password sao obrigatorios." }, { status: 400 });
  }

  const data = login(payload.email, payload.password, payload.tenant_id);
  if (!data) {
    return NextResponse.json(
      { message: "Credenciais invalidas." },
      { status: 401 },
    );
  }

  const responsePayload = {
    user: data.user,
    tenant: data.tenant,
  };
  const nextResponse = NextResponse.json(responsePayload);
  nextResponse.cookies.set("trydelta_session", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });
  nextResponse.cookies.set("trydelta_tenant", data.tenant.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });
  nextResponse.cookies.set("trydelta_user", data.user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });
  return nextResponse;
}
