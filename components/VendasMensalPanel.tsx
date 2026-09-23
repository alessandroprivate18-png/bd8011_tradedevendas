"use client";

import { useMemo } from "react";
import {
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

  // Mapeia e calcula Cobertura de Clientes e Crescimento mês a mês
  const rowsProcessadas = useMemo(() => {
    return rows.map((v, idx) => {
      const clientes = Number(
        v.clientes_ativos ?? (v as any).cobertura ?? (v as any).total_clientes ?? 0
      );

      let crescClientes: number | null = v.crescimento_cobertura_pct ?? null;

      if (crescClientes === null && idx > 0) {
        const prevClientes = Number(
          rows[idx - 1].clientes_ativos ??
          (rows[idx - 1] as any).cobertura ??
          (rows[idx - 1] as any).total_clientes ?? 0
        );
        if (prevClientes > 0) {
          crescClientes = Math.round(((clientes - prevClientes) / prevClientes) * 1000) / 10;
        }
      }

      return {
        ...v,
        cobertura_clientes: clientes,
        crescimento_cobertura_pct: crescClientes,
      };
    });
  }, [rows]);

  return (
    <div className="panel">
      <h2 className="panel-title">Vendas por mês & Cobertura</h2>

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
            <LineChart data={rowsProcessadas}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="mes" stroke="var(--color-muted)" />
              <YAxis stroke="var(--color-muted)" />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === "total_vendas" ? formatMoeda(Number(v)) : formatNumero(Number(v))
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

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Total vendido</th>
                  <th>Pedidos</th>
                  <th>Cresc. Vendas</th>
                  <th>Cobertura (Clientes)</th>
                  <th>Cresc. Cobertura</th>
                </tr>
              </thead>
              <tbody>
                {rowsProcessadas.map((v) => {
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

                  const cobClass =
                    v.crescimento_cobertura_pct == null
                      ? "growth-neutral"
                      : v.crescimento_cobertura_pct >= 0
                      ? "growth-positive"
                      : "growth-negative";

                  const cobLabel =
                    v.crescimento_cobertura_pct == null
                      ? "—"
                      : `${v.crescimento_cobertura_pct > 0 ? "+" : ""}${v.crescimento_cobertura_pct}%`;

                  return (
                    <tr key={v.mes}>
                      <td>{v.mes}</td>
                      <td>{formatMoeda(v.total_vendas)}</td>
                      <td>{v.total_pedidos}</td>
                      <td className={growthClass}>{growthLabel}</td>
                      <td>
                        <strong>{formatNumero(v.cobertura_clientes)}</strong>
                        {v.cobertura_pct != null && (
                          <span style={{ fontSize: 11, marginLeft: 6, color: "var(--color-muted)" }}>
                            ({v.cobertura_pct}%)
                          </span>
                        )}
                      </td>
                      <td className={cobClass}>{cobLabel}</td>
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
