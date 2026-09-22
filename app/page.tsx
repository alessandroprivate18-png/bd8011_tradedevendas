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

// ---------- Tipos ----------

type VendaMensal = {
  mes: string;
  total_vendas: number;
  total_pedidos: number;
  cobertura_pct: number | null;
  crescimento_pct: number | null;
  cobertura_crescimento_pp: number | null;
};

type TopVendedor = { Vendedor: string; total_vendas: number; total_pedidos: number };
type TopProduto = { Produto: string; qtd_total: number; total_vendas: number };
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
    clientes_cadastrados: number;
    cobertura_pct: number;
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
  fabricantes_codigo: { codigo: number; nome: string }[];
  tipos: { valor: number; nome: string }[];
};

type Usuario = {
  nome: string;
  supervisor: string | null;
  cod_supervisor: number | null;
  cod_vendedor: number | null;
};

// ---------- Estilos ----------

function formatMoeda(v: number) {
  return (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const card: React.CSSProperties = {
  background: "#171a23",
  borderRadius: 12,
  padding: "20px 24px",
  flex: 1,
  minWidth: 180,
  border: "1px solid #2a2e3a",
};
const cardTitle: React.CSSProperties = {
  fontSize: 13,
  color: "#9099ab",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};
const cardValue: React.CSSProperties = { fontSize: 26, fontWeight: 700 };
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
const inputStyle: React.CSSProperties = { ...selectStyle, minWidth: 220 };
const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#9099ab",
  marginBottom: 4,
};

const AUTH_KEY = "dashboard_vendas_auth";

// ---------- Tela de login ----------

function TelaLogin({ onLogin }: { onLogin: (u: Usuario) => void }) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    const { data, error } = await supabase.rpc("verificar_login", {
      p_usuario: usuario,
      p_senha: senha,
    });

    setCarregando(false);

    if (error || !data?.sucesso) {
      setErro(data?.mensagem || "Não foi possível entrar. Tente novamente.");
      return;
    }

    const perfil: Usuario = {
      nome: data.nome,
      supervisor: data.supervisor,
      cod_supervisor: data.cod_supervisor,
      cod_vendedor: data.cod_vendedor,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(perfil));
    onLogin(perfil);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1117",
      }}
    >
      <form
        onSubmit={entrar}
        style={{
          background: "#171a23",
          border: "1px solid #2a2e3a",
          borderRadius: 12,
          padding: 32,
          width: 320,
        }}
      >
        <h1 style={{ fontSize: 20, marginBottom: 4, color: "#e6e6e6" }}>Dashboard de Vendas</h1>
        <p style={{ color: "#9099ab", fontSize: 13, marginBottom: 24 }}>Entre com seu usuário</p>

        <label style={label}>Usuário (nome, apelido ou e-mail)</label>
        <input
          type="text"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          style={{ ...inputStyle, width: "100%", marginBottom: 16, boxSizing: "border-box" }}
          autoFocus
        />

        <label style={label}>Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{ ...inputStyle, width: "100%", marginBottom: 16, boxSizing: "border-box" }}
        />

        {erro && (
          <p style={{ color: "#ff9aa6", fontSize: 13, marginBottom: 12 }}>{erro}</p>
        )}

        <button
          type="submit"
          disabled={carregando}
          style={{
            width: "100%",
            background: "#4f8cff",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 0",
            fontWeight: 600,
            cursor: carregando ? "default" : "pointer",
            opacity: carregando ? 0.7 : 1,
          }}
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

// ---------- Painel principal ----------

function Painel({ usuario, onSair }: { usuario: Usuario; onSair: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    supervisores: [],
    ramos: [],
    fabricantes: [],
    fabricantes_codigo: [],
    tipos: [],
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [tipo, setTipo] = useState("1");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [ramo, setRamo] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [codFabricante, setCodFabricante] = useState("");
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteDebounced, setClienteDebounced] = useState("");

  useEffect(() => {
    async function carregarOpcoes() {
      const { data: opts, error } = await supabase.rpc("dashboard_filter_options");
      if (!error && opts) setFilterOptions(opts as FilterOptions);
    }
    carregarOpcoes();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setClienteDebounced(clienteBusca), 500);
    return () => clearTimeout(t);
  }, [clienteBusca]);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data: result, error } = await supabase.rpc("dashboard_query", {
      p_tipo: Number(tipo) || 1,
      p_data_inicio: dataInicio || null,
      p_data_fim: dataFim || null,
      p_supervisor: supervisor || null,
      p_ramo: ramo || null,
      p_fabricante: fabricante || null,
      p_cod_fabricante: codFabricante ? Number(codFabricante) : null,
      p_cliente: clienteDebounced || null,
    });

    if (error) {
      setErro(error.message);
    } else {
      setData(result as DashboardData);
    }
    setLoading(false);
  }, [tipo, dataInicio, dataFim, supervisor, ramo, fabricante, codFabricante, clienteDebounced]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const kpis = data?.kpis ?? {
    total_vendas: 0,
    total_pedidos: 0,
    clientes_ativos: 0,
    clientes_cadastrados: 0,
    cobertura_pct: 0,
  };
  const ticketMedio = kpis.total_pedidos > 0 ? kpis.total_vendas / kpis.total_pedidos : 0;

  const temFiltrosExtras =
    dataInicio || dataFim || supervisor || ramo || fabricante || codFabricante || clienteDebounced;

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
    setSupervisor("");
    setRamo("");
    setFabricante("");
    setCodFabricante("");
    setClienteBusca("");
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 4 }}>Dashboard de Vendas</h1>
          <p style={{ color: "#9099ab" }}>Dados consolidados direto do Supabase</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "#9099ab", fontSize: 13, marginBottom: 4 }}>{usuario.nome}</p>
          <button
            onClick={onSair}
            style={{
              background: "transparent",
              color: "#9099ab",
              border: "1px solid #2a2e3a",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Sair
          </button>
        </div>
      </div>

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
          {erro.includes("timeout")
            ? "O período selecionado contém muitos registros e atingiu o limite de tempo do banco. Dica: selecione um intervalo menor (ex: 7 a 15 dias) para carregar os dados instantaneamente."
            : `Erro ao carregar dados: ${erro}`}
        </div>
      )}

      {/* Filtros */}
      <div style={{ ...panel, marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={label}>Data inicial</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={selectStyle} />
          </div>
          <div>
            <label style={label}>Data final</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={selectStyle} />
          </div>

          <div>
            <label style={{ ...label, color: "#4f8cff" }}>Tipo de Venda</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={selectStyle}>
              {filterOptions.tipos.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.valor} - {t.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Supervisor</label>
            <select value={supervisor} onChange={(e) => setSupervisor(e.target.value)} style={selectStyle}>
              <option value="">Todos</option>
              {filterOptions.supervisores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Ramo de atividade</label>
            <select value={ramo} onChange={(e) => setRamo(e.target.value)} style={selectStyle}>
              <option value="">Todos</option>
              {filterOptions.ramos.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Fabricante</label>
            <select value={fabricante} onChange={(e) => setFabricante(e.target.value)} style={selectStyle}>
              <option value="">Todos</option>
              {filterOptions.fabricantes.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Cód. Fabricante</label>
            <select value={codFabricante} onChange={(e) => setCodFabricante(e.target.value)} style={selectStyle}>
              <option value="">Todos</option>
              {filterOptions.fabricantes_codigo.map((f) => (
                <option key={f.codigo} value={f.codigo}>{f.codigo} - {f.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Buscar cliente (nome ou código)</label>
            <input
              type="text"
              placeholder="Ex: 650021 ou Mercado..."
              value={clienteBusca}
              onChange={(e) => setClienteBusca(e.target.value)}
              style={inputStyle}
            />
          </div>

          {temFiltrosExtras && (
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
          <div style={cardTitle}>Ticket médio</div>
          <div style={cardValue}>{formatMoeda(ticketMedio)}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Clientes ativos</div>
          <div style={cardValue}>{kpis.clientes_ativos.toLocaleString("pt-BR")}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Cobertura de clientes</div>
          <div style={cardValue}>{kpis.cobertura_pct}%</div>
          <div style={{ fontSize: 12, color: "#9099ab", marginTop: 4 }}>
            {kpis.clientes_ativos.toLocaleString("pt-BR")} de {kpis.clientes_cadastrados.toLocaleString("pt-BR")} cadastrados
          </div>
        </div>
      </div>

      {/* Vendas por mes */}
      <div style={panel}>
        <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>Vendas por mês</h2>
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
                  formatter={(v: number, name: string) => (name === "total_vendas" ? formatMoeda(Number(v)) : v)}
                  contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }}
                />
                <Line type="monotone" dataKey="total_vendas" stroke="#4f8cff" strokeWidth={2} dot={false} name="Total vendido" />
              </LineChart>
            </ResponsiveContainer>

            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "#9099ab" }}>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Mês</th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Total vendido</th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Pedidos</th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Crescimento</th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Cobertura</th>
                    <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Cobertura (var.)</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.vendas_mensal ?? []).map((v) => (
                    <tr key={v.mes}>
                      <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>{v.mes}</td>
                      <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>{formatMoeda(v.total_vendas)}</td>
                      <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>{v.total_pedidos}</td>
                      <td
                        style={{
                          padding: "8px 4px",
                          borderBottom: "1px solid #21242e",
                          color: v.crescimento_pct == null ? "#9099ab" : v.crescimento_pct >= 0 ? "#34d399" : "#ff9aa6",
                        }}
                      >
                        {v.crescimento_pct == null ? "—" : `${v.crescimento_pct > 0 ? "+" : ""}${v.crescimento_pct}%`}
                      </td>
                      <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                        {v.cobertura_pct == null ? "—" : `${v.cobertura_pct}%`}
                      </td>
                      <td
                        style={{
                          padding: "8px 4px",
                          borderBottom: "1px solid #21242e",
                          color:
                            v.cobertura_crescimento_pp == null
                              ? "#9099ab"
                              : v.cobertura_crescimento_pp >= 0
                              ? "#34d399"
                              : "#ff9aa6",
                        }}
                      >
                        {v.cobertura_crescimento_pp == null
                          ? "—"
                          : `${v.cobertura_crescimento_pp > 0 ? "+" : ""}${v.cobertura_crescimento_pp} p.p.`}
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
        <div style={{ ...panel, flex: 1, minWidth: 320 }}>
          <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>Top 10 vendedores</h2>
          {loading ? (
            <p style={{ color: "#9099ab" }}>Carregando...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.top_vendedores ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis type="number" stroke="#9099ab" />
                <YAxis type="category" dataKey="Vendedor" stroke="#9099ab" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatMoeda(Number(v))} contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }} />
                <Bar dataKey="total_vendas" fill="#4f8cff" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ ...panel, flex: 1, minWidth: 320 }}>
          <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>Top 10 produtos</h2>
          {loading ? (
            <p style={{ color: "#9099ab" }}>Carregando...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.top_produtos ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis type="number" stroke="#9099ab" />
                <YAxis type="category" dataKey="Produto" stroke="#9099ab" width={160} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => formatMoeda(Number(v))} contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }} />
                <Bar dataKey="total_vendas" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={panel}>
        <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>Top 10 clientes</h2>
        {loading ? (
          <p style={{ color: "#9099ab" }}>Carregando...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#9099ab" }}>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Cliente</th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>CPF/CNPJ</th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Pedidos</th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(data?.top_clientes ?? []).map((c) => (
                <tr key={c["CPF/CNPJ"]}>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>{c.Cliente}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>{c["CPF/CNPJ"]}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>{c.total_pedidos}</td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>{formatMoeda(Number(c.total_vendas))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}

// ---------- Componente raiz (controla login) ----------

export default function DashboardPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  useEffect(() => {
    const salvo = localStorage.getItem(AUTH_KEY);
    if (salvo) {
      try {
        setUsuario(JSON.parse(salvo));
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }
    setCarregandoSessao(false);
  }, []);

  function sair() {
    localStorage.removeItem(AUTH_KEY);
    setUsuario(null);
  }

  if (carregandoSessao) {
    return <div style={{ minHeight: "100vh", background: "#0f1117" }} />;
  }

  if (!usuario) {
    return <TelaLogin onLogin={setUsuario} />;
  }

  return <Painel usuario={usuario} onSair={sair} />;
}
