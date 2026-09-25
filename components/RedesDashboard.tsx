"use client";

import { useState } from "react";
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
} from "recharts";
import { ChevronRight, ChevronDown } from "lucide-react";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useRedes } from "@/lib/hooks/useRedes";
import type { LojaRede } from "@/lib/hooks/useRedes";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

function Variacao({ pct }: { pct: number | null }) {
  if (pct == null) return <span style={{ color: "var(--color-muted)" }}>—</span>;
  return (
    <span style={{ color: pct >= 0 ? "#34d399" : "#ff9aa6" }}>
      {pct > 0 ? "+" : ""}
      {pct}%
    </span>
  );
}

function LinhaRede({
  rede,
  carregarLojas,
}: {
  rede: { rede: string; lojas_cadastradas: number; lojas_ativas: number; pedidos: number; ticket_medio: number | null; total_vendas: number; variacao_yoy_pct: number | null };
  carregarLojas: (rede: string) => Promise<LojaRede[]>;
}) {
  const [aberto, setAberto] = useState(false);
  const [lojas, setLojas] = useState<LojaRede[] | null>(null);
  const [carregandoLojas, setCarregandoLojas] = useState(false);

  async function alternar() {
    const proximo = !aberto;
    setAberto(proximo);
    if (proximo && lojas === null) {
      setCarregandoLojas(true);
      try {
        const dados = await carregarLojas(rede.rede);
        setLojas(dados);
      } finally {
        setCarregandoLojas(false);
      }
    }
  }

  return (
    <>
      <tr onClick={alternar} style={{ cursor: "pointer" }}>
        <td style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {aberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          {rede.rede}
        </td>
        <td>{rede.lojas_cadastradas}</td>
        <td>{rede.lojas_ativas}</td>
        <td>{rede.pedidos}</td>
        <td>{rede.ticket_medio ? formatMoeda(rede.ticket_medio) : "—"}</td>
        <td>{formatMoeda(rede.total_vendas)}</td>
        <td>
          <Variacao pct={rede.variacao_yoy_pct} />
        </td>
      </tr>
      {aberto && (
        <tr>
          <td colSpan={7} style={{ padding: 0, background: "var(--color-bg)" }}>
            {carregandoLojas ? (
              <div style={{ padding: 16 }}>
                <Skeleton height={80} />
              </div>
            ) : (
              <table className="data-table" style={{ width: "100%", margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 32 }}>Cliente / Loja</th>
                    <th>CPF/CNPJ</th>
                    <th>Pedidos</th>
                    <th>Ticket médio</th>
                    <th>Total vendido</th>
                    <th>YoY</th>
                  </tr>
                </thead>
                <tbody>
                  {(lojas ?? []).map((l) => (
                    <tr key={l.cpf_cnpj}>
                      <td style={{ paddingLeft: 32 }}>
                        {l.nome_loja ? `${l.nome_loja} — ${l.cliente}` : l.cliente}
                      </td>
                      <td>{l.cpf_cnpj}</td>
                      <td>{l.pedidos}</td>
                      <td>{l.ticket_medio ? formatMoeda(l.ticket_medio) : "—"}</td>
                      <td>{formatMoeda(l.total_vendas)}</td>
                      <td>
                        <Variacao pct={l.variacao_yoy_pct} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export function RedesDashboard() {
  const { kpis, ranking, mensal, yoyDisponivel, loading, erro, dataInicio, setDataInicio, dataFim, setDataFim, carregarLojas } =
    useRedes();

  const top15 = ranking.slice(0, 15);

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
        </div>
      </div>

      {erro && (
        <div className="panel" style={{ borderColor: "#7a2f38", color: "#ff9aa6", marginBottom: 20 }}>
          {erro}
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total vendido</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatMoeda(kpis?.total_vendas ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Redes ativas</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatNumero(kpis?.redes_ativas ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Year over Year</div>
          {loading ? (
            <Skeleton height={36} />
          ) : yoyDisponivel ? (
            <div className="kpi-value">
              <Variacao pct={kpis?.variacao_yoy_pct ?? null} />
            </div>
          ) : (
            <div className="kpi-value" style={{ fontSize: 15, color: "var(--color-muted)" }}>
              Sem dados de 2025 ainda
            </div>
          )}
        </div>
      </div>

      {yoyDisponivel && mensal.length > 0 && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <h2 className="panel-title">Vendas por mês — este ano vs. ano anterior</h2>
          {loading ? (
            <Skeleton height={260} />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={mensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="mes" stroke="var(--color-muted)" />
                <YAxis stroke="var(--color-muted)" />
                <Tooltip formatter={(v: number) => formatMoeda(Number(v))} contentStyle={TOOLTIP_STYLE} />
                <Line type="monotone" dataKey="total_vendas" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Este ano" />
                <Line type="monotone" dataKey="total_ano_anterior" stroke="#5c6370" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Ano anterior" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 className="panel-title">Ranking de redes (top 15 por faturamento)</h2>
        {loading ? (
          <Skeleton height={420} />
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top15} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted)" />
              <YAxis type="category" dataKey="rede" stroke="var(--color-muted)" width={200} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => formatMoeda(Number(v))} contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="total_vendas" fill="#8b5cf6" name="Total vendido" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Todas as redes ({ranking.length})</h2>
        {loading ? (
          <Skeleton height={300} />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rede</th>
                  <th>Lojas cadastradas</th>
                  <th>Lojas ativas</th>
                  <th>Pedidos</th>
                  <th>Ticket médio</th>
                  <th>Total vendido</th>
                  <th>YoY</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <LinhaRede key={r.rede} rede={r} carregarLojas={carregarLojas} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
