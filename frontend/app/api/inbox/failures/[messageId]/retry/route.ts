import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserByToken, retryInboxFailure, setTenantForUser } from "../../../../../../lib/mock-store";

export async function POST(_request: Request, context: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await context.params;

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
  const result = retryInboxFailure(user, scopedTenant.id, messageId);
  if (!result) {
    return NextResponse.json({ message: "Nao foi possivel reenfileirar." }, { status: 404 });
  }

  return NextResponse.json(result);
}
