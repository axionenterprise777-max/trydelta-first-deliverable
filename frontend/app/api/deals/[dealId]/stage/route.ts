import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserByToken, moveDealStage, setTenantForUser } from "../../../../../lib/mock-store";

type RouteContext = {
  params: Promise<{ dealId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const payload = await request.json();
  const { searchParams } = new URL(request.url);
  const requestedTenantId = searchParams.get("tenant_id");
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  const tenantId = requestedTenantId ?? cookieStore.get("trydelta_tenant")?.value;
  const { dealId } = await context.params;

  if (!token) {
    return NextResponse.json(
      { message: "Sessao ausente." },
      { status: 401 },
    );
  }
  const user = getUserByToken(token);
  if (!user) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }
  const scopedTenant = setTenantForUser(user, tenantId ?? undefined);
  const moved = moveDealStage(user, scopedTenant.id, dealId, payload.stage_id);
  if (!moved) {
    return NextResponse.json({ message: "Deal nao encontrado." }, { status: 404 });
  }
  return NextResponse.json(moved);
}
