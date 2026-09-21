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
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          background: "#0f1117",
          color: "#e6e6e6",
        }}
      >
        {children}
      </body>
    </html>
  );
}
