import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { listDlq } from "@/lib/db";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });
  return NextResponse.json(listDlq(auth.tenantId));
}
