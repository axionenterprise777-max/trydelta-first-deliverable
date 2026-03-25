"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { CSSProperties, FormEvent } from "react";

import { config } from "@fortawesome/fontawesome-svg-core";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import {
  faBell,
  faBolt,
  faChartColumn,
  faChartLine,
  faChevronLeft,
  faChevronRight,
  faComments,
  faGear,
  faMessage,
  faPaperPlane,
  faPhone,
  faRocket,
  faTableColumns,
  faUserGroup,
  faUsers,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

config.autoAddCss = false;

type DashboardSummary = {
  active_tenants: number;
  open_contact_requests: number;
  active_leads: number;
  queued_messages: number;
  pipeline_value_brl: number;
  conversion_rate_pct: number;
};

type UserSummary = {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
};

type DealCard = {
  id: string;
  client_name: string;
  owner: string;
  amount: number;
  stage: string;
  channel: string;
};

type DealLane = {
  id: string;
  label: string;
  total_value: number;
  cards: DealCard[];
};

type ClientSummary = {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  owner_user_id: string;
};

type ActivitySummary = {
  id: string;
  icon: string;
  title: string;
  detail: string;
  created_label: string;
};

type MessageSummary = {
  id: string;
  contact_name: string;
  direction: string;
  status: string;
  preview: string;
  sent_label: string;
};

type DeadLetterJobSummary = {
  id: string;
  task_name: string;
  message_id: string;
  idempotency_key: string;
  error: string;
  status: string;
};

type WhatsAppWorkspaceSummary = {
  provider: string;
  connected: boolean;
  health_status: string;
  session_status: string;
  pairing_code_supported: boolean;
};

type WhatsAppSessionSummary = {
  provider: string;
  connected: boolean;
  health_status: string;
  session_status: string;
  pairing_code_supported: boolean;
  qr_code: string | null;
  details: Record<string, unknown>;
};

type InboxThreadSummary = {
  thread_id: string;
  store_id: string;
  contact_name: string;
  assigned_user_id: string | null;
  last_status: string;
  last_preview: string;
  last_sent_label: string;
  message_count: number;
};

type InboxFailureSummary = {
  message: MessageSummary & { owner_user_id?: string };
  reason: string;
};

type MetricPoint = {
  label: string;
  pipeline: number;
  revenue: number;
};

type WorkspacePayload = {
  current_user: UserSummary;
  current_tenant: {
    id: string;
    name: string;
    plan: string;
    active_users: number;
  };
  available_tenants: Array<{
    id: string;
    name: string;
    plan: string;
    active_users: number;
  }>;
  current_store_id?: string;
  visible_users: UserSummary[];
  summary: DashboardSummary;
  board: { lanes: DealLane[] };
  clients: ClientSummary[];
  activities: ActivitySummary[];
  messages: MessageSummary[];
  whatsapp?: WhatsAppWorkspaceSummary;
  metrics: MetricPoint[];
};

type SectionId =
  | "dashboard"
  | "pipeline"
  | "contacts"
  | "whatsapp"
  | "automation"
  | "reports"
  | "settings";

const sections: Array<{ id: SectionId; label: string; icon: typeof faTableColumns }> = [
  { id: "dashboard", label: "Dashboard", icon: faTableColumns },
  { id: "pipeline", label: "Pipeline de Vendas", icon: faChartLine },
  { id: "contacts", label: "Leads & Contatos", icon: faUsers },
  { id: "whatsapp", label: "Campanhas WhatsApp", icon: faWhatsapp },
  { id: "automation", label: "Automacao", icon: faWandMagicSparkles },
  { id: "reports", label: "Relatorios", icon: faChartColumn },
  { id: "settings", label: "Configuracoes", icon: faGear },
];

const stageOrder = ["new", "follow_up", "won"];
const laneTheme: Record<string, string> = {
  new: "linear-gradient(135deg, #324b7b, #253a62)",
  follow_up: "linear-gradient(135deg, #f39a39, #dd7426)",
  won: "linear-gradient(135deg, #5b57cf, #4b45b9)",
};

const sectionTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.24, ease: "easeOut" as const },
};

const fallbackWorkspace: WorkspacePayload = {
  current_user: {
    id: "user-demo-01",
    tenant_id: "tenant-demo-01",
    name: "Adriana Lima",
    email: "adriana@trydelta.local",
    role: "admin",
    initials: "AL",
  },
  current_tenant: {
    id: "tenant-demo-01",
    name: "TryDelta Demo",
    plan: "pro",
    active_users: 2,
  },
  available_tenants: [
    { id: "tenant-demo-01", name: "TryDelta Demo", plan: "pro", active_users: 2 },
    { id: "tenant-demo-02", name: "TryDelta Industry", plan: "business", active_users: 1 },
  ],
  visible_users: [
    {
      id: "user-demo-01",
      tenant_id: "tenant-demo-01",
      name: "Adriana Lima",
      email: "adriana@trydelta.local",
      role: "admin",
      initials: "AL",
    },
    {
      id: "user-demo-02",
      tenant_id: "tenant-demo-01",
      name: "Bruno Alves",
      email: "bruno@trydelta.local",
      role: "seller",
      initials: "BA",
    },
  ],
  summary: {
    active_tenants: 2,
    open_contact_requests: 3,
    active_leads: 3,
    queued_messages: 2,
    pipeline_value_brl: 54900,
    conversion_rate_pct: 26.4,
  },
  board: {
    lanes: [
      {
        id: "new",
        label: "Novos leads",
        total_value: 27400,
        cards: [
          {
            id: "deal-001",
            client_name: "Nexa Equipamentos",
            owner: "Camila",
            amount: 18000,
            stage: "new",
            channel: "whatsapp",
          },
          {
            id: "deal-002",
            client_name: "Pilar Saude",
            owner: "Renato",
            amount: 9400,
            stage: "new",
            channel: "form",
          },
        ],
      },
      {
        id: "follow_up",
        label: "Em acompanhamento",
        total_value: 27500,
        cards: [
          {
            id: "deal-003",
            client_name: "Lume Energia",
            owner: "Bianca",
            amount: 27500,
            stage: "follow_up",
            channel: "whatsapp",
          },
        ],
      },
      { id: "won", label: "Fechados", total_value: 0, cards: [] },
    ],
  },
  clients: [
    {
      id: "client-001",
      name: "Nexa Equipamentos",
      phone: "+55 11 99877-1001",
      email: "compras@nexa.com",
      status: "ativo",
      owner_user_id: "user-demo-01",
    },
    {
      id: "client-002",
      name: "Pilar Saude",
      phone: "+55 11 99877-1002",
      email: "contato@pilarsaude.com",
      status: "negociacao",
      owner_user_id: "user-demo-02",
    },
  ],
  activities: [
    {
      id: "act-001",
      icon: "phone",
      title: "Ligacao com Nexa Equipamentos",
      detail: "Alinhamento de proposta comercial",
      created_label: "10 min",
    },
    {
      id: "act-002",
      icon: "message",
      title: "WhatsApp enviado para Pilar Saude",
      detail: "Template de follow-up disparado",
      created_label: "25 min",
    },
  ],
  messages: [
    {
      id: "message-001",
      contact_name: "Nexa Equipamentos",
      direction: "outbound",
      status: "delivered",
      preview: "Proposta revisada enviada.",
      sent_label: "10 min",
    },
    {
      id: "message-002",
      contact_name: "Pilar Saude",
      direction: "outbound",
      status: "queued",
      preview: "Template de follow-up aguardando envio.",
      sent_label: "25 min",
    },
  ],
  metrics: [
    { label: "Jan", pipeline: 21000, revenue: 13000 },
    { label: "Fev", pipeline: 28000, revenue: 17000 },
    { label: "Mar", pipeline: 32000, revenue: 22000 },
    { label: "Abr", pipeline: 37000, revenue: 26000 },
    { label: "Mai", pipeline: 41000, revenue: 30000 },
    { label: "Jun", pipeline: 54900, revenue: 34000 },
  ],
};

export function DashboardShell() {
  const [workspace, setWorkspace] = useState<WorkspacePayload | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [activeSection, setActiveSection] = useState<SectionId>("dashboard");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    void loadWorkspace(selectedTenantId || undefined);
  }, [selectedTenantId]);

  const stats = useMemo(() => {
    if (!workspace) {
      return [];
    }

    return [
      {
        label: "Novos Leads",
        value: String(workspace.summary.active_leads),
        accent: "#5d8ae6",
        icon: faUserGroup,
        helper: `${workspace.summary.open_contact_requests} pedidos ativos`,
      },
      {
        label: "Fila WhatsApp",
        value: workspace.summary.queued_messages.toLocaleString("pt-BR"),
        accent: "#2fb26b",
        icon: faWhatsapp,
        helper: "Entrega, leitura e retentativas",
      },
      {
        label: "Pipeline",
        value: formatCurrency(workspace.summary.pipeline_value_brl),
        accent: "#6474e6",
        icon: faChartLine,
        helper: `${workspace.summary.conversion_rate_pct}% conversao`,
      },
      {
        label: "Tenants",
        value: String(workspace.summary.active_tenants),
        accent: "#ef8b45",
        icon: faRocket,
        helper: `${workspace.current_user.role} em ${workspace.current_tenant.id}`,
      },
    ];
  }, [workspace]);

  const statusBreakdown = useMemo(() => {
    if (!workspace) {
      return [];
    }

    return [
      {
        name: "Entregues",
        value: workspace.messages.filter((item) => item.status === "delivered").length,
        color: "#5a7dff",
      },
      {
        name: "Lidas",
        value: workspace.messages.filter((item) => item.status === "read").length,
        color: "#36c274",
      },
      {
        name: "Na fila",
        value: workspace.messages.filter((item) => item.status === "queued").length,
        color: "#f7a23f",
      },
      {
        name: "Falhas",
        value: workspace.messages.filter((item) => item.status === "failed").length,
        color: "#ed6d7f",
      },
    ].filter((item) => item.value > 0);
  }, [workspace]);

  async function loadWorkspace(tenantId?: string) {
    try {
      setErrorMessage("");
      const response = await fetch(
        tenantId
          ? `/api/workspace?tenant_id=${encodeURIComponent(tenantId)}`
          : "/api/workspace",
        { cache: "no-store" },
      );
      const rawBody = await response.text();
      let data: { message?: string; [key: string]: unknown } = {};
      if (rawBody) {
        try {
          data = JSON.parse(rawBody) as { message?: string; [key: string]: unknown };
        } catch {
          data = {};
        }
      }

      if (!response.ok) {
        if (response.status === 401) {
          window.location.assign("/login");
          return;
        }
        startTransition(() => {
          setWorkspace(fallbackWorkspace);
          setSelectedTenantId(fallbackWorkspace.current_tenant.id);
        });
        setErrorMessage(data.message ?? "Modo mock ativo para preview.");
        return;
      }

      startTransition(() => {
        setWorkspace(data as WorkspacePayload);
        if (!tenantId) {
          setSelectedTenantId((data as WorkspacePayload).current_tenant.id);
        }
      });
    } catch {
      startTransition(() => {
        setWorkspace(fallbackWorkspace);
        setSelectedTenantId(fallbackWorkspace.current_tenant.id);
      });
      setErrorMessage("Modo mock ativo para preview.");
    }
  }

  async function moveDeal(card: DealCard, direction: "prev" | "next") {
    const currentIndex = stageOrder.indexOf(card.stage);
    const targetIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    const targetStage = stageOrder[targetIndex];
    if (!targetStage) {
      return;
    }

    const response = await fetch(
      `/api/deals/${encodeURIComponent(card.id)}/stage?tenant_id=${encodeURIComponent(selectedTenantId || workspace?.current_tenant.id || "")}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage_id: targetStage }),
      },
    );

    if (!response.ok) {
      setErrorMessage("Nao foi possivel mover o deal agora.");
      return;
    }

    await loadWorkspace(selectedTenantId || workspace?.current_tenant.id);
  }

  async function refreshWorkspace() {
    await loadWorkspace(selectedTenantId || workspace?.current_tenant.id);
  }

  async function logout() {
    setIsLoggingOut(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/session/logout", {
        method: "POST",
        cache: "no-store",
      });
      if (!response.ok) {
        setErrorMessage("Nao foi possivel encerrar a sessao agora.");
        return;
      }
      window.location.assign("/login");
    } catch {
      setErrorMessage("Nao foi possivel encerrar a sessao agora.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <main style={styles.page} data-testid="dashboard-root">
      <div style={styles.shell}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <LogoMark />
            <div>
              <strong style={styles.logoStrong}>TRYDELTA</strong>
              <div style={styles.logoSoft}>CRM OPERATIONS</div>
            </div>
          </div>

          <div style={styles.sidebarMeta}>
            <span style={styles.metaPill}>UI premium</span>
            <span style={styles.metaText}>Painel dinâmico com tenant isolado</span>
          </div>

          <nav style={styles.menu}>
            {sections.map((item) => (
              <button
                key={item.id}
                type="button"
                data-testid={`nav-${item.id}`}
                style={{
                  ...styles.menuItem,
                  ...(item.id === activeSection ? styles.menuItemActive : {}),
                }}
                onClick={() => setActiveSection(item.id)}
              >
                <span style={styles.menuIcon}>
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section style={styles.workspace}>
          <header style={styles.topbar}>
            <div>
              <h1 style={styles.heading}>CRM SaaS</h1>
              <p style={styles.subheading}>
                Pipeline, WhatsApp, timeline e operacao multiusuario em tempo real.
              </p>
            </div>

            <div style={styles.topbarActions}>
              <span style={styles.actionChip}>
                <FontAwesomeIcon icon={faWhatsapp} />
                <span>WhatsApp</span>
              </span>
              <span style={styles.actionChip}>
                <FontAwesomeIcon icon={faBolt} />
                <span>Automacao</span>
              </span>
              <span style={styles.actionCircle}>
                <FontAwesomeIcon icon={faBell} />
              </span>
              <label style={styles.userSelectWrap}>
                <span style={styles.userSelectLabel}>Tenant</span>
                <select
                  value={selectedTenantId}
                  onChange={async (event) => {
                    const nextTenantId = event.target.value;
                    setSelectedTenantId(nextTenantId);
                    await fetch("/api/session/tenant", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ tenant_id: nextTenantId }),
                    });
                  }}
                  style={styles.userSelect}
                  disabled={(workspace?.available_tenants.length ?? 0) <= 1}
                >
                  {workspace?.available_tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </option>
                  )) ?? <option value="">Carregando...</option>}
                </select>
              </label>
              <span style={styles.avatar}>{workspace?.current_user.initials ?? "TD"}</span>
              <button
                type="button"
                style={styles.logoutButton}
                onClick={() => void logout()}
                disabled={isLoggingOut}
                data-testid="logout-button"
              >
                {isLoggingOut ? "Saindo..." : "Sair"}
              </button>
            </div>
          </header>

          <div style={styles.inner}>
            {errorMessage ? <div style={styles.errorBanner}>{errorMessage}</div> : null}

            {!workspace ? (
              <div style={styles.loadingGrid}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`loading-${index}`} style={styles.loadingCard} />
                ))}
              </div>
            ) : (
              <>
                <section style={styles.statsRow}>
                  {stats.map((item, index) => (
                    <motion.article
                      key={item.label}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={styles.statCard}
                    >
                      <div style={styles.statHeader}>
                        <span style={styles.statLabel}>{item.label}</span>
                        <span style={{ ...styles.statIcon, color: item.accent }}>
                          <FontAwesomeIcon icon={item.icon} />
                        </span>
                      </div>
                      <strong style={styles.statValue}>{item.value}</strong>
                      <span style={styles.statHelper}>{item.helper}</span>
                    </motion.article>
                  ))}
                </section>

                <AnimatePresence mode="wait">
                  <motion.section
                    key={activeSection}
                    {...sectionTransition}
                    style={styles.sectionWrap}
                  >
                    {renderSection({
                      activeSection,
                      workspace,
                      isPending,
                      onMoveDeal: moveDeal,
                      onRefreshWorkspace: refreshWorkspace,
                      statusBreakdown,
                    })}
                  </motion.section>
                </AnimatePresence>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function renderSection({
  activeSection,
  workspace,
  isPending,
  onMoveDeal,
  onRefreshWorkspace,
  statusBreakdown,
}: {
  activeSection: SectionId;
  workspace: WorkspacePayload;
  isPending: boolean;
  onMoveDeal: (card: DealCard, direction: "prev" | "next") => Promise<void>;
  onRefreshWorkspace: () => Promise<void>;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
}) {
  switch (activeSection) {
    case "pipeline":
      return <PipelineSection workspace={workspace} isPending={isPending} onMoveDeal={onMoveDeal} />;
    case "contacts":
      return <ContactsSection workspace={workspace} onRefreshWorkspace={onRefreshWorkspace} />;
    case "whatsapp":
      return (
        <WhatsappSection
          workspace={workspace}
          statusBreakdown={statusBreakdown}
          onRefreshWorkspace={onRefreshWorkspace}
        />
      );
    case "automation":
      return <AutomationSection workspace={workspace} />;
    case "reports":
      return <ReportsSection workspace={workspace} statusBreakdown={statusBreakdown} />;
    case "settings":
      return <SettingsSection workspace={workspace} />;
    case "dashboard":
    default:
      return (
        <OverviewSection
          workspace={workspace}
          isPending={isPending}
          onMoveDeal={onMoveDeal}
          statusBreakdown={statusBreakdown}
        />
      );
  }
}

function OverviewSection({
  workspace,
  isPending,
  onMoveDeal,
  statusBreakdown,
}: {
  workspace: WorkspacePayload;
  isPending: boolean;
  onMoveDeal: (card: DealCard, direction: "prev" | "next") => Promise<void>;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
}) {
  return (
    <div style={styles.mainGrid}>
      <div style={styles.primaryColumn}>
        <PipelinePanel workspace={workspace} isPending={isPending} onMoveDeal={onMoveDeal} compact />
        <div style={styles.bottomGrid}>
          <section style={styles.cardPanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Grafico de Vendas</h2>
            </div>
            <div style={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={workspace.metrics}>
                  <defs>
                    <linearGradient id="pipelineArea" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#5f82ff" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#5f82ff" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e5ebf3" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#73839e" />
                  <YAxis stroke="#73839e" />
                  <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                  <Area dataKey="pipeline" stroke="#5f82ff" strokeWidth={3} fill="url(#pipelineArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section style={styles.cardPanel}>
            <div style={styles.panelHeader}>
              <h2 style={styles.panelTitle}>Metas e Performance</h2>
            </div>
            <div style={styles.performanceGrid}>
              <MetricRing label="Conversao" value={Math.round(workspace.summary.conversion_rate_pct)} color="#5d77f3" />
              <MetricRing label="Mensagens" value={Math.min(99, workspace.summary.queued_messages * 20)} color="#30bc72" />
            </div>
            <div style={styles.pieWrap}>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={statusBreakdown} innerRadius={42} outerRadius={66} dataKey="value" paddingAngle={3}>
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </div>

      <aside style={styles.secondaryColumn}>
        <CampaignPanel workspace={workspace} />
        <ActivityPanel workspace={workspace} />
      </aside>
    </div>
  );
}

function PipelineSection({
  workspace,
  isPending,
  onMoveDeal,
}: {
  workspace: WorkspacePayload;
  isPending: boolean;
  onMoveDeal: (card: DealCard, direction: "prev" | "next") => Promise<void>;
}) {
  return (
    <div style={styles.sectionGridSingle}>
      <PipelinePanel workspace={workspace} isPending={isPending} onMoveDeal={onMoveDeal} />
    </div>
  );
}

function ContactsSection({
  workspace,
  onRefreshWorkspace,
}: {
  workspace: WorkspacePayload;
  onRefreshWorkspace: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    status: "novo",
  });
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFeedback("Preencha nome, email e telefone.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback("");
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          status: form.status.trim() || "novo",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel criar o cliente.");
        return;
      }

      setForm({ name: "", email: "", phone: "", status: "novo" });
      setFeedback("Cliente criado com sucesso.");
      await onRefreshWorkspace();
    } catch {
      setFeedback("Nao foi possivel criar o cliente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveEdit() {
    if (!editingClientId) {
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFeedback("Preencha nome, email e telefone.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback("");
      const response = await fetch(`/api/clients/${encodeURIComponent(editingClientId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          status: form.status.trim() || "ativo",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel atualizar o cliente.");
        return;
      }

      setEditingClientId(null);
      setForm({ name: "", email: "", phone: "", status: "novo" });
      setFeedback("Cliente atualizado com sucesso.");
      await onRefreshWorkspace();
    } catch {
      setFeedback("Nao foi possivel atualizar o cliente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(client: ClientSummary) {
    setEditingClientId(client.id);
    setForm({
      name: client.name,
      email: client.email,
      phone: client.phone,
      status: client.status,
    });
    setFeedback("");
  }

  function cancelEdit() {
    setEditingClientId(null);
    setForm({ name: "", email: "", phone: "", status: "novo" });
    setFeedback("");
  }

  return (
    <div style={styles.sectionGridSingle}>
      <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Leads e Contatos</h2>
          <span style={styles.panelHint}>{workspace.clients.length} registros</span>
        </div>

        <form onSubmit={handleCreate} style={styles.inlineFormGrid}>
          <label style={styles.fieldStack}>
            <span style={styles.fieldLabel}>Conta</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              style={styles.textField}
              placeholder="Nome da conta"
            />
          </label>
          <label style={styles.fieldStack}>
            <span style={styles.fieldLabel}>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              style={styles.textField}
              placeholder="contato@empresa.com"
            />
          </label>
          <label style={styles.fieldStack}>
            <span style={styles.fieldLabel}>Telefone</span>
            <input
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              style={styles.textField}
              placeholder="+55 11 99999-9999"
            />
          </label>
          <label style={styles.fieldStack}>
            <span style={styles.fieldLabel}>Status</span>
            <input
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              style={styles.textField}
              placeholder="novo"
            />
          </label>
          <div style={styles.inlineFormActions}>
            {editingClientId ? (
              <>
                <button type="button" style={styles.primaryButton} onClick={() => void handleSaveEdit()} disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar edicao"}
                </button>
                <button type="button" style={styles.secondaryButton} onClick={cancelEdit} disabled={isSubmitting}>
                  Cancelar
                </button>
              </>
            ) : (
              <button type="submit" style={styles.primaryButton} disabled={isSubmitting}>
                {isSubmitting ? "Criando..." : "Adicionar cliente"}
              </button>
            )}
          </div>
        </form>

        {feedback ? <div style={styles.inlineNotice}>{feedback}</div> : null}

        <div style={styles.tableWrap}>
          <div style={styles.tableHeaderContacts}>
            <span>Conta</span>
            <span>Status</span>
            <span>Contato</span>
            <span>Acoes</span>
          </div>
          {workspace.clients.map((client) => (
            <div key={client.id} style={styles.tableRowContacts}>
              <div style={styles.tablePrimary}>
                <strong>{client.name}</strong>
                <span>{client.email}</span>
              </div>
              <span style={styles.statusBadge}>{client.status}</span>
              <span>{client.phone}</span>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={() => startEdit(client)}
                disabled={isSubmitting}
              >
                Editar
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function WhatsappSection({
  workspace,
  statusBreakdown,
  onRefreshWorkspace,
}: {
  workspace: WorkspacePayload;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  onRefreshWorkspace: () => Promise<void>;
}) {
  const [contactName, setContactName] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [deadLetterJobs, setDeadLetterJobs] = useState<DeadLetterJobSummary[]>([]);
  const [threads, setThreads] = useState<InboxThreadSummary[]>([]);
  const [failures, setFailures] = useState<InboxFailureSummary[]>([]);
  const [threadAssignees, setThreadAssignees] = useState<Record<string, string>>({});
  const [activeThread, setActiveThread] = useState<InboxThreadSummary | null>(null);
  const [threadMessages, setThreadMessages] = useState<MessageSummary[]>([]);
  const [session, setSession] = useState<WhatsAppSessionSummary | null>(null);
  const [pairingPhone, setPairingPhone] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDlq, setIsLoadingDlq] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [isGeneratingPairingCode, setIsGeneratingPairingCode] = useState(false);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);
  const [isLoadingFailures, setIsLoadingFailures] = useState(false);
  const [isLoadingThreadMessages, setIsLoadingThreadMessages] = useState(false);
  const [isAssigningThreadId, setIsAssigningThreadId] = useState<string | null>(null);
  const [isRetryingFailureId, setIsRetryingFailureId] = useState<string | null>(null);

  useEffect(() => {
    void loadDeadLetterJobs();
    void loadSession();
    void loadThreads();
    void loadFailures();
  }, [workspace.current_tenant.id, workspace.current_store_id]);

  async function loadDeadLetterJobs() {
    try {
      setIsLoadingDlq(true);
      const response = await fetch("/api/messages/dlq", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel carregar a DLQ.");
        return;
      }

      setDeadLetterJobs(data);
    } catch {
      setFeedback("Nao foi possivel carregar a DLQ.");
    } finally {
      setIsLoadingDlq(false);
    }
  }

  async function loadSession() {
    try {
      setIsLoadingSession(true);
      const response = await fetch("/api/whatsapp/session", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel carregar a sessao do WhatsApp.");
        return;
      }
      setSession(data);
    } catch {
      setFeedback("Nao foi possivel carregar a sessao do WhatsApp.");
    } finally {
      setIsLoadingSession(false);
    }
  }

  async function loadThreads() {
    try {
      setIsLoadingThreads(true);
      const response = await fetch("/api/inbox/threads", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel carregar as threads.");
        return;
      }
      setThreads(Array.isArray(data) ? data : []);
    } catch {
      setFeedback("Nao foi possivel carregar as threads.");
    } finally {
      setIsLoadingThreads(false);
    }
  }

  async function loadFailures() {
    try {
      setIsLoadingFailures(true);
      const response = await fetch("/api/inbox/failures", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel carregar as falhas.");
        return;
      }
      setFailures(Array.isArray(data) ? data : []);
    } catch {
      setFeedback("Nao foi possivel carregar as falhas.");
    } finally {
      setIsLoadingFailures(false);
    }
  }

  async function openThread(thread: InboxThreadSummary) {
    try {
      setIsLoadingThreadMessages(true);
      setActiveThread(thread);
      setThreadMessages([]);
      const response = await fetch(`/api/inbox/threads/${encodeURIComponent(thread.thread_id)}/messages`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel carregar as mensagens da thread.");
        return;
      }
      setThreadMessages(Array.isArray(data) ? data : []);
    } catch {
      setFeedback("Nao foi possivel carregar as mensagens da thread.");
    } finally {
      setIsLoadingThreadMessages(false);
    }
  }

  function closeThread() {
    setActiveThread(null);
    setThreadMessages([]);
  }

  async function assignThread(threadId: string, userId: string) {
    try {
      setIsAssigningThreadId(threadId);
      setFeedback("");
      const response = await fetch(`/api/inbox/threads/${encodeURIComponent(threadId)}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel atribuir a thread.");
        return;
      }
      setFeedback("Thread atribuida com sucesso.");
      await Promise.all([onRefreshWorkspace(), loadThreads()]);
      return data;
    } catch {
      setFeedback("Nao foi possivel atribuir a thread.");
    } finally {
      setIsAssigningThreadId(null);
    }
  }

  async function retryFailure(messageId: string) {
    try {
      setIsRetryingFailureId(messageId);
      setFeedback("");
      const response = await fetch(`/api/inbox/failures/${encodeURIComponent(messageId)}/retry`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel reenfileirar a falha.");
        return;
      }
      setFeedback("Mensagem reenfileirada com sucesso.");
      await Promise.all([onRefreshWorkspace(), loadFailures(), loadDeadLetterJobs()]);
      return data;
    } catch {
      setFeedback("Nao foi possivel reenfileirar a falha.");
    } finally {
      setIsRetryingFailureId(null);
    }
  }

  async function handlePairingCode() {
    if (!pairingPhone.trim()) {
      setFeedback("Informe um numero para gerar o pairing code.");
      return;
    }

    try {
      setIsGeneratingPairingCode(true);
      setFeedback("");
      const response = await fetch("/api/whatsapp/session/pairing-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: pairingPhone.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel gerar o pairing code.");
        return;
      }
      setPairingCode(data.pairing_code ?? "");
      setFeedback("Pairing code gerado com sucesso.");
      await loadSession();
    } catch {
      setFeedback("Nao foi possivel gerar o pairing code.");
    } finally {
      setIsGeneratingPairingCode(false);
    }
  }

  async function handleDispatch() {
    if (!contactName.trim() || !messageBody.trim()) {
      setFeedback("Preencha contato e mensagem para disparar.");
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback("");
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_name: contactName.trim(),
          preview: messageBody.trim(),
          idempotency_key:
            typeof crypto !== "undefined" && "randomUUID" in crypto
              ? crypto.randomUUID()
              : `idem-${Date.now()}`,
          simulate_failure: simulateFailure,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel disparar agora.");
        return;
      }

      setContactName("");
      setMessageBody("");
      setSimulateFailure(false);
      setFeedback(data.duplicate ? "Envio ja registrado." : "Mensagem enfileirada com sucesso.");
      await Promise.all([onRefreshWorkspace(), loadDeadLetterJobs(), loadThreads(), loadFailures()]);
    } catch {
      setFeedback("Nao foi possivel disparar agora.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRetry(jobId: string) {
    try {
      setFeedback("");
      const response = await fetch(`/api/messages/dlq/${encodeURIComponent(jobId)}/retry`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setFeedback(data.message ?? "Nao foi possivel reenfileirar.");
        return;
      }

      setFeedback("Job reenfileirado para nova tentativa.");
      await Promise.all([onRefreshWorkspace(), loadDeadLetterJobs(), loadFailures()]);
    } catch {
      setFeedback("Nao foi possivel reenfileirar.");
    }
  }

  const visibleUsersById = useMemo(() => {
    const map: Record<string, UserSummary> = {};
    workspace.visible_users.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [workspace.visible_users]);

  const sessionDetails = useMemo(() => {
    const details = session?.details ?? {};
    return Object.entries(details).filter(([key, value]) => {
      if (value === null || value === undefined) return false;
      const normalized = key.toLowerCase();
      if (normalized.includes("token") || normalized.includes("secret") || normalized.includes("password")) return false;
      return true;
    });
  }, [session]);

  return (
    <>
      <div style={styles.twoColumnSplit}>
        <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Fila WhatsApp</h2>
        </div>
        <div style={styles.composerPanel}>
          <div style={styles.composerGrid}>
            <label style={styles.fieldStack}>
              <span style={styles.fieldLabel}>Contato</span>
              <input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="Nome da conta"
                style={styles.textField}
              />
            </label>
            <label style={styles.fieldStack}>
              <span style={styles.fieldLabel}>Mensagem</span>
              <textarea
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Digite a proxima acao"
                style={styles.textAreaField}
              />
            </label>
          </div>
          <div style={styles.composerActions}>
            <label style={styles.toggleWrap}>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(event) => setSimulateFailure(event.target.checked)}
              />
              <span>Simular falha</span>
            </label>
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => void handleDispatch()}
              disabled={isSubmitting}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>{isSubmitting ? "Enfileirando..." : "Disparar"}</span>
            </button>
          </div>
          {feedback ? <div style={styles.inlineNotice}>{feedback}</div> : null}
        </div>
        <div style={styles.messageList}>
          {workspace.messages.map((message) => (
            <div key={message.id} style={styles.messageCard}>
              <div style={styles.messageMeta}>
                <span style={styles.messageName}>{message.contact_name}</span>
                <span style={styles.messageTime}>{message.sent_label}</span>
              </div>
              <p style={styles.messagePreview}>{message.preview}</p>
              <div style={styles.messageFooter}>
                <span style={styles.directionChip}>
                  <FontAwesomeIcon icon={message.direction === "inbound" ? faMessage : faPaperPlane} />
                  <span>{message.direction}</span>
                </span>
                <span style={styles.statusBadge}>{message.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

        <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Status e Timeline</h2>
        </div>
        <div style={styles.integrationStatusCard}>
          <div style={styles.integrationStatusHeader}>
            <div style={styles.tablePrimary}>
              <strong style={styles.panelTitle}>Sessao {workspace.whatsapp?.provider ?? "whatsapp"}</strong>
              <span style={styles.messageTime}>
                {isLoadingSession ? "Atualizando..." : `${workspace.whatsapp?.health_status ?? "unknown"} / ${workspace.whatsapp?.session_status ?? "unknown"}`}
              </span>
            </div>
            <span
              style={{
                ...styles.statusBadge,
                ...((workspace.whatsapp?.connected ?? false) ? styles.statusBadgeSuccess : styles.statusBadgeWarn),
              }}
            >
              {(workspace.whatsapp?.connected ?? false) ? "conectado" : "aguardando"}
            </span>
          </div>
          {session?.qr_code ? (
            <div style={styles.qrBox}>
              <div style={styles.qrBoxHeader}>
                <strong>QR Code (raw)</strong>
                <span>{session.connected ? "conectado" : "aguardando leitura"}</span>
              </div>
              <pre style={styles.qrCodePre}>{session.qr_code}</pre>
            </div>
          ) : null}
          {sessionDetails.length ? (
            <div style={styles.detailsGrid}>
              {sessionDetails.map(([key, value]) => (
                <div key={key} style={styles.detailsRow}>
                  <span>{key}</span>
                  <strong style={styles.detailsValue}>{String(value)}</strong>
                </div>
              ))}
            </div>
          ) : null}
          {session?.pairing_code_supported ? (
            <div style={styles.composerGrid}>
              <label style={styles.fieldStack}>
                <span style={styles.fieldLabel}>Numero para parear</span>
                <input
                  value={pairingPhone}
                  onChange={(event) => setPairingPhone(event.target.value)}
                  placeholder="+55 11 99999-0000"
                  style={styles.textField}
                />
              </label>
              <div style={styles.composerActions}>
                <button type="button" style={styles.secondaryButton} onClick={() => void loadSession()} disabled={isLoadingSession}>
                  {isLoadingSession ? "Atualizando..." : "Atualizar sessao"}
                </button>
                <button
                  type="button"
                  style={styles.primaryButton}
                  onClick={() => void handlePairingCode()}
                  disabled={isGeneratingPairingCode}
                >
                  {isGeneratingPairingCode ? "Gerando..." : "Gerar pairing code"}
                </button>
              </div>
              {pairingCode ? <div style={styles.pairingCodeBox}>{pairingCode}</div> : null}
            </div>
          ) : null}
        </div>
        <div style={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={statusBreakdown}>
              <CartesianGrid stroke="#e5ebf3" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#73839e" />
              <YAxis stroke="#73839e" />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.dlqSection}>
          <div style={styles.subPanelHeader}>
            <strong>Dead Letter Queue</strong>
            <span>{isLoadingDlq ? "Atualizando..." : `${deadLetterJobs.length} itens`}</span>
          </div>
          <div style={styles.dlqList}>
            {deadLetterJobs.length === 0 ? (
              <div style={styles.emptyState}>Nenhum job retido.</div>
            ) : (
              deadLetterJobs.slice(0, 4).map((job) => (
                <div key={job.id} style={styles.dlqItem}>
                  <div style={styles.dlqMeta}>
                    <strong>{job.message_id}</strong>
                    <span>{job.status}</span>
                  </div>
                  <span style={styles.dlqError}>{job.error}</span>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => void handleRetry(job.id)}
                  >
                    Reenfileirar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.dlqSection}>
          <div style={styles.subPanelHeader}>
            <strong>Inbox Threads</strong>
            <div style={styles.subPanelActions}>
              <span>{isLoadingThreads ? "Atualizando..." : `${threads.length} threads`}</span>
              <button type="button" style={styles.secondaryButton} onClick={() => void loadThreads()} disabled={isLoadingThreads}>
                Atualizar
              </button>
            </div>
          </div>
          <div style={styles.threadList}>
            {threads.length === 0 ? (
              <div style={styles.emptyState}>Nenhuma thread encontrada.</div>
            ) : (
              threads.slice(0, 6).map((thread) => {
                const selectedAssignee =
                  threadAssignees[thread.thread_id] ??
                  thread.assigned_user_id ??
                  workspace.current_user.id;
                const assignedUser = thread.assigned_user_id ? visibleUsersById[thread.assigned_user_id] : undefined;
                return (
                  <div key={thread.thread_id} style={styles.threadItem}>
                    <div style={styles.threadTop}>
                      <div style={styles.tablePrimary}>
                        <strong>{thread.contact_name}</strong>
                        <span style={styles.messageTime}>
                          {thread.last_sent_label} · {thread.message_count} msgs · {thread.store_id}
                        </span>
                      </div>
                      <span style={styles.statusBadge}>{thread.last_status}</span>
                    </div>
                    <span style={styles.threadPreview}>{thread.last_preview}</span>
                    <div style={styles.threadBottom}>
                      <span style={styles.threadAssignee}>
                        {assignedUser ? `Owner: ${assignedUser.name}` : thread.assigned_user_id ? `Owner: ${thread.assigned_user_id}` : "Owner: nao atribuido"}
                      </span>
                      <div style={styles.threadActions}>
                        <select
                          value={selectedAssignee}
                          onChange={(event) =>
                            setThreadAssignees((current) => ({ ...current, [thread.thread_id]: event.target.value }))
                          }
                          style={styles.compactSelect}
                        >
                          {workspace.visible_users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          style={styles.secondaryButton}
                          onClick={() => void assignThread(thread.thread_id, selectedAssignee)}
                          disabled={isAssigningThreadId === thread.thread_id}
                        >
                          {isAssigningThreadId === thread.thread_id ? "Atribuindo..." : "Atribuir"}
                        </button>
                        <button type="button" style={styles.primaryButton} onClick={() => void openThread(thread)}>
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={styles.dlqSection}>
          <div style={styles.subPanelHeader}>
            <strong>Falhas de entrega</strong>
            <div style={styles.subPanelActions}>
              <span>{isLoadingFailures ? "Atualizando..." : `${failures.length} itens`}</span>
              <button type="button" style={styles.secondaryButton} onClick={() => void loadFailures()} disabled={isLoadingFailures}>
                Atualizar
              </button>
            </div>
          </div>
          <div style={styles.failureList}>
            {failures.length === 0 ? (
              <div style={styles.emptyState}>Nenhuma falha encontrada.</div>
            ) : (
              failures.slice(0, 6).map((failure) => (
                <div key={failure.message.id} style={styles.failureItem}>
                  <div style={styles.threadTop}>
                    <div style={styles.tablePrimary}>
                      <strong>{failure.message.contact_name}</strong>
                      <span style={styles.messageTime}>{failure.message.sent_label}</span>
                    </div>
                    <span style={styles.statusBadge}>{failure.message.status}</span>
                  </div>
                  <span style={styles.failureReason}>{failure.reason}</span>
                  <span style={styles.threadPreview}>{failure.message.preview}</span>
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => void retryFailure(failure.message.id)}
                    disabled={isRetryingFailureId === failure.message.id}
                  >
                    {isRetryingFailureId === failure.message.id ? "Reenfileirando..." : "Reenfileirar"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <ActivityPanel workspace={workspace} compact />
      </section>
      </div>

      <AnimatePresence>
        {activeThread ? (
          <motion.div style={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              style={styles.modalPanel}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 18, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div style={styles.modalHeader}>
                <div style={styles.tablePrimary}>
                  <strong>{activeThread.contact_name}</strong>
                  <span style={styles.messageTime}>
                    {isLoadingThreadMessages ? "Carregando..." : `${threadMessages.length} mensagens`}
                  </span>
                </div>
                <button type="button" style={styles.secondaryButton} onClick={closeThread}>
                  Fechar
                </button>
              </div>
              <div style={styles.modalBody}>
                {threadMessages.length === 0 ? (
                  <div style={styles.emptyState}>Sem mensagens registradas.</div>
                ) : (
                  threadMessages.map((message) => (
                    <div key={message.id} style={styles.modalMessage}>
                      <div style={styles.modalMessageTop}>
                        <span style={styles.directionChip}>
                          <span>{message.direction}</span>
                        </span>
                        <span style={styles.messageTime}>{message.sent_label}</span>
                      </div>
                      <p style={styles.messagePreview}>{message.preview}</p>
                      <div style={styles.modalMessageBottom}>
                        <span style={styles.statusBadge}>{message.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function AutomationSection({ workspace }: { workspace: WorkspacePayload }) {
  const cards = [
    {
      title: "Regras ativas",
      value: workspace.activities.length + workspace.messages.length,
      detail: "Eventos ligados ao tenant atual",
      icon: faBolt,
    },
    {
      title: "Campanhas monitoradas",
      value: workspace.summary.open_contact_requests,
      detail: "Pedidos e capturas aguardando tratamento",
      icon: faRocket,
    },
    {
      title: "Retentativas",
      value: workspace.messages.filter((message) => message.status === "failed").length,
      detail: "Fila pronta para novo disparo",
      icon: faComments,
    },
  ];

  return (
    <div style={styles.sectionGridSingle}>
      <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Automacao Operacional</h2>
        </div>
        <div style={styles.automationGrid}>
          {cards.map((card) => (
            <div key={card.title} style={styles.automationCard}>
              <span style={styles.automationIcon}>
                <FontAwesomeIcon icon={card.icon} />
              </span>
              <strong style={styles.automationValue}>{card.value}</strong>
              <span style={styles.automationTitle}>{card.title}</span>
              <span style={styles.automationDetail}>{card.detail}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportsSection({
  workspace,
  statusBreakdown,
}: {
  workspace: WorkspacePayload;
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
}) {
  return (
    <div style={styles.twoColumnSplit}>
      <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Receita x Pipeline</h2>
        </div>
        <div style={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workspace.metrics}>
              <CartesianGrid stroke="#e5ebf3" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#73839e" />
              <YAxis stroke="#73839e" />
              <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
              <Bar dataKey="pipeline" fill="#6c80ff" radius={[8, 8, 0, 0]} />
              <Bar dataKey="revenue" fill="#88c9ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Status de Mensageria</h2>
        </div>
        <div style={styles.pieWrap}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={4}>
                {statusBreakdown.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={styles.legendList}>
          {statusBreakdown.map((entry) => (
            <div key={entry.name} style={styles.legendItem}>
              <span style={{ ...styles.legendDot, background: entry.color }} />
              <span>{entry.name}</span>
              <strong>{entry.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SettingsSection({ workspace }: { workspace: WorkspacePayload }) {
  return (
    <div style={styles.twoColumnSplit}>
      <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Perfil e Escopo</h2>
        </div>
        <div style={styles.settingsStack}>
          <div style={styles.settingsRow}><span>Usuario atual</span><strong>{workspace.current_user.name}</strong></div>
          <div style={styles.settingsRow}><span>Role</span><strong>{workspace.current_user.role}</strong></div>
          <div style={styles.settingsRow}><span>Tenant</span><strong>{workspace.current_user.tenant_id}</strong></div>
          <div style={styles.settingsRow}><span>Email</span><strong>{workspace.current_user.email}</strong></div>
        </div>
      </section>

      <section style={styles.cardPanel}>
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Equipe visivel</h2>
        </div>
        <div style={styles.userList}>
          {workspace.visible_users.map((user) => (
            <div key={user.id} style={styles.userCard}>
              <span style={styles.userAvatar}>{user.initials}</span>
              <div style={styles.userMeta}>
                <strong>{user.name}</strong>
                <span>{user.role} · {user.email}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PipelinePanel({
  workspace,
  isPending,
  onMoveDeal,
  compact = false,
}: {
  workspace: WorkspacePayload;
  isPending: boolean;
  onMoveDeal: (card: DealCard, direction: "prev" | "next") => Promise<void>;
  compact?: boolean;
}) {
  return (
    <section style={styles.cardPanel}>
      <div style={styles.panelHeader}>
        <h2 style={styles.panelTitle}>Funil de Vendas</h2>
        <span style={styles.panelHint}>{isPending ? "Atualizando..." : "Banco conectado"}</span>
      </div>
      <div
        style={{
          ...styles.pipelineGrid,
          gridTemplateColumns: compact ? "repeat(auto-fit, minmax(210px, 1fr))" : "repeat(auto-fit, minmax(250px, 1fr))",
        }}
      >
        {workspace.board.lanes.map((lane) => (
          <div key={lane.id} style={styles.pipelineColumn}>
            <div style={{ ...styles.pipelineHeader, background: laneTheme[lane.id] ?? laneTheme.new }}>
              <span>{lane.label}</span>
              <span style={styles.pipelineCount}>{lane.cards.length}</span>
            </div>
            <div style={styles.pipelineBody}>
              <div style={styles.pipelineTotal}>{formatCurrency(lane.total_value)}</div>
              {lane.cards.length === 0 ? <div style={styles.emptyState}>Nenhum deal nesta etapa.</div> : null}
              {lane.cards.map((card) => {
                const stageIndex = stageOrder.indexOf(card.stage);
                return (
                  <motion.div key={card.id} layout style={styles.pipelineCard} whileHover={{ y: -2 }}>
                    <div style={styles.pipelineCardHeader}>
                      <strong style={styles.pipelineCardTitle}>{card.client_name}</strong>
                      <span style={styles.pipelineChannel}>{card.channel}</span>
                    </div>
                    <span style={styles.pipelineCardMeta}>{card.owner}</span>
                    <div style={styles.pipelineCardFooter}>
                      <span style={styles.pipelinePrice}>{formatCurrency(card.amount)}</span>
                      <div style={styles.dealActions}>
                        <button type="button" style={styles.dealActionButton} onClick={() => void onMoveDeal(card, "prev")} disabled={stageIndex <= 0}>
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button type="button" style={styles.dealActionButton} onClick={() => void onMoveDeal(card, "next")} disabled={stageIndex >= stageOrder.length - 1}>
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CampaignPanel({ workspace }: { workspace: WorkspacePayload }) {
  const primaryMessage = workspace.messages[0];

  return (
    <section style={styles.cardPanel}>
      <div style={styles.panelHeader}>
        <h2 style={styles.panelTitle}>Campanha WhatsApp</h2>
      </div>
      <div style={styles.campaignContent}>
        <div style={styles.campaignGlow} />
        <div style={styles.campaignBadge}>
          <FontAwesomeIcon icon={faWhatsapp} />
          <span>Meta Cloud API</span>
        </div>
        <strong style={styles.campaignTitle}>{primaryMessage?.contact_name ?? "Campanha ativa"}</strong>
        <p style={styles.campaignText}>
          Ultimo fluxo: {primaryMessage?.preview ?? "Nenhum disparo registrado."}
        </p>
        <div style={styles.campaignStats}>
          <span>Fila: {workspace.summary.queued_messages}</span>
          <span>Conversao: {workspace.summary.conversion_rate_pct}%</span>
        </div>
      </div>
    </section>
  );
}

function ActivityPanel({
  workspace,
  compact = false,
}: {
  workspace: WorkspacePayload;
  compact?: boolean;
}) {
  return (
    <section style={compact ? styles.activityCompact : styles.cardPanel}>
      {!compact ? (
        <div style={styles.panelHeader}>
          <h2 style={styles.panelTitle}>Atividades Recentes</h2>
        </div>
      ) : null}
      <div style={styles.activities}>
        {workspace.activities.map((item) => (
          <div key={item.id} style={styles.activityItem}>
            <span style={styles.activityIconWrap}>
              <FontAwesomeIcon icon={mapActivityIcon(item.icon)} />
            </span>
            <div style={styles.activityTextWrap}>
              <strong style={styles.activityTitle}>{item.title}</strong>
              <span style={styles.activityDetail}>{item.detail}</span>
            </div>
            <span style={styles.activityAge}>{item.created_label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricRing({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const safeValue = Math.max(1, Math.min(100, value));

  return (
    <div style={styles.meterCard}>
      <div
        style={{
          ...styles.meterRing,
          background: `conic-gradient(${color} 0deg ${safeValue * 3.6}deg, #e7edf5 ${safeValue * 3.6}deg 360deg)`,
        }}
      >
        <div style={styles.meterCenter}>{safeValue}%</div>
      </div>
      <span style={styles.meterLabel}>{label}</span>
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="40" height="40" rx="14" fill="url(#logo-bg)" />
      <path d="M10 28L18.4 12H23.6L32 28H26.8L25.1 24.5H16.8L15.2 28H10Z" fill="#F6FAFF" />
      <path d="M19.1 21.4H22.9L21 17.4L19.1 21.4Z" fill="#1A1F31" />
      <defs>
        <linearGradient id="logo-bg" x1="5" x2="34" y1="6" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5DC6FF" />
          <stop offset="1" stopColor="#6A58EE" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function mapActivityIcon(icon: string) {
  switch (icon) {
    case "phone":
      return faPhone;
    case "message":
      return faMessage;
    case "campaign":
      return faRocket;
    case "chart":
    default:
      return faChartLine;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", padding: "12px 20px 20px", background: "radial-gradient(circle at top left, rgba(95,127,202,.18), transparent 24%), radial-gradient(circle at top right, rgba(15,107,255,.14), transparent 18%), linear-gradient(180deg, #18223a 0%, #11192b 100%)" },
  shell: { minHeight: "calc(100vh - 48px)", display: "flex", flexWrap: "wrap", borderRadius: "28px", overflow: "hidden", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 30px 60px rgba(6,10,20,.45)" },
  sidebar: { flex: "0 0 280px", background: "linear-gradient(180deg, rgba(34,48,82,.97), rgba(18,28,46,.98))", padding: "22px 12px", borderRight: "1px solid rgba(255,255,255,.08)", display: "grid", alignContent: "start", gap: "18px" },
  sidebarHeader: { display: "flex", alignItems: "center", gap: "12px", padding: "0 10px", color: "#ecf2ff" },
  logoStrong: { display: "block", fontSize: "15px", fontWeight: 800, letterSpacing: ".08em" },
  logoSoft: { fontSize: "11px", opacity: .7, letterSpacing: ".12em" },
  sidebarMeta: { margin: "4px 8px 0", padding: "14px", borderRadius: "16px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.08)", display: "grid", gap: "8px" },
  metaPill: { width: "fit-content", padding: "6px 10px", borderRadius: "999px", background: "rgba(100,116,230,.18)", color: "#dbe5ff", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" },
  metaText: { color: "#aebbd4", fontSize: "12px", lineHeight: 1.5 },
  menu: { display: "grid", gap: "6px" },
  menuItem: { minHeight: "48px", padding: "0 14px", borderRadius: "14px", border: "1px solid transparent", background: "transparent", color: "#d1daee", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", width: "100%", textAlign: "left" },
  menuItemActive: { background: "rgba(95,127,202,.18)", border: "1px solid rgba(107,167,255,.3)", color: "#fff", boxShadow: "inset 3px 0 0 #6ba7ff" },
  menuIcon: { width: "14px" },
  workspace: { flex: "1 1 780px", minWidth: 0, background: "linear-gradient(180deg, #f3f5fa 0%, #eef1f7 42%, #edf0f6 100%)", display: "grid", gridTemplateRows: "auto 1fr" },
  topbar: { minHeight: "78px", padding: "0 28px", background: "rgba(255,255,255,.96)", borderBottom: "1px solid #d9dfe8", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" },
  heading: { margin: 0, fontSize: "28px", color: "#1f2b43", lineHeight: 1.1 },
  subheading: { margin: "4px 0 0", fontSize: "13px", color: "#6f7d97" },
  topbarActions: { display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" },
  actionChip: { minHeight: "36px", padding: "0 14px", borderRadius: "999px", background: "#fff", border: "1px solid #dde4ee", color: "#34415d", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 700 },
  actionCircle: { width: "38px", height: "38px", borderRadius: "999px", background: "#f2f5fa", border: "1px solid #dce3ed", color: "#50607a", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  userSelectWrap: { display: "grid", gap: "4px", color: "#596a86", fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" },
  userSelectLabel: { lineHeight: 1 },
  userSelect: { minHeight: "38px", minWidth: "180px", padding: "0 12px", borderRadius: "12px", border: "1px solid #d5ddea", background: "#fff", color: "#24324a", fontWeight: 600 },
  avatar: { width: "40px", height: "40px", borderRadius: "999px", background: "linear-gradient(135deg, #d7def1, #f4f6fb)", border: "1px solid #cfd7e4", color: "#34415d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 800 },
  logoutButton: { minHeight: "38px", padding: "0 14px", borderRadius: "12px", border: "1px solid #d5ddea", background: "#fff", color: "#33415e", fontWeight: 700, cursor: "pointer" },
  inner: { padding: "22px", display: "grid", gap: "18px", alignContent: "start" },
  errorBanner: { minHeight: "48px", padding: "14px 16px", borderRadius: "14px", background: "#fff4f6", border: "1px solid #f1cfd6", color: "#9b3144", fontWeight: 600 },
  loadingGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" },
  loadingCard: { minHeight: "180px", borderRadius: "18px", background: "linear-gradient(90deg, #eef2f7, #f8fafc, #eef2f7)", border: "1px solid #e1e7ef" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "14px" },
  statCard: { minHeight: "142px", borderRadius: "18px", background: "linear-gradient(180deg, #fff 0%, #f7f9fc 100%)", border: "1px solid #dde3ec", boxShadow: "0 10px 24px rgba(33,49,77,.08)", padding: "18px 20px", display: "grid", gap: "10px" },
  statHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" },
  statLabel: { fontSize: "13px", color: "#33425f", fontWeight: 800 },
  statIcon: { width: "32px", height: "32px", borderRadius: "999px", background: "#f7f9fc", border: "1px solid #dbe2ed", display: "grid", placeItems: "center" },
  statValue: { fontSize: "34px", color: "#1f2b43", lineHeight: 1 },
  statHelper: { fontSize: "12px", color: "#65748e" },
  sectionWrap: { display: "grid", gap: "16px" },
  mainGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1.75fr) minmax(280px, .9fr)", gap: "16px" },
  primaryColumn: { display: "grid", gap: "16px" },
  secondaryColumn: { display: "grid", gap: "16px", alignContent: "start" },
  cardPanel: { borderRadius: "18px", background: "linear-gradient(180deg, #fff 0%, #f6f8fb 100%)", border: "1px solid #dbe2ec", boxShadow: "0 12px 24px rgba(33,49,77,.08)", padding: "16px" },
  panelHeader: { minHeight: "34px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", paddingBottom: "10px", borderBottom: "1px solid #e6ebf2", marginBottom: "14px" },
  panelTitle: { margin: 0, fontSize: "16px", color: "#24324a", lineHeight: 1.2 },
  panelHint: { color: "#6b7b96", fontSize: "12px", fontWeight: 700 },
  pipelineGrid: { display: "grid", gap: "12px" },
  pipelineColumn: { borderRadius: "14px", overflow: "hidden", background: "#eef2f8", border: "1px solid #dde4ee" },
  pipelineHeader: { minHeight: "50px", padding: "0 14px", color: "#fff", fontSize: "13px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" },
  pipelineCount: { minWidth: "26px", height: "26px", borderRadius: "999px", background: "rgba(255,255,255,.18)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800 },
  pipelineBody: { padding: "12px", display: "grid", gap: "10px", alignContent: "start" },
  pipelineTotal: { color: "#60728f", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" },
  pipelineCard: { borderRadius: "12px", background: "#fff", border: "1px solid #dbe2ec", padding: "12px", display: "grid", gap: "8px", boxShadow: "0 4px 10px rgba(34,51,80,.05)" },
  pipelineCardHeader: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start" },
  pipelineCardTitle: { fontSize: "13px", color: "#23334b", lineHeight: 1.35 },
  pipelineCardMeta: { fontSize: "12px", color: "#63738b" },
  pipelineCardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" },
  pipelinePrice: { fontSize: "12px", color: "#4474cf", fontWeight: 700 },
  pipelineChannel: { minHeight: "20px", padding: "0 8px", borderRadius: "999px", background: "#ecf1f8", color: "#687790", display: "inline-flex", alignItems: "center", fontSize: "10px", fontWeight: 800, letterSpacing: ".03em", textTransform: "uppercase" },
  dealActions: { display: "flex", gap: "6px" },
  dealActionButton: { width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #d8dfe9", background: "#f8fafc", color: "#556883", display: "grid", placeItems: "center" },
  emptyState: { minHeight: "44px", borderRadius: "10px", border: "1px dashed #d5ddea", color: "#7b8aa0", display: "grid", placeItems: "center", fontSize: "12px" },
  bottomGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" },
  chartWrap: { minHeight: "220px", borderRadius: "14px", background: "linear-gradient(180deg, rgba(240,244,250,.8), rgba(247,249,252,.95))", border: "1px solid #e4e9f1", padding: "12px" },
  performanceGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" },
  meterCard: { borderRadius: "12px", background: "#f7f9fc", border: "1px solid #e3e8f1", padding: "16px", display: "grid", gap: "12px", justifyItems: "center" },
  meterRing: { width: "108px", height: "108px", borderRadius: "999px", display: "grid", placeItems: "center" },
  meterCenter: { width: "74px", height: "74px", borderRadius: "999px", background: "#fff", display: "grid", placeItems: "center", color: "#23334b", fontSize: "26px", fontWeight: 800, boxShadow: "inset 0 0 0 1px #e3e8f1" },
  meterLabel: { fontSize: "13px", color: "#4b5d78", fontWeight: 700 },
  pieWrap: { marginTop: "14px" },
  campaignContent: { position: "relative", overflow: "hidden", minHeight: "220px", borderRadius: "16px", padding: "18px", background: "linear-gradient(135deg, #edf6ff 0%, #fff 52%, #f7fbff 100%)", border: "1px solid #dce7f4", display: "grid", gap: "12px" },
  campaignGlow: { position: "absolute", top: "-24px", right: "-10px", width: "140px", height: "140px", borderRadius: "999px", background: "radial-gradient(circle, rgba(88,183,255,.32), rgba(88,183,255,0))" },
  campaignBadge: { width: "fit-content", padding: "8px 12px", borderRadius: "999px", background: "#fff", border: "1px solid #dce7f4", color: "#2c6e59", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, position: "relative", zIndex: 1 },
  campaignTitle: { fontSize: "22px", color: "#24324a", maxWidth: "14ch", lineHeight: 1.1, position: "relative", zIndex: 1 },
  campaignText: { margin: 0, color: "#53647f", fontSize: "14px", lineHeight: 1.6, position: "relative", zIndex: 1 },
  campaignStats: { marginTop: "auto", display: "flex", gap: "10px", flexWrap: "wrap", color: "#465773", fontSize: "13px", fontWeight: 700, position: "relative", zIndex: 1 },
  activities: { display: "grid", gap: "10px" },
  activityCompact: { marginTop: "14px", padding: "0" },
  activityItem: { minHeight: "52px", borderBottom: "1px solid #e6ebf2", display: "grid", gridTemplateColumns: "40px 1fr auto", gap: "10px", alignItems: "center" },
  activityIconWrap: { width: "36px", height: "36px", borderRadius: "12px", background: "#eef4fb", color: "#5970c8", display: "grid", placeItems: "center" },
  activityTextWrap: { display: "grid", gap: "3px" },
  activityTitle: { fontSize: "13px", color: "#2b3950" },
  activityDetail: { fontSize: "12px", color: "#6f7d97" },
  activityAge: { fontSize: "12px", color: "#7b899e", whiteSpace: "nowrap" },
  sectionGridSingle: { display: "grid", gap: "16px" },
  twoColumnSplit: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" },
  tableWrap: { display: "grid" },
  inlineFormGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "12px" },
  inlineFormActions: { display: "flex", alignItems: "end", gap: "8px", flexWrap: "wrap" },
  tableHeader: { minHeight: "44px", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) 120px 160px", gap: "14px", alignItems: "center", color: "#66758d", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "1px solid #e6ebf2" },
  tableRow: { minHeight: "58px", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) 120px 160px", gap: "14px", alignItems: "center", borderBottom: "1px solid #eef2f6", color: "#41526c", fontSize: "14px" },
  tableHeaderContacts: { minHeight: "44px", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) 120px 160px 96px", gap: "14px", alignItems: "center", color: "#66758d", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em", borderBottom: "1px solid #e6ebf2" },
  tableRowContacts: { minHeight: "58px", display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) 120px 160px 96px", gap: "14px", alignItems: "center", borderBottom: "1px solid #eef2f6", color: "#41526c", fontSize: "14px" },
  tablePrimary: { display: "grid", gap: "3px" },
  statusBadge: { width: "fit-content", minHeight: "26px", padding: "0 10px", borderRadius: "999px", background: "#eef4fb", color: "#50648a", display: "inline-flex", alignItems: "center", fontSize: "12px", fontWeight: 700, textTransform: "capitalize" },
  statusBadgeSuccess: { background: "rgba(48,188,114,.12)", color: "#1f6a44", border: "1px solid rgba(48,188,114,.22)" },
  statusBadgeWarn: { background: "rgba(248,191,68,.16)", color: "#7c5a10", border: "1px solid rgba(248,191,68,.25)" },
  composerPanel: { marginBottom: "14px", borderRadius: "14px", border: "1px solid #dbe2ec", background: "linear-gradient(180deg, #f7fafe 0%, #ffffff 100%)", padding: "14px", display: "grid", gap: "12px" },
  composerGrid: { display: "grid", gap: "12px" },
  fieldStack: { display: "grid", gap: "6px" },
  fieldLabel: { fontSize: "12px", fontWeight: 800, color: "#51617b", textTransform: "uppercase", letterSpacing: ".06em" },
  textField: { minHeight: "42px", borderRadius: "12px", border: "1px solid #d8e1ed", background: "#fff", color: "#23334b", padding: "0 12px", fontSize: "14px", outline: "none" },
  textAreaField: { minHeight: "88px", borderRadius: "12px", border: "1px solid #d8e1ed", background: "#fff", color: "#23334b", padding: "12px", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit" },
  composerActions: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" },
  toggleWrap: { display: "inline-flex", alignItems: "center", gap: "8px", color: "#5b6c86", fontSize: "13px", fontWeight: 700 },
  primaryButton: { minHeight: "40px", padding: "0 14px", borderRadius: "12px", border: "1px solid #4e6ee7", background: "linear-gradient(135deg, #5f7fff, #4d67d8)", color: "#fff", display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: 800, boxShadow: "0 10px 18px rgba(79,106,221,.24)" },
  secondaryButton: { minHeight: "34px", padding: "0 12px", borderRadius: "10px", border: "1px solid #d8e1ed", background: "#fff", color: "#41526c", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700 },
  inlineNotice: { minHeight: "40px", borderRadius: "12px", background: "#eef4ff", border: "1px solid #dce6fb", color: "#4760a0", display: "flex", alignItems: "center", padding: "0 12px", fontSize: "13px", fontWeight: 700 },
  integrationStatusCard: { marginBottom: "14px", borderRadius: "14px", border: "1px solid #dbe2ec", background: "linear-gradient(180deg, #f7fafe 0%, #ffffff 100%)", padding: "14px", display: "grid", gap: "12px" },
  integrationStatusHeader: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" },
  pairingCodeBox: { minHeight: "48px", borderRadius: "12px", background: "#0f1730", color: "#dfe8ff", border: "1px solid #25345f", display: "flex", alignItems: "center", padding: "0 14px", fontSize: "20px", fontWeight: 800, letterSpacing: ".18em" },
  qrBox: { borderRadius: "12px", border: "1px solid #dce6fb", background: "#eef4ff", padding: "12px", display: "grid", gap: "10px" },
  qrBoxHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", color: "#4760a0", fontSize: "12px" },
  qrCodePre: { margin: 0, borderRadius: "10px", border: "1px solid rgba(0,0,0,.08)", background: "#0f1730", color: "#dfe8ff", padding: "10px", overflowX: "auto", fontSize: "12px", lineHeight: 1.4 },
  detailsGrid: { display: "grid", gap: "8px" },
  detailsRow: { minHeight: "40px", borderRadius: "12px", border: "1px solid #e3e8f1", background: "#f8fafc", padding: "0 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", color: "#475975", fontSize: "13px" },
  detailsValue: { maxWidth: "52%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  messageList: { display: "grid", gap: "12px" },
  messageCard: { borderRadius: "14px", border: "1px solid #dbe2ec", background: "#fff", padding: "14px", display: "grid", gap: "10px" },
  messageMeta: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center" },
  messageName: { color: "#27354c", fontWeight: 800 },
  messageTime: { color: "#7b899e", fontSize: "12px" },
  messagePreview: { margin: 0, color: "#5f708a", fontSize: "14px", lineHeight: 1.6 },
  messageFooter: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  directionChip: { minHeight: "28px", padding: "0 10px", borderRadius: "999px", background: "#f5f8fc", border: "1px solid #dde5ef", color: "#556883", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: 700, textTransform: "capitalize" },
  dlqSection: { marginTop: "14px", display: "grid", gap: "10px" },
  subPanelHeader: { minHeight: "30px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", color: "#5f708a", fontSize: "12px" },
  subPanelActions: { display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
  dlqList: { display: "grid", gap: "10px" },
  dlqItem: { borderRadius: "12px", border: "1px solid #dbe2ec", background: "#fff", padding: "12px", display: "grid", gap: "8px" },
  dlqMeta: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", color: "#24324a", fontSize: "12px" },
  dlqError: { color: "#7b5060", fontSize: "12px", lineHeight: 1.5 },
  threadList: { display: "grid", gap: "10px" },
  threadItem: { borderRadius: "12px", border: "1px solid #dbe2ec", background: "#fff", padding: "12px", display: "grid", gap: "10px" },
  threadTop: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "start", flexWrap: "wrap" },
  threadPreview: { color: "#5f708a", fontSize: "13px", lineHeight: 1.5 },
  threadBottom: { display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" },
  threadAssignee: { color: "#6f7d97", fontSize: "12px" },
  threadActions: { display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" },
  compactSelect: { minHeight: "34px", borderRadius: "10px", border: "1px solid #d8e1ed", background: "#fff", color: "#41526c", padding: "0 10px", fontWeight: 700 },
  failureList: { display: "grid", gap: "10px" },
  failureItem: { borderRadius: "12px", border: "1px solid #dbe2ec", background: "#fff", padding: "12px", display: "grid", gap: "8px" },
  failureReason: { color: "#7b5060", fontSize: "12px", lineHeight: 1.5 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(10,14,24,.55)", display: "grid", placeItems: "center", padding: "18px", zIndex: 60 },
  modalPanel: { width: "min(720px, 100%)", maxHeight: "min(78vh, 720px)", borderRadius: "18px", background: "linear-gradient(180deg, #fff 0%, #f6f8fb 100%)", border: "1px solid #dbe2ec", boxShadow: "0 20px 60px rgba(6,10,20,.35)", display: "grid", gridTemplateRows: "auto 1fr", overflow: "hidden" },
  modalHeader: { padding: "14px 16px", borderBottom: "1px solid #e6ebf2", display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", flexWrap: "wrap" },
  modalBody: { padding: "14px 16px", overflow: "auto", display: "grid", gap: "12px", alignContent: "start" },
  modalMessage: { borderRadius: "14px", border: "1px solid #dbe2ec", background: "#fff", padding: "12px", display: "grid", gap: "10px" },
  modalMessageTop: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  modalMessageBottom: { display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  automationGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" },
  automationCard: { borderRadius: "16px", border: "1px solid #dbe2ec", background: "linear-gradient(180deg, #fff 0%, #f8fbff 100%)", padding: "18px", display: "grid", gap: "10px" },
  automationIcon: { width: "40px", height: "40px", borderRadius: "14px", background: "#eef4ff", color: "#6178f3", display: "grid", placeItems: "center" },
  automationValue: { fontSize: "34px", color: "#23334b", lineHeight: 1 },
  automationTitle: { fontSize: "15px", fontWeight: 800, color: "#2b3950" },
  automationDetail: { fontSize: "13px", color: "#6f7d97", lineHeight: 1.5 },
  legendList: { display: "grid", gap: "10px" },
  legendItem: { minHeight: "34px", display: "grid", gridTemplateColumns: "12px 1fr auto", gap: "10px", alignItems: "center", color: "#51617b", fontSize: "13px" },
  legendDot: { width: "10px", height: "10px", borderRadius: "999px" },
  settingsStack: { display: "grid", gap: "12px" },
  settingsRow: { minHeight: "44px", borderRadius: "12px", border: "1px solid #e3e8f1", background: "#f8fafc", padding: "0 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", color: "#475975", fontSize: "14px" },
  userList: { display: "grid", gap: "12px" },
  userCard: { borderRadius: "14px", border: "1px solid #dbe2ec", background: "#fff", padding: "14px", display: "grid", gridTemplateColumns: "44px 1fr", gap: "12px", alignItems: "center" },
  userAvatar: { width: "42px", height: "42px", borderRadius: "14px", background: "linear-gradient(135deg, #dfe7ff, #f1f5ff)", color: "#4e63b8", display: "grid", placeItems: "center", fontWeight: 800 },
  userMeta: { display: "grid", gap: "3px", color: "#5f708a", fontSize: "13px" },
};
