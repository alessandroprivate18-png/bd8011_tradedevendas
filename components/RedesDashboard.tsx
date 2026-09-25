"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronRight, ChevronDown } from "lucide-react";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useRedesRanking, useLojasDeRede, FILTRO_REDES_PADRAO } from "@/lib/hooks/useRedes";
import type { LojaRede, RedeRanking } from "@/lib/hooks/useRedes";
import { RedesFabricanteMatriz } from "@/components/RedesFabricanteMatriz";
import { FiltroAvancado } from "@/components/FiltroAvancado";
import type { FiltroAvancadoValor } from "@/components/FiltroAvancado";
import type { FilterOptions } from "@/lib/types";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

function LinhaRede({
  rede,
  filtro,
  carregarLojas,
}: {
  rede: RedeRanking;
  filtro: FiltroAvancadoValor;
  carregarLojas: (rede: string, filtro: FiltroAvancadoValor) => Promise<LojaRede[]>;
}) {
  const [aberto, setAberto] = useState(false);
  const [lojas, setLojas] = useState<LojaRede[] | null>(null);
  const [carregandoLojas, setCarregandoLojas] = useState(false);

  async function alternar() {
    const proximo = !aberto;
    setAberto(proximo);
    if (proximo) {
      // Sempre recarrega ao abrir: o filtro do painel pai pode ter mudado
      // desde a ultima vez que essa linha foi expandida.
      setCarregandoLojas(true);
      try {
        const dados = await carregarLojas(rede.rede, filtro);
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
      </tr>
      {aberto && (
        <tr>
          <td colSpan={6} style={{ padding: 0, background: "var(--color-bg)" }}>
            {carregandoLojas ? (
              <div style={{ padding: 16 }}>
                <Skeleton height={80} />
              </div>
            ) : (
              <table className="data-table" style={{ width: "100%", margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ paddingLeft: 32 }}>Cliente</th>
                    <th>Cidade/Bairro</th>
                    <th>Pedidos</th>
                    <th>Volume</th>
                    <th>Qt. SKUs</th>
                    <th>Ticket médio</th>
                    <th>Total vendido</th>
                  </tr>
                </thead>
                <tbody>
                  {(lojas ?? []).map((l) => (
                    <tr key={l.cpf_cnpj}>
                      <td style={{ paddingLeft: 32 }}>
                        {l.cpf_cnpj} - ({l.codigo_cliente}) - {l.cliente}
                      </td>
                      <td>
                        {[l.cidade, l.bairro].filter(Boolean).join(" / ") || "—"}
                      </td>
                      <td>{l.pedidos}</td>
                      <td>{formatNumero(l.volume)}</td>
                      <td>{l.qt_skus}</td>
                      <td>{l.ticket_medio ? formatMoeda(l.ticket_medio) : "—"}</td>
                      <td>{formatMoeda(l.total_vendas)}</td>
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

export function RedesDashboard({ filterOptions }: { filterOptions: FilterOptions }) {
  // Topo: KPIs + grafico de ranking — filtro avancado proprio
  const { filtro, setFiltro, kpis, ranking, loading, erro } = useRedesRanking();

  // Tabela "Todas as redes" — filtro avancado independente do topo
  const {
    filtro: filtroTabela,
    setFiltro: setFiltroTabela,
    ranking: rankingTabela,
    loading: loadingTabela,
    erro: erroTabela,
  } = useRedesRanking(FILTRO_REDES_PADRAO);

  const { carregarLojas } = useLojasDeRede();

  const top15 = ranking.slice(0, 15);

  return (
    <>
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="filter-row">
          <FiltroAvancado
            fabricantesOptions={filterOptions.fabricantes_codigo}
            valor={filtro}
            onChange={setFiltro}
          />
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
      </div>

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

      <RedesFabricanteMatriz ranking={ranking} filterOptions={filterOptions} />

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="panel-title">Todas as redes ({rankingTabela.length})</h2>

        <div className="filter-row" style={{ marginBottom: 16 }}>
          <FiltroAvancado
            fabricantesOptions={filterOptions.fabricantes_codigo}
            valor={filtroTabela}
            onChange={setFiltroTabela}
          />
        </div>

        {erroTabela && (
          <div style={{ color: "#ff9aa6", fontSize: 13, marginBottom: 16 }}>{erroTabela}</div>
        )}

        {loadingTabela ? (
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
                </tr>
              </thead>
              <tbody>
                {rankingTabela.map((r) => (
                  <LinhaRede
                    key={r.rede}
                    rede={r}
                    filtro={filtroTabela}
                    carregarLojas={carregarLojas}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
