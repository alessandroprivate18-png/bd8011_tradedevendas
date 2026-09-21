"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";

type VendaMensal = {
  mes: string;
  total_vendas: number;
  total_pedidos: number;
  crescimento_pct: number | null;
};

type TopVendedor = {
  Vendedor: string;
  total_vendas: number;
  total_pedidos: number;
};

type TopProduto = {
  Produto: string;
  qtd_total: number;
  total_vendas: number;
};

type TopCliente = {
  Cliente: string;
  "CPF/CNPJ": string;
  total_vendas: number;
  total_pedidos: number;
};

type DashboardData = {
  kpis: {
    total_vendas: number;
    total_pedidos: number;
    clientes_ativos: number;
  };
  vendas_mensal: VendaMensal[];
  top_vendedores: TopVendedor[];
  top_produtos: TopProduto[];
  top_clientes: TopCliente[];
};

type FilterOptions = {
  supervisores: string[];
  ramos: string[];
  fabricantes: string[];
};

function formatMoeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const card: React.CSSProperties = {
  background: "#171a23",
  borderRadius: 12,
  padding: "20px 24px",
  flex: 1,
  minWidth: 200,
  border: "1px solid #2a2e3a",
};

const cardTitle: React.CSSProperties = {
  fontSize: 13,
  color: "#9099ab",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const cardValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
};

const panel: React.CSSProperties = {
  background: "#171a23",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #2a2e3a",
  marginBottom: 24,
};

const selectStyle: React.CSSProperties = {
  background: "#171a23",
  color: "#e6e6e6",
  border: "1px solid #2a2e3a",
  borderRadius: 8,
  padding: "8px 12px",
};

const inputStyle: React.CSSProperties = {
  ...selectStyle,
  minWidth: 220,
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    supervisores: [],
    ramos: [],
    fabricantes: [],
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [ramo, setRamo] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteDebounced, setClienteDebounced] = useState("");

  // Carrega as opcoes de filtro uma unica vez
  useEffect(() => {
    async function carregarOpcoes() {
      const { data: opts, error } = await supabase.rpc("dashboard_filter_options");
      if (!error && opts) {
        setFilterOptions(opts as FilterOptions);
      }
    }
    carregarOpcoes();
  }, []);

  // Debounce da busca por cliente (espera parar de digitar)
  useEffect(() => {
    const t = setTimeout(() => setClienteDebounced(clienteBusca), 500);
    return () => clearTimeout(t);
  }, [clienteBusca]);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data: result, error } = await supabase.rpc("dashboard_query", {
      p_data_inicio: dataInicio || null,
      p_data_fim: dataFim || null,
      p_supervisor: supervisor || null,
      p_ramo: ramo || null,
      p_fabricante: fabricante || null,
      p_cliente: clienteDebounced || null,
    });

    if (error) {
      setErro(error.message);
    } else {
      setData(result as DashboardData);
    }
    setLoading(false);
  }, [dataInicio, dataFim, supervisor, ramo, fabricante, clienteDebounced]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const kpis = data?.kpis ?? { total_vendas: 0, total_pedidos: 0, clientes_ativos: 0 };
  const ticketMedio = kpis.total_pedidos > 0 ? kpis.total_vendas / kpis.total_pedidos : 0;

  const temFiltrosAtivos =
    dataInicio || dataFim || supervisor || ramo || fabricante || clienteDebounced;

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
    setSupervisor("");
    setRamo("");
    setFabricante("");
    setClienteBusca("");
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Dashboard de Vendas</h1>
      <p style={{ color: "#9099ab", marginBottom: 24 }}>
        Dados consolidados direto do Supabase
      </p>

      {erro && (
        <div
          style={{
            background: "#3a1d22",
            border: "1px solid #7a2f38",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            color: "#ff9aa6",
          }}
        >
          Erro ao carregar dados: {erro}
        </div>
      )}

      {/* Filtros */}
      <div style={{ ...panel, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9099ab", marginBottom: 4 }}>
              Data inicial
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              style={selectStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9099ab", marginBottom: 4 }}>
              Data final
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              style={selectStyle}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9099ab", marginBottom: 4 }}>
              Supervisor
            </label>
            <select
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos</option>
              {filterOptions.supervisores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9099ab", marginBottom: 4 }}>
              Ramo de atividade
            </label>
            <select value={ramo} onChange={(e) => setRamo(e.target.value)} style={selectStyle}>
              <option value="">Todos</option>
              {filterOptions.ramos.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9099ab", marginBottom: 4 }}>
              Fabricante
            </label>
            <select
              value={fabricante}
              onChange={(e) => setFabricante(e.target.value)}
              style={selectStyle}
            >
              <option value="">Todos</option>
              {filterOptions.fabricantes.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, color: "#9099ab", marginBottom: 4 }}>
              Buscar cliente
            </label>
            <input
              type="text"
              placeholder="Nome do cliente..."
              value={clienteBusca}
              onChange={(e) => setClienteBusca(e.target.value)}
              style={inputStyle}
            />
          </div>

          {temFiltrosAtivos && (
            <button
              onClick={limparFiltros}
              style={{
                background: "transparent",
                color: "#ff9aa6",
                border: "1px solid #7a2f38",
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={card}>
          <div style={cardTitle}>Total vendido</div>
          <div style={cardValue}>{formatMoeda(kpis.total_vendas)}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Pedidos</div>
          <div style={cardValue}>{kpis.total_pedidos.toLocaleString("pt-BR")}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Clientes ativos</div>
          <div style={cardValue}>{kpis.clientes_ativos.toLocaleString("pt-BR")}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Ticket médio</div>
          <div style={cardValue}>{formatMoeda(ticketMedio)}</div>
        </div>
      </div>

      {/* Vendas por mes + crescimento */}
      <div style={panel}>
        <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
          Vendas por mês
        </h2>
        {loading ? (
          <p style={{ color: "#9099ab" }}>Carregando...</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data?.vendas_mensal ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis dataKey="mes" stroke="#9099ab" />
                <YAxis stroke="#9099ab" />
                <Tooltip
                  formatter={(v: number, name: string) =>
                    name === "total_vendas" ? formatMoeda(Number(v)) : v
                  }
                  contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }}
                />
                <Line
                  type="monotone"
                  dataKey="total_vendas"
                  stroke="#4f8cff"
                  strokeWidth={2}
                  dot={false}
                  name="Total vendido"
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Tabela de crescimento mes a mes */}
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#9099ab" }}>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Mês</th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                      Total vendido
                    </th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                      Pedidos
                    </th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                      Crescimento vs. mês anterior
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.vendas_mensal ?? []).map((v) => (
                    <tr key={v.mes}>
                      <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                        {v.mes}
                      </td>
                      <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                        {formatMoeda(v.total_vendas)}
                      </td>
                      <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                        {v.total_pedidos}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          borderBottom: "1px solid #21242e",
                          color:
                            v.crescimento_pct == null
                              ? "#9099ab"
                              : v.crescimento_pct >= 0
                              ? "#34d399"
                              : "#ff9aa6",
                        }}
                      >
                        {v.crescimento_pct == null
                          ? "—"
                          : `${v.crescimento_pct > 0 ? "+" : ""}${v.crescimento_pct}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Top vendedores */}
        <div style={{ ...panel, flex: 1, minWidth: 320 }}>
          <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
            Top 10 vendedores
          </h2>
          {loading ? (
            <p style={{ color: "#9099ab" }}>Carregando...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.top_vendedores ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis type="number" stroke="#9099ab" />
                <YAxis
                  type="category"
                  dataKey="Vendedor"
                  stroke="#9099ab"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v: number) => formatMoeda(Number(v))}
                  contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }}
                />
                <Bar dataKey="total_vendas" fill="#4f8cff" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top produtos */}
        <div style={{ ...panel, flex: 1, minWidth: 320 }}>
          <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
            Top 10 produtos
          </h2>
          {loading ? (
            <p style={{ color: "#9099ab" }}>Carregando...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.top_produtos ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis type="number" stroke="#9099ab" />
                <YAxis
                  type="category"
                  dataKey="Produto"
                  stroke="#9099ab"
                  width={160}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number) => formatMoeda(Number(v))}
                  contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }}
                />
                <Bar dataKey="total_vendas" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top clientes */}
      <div style={panel}>
        <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
          Top 10 clientes
        </h2>
        {loading ? (
          <p style={{ color: "#9099ab" }}>Carregando...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#9099ab" }}>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  Cliente
                </th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  CPF/CNPJ
                </th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  Pedidos
                </th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(data?.top_clientes ?? []).map((c) => (
                <tr key={c["CPF/CNPJ"]}>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {c.Cliente}
                  </td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {c["CPF/CNPJ"]}
                  </td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {c.total_pedidos}
                  </td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {formatMoeda(Number(c.total_vendas))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
