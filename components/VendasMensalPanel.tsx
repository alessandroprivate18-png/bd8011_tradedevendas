"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoeda } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { VendaMensal } from "@/lib/types";

interface VendasMensalPanelProps {
  dados: VendaMensal[] | undefined;
  loading: boolean;
}

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

export function VendasMensalPanel({ dados, loading }: VendasMensalPanelProps) {
  const rows = dados ?? [];

  return (
    <div className="panel">
      <h2 className="panel-title">Vendas por mês</h2>

      {loading ? (
        <>
          <Skeleton height={260} />
          <div style={{ marginTop: 16 }}>
            <Skeleton height={140} />
          </div>
        </>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-muted)" />
              <YAxis stroke="var(--color-muted)" />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === "total_vendas" ? formatMoeda(Number(v)) : v
                }
                contentStyle={TOOLTIP_STYLE}
              />
              <Line
                type="monotone"
                dataKey="total_vendas"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={false}
                name="Total vendido"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Tabela de crescimento mês a mês com Cobertura de Clientes */}
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Total vendido</th>
                  <th>Pedidos</th>
                  <th>Crescimento vendas</th>
                  <th>Cobertura de clientes</th>
                  <th>Crescimento cobertura</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v) => {
                  const growthClass =
                    v.crescimento_pct == null
                      ? "growth-neutral"
                      : v.crescimento_pct >= 0
                      ? "growth-positive"
                      : "growth-negative";

                  const growthLabel =
                    v.crescimento_pct == null
                      ? "—"
                      : `${v.crescimento_pct > 0 ? "+" : ""}${v.crescimento_pct}%`;

                  const cobLabel =
                    v.cobertura_pct == null ? "—" : `${v.cobertura_pct}%`;

                  const cobCrescClass =
                    v.cobertura_crescimento_pp == null
                      ? "growth-neutral"
                      : v.cobertura_crescimento_pp >= 0
                      ? "growth-positive"
                      : "growth-negative";

                  const cobCrescLabel =
                    v.cobertura_crescimento_pp == null
                      ? "—"
                      : `${v.cobertura_crescimento_pp > 0 ? "+" : ""}${v.cobertura_crescimento_pp} p.p.`;

                  return (
                    <tr key={v.mes}>
                      <td>{v.mes}</td>
                      <td>{formatMoeda(v.total_vendas)}</td>
                      <td>{v.total_pedidos}</td>
                      <td className={growthClass}>{growthLabel}</td>
                      <td>
                        <strong>{cobLabel}</strong>
                      </td>
                      <td className={cobCrescClass}>{cobCrescLabel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
