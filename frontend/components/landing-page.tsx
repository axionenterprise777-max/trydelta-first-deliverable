import type { CSSProperties } from "react";

import { ContactCaptureForm } from "./contact-capture-form";


const plans = [
  {
    name: "Starter",
    price: "R$69",
    cadence: "/mes",
    subtitle: "Base enxuta para pequenas operacoes.",
    limit: "ate 3 usuarios",
    cta: "Comecar no Starter",
    featured: false,
    points: [
      "Pipeline comercial visual",
      "Timeline de clientes",
      "Fila de mensagens monitorada",
    ],
  },
  {
    name: "Pro",
    price: "R$129",
    cadence: "/mes",
    subtitle: "Equipe comercial com mais cadencia e visibilidade.",
    limit: "ate 10 usuarios",
    cta: "Escolher Pro",
    featured: true,
    points: [
      "Filtros operacionais e prioridades",
      "Campanhas e acompanhamento",
      "Indicadores de conversao",
    ],
  },
  {
    name: "Business",
    price: "R$249",
    cadence: "/mes",
    subtitle: "Escala, governanca e atendimento integrado.",
    limit: "operacao expandida",
    cta: "Falar com vendas",
    featured: false,
    points: [
      "Fluxos multi-equipe",
      "Base para auditoria",
      "Mais volume com controle",
    ],
  },
];

const metrics = [
  { label: "Leads tratados", value: "+38%" },
  { label: "Tempo de resposta", value: "-52%" },
  { label: "Visao do pipeline", value: "100%" },
];

const structuredData = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TryDelta",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: plans.map((plan) => ({
    "@type": "Offer",
    name: plan.name,
    price: plan.price.replace("R$", ""),
    priceCurrency: "BRL",
    description: plan.subtitle,
  })),
}).replace(/</g, "\\u003c");

export function LandingPage() {
  return (
    <main style={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <section style={styles.hero}>
        <header style={styles.topbar}>
          <div style={styles.brandWrap}>
            <span style={styles.brandMark}>TD</span>
            <span style={styles.brand}>TryDelta</span>
            <span style={styles.betaBadge}>BETA PREVIEW</span>
          </div>
          <nav style={styles.nav}>
            <a href="#beneficios">Beneficios</a>
            <a href="#planos">Planos</a>
            <a href="#contato">Contato</a>
            <a href="/login">Entrar</a>
          </nav>
        </header>

        <div style={styles.heroGrid}>
          <div style={styles.heroCopy}>
            <p style={styles.kicker}>Modo demonstracao com dados mock</p>
            <h1 style={styles.heroTitle}>
              Sua equipe comercial em um fluxo unico e direto.
            </h1>
            <p style={styles.heroText}>
              Organize oportunidades, acompanhe conversas e avance etapas com
              uma visualizacao simples para demo e validacao.
            </p>
            <p style={styles.previewNote}>
              Preview com dados simulados e sem integracoes externas.
            </p>
            <div style={styles.heroActions}>
              <a href="#planos" style={styles.primaryButton}>
                Ver planos
              </a>
              <a href="#contato" style={styles.secondaryButton}>
                Solicitar contato
              </a>
            </div>
            <div style={styles.metricRow}>
              {metrics.map((metric) => (
                <div key={metric.label} style={styles.metricCard}>
                  <strong style={styles.metricValue}>{metric.value}</strong>
                  <span style={styles.metricLabel}>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.previewPanel}>
            <div style={styles.previewHeader}>
              <span style={styles.previewPill}>Fluxo vital</span>
              <span style={styles.previewMuted}>Capta, organiza e converte</span>
            </div>
            <div style={styles.previewStack}>
              <div style={styles.previewCard}>
                <strong style={styles.previewTitle}>Captura comercial</strong>
                <span style={styles.previewMuted}>
                  Novos contatos entram em fila com prioridade.
                </span>
              </div>
              <div style={styles.previewCard}>
                <strong style={styles.previewTitle}>Resumo operacional</strong>
                <span style={styles.previewMuted}>
                  Indicadores de leads, pipeline e mensagens.
                </span>
              </div>
              <div style={styles.previewCard}>
                <strong style={styles.previewTitle}>Fluxo de equipe</strong>
                <span style={styles.previewMuted}>
                  Troca de contexto sem perder o historico do dia.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" style={styles.section}>
        <div style={styles.sectionHeading}>
          <p style={styles.kicker}>Rotina comercial</p>
          <h2 style={styles.sectionTitle}>Funcionalidades vitais no MVP.</h2>
          <p style={styles.sectionText}>
            Recursos essenciais para validar rotina comercial sem friccao: captar interesse, acompanhar andamento e visualizar resultados.
          </p>
        </div>
        <div style={styles.benefitGrid}>
          <article style={styles.benefitCard}>
            <strong style={styles.benefitTitle}>Captura de interesse</strong>
            <p style={styles.benefitText}>
              A landing registra pedidos comerciais com empresa, contato, plano
              e tamanho da equipe.
            </p>
          </article>
          <article style={styles.benefitCard}>
            <strong style={styles.benefitTitle}>Resumo do dashboard</strong>
            <p style={styles.benefitText}>
              Painel com leads ativos, valor de pipeline e fila de mensagens.
            </p>
          </article>
          <article style={styles.benefitCard}>
            <strong style={styles.benefitTitle}>Pipeline inicial</strong>
            <p style={styles.benefitText}>
              O quadro atual organiza entradas, acompanhamentos e fechamentos.
            </p>
          </article>
        </div>
      </section>

      <section id="planos" style={styles.section}>
        <div style={styles.sectionHeading}>
          <p style={styles.kicker}>Planos</p>
          <h2 style={styles.sectionTitle}>Escolha o nivel certo da sua equipe.</h2>
          <p style={styles.sectionText}>
            Contratacao mensal simples, com onboarding rapido e caminho claro
            para crescer dentro da mesma base.
          </p>
        </div>
        <div style={styles.planGrid}>
          {plans.map((plan) => (
            <article
              key={plan.name}
              style={{
                ...styles.planCard,
                ...(plan.featured ? styles.planCardFeatured : {}),
              }}
            >
              <div style={styles.planHeader}>
                <div>
                  <p style={styles.planName}>{plan.name}</p>
                  <p style={styles.planSubtitle}>{plan.subtitle}</p>
                </div>
                {plan.featured ? (
                  <span style={styles.planBadge}>Mais escolhido</span>
                ) : null}
              </div>
              <div style={styles.priceRow}>
                <span style={styles.price}>{plan.price}</span>
                <span style={styles.priceCadence}>{plan.cadence}</span>
              </div>
              <p style={styles.planLimit}>{plan.limit}</p>
              <ul style={styles.planList}>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <a href="#contato" style={plan.featured ? styles.primaryButton : styles.secondaryButton}>
                {plan.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="contato" style={styles.contactSection}>
        <div style={styles.sectionHeading}>
          <p style={styles.kicker}>Contratacao</p>
          <h2 style={styles.sectionTitle}>Solicite contato comercial.</h2>
          <p style={styles.sectionText}>
            Envie os dados da empresa e o plano desejado para avancar com a avaliacao da conta.
          </p>
        </div>
        <ContactCaptureForm />
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    gap: "28px",
    padding: "12px 20px 20px",
    color: "#152033",
  },
  hero: {
    display: "grid",
    gap: "28px",
    padding: "28px",
    borderRadius: "32px",
    border: "1px solid #d9e2ec",
    background:
      "radial-gradient(circle at top right, rgba(25, 185, 255, 0.12), transparent 30%), #ffffff",
    boxShadow: "0 28px 70px rgba(18, 42, 66, 0.08)",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandMark: {
    width: "38px",
    height: "38px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f6bff, #19b9ff)",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: "13px",
  },
  brand: {
    fontSize: "18px",
    fontWeight: 700,
  },
  betaBadge: {
    minHeight: "24px",
    padding: "0 10px",
    borderRadius: "999px",
    border: "1px solid #9fc5ff",
    background: "#ecf4ff",
    color: "#0f5bd4",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    display: "inline-flex",
    alignItems: "center",
  },
  nav: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    color: "#4f637a",
    fontSize: "14px",
  },
  heroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "24px",
  },
  heroCopy: {
    display: "grid",
    gap: "18px",
    alignContent: "start",
  },
  kicker: {
    margin: 0,
    color: "#0f6bff",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: 0,
    fontSize: "clamp(36px, 7vw, 62px)",
    lineHeight: 1.02,
    maxWidth: "11ch",
  },
  heroText: {
    margin: 0,
    maxWidth: "60ch",
    color: "#4f637a",
    lineHeight: 1.7,
    fontSize: "16px",
  },
  previewNote: {
    margin: 0,
    color: "#2a3f5d",
    fontSize: "14px",
    lineHeight: 1.5,
    background: "#f3f7fd",
    border: "1px solid #d7e3f3",
    borderRadius: "12px",
    padding: "10px 12px",
    width: "fit-content",
    maxWidth: "100%",
  },
  heroActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "46px",
    padding: "0 18px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #0f6bff, #19b9ff)",
    color: "#ffffff",
    fontWeight: 700,
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "46px",
    padding: "0 18px",
    borderRadius: "999px",
    border: "1px solid #d4deea",
    background: "#ffffff",
    color: "#152033",
    fontWeight: 700,
  },
  metricRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px",
  },
  metricCard: {
    display: "grid",
    gap: "6px",
    padding: "16px",
    borderRadius: "20px",
    background: "#f8fbff",
    border: "1px solid #e3ebf5",
  },
  metricValue: {
    fontSize: "20px",
  },
  metricLabel: {
    color: "#688099",
    fontSize: "13px",
  },
  previewPanel: {
    display: "grid",
    gap: "16px",
    padding: "22px",
    borderRadius: "26px",
    background: "linear-gradient(180deg, #eef8ff, #ffffff)",
    border: "1px solid #d8e8f5",
  },
  previewHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  previewPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#dff4ff",
    color: "#0f6bff",
    fontSize: "12px",
    fontWeight: 700,
  },
  previewMuted: {
    color: "#688099",
    fontSize: "13px",
  },
  previewStack: {
    display: "grid",
    gap: "12px",
  },
  previewCard: {
    display: "grid",
    gap: "6px",
    padding: "16px",
    borderRadius: "18px",
    background: "#ffffff",
    border: "1px solid #deebf5",
  },
  previewTitle: {
    fontSize: "16px",
  },
  section: {
    display: "grid",
    gap: "20px",
    padding: "28px",
    borderRadius: "28px",
    border: "1px solid #dde6ef",
    background: "#ffffff",
    boxShadow: "0 22px 60px rgba(20, 45, 80, 0.05)",
  },
  contactSection: {
    display: "grid",
    gap: "20px",
    padding: "28px",
    borderRadius: "28px",
    border: "1px solid #d8e2ed",
    background:
      "linear-gradient(180deg, rgba(244, 249, 255, 0.9), rgba(255, 255, 255, 1))",
    boxShadow: "0 22px 60px rgba(20, 45, 80, 0.05)",
  },
  sectionHeading: {
    display: "grid",
    gap: "10px",
    maxWidth: "68ch",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "clamp(28px, 5vw, 42px)",
    lineHeight: 1.08,
  },
  sectionText: {
    margin: 0,
    color: "#4f637a",
    lineHeight: 1.7,
  },
  benefitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  benefitCard: {
    display: "grid",
    gap: "10px",
    padding: "20px",
    borderRadius: "22px",
    background: "#f9fbfd",
    border: "1px solid #e2ebf3",
  },
  benefitTitle: {
    fontSize: "18px",
  },
  benefitText: {
    margin: 0,
    color: "#4f637a",
    lineHeight: 1.7,
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  planCard: {
    display: "grid",
    gap: "18px",
    padding: "22px",
    borderRadius: "24px",
    background: "#ffffff",
    border: "1px solid #dfe7ef",
  },
  planCardFeatured: {
    background:
      "linear-gradient(180deg, rgba(15, 107, 255, 0.06), rgba(25, 185, 255, 0.04))",
    border: "1px solid #bedcff",
    boxShadow: "0 18px 50px rgba(15, 107, 255, 0.08)",
  },
  planHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
  },
  planName: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 700,
  },
  planSubtitle: {
    margin: "6px 0 0",
    color: "#4f637a",
    lineHeight: 1.5,
  },
  planBadge: {
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#e3f2ff",
    color: "#0f6bff",
    fontSize: "12px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },
  price: {
    fontSize: "44px",
    lineHeight: 1,
    fontWeight: 700,
  },
  priceCadence: {
    color: "#688099",
    fontSize: "16px",
  },
  planLimit: {
    margin: 0,
    color: "#152033",
    fontWeight: 600,
  },
  planList: {
    margin: 0,
    paddingLeft: "18px",
    display: "grid",
    gap: "10px",
    color: "#4f637a",
    lineHeight: 1.6,
  },
};



