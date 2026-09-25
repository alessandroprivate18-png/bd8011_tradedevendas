"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useCurvaABC } from "@/lib/hooks/useCurvaABC";
import type { FilterOptions } from "@/lib/types";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

const CORES_CLASSE: Record<string, string> = { A: "#34d399", B: "#eda100", C: "#ff9aa6" };

function TagClasse({ classe }: { classe: string }) {
  return (
    <span
      style={{
        background: CORES_CLASSE[classe] + "22",
        color: CORES_CLASSE[classe],
        border: `1px solid ${CORES_CLASSE[classe]}55`,
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      {classe}
    </span>
  );
}

interface ProdutosCurvaABCProps {
  filterOptions: FilterOptions;
}

export function ProdutosCurvaABC({ filterOptions }: ProdutosCurvaABCProps) {
  const {
    produtos,
    resumo,
    loading,
    erro,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    codFabricante,
    setCodFabricante,
  } = useCurvaABC();

  const top30 = produtos.slice(0, 30);

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
          <div className="filter-field">
            <label className="filter-label">Cód. Fabricante</label>
            <select
              className="filter-control"
              value={codFabricante}
              onChange={(e) => setCodFabricante(e.target.value)}
            >
              <option value="">Todos</option>
              {filterOptions.fabricantes_codigo.map((f) => (
                <option key={f.codigo} value={f.codigo}>
                  {f.codigo} - {f.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {erro && (
        <div className="panel" style={{ borderColor: "#7a2f38", color: "#ff9aa6", marginBottom: 20 }}>
          {erro}
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {resumo.map((r) => (
          <div className="kpi-card" key={r.classe}>
            <div className="kpi-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TagClasse classe={r.classe} /> Classe {r.classe}
            </div>
            {loading ? (
              <Skeleton height={36} />
            ) : (
              <>
                <div className="kpi-value">{formatMoeda(r.total_vendas)}</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
                  {formatNumero(r.qtde_produtos)} produtos · {r.pct_faturamento}% do faturamento
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 className="panel-title">Curva ABC (top 30 produtos)</h2>
        {loading ? (
          <Skeleton height={320} />
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart
              key={`${dataInicio}-${dataFim}-${codFabricante}`}
              data={top30}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="Produto" hide />
              <YAxis yAxisId="left" stroke="var(--color-muted)" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="var(--color-muted)" />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === "pct_acumulado" ? `${v}%` : formatMoeda(Number(v))
                }
                labelFormatter={(label: string) => label}
                contentStyle={TOOLTIP_STYLE}
              />
              <Bar
                yAxisId="left"
                dataKey="total_vendas"
                fill="#2a78d6"
                name="Faturamento"
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="pct_acumulado"
                stroke="#eb6834"
                strokeWidth={2}
                dot={false}
                name="% acumulado"
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Todos os produtos ({formatNumero(produtos.length)})</h2>
        {loading ? (
          <Skeleton height={300} />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Produto</th>
                  <th>Qtd. vendida</th>
                  <th>Faturamento</th>
                  <th>% do total</th>
                  <th>% acumulado</th>
                </tr>
              </thead>
              <tbody>
                {produtos.slice(0, 100).map((p) => (
                  <tr key={p.Produto}>
                    <td>
                      <TagClasse classe={p.classe} />
                    </td>
                    <td>{p.Produto}</td>
                    <td>{formatNumero(p.qtd_total)}</td>
                    <td>{formatMoeda(p.total_vendas)}</td>
                    <td>{p.pct}%</td>
                    <td>{p.pct_acumulado}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {produtos.length > 100 && (
              <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 8 }}>
                Mostrando os 100 primeiros de {formatNumero(produtos.length)} produtos.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
