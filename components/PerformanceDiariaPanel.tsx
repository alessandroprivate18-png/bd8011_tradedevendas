"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { usePerformanceDiaria } from "@/lib/hooks/usePerformanceDiaria";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

export function PerformanceDiariaPanel() {
  const { dados, loading, erro, dataSelecionada, setDataSelecionada } =
    usePerformanceDiaria();

  const pctAtingimento =
    dados?.meta_diaria && dados.meta_diaria > 0
      ? Math.round((dados.valor_vendido_dia / dados.meta_diaria) * 1000) / 10
      : null;

  const coberturaDia =
    dados && dados.clientes_cadastrados > 0
      ? Math.round((dados.clientes_positivados_dia / dados.clientes_cadastrados) * 1000) / 10
      : 0;

  const ticketMedioDia =
    dados && dados.pedidos_dia > 0 ? dados.valor_vendido_dia / dados.pedidos_dia : 0;

  const variacaoSemana =
    dados && dados.mesmo_dia_semana_anterior > 0
      ? Math.round(
          ((dados.valor_vendido_dia - dados.mesmo_dia_semana_anterior) /
            dados.mesmo_dia_semana_anterior) *
            1000
        ) / 10
      : null;

  return (
    <>
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="filter-row">
          <div className="filter-field">
            <label className="filter-label">Dia</label>
            <input
              type="date"
              className="filter-control"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
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
          <div className="kpi-label">Vendido no dia</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatMoeda(dados?.valor_vendido_dia ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Meta do dia</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">
              {dados?.meta_diaria == null ? "—" : formatMoeda(dados.meta_diaria)}
            </div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">% da meta</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{pctAtingimento == null ? "—" : `${pctAtingimento}%`}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Clientes positivados</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatNumero(dados?.clientes_positivados_dia ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cobertura do dia</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{coberturaDia}%</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Ticket médio</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatMoeda(ticketMedioDia)}</div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">
          Evolução das vendas (últimos 14 dias)
          {variacaoSemana != null && (
            <span
              style={{
                marginLeft: 12,
                fontSize: 13,
                fontWeight: 500,
                color: variacaoSemana >= 0 ? "#34d399" : "#ff9aa6",
              }}
            >
              {variacaoSemana > 0 ? "+" : ""}
              {variacaoSemana}% vs. mesmo dia da semana passada
            </span>
          )}
        </h2>
        {loading ? (
          <Skeleton height={260} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dados?.tendencia_14_dias ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="dia" stroke="var(--color-muted)" />
              <YAxis stroke="var(--color-muted)" />
              <Tooltip
                formatter={(v: number) => formatMoeda(Number(v))}
                contentStyle={TOOLTIP_STYLE}
              />
              {dados?.meta_diaria != null && (
                <ReferenceLine
                  y={dados.meta_diaria}
                  stroke="#eb6834"
                  strokeDasharray="4 4"
                  label={{ value: "Meta", fill: "#eb6834", fontSize: 11 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="total_vendas"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Total vendido"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </>
  );
}
