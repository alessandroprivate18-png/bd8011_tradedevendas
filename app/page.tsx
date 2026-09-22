"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { FilterBar } from "@/components/FilterBar";
import { KpiCards } from "@/components/KpiCards";
import { VendasMensalPanel } from "@/components/VendasMensalPanel";
import { TopVendedores } from "@/components/TopVendedores";
import { TopProdutos } from "@/components/TopProdutos";
import { TopClientes } from "@/components/TopClientes";
import { ClientesCoberturaDashboard } from "@/components/ClientesCoberturaDashboard";
import { ProdutosAnaliseDashboard } from "@/components/ProdutosAnaliseDashboard";
import { RedesDashboard } from "@/components/RedesDashboard";
import { VendasDetalheDashboard } from "@/components/VendasDetalheDashboard";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useFilterOptions } from "@/lib/hooks/useFilterOptions";
import type { ActiveTab } from "@/lib/types";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("visao-geral");
  const { filterOptions } = useFilterOptions();
  const {
    data,
    loading,
    erro,
    kpis,
    ticketMedio,
    filtros,
    setFiltros,
    temFiltrosAtivos,
    limparFiltros,
    carregarDados,
  } = useDashboard();

  // Título e subtítulo dinâmico por aba
  const titulos = {
    "visao-geral": {
      titulo: "Visão Geral do Negócio",
      subtitulo: "Indicadores executivos, vendas mensais e principais rankings comerciais",
    },
    vendas: {
      titulo: "Análise de Vendas & Operações",
      subtitulo: "Performance de vendas por tipo de movimento (Venda, Troca, Bonificação, Consignado...)",
    },
    clientes: {
      titulo: "Cobertura de Clientes & Positivação Diária",
      subtitulo: "Acompanhamento diário de cobertura de carteira, clientes ativos e frequência",
    },
    produtos: {
      titulo: "Análise Completa de Produtos & Curva ABC",
      subtitulo: "Mix de produtos faturados, volume de caixas/unidades e concentração de receita",
    },
    redes: {
      titulo: "Gestão de Redes de Clientes (dim_bd_Redes)",
      subtitulo: "Monitoramento de lojas, filiais e redes comerciais cadastradas no Supabase",
    },
  };

  const headerInfo = titulos[activeTab] || titulos["visao-geral"];

  return (
    <DashboardLayout
      onRefreshData={carregarDados}
      refreshing={loading}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
    >
      <div className="dashboard-header-block">
        <h1 className="dashboard-title">{headerInfo.titulo}</h1>
        <p className="dashboard-subtitle">{headerInfo.subtitulo}</p>
      </div>

      {erro && (
        <div className="error-box">Erro ao carregar dados do Supabase: {erro}</div>
      )}

      {/* A barra de filtros é exibida para todas as visões exceto Redes (que possui filtros próprios de rede/loja) */}
      {activeTab !== "redes" && (
        <FilterBar
          options={filterOptions}
          filtros={filtros}
          onChange={setFiltros}
          temFiltrosAtivos={temFiltrosAtivos}
          onLimpar={limparFiltros}
        />
      )}

      {/* Aba 1: Visão Geral */}
      {activeTab === "visao-geral" && (
        <>
          <KpiCards kpis={kpis} ticketMedio={ticketMedio} loading={loading} />
          <VendasMensalPanel dados={data?.vendas_mensal} loading={loading} />
          <div className="grid-2col">
            <TopVendedores dados={data?.top_vendedores} loading={loading} />
            <TopProdutos dados={data?.top_produtos} loading={loading} />
          </div>
          <TopClientes dados={data?.top_clientes} loading={loading} />
        </>
      )}

      {/* Aba 2: Vendas */}
      {activeTab === "vendas" && (
        <VendasDetalheDashboard
          data={data}
          loading={loading}
          tipoVendaAtual={filtros.tipoVenda}
        />
      )}

      {/* Aba 3: Clientes & Cobertura Dia */}
      {activeTab === "clientes" && (
        <ClientesCoberturaDashboard data={data} loading={loading} />
      )}

      {/* Aba 4: Produtos & Curva ABC */}
      {activeTab === "produtos" && (
        <ProdutosAnaliseDashboard data={data} loading={loading} />
      )}

      {/* Aba 5: Redes de Clientes (dim_bd_Redes) */}
      {activeTab === "redes" && <RedesDashboard />}
    </DashboardLayout>
  );
}
