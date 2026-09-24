"use client";

import { useMemo } from "react";
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
  LabelList,
} from "recharts";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { DashboardData } from "@/lib/types";

interface ClientesCoberturaDashboardProps {
  data: DashboardData | null;
  loading: boolean;
}

const TOOLTIP_STYLE = {
  background: "#151A23",
  border: "1px solid #232936",
  color: "#F1F5F9",
  borderRadius: "8px",
};

export function ClientesCoberturaDashboard({
  data,
  loading,
}: ClientesCoberturaDashboardProps) {
  const kpis = data?.kpis ?? {
    total_vendas: 0,
    total_pedidos: 0,
    clientes_ativos: 0,
    cobertura_pct: null,
  };

  const topClientes = useMemo(() => data?.top_clientes ?? [], [data]);
  const topVendedores = useMemo(() => data?.top_vendedores ?? [], [data]);
  const vendasMensal = useMemo(() => data?.vendas_mensal ?? [], [data]);
  const topProdutos = useMemo(() => data?.top_produtos ?? [], [data]);

  // 1. Insights Automáticos em Linguagem Executiva
  const insights = useMemo(() => {
    const clienteLider = topClientes[0] ?? { Cliente: "—", total_vendas: 0 };
    const produtoLider = topProdutos[0] ?? { Produto: "—", total_vendas: 0 };
    const vendedorLider = topVendedores[0] ?? { Vendedor: "—", total_vendas: 0, total_pedidos: 0 };

    const ticketMedio =
      kpis.total_pedidos > 0 ? kpis.total_vendas / kpis.total_pedidos : 0;

    return {
      clienteLider,
      produtoLider,
      vendedorLider,
      ticketMedio,
      resumo: `No período analisado, foram faturados ${formatMoeda(
        kpis.total_vendas
      )} distribuídos em ${formatNumero(kpis.total_pedidos)} pedidos, alcançando ${formatNumero(
        kpis.clientes_ativos
      )} clientes ativos na carteira. O ticket médio registrado foi de ${formatMoeda(
        ticketMedio
      )} por pedido faturado.`,
    };
  }, [kpis, topClientes, topProdutos, topVendedores]);

  // 2. Dados do Gráfico de CPF/CNPJ (Limitado aos top clientes)
  const dadosCpfCnpj = useMemo(() => {
    return topClientes.slice(0, 7).map((c) => ({
      nomeCurto: (c.Cliente || "Cliente").substring(0, 18),
      nomeCompleto: c.Cliente,
      total: Number(c.total_vendas || 0),
      totalFormatado: formatMoeda(c.total_vendas),
      pedidos: c.total_pedidos || 1,
    }));
  }, [topClientes]);

  // 3. Dados de Evolução da Cobertura de Clientes
  const dadosCoberturaMensal = useMemo(() => {
    return vendasMensal.map((v) => ({
      mes: v.mes,
      clientes: Number(
        v.clientes_ativos ?? (v as any).cobertura ?? (v as any).total_clientes ?? 0
      ),
      vendas: v.total_vendas,
      vendasFormatada: formatMoeda(v.total_vendas),
    }));
  }, [vendasMensal]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ==================================================================== */}
      {/* ÁREA DE INSIGHTS AUTOMÁTICOS EM LINGUAGEM EXECUTIVA                   */}
      {/* ==================================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <div className="panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-muted)", letterSpacing: "0.05em" }}>
            Cliente Top Faturamento
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#00F5FF", marginTop: 4, fontVariant: "normal" }}>
            {loading ? <Skeleton height={24} /> : insights.clienteLider.Cliente}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
            {formatMoeda(insights.clienteLider.total_vendas)}
          </div>
        </div>

        <div className="panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-muted)", letterSpacing: "0.05em" }}>
            Produto Líder em Vendas
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#00F5FF", marginTop: 4, fontVariant: "normal" }}>
            {loading ? <Skeleton height={24} /> : insights.produtoLider.Produto}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
            {formatMoeda(insights.produtoLider.total_vendas)}
          </div>
        </div>

        <div className="panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-muted)", letterSpacing: "0.05em" }}>
            Melhor Vendedor em Vendas
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#00F5FF", marginTop: 4, fontVariant: "normal" }}>
            {loading ? <Skeleton height={24} /> : insights.vendedorLider.Vendedor}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
            {formatMoeda(insights.vendedorLider.total_vendas)}
          </div>
        </div>

        <div className="panel" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", color: "var(--color-muted)", letterSpacing: "0.05em" }}>
            Cobertura da Carteira
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#34D399", marginTop: 4, fontVariant: "normal" }}>
            {loading ? <Skeleton height={24} /> : `${formatNumero(kpis.clientes_ativos)} clientes`}
          </div>
          <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 4 }}>
            {kpis.cobertura_pct != null ? `${kpis.cobertura_pct}% de positivação` : "Clientes ativos no período"}
          </div>
        </div>
      </div>

      {/* Resumo Executivo em Parágrafo */}
      <div
        className="panel"
        style={{
          borderLeft: "4px solid #00F5FF",
          padding: "16px 20px",
          background: "rgba(0, 245, 255, 0.03)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#00F5FF", textTransform: "uppercase" }}>
          Diagnóstico do Período:
        </span>
        <p style={{ fontSize: 13, color: "var(--color-text)", marginTop: 4, lineHeight: 1.6, fontVariant: "normal" }}>
          {insights.resumo}
        </p>
      </div>

      {/* ==================================================================== */}
      {/* GRÁFICOS COM VALORES SEMPRE VISÍVEIS (DATA LABELS)                   */}
      {/* ==================================================================== */}
      <div className="grid-2col">
        {/* Gráfico 1: Vendas por CPF/CNPJ (Barras com valor permanente no final) */}
        <div className="panel">
          <h2 className="panel-title">Vendas por Cliente / Documento (Faturamento na Barra)</h2>
          {loading ? (
            <Skeleton height={320} />
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dadosCpfCnpj}
                  layout="vertical"
                  margin={{ top: 10, right: 110, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="nomeCurto"
                    stroke="var(--color-muted)"
                    width={130}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: any) => formatMoeda(Number(v))}
                  />
                  <Bar dataKey="total" fill="#00F5FF" radius={[0, 4, 4, 0]}>
                    <LabelList
                      dataKey="totalFormatado"
                      position="right"
                      fill="#00F5FF"
                      style={{ fontSize: 11, fontWeight: "bold" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Gráfico 2: Evolução de Clientes Atendidos por Mês (Linha com valor no ponto) */}
        <div className="panel">
          <h2 className="panel-title">Evolução da Cobertura de Clientes (Mês a Mês)</h2>
          {loading ? (
            <Skeleton height={320} />
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={dadosCoberturaMensal}
                  margin={{ top: 25, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="mes" stroke="var(--color-muted)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--color-muted)" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(v: any) => [`${formatNumero(Number(v))} clientes`, "Cobertura"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="clientes"
                    stroke="#34D399"
                    strokeWidth={3}
                    dot={{ r: 6, fill: "#34D399" }}
                    activeDot={{ r: 8 }}
                  >
                    <LabelList
                      dataKey="clientes"
                      position="top"
                      offset={10}
                      fill="#F1F5F9"
                      style={{ fontSize: 11, fontWeight: "bold" }}
                      formatter={(v: any) => formatNumero(Number(v))}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TABELA COM ALINHAMENTO ESTRUTURAL RÍGIDO (TABLE-LAYOUT: FIXED)       */}
      {/* ==================================================================== */}
      <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)" }}>
          <h2 className="panel-title" style={{ margin: 0 }}>
            Carteira de Clientes & Positivação
          </h2>
        </div>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              tableLayout: "fixed",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ height: 48, background: "rgba(255, 255, 255, 0.02)" }}>
                <th style={{ width: "60px", textAlign: "center", padding: "12px 16px" }}>Pos.</th>
                <th style={{ width: "320px", textAlign: "left", padding: "12px 16px" }}>Cliente</th>
                <th style={{ width: "180px", textAlign: "right", padding: "12px 16px" }}>Total Vendido</th>
                <th style={{ width: "120px", textAlign: "right", padding: "12px 16px" }}>Pedidos</th>
                <th style={{ width: "160px", textAlign: "right", padding: "12px 16px" }}>Ticket Médio</th>
                <th style={{ width: "130px", textAlign: "center", padding: "12px 16px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {topClientes.slice(0, 15).map((cli, idx) => {
                const pedidos = cli.pedidos || 1;
                const ticket = cli.total_vendas / pedidos;
                return (
                  <tr
                    key={cli.Cliente + idx}
                    style={{
                      height: 48,
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <td style={{ textAlign: "center", padding: "12px 16px", color: "var(--color-muted)" }}>
                      #{idx + 1}
                    </td>
                    <td
                      style={{
                        textAlign: "left",
                        padding: "12px 16px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                      }}
                      title={cli.Cliente}
                    >
                      {cli.Cliente}
                    </td>
                    <td style={{ textAlign: "right", padding: "12px 16px", color: "#34D399", fontWeight: 700 }}>
                      {formatMoeda(cli.total_vendas)}
                    </td>
                    <td style={{ textAlign: "right", padding: "12px 16px" }}>
                      {formatNumero(pedidos)}
                    </td>
                    <td style={{ textAlign: "right", padding: "12px 16px", color: "var(--color-muted)" }}>
                      {formatMoeda(ticket)}
                    </td>
                    <td style={{ textAlign: "center", padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: "rgba(16, 185, 129, 0.15)",
                          color: "#34D399",
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Positivado
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
