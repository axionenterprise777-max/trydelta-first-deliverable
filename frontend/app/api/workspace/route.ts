import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import {
  findUserById,
  sanitizeUser,
  getTenant,
  listTenants,
  listClients,
  listDeals,
  listMessages,
  listActivities,
  getOrCreateSession,
  computeMetrics,
  listUsersByTenant,
} from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedTenantId = searchParams.get("tenant_id");
  const cookieStore = await cookies();
  const token = cookieStore.get("trydelta_session")?.value;
  const tenantId = requestedTenantId ?? cookieStore.get("trydelta_tenant")?.value;

  if (!token) {
    return NextResponse.json({ message: "Sessao ausente." }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ message: "Sessao invalida." }, { status: 401 });
  }

  const user = findUserById(payload.sub);
  if (!user) {
    return NextResponse.json({ message: "Usuario nao encontrado." }, { status: 401 });
  }

  const tenant = getTenant(tenantId ?? user.tenant_id) ?? getTenant(user.tenant_id);
  if (!tenant) {
    return NextResponse.json({ message: "Tenant nao encontrado." }, { status: 404 });
  }

  const sellerOnly = user.role === "seller";
  const allTenants = user.role === "admin" ? listTenants() : listTenants().filter((t) => t.id === user.tenant_id);

  const data = {
    current_user: sanitizeUser(user),
    current_tenant: tenant,
    available_tenants: allTenants,
    current_store_id: `store-${tenant.id}`,
    visible_users: listUsersByTenant(tenant.id).map((u) => sanitizeUser(u)),
    summary: computeMetrics(tenant.id),
    board: {
      lanes: ["new", "follow_up", "won"].map((laneId) => {
        const cards = listDeals(tenant.id, user.id, sellerOnly).filter((d) => d.stage === laneId);
        return {
          id: laneId,
          label: laneId === "new" ? "Novos leads" : laneId === "follow_up" ? "Em acompanhamento" : "Fechados",
          total_value: cards.reduce((sum, c) => sum + c.amount, 0),
          cards: cards.map((c) => ({
            id: c.id,
            client_name: c.client_name,
            owner: c.owner,
            amount: c.amount,
            stage: c.stage,
            channel: c.channel,
          })),
        };
      }),
    },
    clients: listClients(tenant.id, user.id, sellerOnly),
    activities: listActivities(tenant.id),
    messages: listMessages(tenant.id, user.id, sellerOnly),
    whatsapp: {
      provider: getOrCreateSession(tenant.id).provider,
      connected: getOrCreateSession(tenant.id).connected,
      health_status: getOrCreateSession(tenant.id).health_status,
      session_status: getOrCreateSession(tenant.id).session_status,
      pairing_code_supported: getOrCreateSession(tenant.id).pairing_code_supported,
    },
    metrics: computeMetrics(tenant.id).chart,
  };

  const response = NextResponse.json(data);

  if (requestedTenantId) {
    response.cookies.set("trydelta_tenant", tenant.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}
