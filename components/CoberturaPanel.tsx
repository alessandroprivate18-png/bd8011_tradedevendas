"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useCobertura } from "@/lib/hooks/useCobertura";

const CORES = ["#34d399", "#2a2e3a"];

export function CoberturaPanel() {
  const { dados, loading, erro, dataInicio, setDataInicio, dataFim, setDataFim } =
    useCobertura();

  const naoPositivados = dados
    ? Math.max(dados.clientes_cadastrados - dados.clientes_ativos, 0)
    : 0;

  const pieData = dados
    ? [
        { name: "Positivados", value: dados.clientes_ativos },
        { name: "Não positivados", value: naoPositivados },
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
            <div className="kpi-value">{formatNumero(naoPositivados)}</div>
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
    </>
  );
}
