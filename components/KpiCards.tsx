"use client";

import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { Kpis } from "@/lib/types";

interface KpiCardsProps {
  kpis: Kpis;
  ticketMedio: number;
  loading: boolean;
}

interface CardProps {
  label: string;
  value: string;
  sublabel?: string;
  loading: boolean;
}

function KpiCard({ label, value, sublabel, loading }: CardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      {loading ? (
        <Skeleton height={36} />
      ) : (
        <>
          <div className="kpi-value">{value}</div>
          {sublabel && (
            <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
              {sublabel}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function KpiCards({ kpis, ticketMedio, loading }: KpiCardsProps) {
  return (
    <div className="kpi-grid">
      <KpiCard
        label="Total vendido"
        value={formatMoeda(kpis.total_vendas)}
        loading={loading}
      />
      <KpiCard
        label="Pedidos"
        value={formatNumero(kpis.total_pedidos)}
        loading={loading}
      />
      <KpiCard
        label="Ticket médio"
        value={formatMoeda(ticketMedio)}
        loading={loading}
      />
      <KpiCard
        label="Clientes ativos"
        value={formatNumero(kpis.clientes_ativos)}
        loading={loading}
      />
      <KpiCard
        label="Cobertura de clientes"
        value={`${kpis.cobertura_pct ?? 0}%`}
        sublabel={`${formatNumero(kpis.clientes_ativos)} de ${formatNumero(
          kpis.clientes_cadastrados
        )} cadastrados`}
        loading={loading}
      />
    </div>
  );
}
