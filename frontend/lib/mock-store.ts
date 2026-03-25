type User = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  password: string;
};

type Tenant = {
  id: string;
  name: string;
  plan: string;
  active_users: number;
};

type Client = {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  owner_user_id: string;
};

type Deal = {
  id: string;
  tenant_id: string;
  client_name: string;
  owner: string;
  owner_user_id: string;
  amount: number;
  stage: "new" | "follow_up" | "won";
  channel: string;
};

type Message = {
  id: string;
  tenant_id: string;
  owner_user_id: string;
  contact_name: string;
  direction: string;
  status: string;
  preview: string;
  sent_label: string;
};

type DeadLetter = {
  id: string;
  tenant_id: string;
  task_name: string;
  message_id: string;
  idempotency_key: string;
  error: string;
  status: string;
};

type WhatsAppSession = {
  tenant_id: string;
  provider: string;
  connected: boolean;
  health_status: string;
  session_status: string;
  pairing_code_supported: boolean;
  qr_code: string | null;
  pairing_code: string | null;
  phone: string | null;
  updated_at: number;
};

type InboxThread = {
  thread_id: string;
  tenant_id: string;
  store_id: string;
  contact_name: string;
  assigned_user_id: string | null;
  message_ids: string[];
};

type ContactRequest = {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  plan_id: string;
  team_size: number;
  notes?: string;
  status: string;
};

const tenants: Tenant[] = [
  { id: "tenant-demo-01", name: "TryDelta Demo", plan: "pro", active_users: 2 },
  { id: "tenant-demo-02", name: "TryDelta Industry", plan: "business", active_users: 1 },
];

const users: User[] = [
  {
    id: "user-demo-01",
    tenant_id: "tenant-demo-01",
    name: "Adriana Lima",
    email: "adriana@trydelta.local",
    role: "admin",
    initials: "AL",
    password: "TryDelta123!",
  },
  {
    id: "user-demo-02",
    tenant_id: "tenant-demo-01",
    name: "Bruno Alves",
    email: "bruno@trydelta.local",
    role: "seller",
    initials: "BA",
    password: "TryDelta123!",
  },
  {
    id: "user-demo-03",
    tenant_id: "tenant-demo-02",
    name: "Carla Souza",
    email: "carla@trydelta.local",
    role: "manager",
    initials: "CS",
    password: "TryDelta123!",
  },
];

let clients: Client[] = [
  {
    id: "client-001",
    tenant_id: "tenant-demo-01",
    name: "Nexa Equipamentos",
    phone: "+55 11 99877-1001",
    email: "compras@nexa.com",
    status: "ativo",
    owner_user_id: "user-demo-01",
  },
  {
    id: "client-002",
    tenant_id: "tenant-demo-01",
    name: "Pilar Saude",
    phone: "+55 11 99877-1002",
    email: "contato@pilarsaude.com",
    status: "negociacao",
    owner_user_id: "user-demo-02",
  },
  {
    id: "client-003",
    tenant_id: "tenant-demo-01",
    name: "Lume Energia",
    phone: "+55 21 99877-1003",
    email: "relacionamento@lume.com",
    status: "proposta",
    owner_user_id: "user-demo-01",
  },
];

let deals: Deal[] = [
  {
    id: "deal-001",
    tenant_id: "tenant-demo-01",
    client_name: "Nexa Equipamentos",
    owner: "Camila",
    owner_user_id: "user-demo-01",
    amount: 18000,
    stage: "new",
    channel: "whatsapp",
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
  },
];

let messages: Message[] = [
  {
    id: "message-001",
    tenant_id: "tenant-demo-01",
    owner_user_id: "user-demo-01",
    contact_name: "Nexa Equipamentos",
    direction: "outbound",
    status: "delivered",
    preview: "Proposta revisada enviada.",
    sent_label: "10 min",
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
  },
];

let deadLetters: DeadLetter[] = [];
let contactRequests: ContactRequest[] = [];
const threadAssignments = new Map<string, string>();
const sessionByTenant = new Map<string, WhatsAppSession>();

const sessionTokens = new Map<string, string>();
const activitySeed = [
  { id: "act-001", icon: "phone", title: "Ligacao com Nexa Equipamentos", detail: "Alinhamento de proposta comercial", created_label: "10 min" },
  { id: "act-002", icon: "message", title: "WhatsApp enviado para Pilar Saude", detail: "Template de follow-up disparado", created_label: "25 min" },
  { id: "act-003", icon: "chart", title: "Meta atualizada para Lume Energia", detail: "Ajuste de valor para nova rodada", created_label: "1 h" },
];

function stageLabel(stage: Deal["stage"]) {
  if (stage === "new") return "Novos leads";
  if (stage === "follow_up") return "Em acompanhamento";
  return "Fechados";
}

function tenantStoreId(tenantId: string) {
  return `store-${tenantId}`;
}

function threadIdFromContact(contactName: string) {
  const normalized = contactName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `thread-${normalized || "contact"}`;
}

function getOrCreateSession(tenantId: string) {
  const existing = sessionByTenant.get(tenantId);
  if (existing) return existing;
  const fresh: WhatsAppSession = {
    tenant_id: tenantId,
    provider: "mock",
    connected: true,
    health_status: "healthy",
    session_status: "connected",
    pairing_code_supported: true,
    qr_code: null,
    pairing_code: null,
    phone: null,
    updated_at: Date.now(),
  };
  sessionByTenant.set(tenantId, fresh);
  return fresh;
}

export function login(email: string, password: string, tenantId?: string) {
  const user = users.find((item) => item.email === email.toLowerCase().trim() && item.password === password);
  if (!user) return null;

  const tenant = tenants.find((item) => item.id === (tenantId ?? user.tenant_id)) ?? tenants[0];
  const token = `mock-${user.id}-${Date.now()}`;
  sessionTokens.set(token, user.id);

  return {
    access_token: token,
    expires_in: 60 * 60 * 12,
    user: { id: user.id, tenant_id: user.tenant_id, name: user.name, email: user.email, role: user.role, initials: user.initials },
    tenant,
  };
}

export function getUserByToken(token: string | undefined) {
  if (!token) return null;
  const userId = sessionTokens.get(token);
  if (!userId) return null;
  const user = users.find((item) => item.id === userId);
  return user ?? null;
}

export function clearToken(token: string | undefined) {
  if (!token) return;
  sessionTokens.delete(token);
}

export function setTenantForUser(user: User, requestedTenantId?: string) {
  if (!requestedTenantId) return tenants.find((item) => item.id === user.tenant_id) ?? tenants[0];
  if (user.role === "admin") return tenants.find((item) => item.id === requestedTenantId) ?? tenants[0];
  return tenants.find((item) => item.id === user.tenant_id) ?? tenants[0];
}

export function buildWorkspace(user: User, tenantId?: string) {
  const tenant = setTenantForUser(user, tenantId);
  const userOnly = user.role === "seller";
  const scopedDeals = deals.filter((item) => item.tenant_id === tenant.id && (!userOnly || item.owner_user_id === user.id));
  const scopedClients = clients.filter((item) => item.tenant_id === tenant.id && (!userOnly || item.owner_user_id === user.id));
  const scopedMessages = messages.filter((item) => item.tenant_id === tenant.id && (!userOnly || item.owner_user_id === user.id));
  const whatsappSession = getOrCreateSession(tenant.id);

  const pipelineValue = scopedDeals.reduce((sum, item) => sum + item.amount, 0);
  const queued = scopedMessages.filter((item) => item.status === "queued").length;
  const lanes = ["new", "follow_up", "won"].map((laneId) => {
    const cards = scopedDeals.filter((item) => item.stage === laneId);
    return {
      id: laneId,
      label: stageLabel(laneId as Deal["stage"]),
      total_value: cards.reduce((sum, item) => sum + item.amount, 0),
      cards: cards.map((item) => ({
        id: item.id,
        client_name: item.client_name,
        owner: item.owner,
        amount: item.amount,
        stage: item.stage,
        channel: item.channel,
      })),
    };
  });

  return {
    current_user: { id: user.id, tenant_id: user.tenant_id, name: user.name, email: user.email, role: user.role, initials: user.initials },
    current_tenant: tenant,
    available_tenants: user.role === "admin" ? tenants : tenants.filter((item) => item.id === user.tenant_id),
    current_store_id: tenantStoreId(tenant.id),
    visible_users: users
      .filter((item) => item.tenant_id === tenant.id)
      .map((item) => ({ id: item.id, tenant_id: item.tenant_id, name: item.name, email: item.email, role: item.role, initials: item.initials })),
    summary: {
      active_tenants: tenants.length,
      open_contact_requests: contactRequests.length,
      active_leads: scopedDeals.length,
      queued_messages: queued,
      pipeline_value_brl: pipelineValue,
      conversion_rate_pct: scopedDeals.length > 0 ? 26.4 : 0,
    },
    board: { lanes },
    clients: scopedClients.map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      email: item.email,
      status: item.status,
      owner_user_id: item.owner_user_id,
    })),
    activities: activitySeed,
    messages: scopedMessages,
    whatsapp: {
      provider: whatsappSession.provider,
      connected: whatsappSession.connected,
      health_status: whatsappSession.health_status,
      session_status: whatsappSession.session_status,
      pairing_code_supported: whatsappSession.pairing_code_supported,
    },
    metrics: [
      { label: "Jan", pipeline: 21000, revenue: 13000 },
      { label: "Fev", pipeline: 28000, revenue: 17000 },
      { label: "Mar", pipeline: 32000, revenue: 22000 },
      { label: "Abr", pipeline: 37000, revenue: 26000 },
      { label: "Mai", pipeline: 41000, revenue: 30000 },
      { label: "Jun", pipeline: pipelineValue, revenue: Math.round(pipelineValue * 0.62) },
    ],
  };
}

export function moveDealStage(user: User, tenantId: string, dealId: string, stageId: "new" | "follow_up" | "won") {
  const target = deals.find((item) => item.id === dealId && item.tenant_id === tenantId);
  if (!target) return null;
  if (user.role === "seller" && target.owner_user_id !== user.id) return null;
  target.stage = stageId;
  return {
    id: target.id,
    client_name: target.client_name,
    owner: target.owner,
    amount: target.amount,
    stage: target.stage,
    channel: target.channel,
  };
}

export function createClient(user: User, tenantId: string, payload: { name: string; email: string; phone: string; status: string }) {
  const id = `client-${Math.random().toString(16).slice(2, 10)}`;
  const owner = user.role === "seller" ? user.id : user.id;
  const item: Client = {
    id,
    tenant_id: tenantId,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    status: payload.status || "novo",
    owner_user_id: owner,
  };
  clients = [item, ...clients];
  return { ...item };
}

export function updateClient(user: User, tenantId: string, clientId: string, payload: Partial<Omit<Client, "id" | "tenant_id">>) {
  const index = clients.findIndex((item) => item.id === clientId && item.tenant_id === tenantId);
  if (index < 0) return null;
  if (user.role === "seller" && clients[index].owner_user_id !== user.id) return null;
  clients[index] = {
    ...clients[index],
    ...payload,
    owner_user_id: user.role === "seller" ? clients[index].owner_user_id : (payload.owner_user_id ?? clients[index].owner_user_id),
  };
  return { ...clients[index] };
}

export function createContactRequest(payload: Omit<ContactRequest, "id" | "status">) {
  const item: ContactRequest = {
    id: `lead-${Math.random().toString(16).slice(2, 10)}`,
    status: "new",
    ...payload,
  };
  contactRequests = [item, ...contactRequests];
  return item;
}

export function listMessages(user: User, tenantId: string) {
  return messages.filter((item) => item.tenant_id === tenantId && (user.role !== "seller" || item.owner_user_id === user.id));
}

export function enqueueMessage(user: User, tenantId: string, payload: { contact_name: string; preview: string; idempotency_key: string; simulate_failure?: boolean }) {
  const existing = messages.find((item) => item.tenant_id === tenantId && item.preview === payload.preview && item.contact_name === payload.contact_name);
  if (existing) {
    return { id: existing.id, duplicate: true, status: existing.status };
  }

  const item: Message = {
    id: `message-${Math.random().toString(16).slice(2, 10)}`,
    tenant_id: tenantId,
    owner_user_id: user.id,
    contact_name: payload.contact_name,
    direction: "outbound",
    status: payload.simulate_failure ? "failed" : "queued",
    preview: payload.preview,
    sent_label: "agora",
  };
  messages = [item, ...messages];

  if (payload.simulate_failure) {
    deadLetters = [
      {
        id: `dlq-${Math.random().toString(16).slice(2, 10)}`,
        tenant_id: tenantId,
        task_name: "messages.outbound.send",
        message_id: item.id,
        idempotency_key: payload.idempotency_key,
        error: "mock failure",
        status: "failed",
      },
      ...deadLetters,
    ];
  }

  return { id: item.id, duplicate: false, status: item.status };
}

export function listDlq(tenantId: string) {
  return deadLetters.filter((item) => item.tenant_id === tenantId);
}

export function retryDlq(tenantId: string, jobId: string) {
  const index = deadLetters.findIndex((item) => item.id === jobId && item.tenant_id === tenantId);
  if (index < 0) return null;
  deadLetters[index] = { ...deadLetters[index], status: "requeued" };
  return deadLetters[index];
}

export function getWhatsAppSession(tenantId: string) {
  const session = getOrCreateSession(tenantId);
  return {
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
      updated_at: new Date(session.updated_at).toISOString(),
    },
  };
}

export function generatePairingCode(tenantId: string, phone: string) {
  const session = getOrCreateSession(tenantId);
  const code = `${Math.floor(100000 + Math.random() * 900000)}`;
  session.phone = phone.trim();
  session.pairing_code = code;
  session.connected = false;
  session.session_status = "pairing";
  session.updated_at = Date.now();
  sessionByTenant.set(tenantId, session);
  return { pairing_code: code };
}

export function listInboxThreads(user: User, tenantId: string) {
  const userOnly = user.role === "seller";
  const scopedMessages = messages
    .filter((item) => item.tenant_id === tenantId && (!userOnly || item.owner_user_id === user.id))
    .slice()
    .reverse();

  const byContact = new Map<string, Message[]>();
  scopedMessages.forEach((message) => {
    const list = byContact.get(message.contact_name) ?? [];
    list.push(message);
    byContact.set(message.contact_name, list);
  });

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
    const threadId = threadIdFromContact(contactName);
    const last = items[items.length - 1];
    const assignedKey = `${tenantId}:${threadId}`;
    const fallbackOwner = items.find((msg) => msg.direction === "outbound")?.owner_user_id ?? last.owner_user_id;
    const assigned = threadAssignments.get(assignedKey) ?? fallbackOwner;
    threads.push({
      thread_id: threadId,
      store_id: tenantStoreId(tenantId),
      contact_name: contactName,
      assigned_user_id: assigned ?? null,
      last_status: last.status,
      last_preview: last.preview,
      last_sent_label: last.sent_label,
      message_count: items.length,
    });
  });

  return threads.sort((a, b) => (a.last_sent_label === b.last_sent_label ? 0 : -1));
}

export function listThreadMessages(user: User, tenantId: string, threadId: string) {
  const userOnly = user.role === "seller";
  const scoped = messages.filter((item) => item.tenant_id === tenantId && (!userOnly || item.owner_user_id === user.id));
  const contactName = threadId.replace(/^thread-/, "").replace(/-/g, " ");
  const exact = scoped.filter((item) => threadIdFromContact(item.contact_name) === threadId);
  if (exact.length) return exact;
  return scoped.filter((item) => item.contact_name.toLowerCase() === contactName);
}

export function assignThread(user: User, tenantId: string, threadId: string, assigneeUserId: string) {
  if (user.role === "seller") return null;
  const exists = users.some((item) => item.tenant_id === tenantId && item.id === assigneeUserId);
  if (!exists) return null;
  const key = `${tenantId}:${threadId}`;
  threadAssignments.set(key, assigneeUserId);
  return { thread_id: threadId, assigned_user_id: assigneeUserId };
}

export function listInboxFailures(user: User, tenantId: string) {
  const userOnly = user.role === "seller";
  const scopedMessages = messages.filter((item) => item.tenant_id === tenantId && (!userOnly || item.owner_user_id === user.id));
  const failures = scopedMessages.filter((item) => item.status === "failed");
  return failures.map((message) => {
    const dlq = deadLetters.find((item) => item.tenant_id === tenantId && item.message_id === message.id);
    return {
      message,
      reason: dlq?.error ?? "Falha de envio simulada.",
    };
  });
}

export function retryInboxFailure(user: User, tenantId: string, messageId: string) {
  const index = messages.findIndex((item) => item.id === messageId && item.tenant_id === tenantId);
  if (index < 0) return null;
  if (user.role === "seller" && messages[index].owner_user_id !== user.id) return null;
  messages[index] = { ...messages[index], status: "queued", sent_label: "agora" };
  const dlqIndex = deadLetters.findIndex((item) => item.tenant_id === tenantId && item.message_id === messageId);
  if (dlqIndex >= 0) {
    deadLetters[dlqIndex] = { ...deadLetters[dlqIndex], status: "requeued" };
  }
  return { message_id: messageId, status: messages[index].status };
}
