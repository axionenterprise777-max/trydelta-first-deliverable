import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { listInboxFailures } from "@/lib/db";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const sellerOnly = auth.role === "seller";
  const failures = listInboxFailures(auth.tenantId, auth.user.id, sellerOnly);
  return NextResponse.json(failures);
}
