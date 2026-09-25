"use client";

import {
  BarChart,
  Bar,
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

export function RedesDashboard() {
  const {
    redes,
    totalRedes,
    totalLojas,
    loading,
    erro,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
  } = useRedes();

  const top15 = redes.slice(0, 15);

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
          <div className="kpi-label">Redes cadastradas</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{totalRedes}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Lojas cadastradas</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatNumero(totalLojas)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Lojas ativas no período</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">
              {formatNumero(redes.reduce((acc, r) => acc + r.lojas_ativas, 0))}
            </div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Year over Year</div>
          <div className="kpi-value" style={{ fontSize: 15, color: "var(--color-muted)" }}>
            Sem dados de 2025 ainda
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 className="panel-title">Ranking de redes (top 15 por faturamento)</h2>
        {loading ? (
          <Skeleton height={420} />
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top15} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted)" />
              <YAxis
                type="category"
                dataKey="Rede"
                stroke="var(--color-muted)"
                width={200}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(v: number) => formatMoeda(Number(v))}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar dataKey="total_vendas" fill="#8b5cf6" name="Total vendido" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Todas as redes ({redes.length})</h2>
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
                  <th>Total vendido</th>
                  <th>YoY</th>
                </tr>
              </thead>
              <tbody>
                {redes.map((r) => (
                  <tr key={r.Rede}>
                    <td>{r.Rede}</td>
                    <td>{r.qtd_lojas}</td>
                    <td>{r.lojas_ativas}</td>
                    <td>{r.total_pedidos}</td>
                    <td>{formatMoeda(r.total_vendas)}</td>
                    <td style={{ color: "var(--color-muted)" }}>
                      {r.yoy_pct == null ? "—" : `${r.yoy_pct}%`}
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
