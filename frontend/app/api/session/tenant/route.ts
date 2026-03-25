import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getTenant } from "@/lib/db";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ message: "Sem permissao." }, { status: 403 });
  }

  let tenantId = "";
  try {
    const body = (await request.json()) as { tenant_id?: string };
    tenantId = body.tenant_id?.trim() ?? "";
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  if (!tenantId) {
    return NextResponse.json({ message: "tenant_id obrigatorio." }, { status: 400 });
  }

  const tenant = getTenant(tenantId);
  if (!tenant) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  const response = NextResponse.json({ ok: true, tenant });
  response.cookies.set("trydelta_tenant", tenantId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
