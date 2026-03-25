import type { Metadata } from "next";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";


export const metadata: Metadata = {
  title: "TryDelta",
  description:
    "TryDelta: CRM SaaS multi-tenant com pipeline comercial, atendimento e WhatsApp.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
