import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { retryInboxFailure } from "@/lib/db";

export async function POST(_request: Request, context: { params: Promise<{ messageId: string }> }) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const { messageId } = await context.params;
  const result = retryInboxFailure(auth.tenantId, messageId, auth.user.id, auth.role);
  if (!result) {
    return NextResponse.json({ message: "Nao foi possivel reenfileirar." }, { status: 404 });
  }
  return NextResponse.json(result);
}
