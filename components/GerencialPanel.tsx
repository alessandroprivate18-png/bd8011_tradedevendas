"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useGerencial } from "@/lib/hooks/useGerencial";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

const CORES_PIZZA = ["#4f8cff", "#34d399", "#eb6834", "#a78bfa", "#f472b6", "#facc15", "#64748b"];

export function GerencialPanel() {
  const { ranking, fabricantes, loading, erro, dataInicio, setDataInicio, dataFim, setDataFim } =
    useGerencial();

  const top15 = ranking.slice(0, 15);

  return (
    <>
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="filter-row">
          <div className="filter-field">
            <label className="filter-label">Data inicial</label>
            <input
              type="date"
              className="filter-control"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Data final</label>
            <input
              type="date"
              className="filter-control"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>
        </div>
      </div>

      {erro && (
        <div className="panel" style={{ borderColor: "#7a2f38", color: "#ff9aa6", marginBottom: 20 }}>
          {erro}
        </div>
      )}

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 className="panel-title">Ranking de vendedores (top 15)</h2>
        {loading ? (
          <Skeleton height={420} />
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top15} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted)" />
              <YAxis
                type="category"
                dataKey="Vendedor"
                stroke="var(--color-muted)"
                width={180}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === "total_vendas" ? formatMoeda(Number(v)) : v
                }
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="total_vendas" fill="#4f8cff" name="Total vendido" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {!loading && (
          <div className="table-wrapper" style={{ marginTop: 16 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th>Total vendido</th>
                  <th>Clientes ativos</th>
                  <th>Carteira</th>
                  <th>Cobertura</th>
                </tr>
              </thead>
              <tbody>
                {top15.map((v) => (
                  <tr key={v.Cod_Vendedor}>
                    <td>{v.Vendedor}</td>
                    <td>{formatMoeda(v.total_vendas)}</td>
                    <td>{formatNumero(v.clientes_ativos)}</td>
                    <td>{v.carteira_total > 0 ? formatNumero(v.carteira_total) : "—"}</td>
                    <td>{v.cobertura_pct == null ? "—" : `${v.cobertura_pct}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Participação por fornecedor</h2>
        {loading ? (
          <Skeleton height={280} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={fabricantes}
                dataKey="total_vendas"
                nameKey="Fabricante"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
              >
                {fabricantes.map((_, i) => (
                  <Cell key={i} fill={CORES_PIZZA[i % CORES_PIZZA.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, name: string, props: any) =>
                  `${formatMoeda(Number(v))} (${props.payload.pct}%)`
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
