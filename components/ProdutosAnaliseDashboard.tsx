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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { DashboardData } from "@/lib/types";

interface ProdutosAnaliseDashboardProps {
  data: DashboardData | null;
  loading: boolean;
}

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

const COLORS_ABC = ["#3b82f6", "#10b981", "#f59e0b"];

export function ProdutosAnaliseDashboard({
  data,
  loading,
}: ProdutosAnaliseDashboardProps) {
  const produtos = useMemo(() => data?.top_produtos ?? [], [data]);

  const totalVendasProdutos = useMemo(() => {
    return produtos.reduce((acc, p) => acc + (Number(p.total_vendas) || 0), 0);
  }, [produtos]);

  const totalQtdProdutos = useMemo(() => {
    return produtos.reduce((acc, p) => acc + (Number(p.qtd_total) || 0), 0);
  }, [produtos]);

  const precoMedioGeral = totalQtdProdutos > 0 ? totalVendasProdutos / totalQtdProdutos : 0;

  // Classificação Curva ABC
  const produtosComABC = useMemo(() => {
    let acumulado = 0;
    return produtos.map((p) => {
      const valor = Number(p.total_vendas) || 0;
      acumulado += valor;
      const pctAcumulado = totalVendasProdutos > 0 ? (acumulado / totalVendasProdutos) * 100 : 0;
      let classe = "C";
      if (pctAcumulado <= 70) classe = "A";
      else if (pctAcumulado <= 90) classe = "B";

      const precoMedio = p.qtd_total > 0 ? valor / p.qtd_total : 0;

      return {
        ...p,
        valor,
        precoMedio,
        pctParticipacao: totalVendasProdutos > 0 ? (valor / totalVendasProdutos) * 100 : 0,
        classe,
      };
    });
  }, [produtos, totalVendasProdutos]);

  // Resumo por Classe ABC
  const resumoABC = useMemo(() => {
    const a = produtosComABC.filter((p) => p.classe === "A").reduce((acc, p) => acc + p.valor, 0);
    const b = produtosComABC.filter((p) => p.classe === "B").reduce((acc, p) => acc + p.valor, 0);
    const c = produtosComABC.filter((p) => p.classe === "C").reduce((acc, p) => acc + p.valor, 0);

    return [
      { name: "Curva A (Alto Impacto)", value: a || 70 },
      { name: "Curva B (Médio Impacto)", value: b || 20 },
      { name: "Curva C (Cauda Longa)", value: c || 10 },
    ];
  }, [produtosComABC]);

  return (
    <div>
      {/* KPIs de Produtos */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Faturamento Total Top Produtos</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatMoeda(totalVendasProdutos)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Volume Total (Unidades / CX)</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatNumero(totalQtdProdutos)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Preço Médio Unitário</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatMoeda(precoMedioGeral)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Mix de Produtos Ativos</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{produtos.length} itens</div>}
        </div>
      </div>

      {/* Gráficos: Curva ABC e Ranking de Faturamento */}
      <div className="grid-2col">
        {/* Distribuição Curva ABC */}
        <div className="panel">
          <h2 className="panel-title">Concentração de Faturamento (Curva ABC)</h2>
          {loading ? (
            <Skeleton height={280} />
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <ResponsiveContainer width="55%" height={260}>
                <PieChart>
                  <Pie data={resumoABC} dataKey="value" innerRadius={55} outerRadius={85} paddingAngle={4}>
                    {resumoABC.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_ABC[index % COLORS_ABC.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatMoeda(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, paddingLeft: 16 }}>
                {resumoABC.map((r, i) => (
                  <div key={r.name} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS_ABC[i] }} />
                      <span style={{ fontWeight: 600 }}>{r.name}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--color-muted)", marginLeft: 18 }}>
                      {formatMoeda(r.value)} ({totalVendasProdutos > 0 ? ((r.value / totalVendasProdutos) * 100).toFixed(1) : 0}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quantidade vendida por produto */}
        <div className="panel">
          <h2 className="panel-title">Volume Vendido (Quantidade Física)</h2>
          {loading ? (
            <Skeleton height={280} />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={produtosComABC} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" stroke="var(--color-muted)" tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="Produto" stroke="var(--color-muted)" width={150} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatNumero(Number(v)) + " un"} />
                <Bar dataKey="qtd_total" fill="var(--color-accent)" radius={[0, 4, 4, 0]} name="Quantidade Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabela Analítica de Produtos */}
      <div className="panel">
        <h2 className="panel-title">Matriz Analítica de Produtos & Margem Estimada</h2>
        {loading ? (
          <Skeleton height={240} />
        ) : (
          <div className="table-wrapper" style={{ marginTop: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Produto</th>
                  <th>Qtd. Vendida</th>
                  <th>Preço Médio</th>
                  <th>Participação %</th>
                  <th>Total Faturado</th>
                </tr>
              </thead>
              <tbody>
                {produtosComABC.map((p) => (
                  <tr key={p.Produto}>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor:
                            p.classe === "A"
                              ? "rgba(59, 130, 246, 0.15)"
                              : p.classe === "B"
                              ? "rgba(16, 185, 129, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                          color:
                            p.classe === "A"
                              ? "var(--color-accent)"
                              : p.classe === "B"
                              ? "var(--color-success)"
                              : "#f59e0b",
                        }}
                      >
                        Classe {p.classe}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.Produto}</td>
                    <td>{formatNumero(p.qtd_total)}</td>
                    <td>{formatMoeda(p.precoMedio)}</td>
                    <td>{p.pctParticipacao.toFixed(1)}%</td>
                    <td style={{ fontWeight: 600, color: "var(--color-accent)" }}>{formatMoeda(p.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
