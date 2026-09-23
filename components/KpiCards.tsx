"use client";

import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { Kpis } from "@/lib/types";

interface KpiCardsProps {
  kpis: Kpis;
  ticketMedio: number;
  loading: boolean;
}

export function KpiCards({ kpis, ticketMedio, loading }: KpiCardsProps) {
  const coberturaPct = kpis.cobertura_pct ?? null;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-label">Faturamento Total</div>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <div className="kpi-value">{formatMoeda(kpis.total_vendas)}</div>
        )}
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Volume de Pedidos</div>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <div className="kpi-value">{formatNumero(kpis.total_pedidos)}</div>
        )}
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Ticket Médio / Pedido</div>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <div className="kpi-value">{formatMoeda(ticketMedio)}</div>
        )}
      </div>

      <div className="kpi-card">
        <div className="kpi-label">Cobertura de Clientes</div>
        {loading ? (
          <Skeleton height={36} />
        ) : (
          <div className="kpi-value" style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span>{formatNumero(kpis.clientes_ativos)}</span>
            {coberturaPct != null && (
              <span style={{ fontSize: 13, color: "var(--color-accent)", fontWeight: 500 }}>
                ({coberturaPct}%)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
