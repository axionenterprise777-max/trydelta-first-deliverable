import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { updateClient } from "@/lib/db";

type Params = { params: Promise<{ clientId: string }> };

export async function PATCH(request: Request, context: Params) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const { clientId } = await context.params;
  const body = await request.json();

  const updated = updateClient(auth.tenantId, clientId, auth.user.id, auth.role, body);
  if (!updated) {
    return NextResponse.json({ message: "Cliente nao encontrado." }, { status: 404 });
  }
  return NextResponse.json(updated);
}
