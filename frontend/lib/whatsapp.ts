import { getOrCreateSession, generatePairingCode, uid, nowISO, persist, getDb } from "./db";

type WhatsAppAction =
  | { type: "GET_SESSION"; tenant_id: string }
  | { type: "GENERATE_PAIRING"; tenant_id: string; phone: string }
  | { type: "DISPATCH_MESSAGE"; tenant_id: string; user_id: string; contact_name: string; body: string; idempotency_key: string }
  | { type: "CHECK_HEALTH"; tenant_id: string };

type WhatsAppResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

export function handleWhatsAppAction(action: WhatsAppAction): WhatsAppResult {
  switch (action.type) {
    case "GET_SESSION": {
      const session = getOrCreateSession(action.tenant_id);
      return {
        ok: true,
        data: {
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
        },
      };
    }

    case "GENERATE_PAIRING": {
      const result = generatePairingCode(action.tenant_id, action.phone);
      return { ok: true, data: result };
    }

    case "DISPATCH_MESSAGE": {
      const db = getDb();
      const existing = db.messages.find(
        (m) =>
          m.tenant_id === action.tenant_id &&
          m.preview === action.body &&
          m.contact_name === action.contact_name,
      );
      if (existing) {
        return { ok: true, data: { id: existing.id, duplicate: true, status: existing.status } };
      }

      const msg = {
        id: `message-${uid().slice(0, 8)}`,
        tenant_id: action.tenant_id,
        owner_user_id: action.user_id,
        contact_name: action.contact_name,
        direction: "outbound",
        status: "queued",
        preview: action.body,
        sent_label: "agora",
        created_at: nowISO(),
      };
      db.messages.unshift(msg);
      persist();
      return { ok: true, data: { id: msg.id, duplicate: false, status: msg.status } };
    }

    case "CHECK_HEALTH": {
      const session = getOrCreateSession(action.tenant_id);
      return {
        ok: true,
        data: {
          healthy: session.connected && session.health_status === "healthy",
          provider: session.provider,
          status: session.session_status,
        },
      };
    }

    default:
      return { ok: false, error: "Unknown action" };
  }
}
