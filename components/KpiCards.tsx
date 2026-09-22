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
  loading: boolean;
}

function KpiCard({ label, value, loading }: CardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      {loading ? (
        <Skeleton height={36} />
      ) : (
        <div className="kpi-value">{value}</div>
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
        label="Clientes ativos"
        value={formatNumero(kpis.clientes_ativos)}
        loading={loading}
      />
      <KpiCard
        label="Ticket médio"
        value={formatMoeda(ticketMedio)}
        loading={loading}
      />
    </div>
  );
}
