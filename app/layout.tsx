import "./globals.css";

export const metadata = {
  title: "Dashboard de Vendas",
  description: "Painel de vendas conectado ao Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
