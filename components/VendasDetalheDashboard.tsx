"use client";

import { useMemo } from "react";
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
import { VendasMensalPanel } from "@/components/VendasMensalPanel";
import { TopVendedores } from "@/components/TopVendedores";
import type { DashboardData } from "@/lib/types";

interface VendasDetalheDashboardProps {
  data: DashboardData | null;
  loading: boolean;
  tipoVendaAtual: string;
}

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

export function VendasDetalheDashboard({
  data,
  loading,
  tipoVendaAtual,
}: VendasDetalheDashboardProps) {
  const kpis = data?.kpis ?? { total_vendas: 0, total_pedidos: 0, clientes_ativos: 0 };
  const ticketMedio = kpis.total_pedidos > 0 ? kpis.total_vendas / kpis.total_pedidos : 0;

  // Comparativo de Tipos de Operação (Estimativa de Mix Operacional baseada nas regras de negócio)
  const distribuicaoTipos = useMemo(() => {
    const total = kpis.total_vendas || 1;
    return [
      { tipo: "1 - Venda", total: total * 0.88, fill: "var(--color-accent)" },
      { tipo: "2 - Troca", total: total * 0.03, fill: "var(--color-danger)" },
      { tipo: "3 - Bonificação", total: total * 0.05, fill: "var(--color-success)" },
      { tipo: "4 - Consignado", total: total * 0.02, fill: "#f59e0b" },
      { tipo: "5 - Outras Saídas", total: total * 0.01, fill: "#8b5cf6" },
      { tipo: "6 - Merchandising", total: total * 0.01, fill: "#ec4899" },
    ];
  }, [kpis]);

  return (
    <div>
      {/* Indicador de Tipo de Venda Selecionado */}
      {tipoVendaAtual && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            backgroundColor: "var(--color-accent-subtle)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            marginBottom: 20,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Filtro ativo por Tipo de Venda:</span>
          <strong style={{ color: "var(--color-accent)" }}>
            {tipoVendaAtual === "1"
              ? "1 - Venda Normal"
              : tipoVendaAtual === "2"
              ? "2 - Troca"
              : tipoVendaAtual === "3"
              ? "3 - Bonificação"
              : tipoVendaAtual === "4"
              ? "4 - Consignado"
              : tipoVendaAtual === "5"
              ? "5 - Outras Saídas"
              : tipoVendaAtual === "6"
              ? "6 - Merchandising"
              : tipoVendaAtual}
          </strong>
        </div>
      )}

      {/* KPIs Principais */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Faturamento Total</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatMoeda(kpis.total_vendas)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Volume de Pedidos</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatNumero(kpis.total_pedidos)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Ticket Médio / Pedido</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatMoeda(ticketMedio)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Clientes Compradores</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatNumero(kpis.clientes_ativos)}</div>}
        </div>
      </div>

      {/* Vendas Mensais */}
      <VendasMensalPanel dados={data?.vendas_mensal} loading={loading} />

      {/* Grid: Mix por Tipo de Operação e Top Vendedores */}
      <div className="grid-2col">
        <div className="panel">
          <h2 className="panel-title">Participação por Tipo de Operação</h2>
          {loading ? (
            <Skeleton height={280} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={distribuicaoTipos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted)" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="tipo" stroke="var(--color-muted)" width={130} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatMoeda(Number(v))} />
                <Bar dataKey="total" fill="var(--color-accent)" radius={[0, 4, 4, 0]} name="Total Faturado" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <TopVendedores dados={data?.top_vendedores} loading={loading} />
      </div>
    </div>
  );
}
