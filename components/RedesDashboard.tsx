"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { RedeCliente } from "@/lib/types";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

export function RedesDashboard() {
  const [redes, setRedes] = useState<RedeCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [redeFiltro, setRedeFiltro] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function carregarRedes() {
      setLoading(true);
      setErro(null);

      try {
        const { data, error } = await supabase
          .from("dim_bd_Redes")
          .select("*")
          .order("Rede", { ascending: true })
          .limit(1000);

        if (!cancelled) {
          if (error) {
            setErro(error.message);
          } else if (data) {
            setRedes(data as RedeCliente[]);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setErro(err instanceof Error ? err.message : "Erro ao carregar redes");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    carregarRedes();

    return () => {
      cancelled = true;
    };
  }, []);

  // Lista única de nomes de Redes para o select
  const listaRedesUnicas = useMemo(() => {
    const set = new Set<string>();
    redes.forEach((r) => {
      const nome = r.Rede?.trim();
      if (nome) set.add(nome);
    });
    return Array.from(set).sort();
  }, [redes]);

  // Ranking de Redes por quantidade de lojas/CNPJs cadastrados
  const rankingRedes = useMemo(() => {
    const contagem: Record<string, number> = {};
    redes.forEach((r) => {
      const nome = r.Rede?.trim() || "Outras";
      contagem[nome] = (contagem[nome] || 0) + 1;
    });

    return Object.entries(contagem)
      .map(([nome, total]) => ({ Rede: nome, total_lojas: total }))
      .sort((a, b) => b.total_lojas - a.total_lojas)
      .slice(0, 10);
  }, [redes]);

  // Lojas filtradas pela busca e pelo select
  const lojasFiltradas = useMemo(() => {
    return redes.filter((r) => {
      const matchBusca =
        !busca ||
        r.Cliente?.toLowerCase().includes(busca.toLowerCase()) ||
        r["Cpf/Cnpj"]?.includes(busca) ||
        r.Rede?.toLowerCase().includes(busca.toLowerCase());

      const matchRede = !redeFiltro || r.Rede?.trim() === redeFiltro;

      return matchBusca && matchRede;
    });
  }, [redes, busca, redeFiltro]);

  const totalLojas = redes.length;
  const totalRedes = listaRedesUnicas.length;
  const maiorRede = rankingRedes[0] ?? { Rede: "—", total_lojas: 0 };

  return (
    <div>
      {/* KPIs de Redes */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Redes Cadastradas (dim_bd_Redes)</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{totalRedes}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total de Lojas / Filiais em Redes</div>
          {loading ? <Skeleton height={36} /> : <div className="kpi-value">{formatNumero(totalLojas)}</div>}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Maior Rede em Lojas</div>
          {loading ? (
            <Skeleton height={36} />
          ) : (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--color-accent)" }}>{maiorRede.Rede}</div>
              <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{maiorRede.total_lojas} lojas vinculadas</div>
            </div>
          )}
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Média de Lojas por Rede</div>
          {loading ? (
            <Skeleton height={36} />
          ) : (
            <div className="kpi-value">{totalRedes > 0 ? (totalLojas / totalRedes).toFixed(1) : 0}</div>
          )}
        </div>
      </div>

      {erro && <div className="error-box">Erro ao consultar dim_bd_Redes: {erro}</div>}

      {/* Gráfico do Top 10 Redes por Quantidade de Lojas */}
      <div className="panel">
        <h2 className="panel-title">Top 10 Maiores Redes por Presença de Lojas</h2>
        {loading ? (
          <Skeleton height={300} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rankingRedes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" stroke="var(--color-muted)" tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="Rede"
                stroke="var(--color-muted)"
                width={170}
                tick={{ fontSize: 11 }}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatNumero(Number(v)) + " lojas"} />
              <Bar dataKey="total_lojas" fill="var(--color-accent)" radius={[0, 4, 4, 0]} name="Total de Lojas" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Filtros da Tabela de Redes */}
      <div className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <h2 className="panel-title" style={{ margin: 0 }}>
            Lojas e Clientes Associados ({lojasFiltradas.length} encontrados)
          </h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <select
              className="filter-control"
              value={redeFiltro}
              onChange={(e) => setRedeFiltro(e.target.value)}
              style={{ minWidth: 180 }}
            >
              <option value="">Todas as Redes</option>
              {listaRedesUnicas.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="filter-control"
              placeholder="Buscar cliente, CNPJ ou rede..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ minWidth: 240 }}
            />
          </div>
        </div>

        {loading ? (
          <Skeleton height={240} />
        ) : (
          <div className="table-wrapper" style={{ marginTop: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rede</th>
                  <th>Cód. Cliente</th>
                  <th>Razão Social / Cliente</th>
                  <th>CNPJ / CPF</th>
                  <th>Status / Unidade</th>
                </tr>
              </thead>
              <tbody>
                {lojasFiltradas.slice(0, 50).map((r, idx) => (
                  <tr key={`${r.Codigo}-${r.id_Redes}-${idx}`}>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: "var(--color-accent-subtle)",
                          color: "var(--color-accent)",
                        }}
                      >
                        {r.Rede?.trim() || "Rede Não Identificada"}
                      </span>
                    </td>
                    <td style={{ color: "var(--color-muted)" }}>{r.Codigo}</td>
                    <td style={{ fontWeight: 600 }}>{r.Cliente}</td>
                    <td style={{ color: "var(--color-muted)", fontSize: 12 }}>{r["Cpf/Cnpj"]}</td>
                    <td>
                      <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{r.Status || "Loja Ativa"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lojasFiltradas.length > 50 && (
              <div style={{ textAlign: "center", padding: 12, fontSize: 12, color: "var(--color-muted)" }}>
                Mostrando as primeiras 50 de {lojasFiltradas.length} lojas. Use a busca acima para filtrar.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
