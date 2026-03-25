import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { listThreadMessages } from "@/lib/db";

export async function GET(_request: Request, context: { params: Promise<{ threadId: string }> }) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const { threadId } = await context.params;
  const sellerOnly = auth.role === "seller";
  const messages = listThreadMessages(auth.tenantId, threadId, auth.user.id, sellerOnly);
  return NextResponse.json(messages);
}
