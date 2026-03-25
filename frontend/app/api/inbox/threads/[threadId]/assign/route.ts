import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { assignThread, getUserByToken, setTenantForUser } from "../../../../../../lib/mock-store";

export async function POST(request: Request, context: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await context.params;

  let payload: { user_id?: string } | null = null;
  try {
    payload = (await request.json()) as { user_id?: string };
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  const userId = payload?.user_id?.trim() ?? "";
  if (!userId) {
    return NextResponse.json({ message: "user_id obrigatorio." }, { status: 400 });
  }

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
  const assigned = assignThread(user, scopedTenant.id, threadId, userId);
  if (!assigned) {
    return NextResponse.json({ message: "Nao foi possivel atribuir." }, { status: 403 });
  }

  return NextResponse.json(assigned);
}
