import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { assignThread } from "@/lib/db";

export async function POST(request: Request, context: { params: Promise<{ threadId: string }> }) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const { threadId } = await context.params;

  let userId = "";
  try {
    const body = (await request.json()) as { user_id?: string };
    userId = body.user_id?.trim() ?? "";
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ message: "user_id obrigatorio." }, { status: 400 });
  }

  const assigned = assignThread(auth.tenantId, threadId, userId, auth.user.id, auth.role);
  if (!assigned) {
    return NextResponse.json({ message: "Nao foi possivel atribuir." }, { status: 403 });
  }

  return NextResponse.json(assigned);
}
