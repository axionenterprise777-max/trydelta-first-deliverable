import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "trydelta.json");

// ── Types ────────────────────────────────────────────────────────────────

export type Tenant = {
  id: string;
  name: string;
  plan: string;
  active_users: number;
};

export type User = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  password_hash: string;
};

export type Client = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  owner_user_id: string;
  created_at: string;
};

export type Deal = {
  id: string;
  tenant_id: string;
  client_name: string;
  owner: string;
  owner_user_id: string;
  amount: number;
  stage: "new" | "follow_up" | "won";
  channel: string;
  created_at: string;
};

export type Message = {
  id: string;
  tenant_id: string;
  owner_user_id: string;
  contact_name: string;
  direction: string;
  status: string;
  preview: string;
  sent_label: string;
  created_at: string;
};

export type DeadLetter = {
  id: string;
  tenant_id: string;
  task_name: string;
  message_id: string;
  idempotency_key: string;
  error: string;
  status: string;
  created_at: string;
};

export type WhatsAppSession = {
  tenant_id: string;
  provider: string;
  connected: boolean;
  health_status: string;
  session_status: string;
  pairing_code_supported: boolean;
  qr_code: string | null;
  pairing_code: string | null;
  phone: string | null;
  updated_at: string;
};

export type ContactRequest = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  plan_id: string;
  team_size: number;
  notes?: string;
  status: string;
  created_at: string;
};

export type Activity = {
  id: string;
  tenant_id: string;
  icon: string;
  title: string;
  detail: string;
  created_label: string;
  created_at: string;
};

type Database = {
  tenants: Tenant[];
  users: User[];
  clients: Client[];
  deals: Deal[];
  messages: Message[];
  dead_letters: DeadLetter[];
  whatsapp_sessions: WhatsAppSession[];
  contact_requests: ContactRequest[];
  activities: Activity[];
  thread_assignments: Record<string, string>;
};

// ── Password hashing (native crypto) ──────────────────────────────────────

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

// ── Database singleton ────────────────────────────────────────────────────

let db: Database | null = null;

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function defaultDb(): Database {
  return {
    tenants: [],
    users: [],
    clients: [],
    deals: [],
    messages: [],
    dead_letters: [],
    whatsapp_sessions: [],
    contact_requests: [],
    activities: [],
    thread_assignments: {},
  };
}

function load(): Database {
  if (db) return db;
  ensureDir();
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(raw) as Database;
    } catch {
      db = defaultDb();
    }
  } else {
    db = defaultDb();
    seed(db);
    save();
  }
  return db;
}

function save(): void {
  if (!db) return;
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
}

// ── Seed data ─────────────────────────────────────────────────────────────

function seed(database: Database): void {
  const now = new Date().toISOString();

  database.tenants = [
    { id: "tenant-demo-01", name: "TryDelta Demo", plan: "pro", active_users: 2 },
    { id: "tenant-demo-02", name: "TryDelta Industry", plan: "business", active_users: 1 },
  ];

  database.users = [
    {
      id: "user-demo-01",
      tenant_id: "tenant-demo-01",
      name: "Adriana Lima",
      email: "adriana@trydelta.local",
      role: "admin",
      initials: "AL",
      password_hash: hashPassword("TryDelta123!"),
    },
    {
      id: "user-demo-02",
      tenant_id: "tenant-demo-01",
      name: "Bruno Alves",
      email: "bruno@trydelta.local",
      role: "seller",
      initials: "BA",
      password_hash: hashPassword("TryDelta123!"),
    },
    {
      id: "user-demo-03",
      tenant_id: "tenant-demo-02",
      name: "Carla Souza",
      email: "carla@trydelta.local",
      role: "manager",
      initials: "CS",
      password_hash: hashPassword("TryDelta123!"),
    },
  ];

  database.clients = [
    {
      id: "client-001",
      tenant_id: "tenant-demo-01",
      name: "Nexa Equipamentos",
      phone: "+55 11 99877-1001",
      email: "compras@nexa.com",
      status: "ativo",
      owner_user_id: "user-demo-01",
      created_at: now,
    },
    {
      id: "client-002",
      tenant_id: "tenant-demo-01",
      name: "Pilar Saude",
      phone: "+55 11 99877-1002",
      email: "contato@pilarsaude.com",
      status: "negociacao",
      owner_user_id: "user-demo-02",
      created_at: now,
    },
    {
      id: "client-003",
      tenant_id: "tenant-demo-01",
      name: "Lume Energia",
      phone: "+55 21 99877-1003",
      email: "relacionamento@lume.com",
      status: "proposta",
      owner_user_id: "user-demo-01",
      created_at: now,
    },
  ];

  database.deals = [
    {
      id: "deal-001",
      tenant_id: "tenant-demo-01",
      client_name: "Nexa Equipamentos",
      owner: "Camila",
      owner_user_id: "user-demo-01",
      amount: 18000,
      stage: "new",
      channel: "whatsapp",
      created_at: now,
    },
    {
      id: "deal-002",
      tenant_id: "tenant-demo-01",
      client_name: "Pilar Saude",
      owner: "Renato",
      owner_user_id: "user-demo-02",
      amount: 9400,
      stage: "new",
      channel: "form",
      created_at: now,
    },
    {
      id: "deal-003",
      tenant_id: "tenant-demo-01",
      client_name: "Lume Energia",
      owner: "Bianca",
      owner_user_id: "user-demo-01",
      amount: 27500,
      stage: "follow_up",
      channel: "whatsapp",
      created_at: now,
    },
  ];

  database.messages = [
    {
      id: "message-001",
      tenant_id: "tenant-demo-01",
      owner_user_id: "user-demo-01",
      contact_name: "Nexa Equipamentos",
      direction: "outbound",
      status: "delivered",
      preview: "Proposta revisada enviada.",
      sent_label: "10 min",
      created_at: now,
    },
    {
      id: "message-002",
      tenant_id: "tenant-demo-01",
      owner_user_id: "user-demo-02",
      contact_name: "Pilar Saude",
      direction: "outbound",
      status: "queued",
      preview: "Template de follow-up aguardando envio.",
      sent_label: "25 min",
      created_at: now,
    },
    {
      id: "message-003",
      tenant_id: "tenant-demo-01",
      owner_user_id: "user-demo-01",
      contact_name: "Lume Energia",
      direction: "inbound",
      status: "read",
      preview: "Cliente solicitou nova condicao comercial.",
      sent_label: "1 h",
      created_at: now,
    },
  ];

  database.activities = [
    {
      id: "act-001",
      tenant_id: "tenant-demo-01",
      icon: "phone",
      title: "Ligacao com Nexa Equipamentos",
      detail: "Alinhamento de proposta comercial",
      created_label: "10 min",
      created_at: now,
    },
    {
      id: "act-002",
      tenant_id: "tenant-demo-01",
      icon: "message",
      title: "WhatsApp enviado para Pilar Saude",
      detail: "Template de follow-up disparado",
      created_label: "25 min",
      created_at: now,
    },
    {
      id: "act-003",
      tenant_id: "tenant-demo-01",
      icon: "chart",
      title: "Meta atualizada para Lume Energia",
      detail: "Ajuste de valor para nova rodada",
      created_label: "1 h",
      created_at: now,
    },
  ];
}

// ── Public API ────────────────────────────────────────────────────────────

export function uid(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function getDb(): Database {
  return load();
}

export function persist(): void {
  save();
}

// ── Auth helpers ──────────────────────────────────────────────────────────

export { hashPassword, verifyPassword };

// ── Tenant operations ─────────────────────────────────────────────────────

export function listTenants(): Tenant[] {
  return load().tenants;
}

export function getTenant(id: string): Tenant | undefined {
  return load().tenants.find((t) => t.id === id);
}

// ── User operations ───────────────────────────────────────────────────────

export function findUserByEmail(email: string): User | undefined {
  return load().users.find((u) => u.email === email.toLowerCase().trim());
}

export function findUserById(id: string): User | undefined {
  return load().users.find((u) => u.id === id);
}

export function listUsersByTenant(tenantId: string): User[] {
  return load().users.filter((u) => u.tenant_id === tenantId);
}

export function sanitizeUser(u: User) {
  const { password_hash: _, ...safe } = u;
  return safe;
}

// ── Client operations ─────────────────────────────────────────────────────

export function listClients(tenantId: string, userId?: string, sellerOnly?: boolean): Client[] {
  return load().clients.filter(
    (c) => c.tenant_id === tenantId && (!sellerOnly || !userId || c.owner_user_id === userId),
  );
}

export function createClient(tenantId: string, ownerUserId: string, data: { name: string; email: string; phone: string; status: string }): Client {
  const database = load();
  const client: Client = {
    id: `client-${uid().slice(0, 8)}`,
    tenant_id: tenantId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    status: data.status || "novo",
    owner_user_id: ownerUserId,
    created_at: nowISO(),
  };
  database.clients.unshift(client);
  save();
  return client;
}

export function updateClient(tenantId: string, clientId: string, userId: string, role: string, data: Partial<Client>): Client | null {
  const database = load();
  const idx = database.clients.findIndex((c) => c.id === clientId && c.tenant_id === tenantId);
  if (idx < 0) return null;
  if (role === "seller" && database.clients[idx].owner_user_id !== userId) return null;
  database.clients[idx] = { ...database.clients[idx], ...data, id: clientId, tenant_id: tenantId };
  save();
  return database.clients[idx];
}

// ── Deal operations ───────────────────────────────────────────────────────

export function listDeals(tenantId: string, userId?: string, sellerOnly?: boolean): Deal[] {
  return load().deals.filter(
    (d) => d.tenant_id === tenantId && (!sellerOnly || !userId || d.owner_user_id === userId),
  );
}

export function moveDeal(tenantId: string, dealId: string, userId: string, role: string, stage: string): Deal | null {
  const database = load();
  const deal = database.deals.find((d) => d.id === dealId && d.tenant_id === tenantId);
  if (!deal) return null;
  if (role === "seller" && deal.owner_user_id !== userId) return null;
  deal.stage = stage as Deal["stage"];
  save();
  return deal;
}

// ── Message operations ────────────────────────────────────────────────────

export function listMessages(tenantId: string, userId?: string, sellerOnly?: boolean): Message[] {
  return load().messages.filter(
    (m) => m.tenant_id === tenantId && (!sellerOnly || !userId || m.owner_user_id === userId),
  );
}

export function enqueueMessage(tenantId: string, userId: string, payload: { contact_name: string; preview: string; idempotency_key: string; simulate_failure?: boolean }): { id: string; duplicate: boolean; status: string } {
  const database = load();
  const existing = database.messages.find(
    (m) => m.tenant_id === tenantId && m.preview === payload.preview && m.contact_name === payload.contact_name,
  );
  if (existing) return { id: existing.id, duplicate: true, status: existing.status };

  const msg: Message = {
    id: `message-${uid().slice(0, 8)}`,
    tenant_id: tenantId,
    owner_user_id: userId,
    contact_name: payload.contact_name,
    direction: "outbound",
    status: payload.simulate_failure ? "failed" : "queued",
    preview: payload.preview,
    sent_label: "agora",
    created_at: nowISO(),
  };
  database.messages.unshift(msg);

  if (payload.simulate_failure) {
    database.dead_letters.unshift({
      id: `dlq-${uid().slice(0, 8)}`,
      tenant_id: tenantId,
      task_name: "messages.outbound.send",
      message_id: msg.id,
      idempotency_key: payload.idempotency_key,
      error: "mock failure",
      status: "failed",
      created_at: nowISO(),
    });
  }

  save();
  return { id: msg.id, duplicate: false, status: msg.status };
}

// ── Dead letter operations ────────────────────────────────────────────────

export function listDlq(tenantId: string): DeadLetter[] {
  return load().dead_letters.filter((d) => d.tenant_id === tenantId);
}

export function retryDlq(tenantId: string, jobId: string): DeadLetter | null {
  const database = load();
  const idx = database.dead_letters.findIndex((d) => d.id === jobId && d.tenant_id === tenantId);
  if (idx < 0) return null;
  database.dead_letters[idx].status = "requeued";
  save();
  return database.dead_letters[idx];
}

// ── WhatsApp session operations ───────────────────────────────────────────

export function getOrCreateSession(tenantId: string): WhatsAppSession {
  const database = load();
  let session = database.whatsapp_sessions.find((s) => s.tenant_id === tenantId);
  if (!session) {
    session = {
      tenant_id: tenantId,
      provider: "mock",
      connected: true,
      health_status: "healthy",
      session_status: "connected",
      pairing_code_supported: true,
      qr_code: null,
      pairing_code: null,
      phone: null,
      updated_at: nowISO(),
    };
    database.whatsapp_sessions.push(session);
    save();
  }
  return session;
}

export function generatePairingCode(tenantId: string, phone: string): { pairing_code: string } {
  const database = load();
  let session = database.whatsapp_sessions.find((s) => s.tenant_id === tenantId);
  if (!session) {
    session = {
      tenant_id: tenantId,
      provider: "mock",
      connected: true,
      health_status: "healthy",
      session_status: "connected",
      pairing_code_supported: true,
      qr_code: null,
      pairing_code: null,
      phone: null,
      updated_at: nowISO(),
    };
    database.whatsapp_sessions.push(session);
  }
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  session.phone = phone.trim();
  session.pairing_code = code;
  session.connected = false;
  session.session_status = "pairing";
  session.updated_at = nowISO();
  save();
  return { pairing_code: code };
}

// ── Inbox / thread operations ─────────────────────────────────────────────

export function listThreads(tenantId: string, userId?: string, sellerOnly?: boolean) {
  const database = load();
  const scoped = database.messages.filter(
    (m) => m.tenant_id === tenantId && (!sellerOnly || !userId || m.owner_user_id === userId),
  );

  const byContact = new Map<string, Message[]>();
  for (const msg of scoped) {
    const list = byContact.get(msg.contact_name) ?? [];
    list.push(msg);
    byContact.set(msg.contact_name, list);
  }

  const threads: Array<{
    thread_id: string;
    store_id: string;
    contact_name: string;
    assigned_user_id: string | null;
    last_status: string;
    last_preview: string;
    last_sent_label: string;
    message_count: number;
  }> = [];

  byContact.forEach((items, contactName) => {
    const threadId = `thread-${contactName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
    const last = items[items.length - 1];
    const fallbackOwner = items.find((m) => m.direction === "outbound")?.owner_user_id ?? last.owner_user_id;
    const assigned = database.thread_assignments[`${tenantId}:${threadId}`] ?? fallbackOwner;
    threads.push({
      thread_id: threadId,
      store_id: `store-${tenantId}`,
      contact_name: contactName,
      assigned_user_id: assigned ?? null,
      last_status: last.status,
      last_preview: last.preview,
      last_sent_label: last.sent_label,
      message_count: items.length,
    });
  });

  return threads;
}

export function listThreadMessages(tenantId: string, threadId: string, userId?: string, sellerOnly?: boolean): Message[] {
  const database = load();
  const scoped = database.messages.filter(
    (m) => m.tenant_id === tenantId && (!sellerOnly || !userId || m.owner_user_id === userId),
  );
  const contactName = threadId.replace(/^thread-/, "").replace(/-/g, " ");
  const exact = scoped.filter((m) => {
    const tid = `thread-${m.contact_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;
    return tid === threadId;
  });
  if (exact.length) return exact;
  return scoped.filter((m) => m.contact_name.toLowerCase() === contactName);
}

export function assignThread(tenantId: string, threadId: string, assigneeUserId: string, userId: string, role: string): { thread_id: string; assigned_user_id: string } | null {
  if (role === "seller") return null;
  const database = load();
  const exists = database.users.some((u) => u.tenant_id === tenantId && u.id === assigneeUserId);
  if (!exists) return null;
  const key = `${tenantId}:${threadId}`;
  database.thread_assignments[key] = assigneeUserId;
  save();
  return { thread_id: threadId, assigned_user_id: assigneeUserId };
}

// ── Inbox failures ────────────────────────────────────────────────────────

export function listInboxFailures(tenantId: string, userId?: string, sellerOnly?: boolean) {
  const database = load();
  const scoped = database.messages.filter(
    (m) => m.tenant_id === tenantId && (!sellerOnly || !userId || m.owner_user_id === userId) && m.status === "failed",
  );
  return scoped.map((message) => {
    const dlq = database.dead_letters.find((d) => d.tenant_id === tenantId && d.message_id === message.id);
    return { message, reason: dlq?.error ?? "Falha de envio." };
  });
}

export function retryInboxFailure(tenantId: string, messageId: string, userId: string, role: string): { message_id: string; status: string } | null {
  const database = load();
  const idx = database.messages.findIndex((m) => m.id === messageId && m.tenant_id === tenantId);
  if (idx < 0) return null;
  if (role === "seller" && database.messages[idx].owner_user_id !== userId) return null;
  database.messages[idx].status = "queued";
  database.messages[idx].sent_label = "agora";
  const dlqIdx = database.dead_letters.findIndex((d) => d.tenant_id === tenantId && d.message_id === messageId);
  if (dlqIdx >= 0) database.dead_letters[dlqIdx].status = "requeued";
  save();
  return { message_id: messageId, status: "queued" };
}

// ── Contact requests ──────────────────────────────────────────────────────

export function createContactRequest(data: { company_name: string; contact_name: string; email: string; plan_id: string; team_size: number; notes?: string }): ContactRequest {
  const database = load();
  const cr: ContactRequest = {
    id: `lead-${uid().slice(0, 8)}`,
    status: "new",
    created_at: nowISO(),
    ...data,
  };
  database.contact_requests.unshift(cr);
  save();
  return cr;
}

// ── Activity operations ───────────────────────────────────────────────────

export function listActivities(tenantId: string): Activity[] {
  return load().activities.filter((a) => a.tenant_id === tenantId);
}

// ── Metrics (computed) ────────────────────────────────────────────────────

export function computeMetrics(tenantId: string) {
  const database = load();
  const deals = database.deals.filter((d) => d.tenant_id === tenantId);
  const messages = database.messages.filter((m) => m.tenant_id === tenantId);
  const pipelineValue = deals.reduce((sum, d) => sum + d.amount, 0);
  const queued = messages.filter((m) => m.status === "queued").length;
  const conversionRate = deals.length > 0 ? 26.4 : 0;

  return {
    active_tenants: database.tenants.length,
    open_contact_requests: database.contact_requests.length,
    active_leads: deals.length,
    queued_messages: queued,
    pipeline_value_brl: pipelineValue,
    conversion_rate_pct: conversionRate,
    chart: [
      { label: "Jan", pipeline: 21000, revenue: 13000 },
      { label: "Fev", pipeline: 28000, revenue: 17000 },
      { label: "Mar", pipeline: 32000, revenue: 22000 },
      { label: "Abr", pipeline: 37000, revenue: 26000 },
      { label: "Mai", pipeline: 41000, revenue: 30000 },
      { label: "Jun", pipeline: pipelineValue, revenue: Math.round(pipelineValue * 0.62) },
    ],
  };
}
