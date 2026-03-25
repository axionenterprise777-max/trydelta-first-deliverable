import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { moveDeal } from "@/lib/db";

type RouteContext = { params: Promise<{ dealId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const { dealId } = await context.params;
  const body = await request.json();

  if (!body.stage_id) {
    return NextResponse.json({ message: "stage_id obrigatorio." }, { status: 400 });
  }

  const moved = moveDeal(auth.tenantId, dealId, auth.user.id, auth.role, body.stage_id);
  if (!moved) {
    return NextResponse.json({ message: "Deal nao encontrado." }, { status: 404 });
  }
  return NextResponse.json(moved);
}
