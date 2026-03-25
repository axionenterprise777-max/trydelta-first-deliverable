import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { generatePairingCode, getUserByToken, setTenantForUser } from "../../../../../lib/mock-store";

export async function POST(request: Request) {
  let payload: { phone?: string } | null = null;
  try {
    payload = (await request.json()) as { phone?: string };
  } catch {
    return NextResponse.json({ message: "Body JSON invalido." }, { status: 400 });
  }

  const phone = payload?.phone?.trim() ?? "";
  if (!phone) {
    return NextResponse.json({ message: "phone obrigatorio." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  const tenantId = cookieStore.get("trydelta_tenant")?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });
  }

  const user = getUserByToken(token);
  if (!user) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const scopedTenant = setTenantForUser(user, tenantId ?? undefined);
  const data = generatePairingCode(scopedTenant.id, phone);
  return NextResponse.json(data);
}
