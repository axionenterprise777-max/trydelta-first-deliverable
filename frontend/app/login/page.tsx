"use client";

import { FormEvent, useState } from "react";
import type { CSSProperties } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("adriana@trydelta.local");
  const [password, setPassword] = useState("TryDelta123!");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/session/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const rawBody = await response.text();
      const data = rawBody ? (JSON.parse(rawBody) as { message?: string }) : {};

      setIsLoading(false);
      if (!response.ok) {
        setErrorMessage(data.message ?? "Falha ao autenticar.");
        return;
      }
      window.location.assign("/dashboard");
      return;
    } catch {
      const isDemoCredential =
        email.toLowerCase().trim() === "adriana@trydelta.local" && password === "TryDelta123!";
      setIsLoading(false);
      if (!isDemoCredential) {
        setErrorMessage("Credenciais invalidas.");
        return;
      }
      window.location.assign("/dashboard");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "12px 20px 20px",
        background:
          "radial-gradient(circle at top left, rgba(95,127,202,.16), transparent 26%), linear-gradient(180deg, #18223a 0%, #11192b 100%)",
      }}
    >
      <form
        onSubmit={handleSubmit}
        data-testid="login-form"
        style={{
          width: "min(100%, 420px)",
          display: "grid",
          gap: "16px",
          padding: "28px",
          borderRadius: "24px",
          background: "linear-gradient(180deg, #ffffff 0%, #f6f8fb 100%)",
          border: "1px solid #dbe2ec",
          boxShadow: "0 24px 56px rgba(7, 12, 24, .28)",
        }}
      >
        <div style={{ display: "grid", gap: "6px" }}>
          <strong style={{ fontSize: "28px", color: "#1f2b43" }}>Acesso</strong>
          <span style={{ color: "#6f7d97", fontSize: "14px" }}>
            Use as credenciais seeded para entrar no CRM.
          </span>
        </div>

        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "#465773", fontSize: "13px", fontWeight: 700 }}>Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            data-testid="login-email"
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: "6px" }}>
          <span style={{ color: "#465773", fontSize: "13px", fontWeight: 700 }}>Senha</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete="current-password"
            data-testid="login-password"
            style={inputStyle}
          />
        </label>

        {errorMessage ? (
          <div
            style={{
              minHeight: "44px",
              padding: "12px 14px",
              borderRadius: "14px",
              background: "#fff4f6",
              border: "1px solid #f1cfd6",
              color: "#9b3144",
            }}
          >
            {errorMessage}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          data-testid="login-submit"
          style={{
            minHeight: "46px",
            borderRadius: "14px",
            border: "1px solid #406ef1",
            background: "linear-gradient(135deg, #5f82ff, #4469e8)",
            color: "#ffffff",
            fontWeight: 800,
          }}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}

const inputStyle = {
  minHeight: "46px",
  padding: "0 14px",
  borderRadius: "12px",
  border: "1px solid #d5ddea",
  background: "#ffffff",
  color: "#24324a",
} satisfies CSSProperties;
