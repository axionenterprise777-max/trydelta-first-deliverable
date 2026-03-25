import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { listClients, createClient } from "@/lib/db";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const sellerOnly = auth.role === "seller";
  return NextResponse.json(listClients(auth.tenantId, auth.user.id, sellerOnly));
}

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const body = await request.json();
  if (!body.name || !body.email || !body.phone) {
    return NextResponse.json({ message: "name, email e phone obrigatorios." }, { status: 400 });
  }

  const created = createClient(auth.tenantId, auth.user.id, {
    name: body.name,
    email: body.email,
    phone: body.phone,
    status: body.status || "novo",
  });
  return NextResponse.json(created, { status: 201 });
}
