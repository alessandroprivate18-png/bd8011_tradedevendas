"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useRedes } from "@/lib/hooks/useRedes";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

function Variacao({ pct }: { pct: number | null }) {
  if (pct == null) return <span style={{ color: "var(--color-muted)" }}>—</span>;
  return (
    <span style={{ color: pct >= 0 ? "#34d399" : "#ff9aa6" }}>
      {pct > 0 ? "+" : ""}
      {pct}%
    </span>
  );
}

export function RedesDashboard() {
  const { kpis, ranking, mensal, yoyDisponivel, loading, erro, dataInicio, setDataInicio, dataFim, setDataFim } =
    useRedes();

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

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total vendido</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatMoeda(kpis?.total_vendas ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Redes ativas</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatNumero(kpis?.redes_ativas ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Year over Year</div>
          {loading ? (
            <Skeleton height={36} />
          ) : yoyDisponivel ? (
            <div className="kpi-value">
              <Variacao pct={kpis?.variacao_yoy_pct ?? null} />
            </div>
          ) : (
            <div className="kpi-value" style={{ fontSize: 15, color: "var(--color-muted)" }}>
              Sem dados de 2025 ainda
            </div>
          )}
        </div>
      </div>

      {yoyDisponivel && mensal.length > 0 && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <h2 className="panel-title">Vendas por mês — este ano vs. ano anterior</h2>
          {loading ? (
            <Skeleton height={260} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip formatter={(v: number) => formatMoeda(Number(v))} contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="total_vendas" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Este ano" />
                <Line type="monotone" dataKey="total_ano_anterior" stroke="#5c6370" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Ano anterior" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 className="panel-title">Ranking de redes (top 15 por faturamento)</h2>
        {loading ? (
          <Skeleton height={420} />
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top15} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted)" />
              <YAxis type="category" dataKey="rede" stroke="var(--color-muted)" width={200} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatMoeda(Number(v))} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="total_vendas" fill="#8b5cf6" name="Total vendido" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Todas as redes ({ranking.length})</h2>
        {loading ? (
          <Skeleton height={300} />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rede</th>
                  <th>Lojas cadastradas</th>
                  <th>Lojas ativas</th>
                  <th>Pedidos</th>
                  <th>Ticket médio</th>
                  <th>Total vendido</th>
                  <th>YoY</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.rede}>
                    <td>{r.rede}</td>
                    <td>{r.lojas_cadastradas}</td>
                    <td>{r.lojas_ativas}</td>
                    <td>{r.pedidos}</td>
                    <td>{r.ticket_medio ? formatMoeda(r.ticket_medio) : "—"}</td>
                    <td>{formatMoeda(r.total_vendas)}</td>
                    <td>
                      <Variacao pct={r.variacao_yoy_pct} />
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
