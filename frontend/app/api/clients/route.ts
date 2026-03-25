import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildWorkspace, createClient, getUserByToken, setTenantForUser } from "../../../lib/mock-store";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  const tenantId = cookieStore.get("trydelta_tenant")?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });
  }
  const user = getUserByToken(token);
  if (!user) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }
  const scopedTenant = setTenantForUser(user, tenantId ?? undefined);
  const workspace = buildWorkspace(user, scopedTenant.id);
  return NextResponse.json(workspace.clients);
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  const tenantId = cookieStore.get("trydelta_tenant")?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });
  }

  const payload = await request.json();
  const user = getUserByToken(token);
  if (!user) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }
  const scopedTenant = setTenantForUser(user, tenantId ?? undefined);
  const created = createClient(user, scopedTenant.id, payload);
  return NextResponse.json(created, { status: 201 });
}
