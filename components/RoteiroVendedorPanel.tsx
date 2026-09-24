"use client";

export function RoteiroVendedorPanel() {
  return (
    <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
      <h2 style={{ marginBottom: 8 }}>Roteiro do Vendedor</h2>
      <p style={{ color: "var(--color-muted)", maxWidth: 480, margin: "0 auto" }}>
        Essa tela mostra os clientes programados para hoje, com status
        (Positivado / Visitado / Pendente), busca, filtro por cidade e rede,
        e ordenação pela próxima visita.
      </p>
      <p style={{ color: "var(--color-muted)", maxWidth: 480, margin: "12px auto 0" }}>
        Ela já está pronta no banco (tabela <code>roteiro_planejado</code>), só falta
        importar os dados de planejamento de visitas para ela aparecer aqui.
      </p>
    </div>
  );
}
