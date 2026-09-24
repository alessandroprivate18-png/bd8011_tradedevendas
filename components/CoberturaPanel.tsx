"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatNumero, formatMoeda } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useCobertura } from "@/lib/hooks/useCobertura";
import { useClientesListas } from "@/lib/hooks/useClientesListas";

const CORES = ["#34d399", "#2a2e3a"];

export function CoberturaPanel() {
  const { dados, loading, erro, dataInicio, setDataInicio, dataFim, setDataFim } =
    useCobertura();
  const {
    naoPositivados,
    totalNaoPositivados,
    inativos,
    totalInativos,
    diasInativo,
    setDiasInativo,
    loading: loadingListas,
  } = useClientesListas(dataInicio, dataFim);

  const naoPositivadosDonut = dados
    ? Math.max(dados.clientes_cadastrados - dados.clientes_ativos, 0)
    : 0;

  const pieData = dados
    ? [
        { name: "Positivados", value: dados.clientes_ativos },
        { name: "Não positivados", value: naoPositivadosDonut },
      ]
    : [];

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
        <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 12, marginBottom: 0 }}>
          "Clientes planejados hoje" e "visitados" ficam disponíveis assim que a base de roteiro
          for importada — por enquanto, mostramos positivados (que compraram) vs. não
          positivados no período.
        </p>
      </div>

      {erro && (
        <div className="panel" style={{ borderColor: "#7a2f38", color: "#ff9aa6", marginBottom: 20 }}>
          {erro}
        </div>
      )}

      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <div className="kpi-card">
          <div className="kpi-label">Clientes cadastrados</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatNumero(dados?.clientes_cadastrados ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Positivados</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatNumero(dados?.clientes_ativos ?? 0)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Não positivados</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{formatNumero(naoPositivadosDonut)}</div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Cobertura</div>
          {loading ? <Skeleton height={36} /> : (
            <div className="kpi-value">{dados?.cobertura_pct ?? 0}%</div>
          )}
        </div>
      </div>

      <div className="panel">
        <h2 className="panel-title">Positivação de clientes</h2>
        {loading ? (
          <Skeleton height={260} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CORES[i % CORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => formatNumero(Number(v))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="panel-title">
          Clientes não positivados no período ({formatNumero(totalNaoPositivados)})
        </h2>
        <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: -8, marginBottom: 16 }}>
          Ordenados por valor médio histórico — os de maior potencial primeiro. Mostrando até 50.
        </p>
        {loadingListas ? (
          <Skeleton height={200} />
        ) : naoPositivados.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>Nenhum cliente cadastrado ficou de fora no período.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Cidade</th>
                  <th>Última compra</th>
                  <th>Valor médio histórico</th>
                </tr>
              </thead>
              <tbody>
                {naoPositivados.map((c) => (
                  <tr key={c.ID_CLIENTE}>
                    <td>{c.cliente}</td>
                    <td>{c.vendedor ?? "—"}</td>
                    <td>{c.cidade ?? "—"}</td>
                    <td>{c.ultima_compra ?? "Nunca comprou"}</td>
                    <td>{c.valor_medio ? formatMoeda(c.valor_medio) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel" style={{ marginTop: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <h2 className="panel-title" style={{ margin: 0 }}>
            Clientes inativos ({formatNumero(totalInativos)})
          </h2>
          <select
            className="filter-control"
            value={diasInativo}
            onChange={(e) => setDiasInativo(Number(e.target.value))}
            style={{ width: "auto" }}
          >
            <option value={30}>30+ dias</option>
            <option value={60}>60+ dias</option>
            <option value={90}>90+ dias</option>
            <option value={180}>180+ dias</option>
          </select>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 16 }}>
          Já compraram alguma vez, mas estão há {diasInativo}+ dias sem comprar. Ordenados pelos mais antigos. Mostrando até 50.
        </p>
        {loadingListas ? (
          <Skeleton height={200} />
        ) : inativos.length === 0 ? (
          <p style={{ color: "var(--color-muted)" }}>Nenhum cliente nessa faixa de inatividade.</p>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Vendedor</th>
                  <th>Cidade</th>
                  <th>Última compra</th>
                  <th>Dias sem comprar</th>
                  <th>Valor médio histórico</th>
                </tr>
              </thead>
              <tbody>
                {inativos.map((c) => (
                  <tr key={c.ID_CLIENTE}>
                    <td>{c.cliente}</td>
                    <td>{c.vendedor ?? "—"}</td>
                    <td>{c.cidade ?? "—"}</td>
                    <td>{c.ultima_compra}</td>
                    <td>{c.dias_sem_comprar}</td>
                    <td>{c.valor_medio ? formatMoeda(c.valor_medio) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
