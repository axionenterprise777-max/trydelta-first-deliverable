import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserByToken, retryDlq, setTenantForUser } from "../../../../../../lib/mock-store";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  const tenantId = cookieStore.get("trydelta_tenant")?.value;
  const { jobId } = await context.params;

  if (!token) {
    return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });
  }
  const user = getUserByToken(token);
  if (!user) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }
  const scopedTenant = setTenantForUser(user, tenantId ?? undefined);
  const retried = retryDlq(scopedTenant.id, jobId);
  if (!retried) {
    return NextResponse.json({ message: "Job nao encontrado." }, { status: 404 });
  }
  return NextResponse.json(retried);
}
