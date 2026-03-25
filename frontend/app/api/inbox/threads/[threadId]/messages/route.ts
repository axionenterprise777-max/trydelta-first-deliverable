import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getUserByToken, listThreadMessages, setTenantForUser } from "../../../../../../lib/mock-store";

export async function GET(_request: Request, context: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await context.params;

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
  const messages = listThreadMessages(user, scopedTenant.id, threadId);
  return NextResponse.json(messages);
}
