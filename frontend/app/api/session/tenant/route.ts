import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let payload: { tenant_id?: string } | null = null;
  try {
    payload = (await request.json()) as { tenant_id?: string };
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  if (!payload.tenant_id) {
    return NextResponse.json({ message: "tenant_id obrigatorio." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("trydelta_tenant", payload.tenant_id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
