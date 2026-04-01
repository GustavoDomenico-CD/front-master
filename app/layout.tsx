import type { Metadata } from "next";
import "./globals.css";
import StyledComponentsRegistry from "./lib/styled-components-registry";

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
      <body className="antialiased">
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
