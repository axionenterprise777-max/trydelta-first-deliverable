import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { listMessages, enqueueMessage } from "@/lib/db";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const sellerOnly = auth.role === "seller";
  return NextResponse.json(listMessages(auth.tenantId, auth.user.id, sellerOnly));
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const body = await request.json();
  if (!body.contact_name || !body.preview) {
    return NextResponse.json({ message: "contact_name e preview obrigatorios." }, { status: 400 });
  }

  const result = enqueueMessage(auth.tenantId, auth.user.id, {
    contact_name: body.contact_name,
    preview: body.preview,
    idempotency_key: body.idempotency_key ?? `auto-${Date.now()}`,
    simulate_failure: body.simulate_failure,
  });
  return NextResponse.json(result, { status: 202 });
}
