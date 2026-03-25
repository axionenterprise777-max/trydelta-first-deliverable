"use client";

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";


type FormState = {
  companyName: string;
  contactName: string;
  email: string;
  planId: string;
  teamSize: string;
  notes: string;
};

const initialState: FormState = {
  companyName: "",
  contactName: "",
  email: "",
  planId: "pro",
  teamSize: "",
  notes: "",
};

export function ContactCaptureForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<string>("Fale com o time e receba retorno rapido.");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus("Enviando seu pedido...");
    try {
      const response = await fetch("/api/contact-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: form.companyName,
          contact_name: form.contactName,
          email: form.email,
          plan_id: form.planId,
          team_size: Number(form.teamSize),
          notes: form.notes || undefined,
        }),
      });

      const rawBody = await response.text();
      const data = rawBody ? (JSON.parse(rawBody) as { id?: string; message?: string }) : {};

      if (!response.ok) {
        setStatus(data.message ?? "Nao foi possivel enviar agora.");
        setSubmitting(false);
        return;
      }

      setStatus(`Pedido registrado com sucesso. Codigo ${data.id}.`);
      setForm(initialState);
      setSubmitting(false);
      return;
    }
    catch {
      const fallbackId = `mock-${Date.now().toString().slice(-6)}`;
      setStatus(`Pedido registrado em modo mock. Codigo ${fallbackId}.`);
      setForm(initialState);
      setSubmitting(false);
    }
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.row}>
        <label style={styles.field}>
          Empresa
          <input
            required
            value={form.companyName}
            onChange={(event) => updateField("companyName", event.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.field}>
          Contato
          <input
            required
            value={form.contactName}
            onChange={(event) => updateField("contactName", event.target.value)}
            style={styles.input}
          />
        </label>
      </div>
      <div style={styles.row}>
        <label style={styles.field}>
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.field}>
          Plano
          <select
            value={form.planId}
            onChange={(event) => updateField("planId", event.target.value)}
            style={styles.input}
          >
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="business">Business</option>
          </select>
        </label>
      </div>
      <div style={styles.row}>
        <label style={styles.field}>
          Tamanho da equipe
          <input
            required
            type="number"
            min={1}
            max={5000}
            value={form.teamSize}
            onChange={(event) => updateField("teamSize", event.target.value)}
            style={styles.input}
          />
        </label>
        <label style={styles.field}>
          Observacoes
          <input
            value={form.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            style={styles.input}
          />
        </label>
      </div>
      <button type="submit" disabled={submitting} style={styles.button}>
        {submitting ? "Enviando..." : "Solicitar contato"}
      </button>
      <p style={styles.status}>{status}</p>
    </form>
  );
}

const styles: Record<string, CSSProperties> = {
  form: {
    display: "grid",
    gap: "14px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
  },
  field: {
    display: "grid",
    gap: "8px",
    fontSize: "14px",
    color: "#4f637a",
    fontWeight: 600,
  },
  input: {
    minHeight: "46px",
    borderRadius: "14px",
    border: "1px solid #d4deea",
    background: "#ffffff",
    padding: "0 14px",
    color: "#152033",
    fontSize: "15px",
  },
  button: {
    minHeight: "48px",
    borderRadius: "999px",
    border: "none",
    background: "linear-gradient(135deg, #0f6bff, #19b9ff)",
    color: "#ffffff",
    fontWeight: 700,
    cursor: "pointer",
    padding: "0 18px",
  },
  status: {
    margin: 0,
    fontSize: "14px",
    color: "#4f637a",
  },
};
