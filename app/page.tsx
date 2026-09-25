"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FilterBar } from "@/components/FilterBar";
import { KpiCards } from "@/components/KpiCards";
import { VendasMensalPanel } from "@/components/VendasMensalPanel";
import { VendasDiariasPanel } from "@/components/VendasDiariasPanel";
import { PerformanceDiariaPanel } from "@/components/PerformanceDiariaPanel";
import { CoberturaPanel } from "@/components/CoberturaPanel";
import { GerencialPanel } from "@/components/GerencialPanel";
import { RoteiroVendedorPanel } from "@/components/RoteiroVendedorPanel";
import { ProdutosCurvaABC } from "@/components/ProdutosCurvaABC";
import { RedesDashboard } from "@/components/RedesDashboard";
import { TopVendedores } from "@/components/TopVendedores";
import { TopProdutos } from "@/components/TopProdutos";
import { TopClientes } from "@/components/TopClientes";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useFilterOptions } from "@/lib/hooks/useFilterOptions";
import type { ActiveTab } from "@/lib/types";

const AUTH_KEY = "dashboard_vendas_auth";

type Usuario = {
  nome: string;
  supervisor: string | null;
  cod_supervisor: number | null;
  cod_vendedor: number | null;
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  color: "#9099ab",
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  background: "#171a23",
  color: "#e6e6e6",
  border: "1px solid #2a2e3a",
  borderRadius: 8,
  padding: "8px 12px",
  minWidth: 220,
};

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
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f1117",
        padding: "24px 16px",
      }}
    >
      <img
        src="/logo-serido.png"
        alt="Seridó Distribuidora"
        style={{
          width: 190,
          maxWidth: "70%",
          height: "auto",
          marginBottom: 32,
          filter: "drop-shadow(0 8px 24px rgba(41,171,226,0.18))",
        }}
      />

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

        {erro && <p style={{ color: "#ff9aa6", fontSize: 13, marginBottom: 12 }}>{erro}</p>}

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

// ---------- Aba "Visão Geral" (agora com secao Gerencial no fim) ----------

function VisaoGeral() {
  const {
    data,
    loading,
    erro,
    kpis,
    ticketMedio,
    filtros,
    setFiltros,
    temFiltrosAtivos,
    temFiltrosPendentes,
    buscar,
    limparFiltros,
  } = useDashboard();
  const { filterOptions } = useFilterOptions();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Visão Geral do Negócio</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Indicadores executivos, vendas mensais e principais rankings comerciais
        </p>
      </div>

      {erro && (
        <div
          className="panel"
          style={{ borderColor: "#7a2f38", color: "#ff9aa6", marginBottom: 20 }}
        >
          {erro}
        </div>
      )}

      <FilterBar
        options={filterOptions}
        filtros={filtros}
        onChange={setFiltros}
        temFiltrosAtivos={temFiltrosAtivos}
        temFiltrosPendentes={temFiltrosPendentes}
        onBuscar={buscar}
        onLimpar={limparFiltros}
      />

      <KpiCards kpis={kpis} ticketMedio={ticketMedio} loading={loading} />

      <div style={{ marginTop: 24 }}>
        <VendasMensalPanel dados={data?.vendas_mensal} loading={loading} />
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 24 }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <TopVendedores dados={data?.top_vendedores} loading={loading} />
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <TopProdutos dados={data?.top_produtos} loading={loading} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <TopClientes dados={data?.top_clientes} loading={loading} />
      </div>
    </>
  );
}

// ---------- Aba "Gerencial" ----------

function AbaGerencial() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Gerencial</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Ranking de vendedores e participação por fornecedor
        </p>
      </div>
      <GerencialPanel />
    </>
  );
}

// ---------- Aba "Roteiro" ----------

function AbaRoteiro() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Roteiro</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Roteiro do vendedor para o dia
        </p>
      </div>
      <RoteiroVendedorPanel />
    </>
  );
}

// ---------- Aba "Vendas" (performance diaria + atendimento por vendedor) ----------

function AbaVendas() {
  const { filterOptions } = useFilterOptions();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Vendas</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Performance diária, vendas por dia e clientes atendidos por vendedor
        </p>
      </div>
      <PerformanceDiariaPanel />
      <div style={{ marginTop: 40, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, marginBottom: 4 }}>Atendimento por vendedor</h2>
      </div>
      <VendasDiariasPanel filterOptions={filterOptions} />
    </>
  );
}

// ---------- Aba "Clientes" (cobertura + roteiro) ----------

function AbaClientes() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Clientes</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Cobertura de clientes e roteiro do vendedor
        </p>
      </div>
      <CoberturaPanel />
    </>
  );
}

// ---------- Aba "Produtos" (curva ABC) ----------

function AbaProdutos() {
  const { filterOptions } = useFilterOptions();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Produtos</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Curva ABC — quais produtos concentram o faturamento
        </p>
      </div>
      <ProdutosCurvaABC filterOptions={filterOptions} />
    </>
  );
}

function AbaRedes() {
  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 4 }}>Redes (dim_bd_Redes)</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Ranking de redes, lojas e comparativo Year over Year
        </p>
      </div>
      <RedesDashboard />
    </>
  );
}

function EmBreve({ titulo }: { titulo: string }) {
  return (
    <div className="panel" style={{ textAlign: "center", padding: "48px 24px" }}>
      <h2 style={{ marginBottom: 8 }}>{titulo}</h2>
      <p style={{ color: "var(--color-muted)" }}>Essa aba ainda está em construção.</p>
    </div>
  );
}

// ---------- Painel principal (com sidebar) ----------

function Painel({ usuario, onSair }: { usuario: Usuario; onSair: () => void }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("visao-geral");

  return (
    <DashboardLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      usuarioNome={usuario.nome}
      onSair={onSair}
    >
      {activeTab === "visao-geral" && <VisaoGeral />}
      {activeTab === "vendas" && <AbaVendas />}
      {activeTab === "clientes" && <AbaClientes />}
      {activeTab === "produtos" && <AbaProdutos />}
      {activeTab === "gerencial" && <AbaGerencial />}
      {activeTab === "roteiro" && <AbaRoteiro />}
      {activeTab === "redes" && <AbaRedes />}
    </DashboardLayout>
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
