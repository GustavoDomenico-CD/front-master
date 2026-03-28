import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Painel de Gestao",
  description: "Sistema de gestao integrado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
