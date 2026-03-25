import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { generatePairingCode } from "@/lib/db";

export async function POST(request: Request) {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  let phone = "";
  try {
    const body = (await request.json()) as { phone?: string };
    phone = body.phone?.trim() ?? "";
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  if (!phone) {
    return NextResponse.json({ message: "phone obrigatorio." }, { status: 400 });
  }

  const data = generatePairingCode(auth.tenantId, phone);
  return NextResponse.json(data);
}
