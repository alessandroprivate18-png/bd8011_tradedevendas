"use client";

import { useMemo, useState } from "react";
import { formatMoeda } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useRoteiro } from "@/lib/hooks/useRoteiro";
import type { ClienteRoteiro } from "@/lib/hooks/useRoteiro";

function TagStatus({ status }: { status: ClienteRoteiro["status"] }) {
  const estilos: Record<string, React.CSSProperties> = {
    Positivado: { background: "#0f2e22", color: "#34d399", border: "1px solid #1d4d3a" },
    Pendente: { background: "#3a1d22", color: "#ff9aa6", border: "1px solid #7a2f38" },
  };
  return (
    <span
      style={{
        ...estilos[status],
        padding: "3px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
}

type Ordenacao = "proxima_visita" | "cliente";

export function RoteiroVendedorPanel() {
  const { dia, setDia, busca, setBusca, cidade, setCidade, cidades, clientes, loading, erro } =
    useRoteiro();
  const [ordenar, setOrdenar] = useState<Ordenacao>("proxima_visita");

  const clientesOrdenados = useMemo(() => {
    const copia = [...clientes];
    if (ordenar === "proxima_visita") {
      copia.sort((a, b) => a.proxima_visita.localeCompare(b.proxima_visita));
    } else {
      copia.sort((a, b) => a.cliente.localeCompare(b.cliente));
    }
    return copia;
  }, [clientes, ordenar]);

  const positivados = clientes.filter((c) => c.status === "Positivado").length;

  return (
    <>
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="filter-row">
          <div className="filter-field">
            <label className="filter-label">Dia</label>
            <input
              type="date"
              className="filter-control"
              value={dia}
              onChange={(e) => setDia(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Cidade</label>
            <select
              className="filter-control"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            >
              <option value="">Todas</option>
              {cidades.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">Buscar cliente</label>
            <input
              type="text"
              className="filter-control"
              placeholder="Nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ minWidth: 200 }}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Ordenar por</label>
            <select
              className="filter-control"
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value as Ordenacao)}
            >
              <option value="proxima_visita">Próxima visita</option>
              <option value="cliente">Nome do cliente</option>
            </select>
          </div>
        </div>
      </div>

      {erro && (
        <div className="panel" style={{ borderColor: "#7a2f38", color: "#ff9aa6", marginBottom: 20 }}>
          {erro}
        </div>
      )}

      <div className="panel">
        <h2 className="panel-title">
          Clientes programados ({clientes.length})
          {clientes.length > 0 && (
            <span style={{ marginLeft: 12, fontSize: 13, fontWeight: 500, color: "var(--color-muted)" }}>
              {positivados} positivados · {clientes.length - positivados} pendentes
            </span>
          )}
        </h2>
        {loading ? (
          <Skeleton height={300} />
        ) : clientesOrdenados.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>Nenhum cliente programado para esse dia.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Cidade</th>
                  <th>Rede</th>
                  <th>Última compra</th>
                  <th>Próxima visita</th>
                  <th>Valor médio</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clientesOrdenados.map((c) => (
                  <tr key={c.Cod_Cliente}>
                    <td>{c.cliente}</td>
                    <td>{c.cidade ?? "—"}</td>
                    <td>{c.rede ?? "—"}</td>
                    <td>{c.ultima_compra ?? "—"}</td>
                    <td>{c.proxima_visita}</td>
                    <td>{c.valor_medio ? formatMoeda(c.valor_medio) : "—"}</td>
                    <td>
                      <TagStatus status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
