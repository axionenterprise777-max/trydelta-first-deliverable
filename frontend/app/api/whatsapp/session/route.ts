import { NextResponse } from "next/server";
import { getAuth } from "@/lib/get-auth";
import { getOrCreateSession } from "@/lib/db";

export async function GET() {
  const auth = await getAuth();
  if (!auth) return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });

  const session = getOrCreateSession(auth.tenantId);
  return NextResponse.json({
    provider: session.provider,
    connected: session.connected,
    health_status: session.health_status,
    session_status: session.session_status,
    pairing_code_supported: session.pairing_code_supported,
    qr_code: session.qr_code,
    details: {
      tenant_id: session.tenant_id,
      phone: session.phone,
      pairing_code: session.pairing_code,
      updated_at: session.updated_at,
    },
  });
}
