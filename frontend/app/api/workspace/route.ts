import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildWorkspace, getUserByToken } from "../../../lib/mock-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedTenantId = searchParams.get("tenant_id");
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  const tenantId = requestedTenantId ?? cookieStore.get("trydelta_tenant")?.value;

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
  const data = buildWorkspace(user, tenantId ?? undefined);
  const response = NextResponse.json(data);

  if (tenantId) {
    response.cookies.set("trydelta_tenant", tenantId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
