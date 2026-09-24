"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { DashboardData, Filtros } from "@/lib/types";

const FILTROS_INICIAIS: Filtros = {
  dataInicio: "",
  dataFim: "",
  supervisor: "",
  ramo: "",
  fabricante: "",
  codFabricante: "",
  clienteBusca: "",
  tipoVenda: "1", // Venda e o padrao ao abrir o dashboard
  codVendedor: "",
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // "filtros" é o que está nos campos na tela (reage ao digitar/selecionar).
  // "filtrosAplicados" é o que realmente foi usado na última consulta —
  // só muda quando o usuário clica em "Pesquisar" ou "Limpar filtros".
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] = useState<Filtros>(FILTROS_INICIAIS);

  // Cód. Vendedor filtra localmente a lista de vendedores já carregada,
  // então continua "ao vivo" sem gerar uma nova consulta no banco.
  const [vendedorDebounced, setVendedorDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setVendedorDebounced(filtros.codVendedor), 400);
    return () => clearTimeout(t);
  }, [filtros.codVendedor]);

  // Guarda de requisição: se, por algum motivo, duas consultas ficarem
  // em andamento ao mesmo tempo, só o resultado da mais recente é aplicado.
  const requestIdRef = useRef(0);

  const carregarDados = useCallback(async () => {
    if (
      filtrosAplicados.dataInicio &&
      filtrosAplicados.dataFim &&
      filtrosAplicados.dataInicio > filtrosAplicados.dataFim
    ) {
      setErro("A data inicial não pode ser depois da data final.");
      return;
    }

    const idDaChamada = ++requestIdRef.current;
    setLoading(true);
    setErro(null);

    try {
      const { data: result, error } = await supabase.rpc("dashboard_query", {
        p_tipo: filtrosAplicados.tipoVenda ? Number(filtrosAplicados.tipoVenda) : 1,
        p_data_inicio: filtrosAplicados.dataInicio || null,
        p_data_fim: filtrosAplicados.dataFim || null,
        p_supervisor: filtrosAplicados.supervisor || null,
        p_ramo: filtrosAplicados.ramo || null,
        p_fabricante: filtrosAplicados.fabricante || null,
        p_cod_fabricante: filtrosAplicados.codFabricante
          ? Number(filtrosAplicados.codFabricante)
          : null,
        p_cliente: filtrosAplicados.clienteBusca || null,
      });

      if (idDaChamada !== requestIdRef.current) return;

      if (error) {
        setData(null);
        if (
          error.code === "57014" ||
          error.message?.toLowerCase().includes("timeout")
        ) {
          setErro(
            "⚠️ A consulta atingiu o tempo limite. Tente um período menor, ou aplique menos filtros de uma vez."
          );
        } else {
          setErro(error.message);
        }
      } else if (result) {
        setData(result as DashboardData);
      }
    } catch (e: unknown) {
      if (idDaChamada !== requestIdRef.current) return;
      setData(null);
      setErro(
        e instanceof Error
          ? e.message
          : "Não foi possível carregar os dados. Verifique a conexão com o Supabase."
      );
    } finally {
      if (idDaChamada === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [filtrosAplicados]);

  // Roda uma vez ao montar (com os filtros iniciais) e de novo toda vez
  // que "filtrosAplicados" mudar — ou seja, quando o usuário confirmar
  // a busca ou limpar os filtros. Nunca a cada tecla digitada.
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const buscar = useCallback(() => {
    setFiltrosAplicados(filtros);
  }, [filtros]);

  const limparFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIAIS);
    setFiltrosAplicados(FILTROS_INICIAIS);
  }, []);

  const dadosFiltrados = useMemo(() => {
    if (!data) return null;
    if (!vendedorDebounced) return data;

    const termo = vendedorDebounced.toLowerCase().trim();
    const topVendedores = data.top_vendedores.filter((v) =>
      v.Vendedor.toLowerCase().includes(termo)
    );

    return {
      ...data,
      top_vendedores: topVendedores,
    };
  }, [data, vendedorDebounced]);

  const kpis = useMemo(
    () =>
      dadosFiltrados?.kpis ?? {
        total_vendas: 0,
        total_pedidos: 0,
        clientes_ativos: 0,
        clientes_cadastrados: 0,
        cobertura_pct: 0,
      },
    [dadosFiltrados]
  );

  const ticketMedio = useMemo(
    () => (kpis.total_pedidos > 0 ? kpis.total_vendas / kpis.total_pedidos : 0),
    [kpis]
  );

  const temFiltrosAtivos = useMemo(
    () =>
      Boolean(
        filtros.dataInicio ||
          filtros.dataFim ||
          filtros.supervisor ||
          filtros.ramo ||
          filtros.fabricante ||
          filtros.codFabricante ||
          filtros.tipoVenda !== "1" ||
          filtros.codVendedor ||
          filtros.clienteBusca
      ),
    [filtros]
  );

  // Indica se há mudanças nos campos que ainda não foram buscadas —
  // usado pra destacar visualmente o botão "Pesquisar".
  const temFiltrosPendentes = useMemo(() => {
    const chaves: (keyof Filtros)[] = [
      "dataInicio",
      "dataFim",
      "supervisor",
      "ramo",
      "fabricante",
      "codFabricante",
      "clienteBusca",
      "tipoVenda",
    ];
    return chaves.some((chave) => filtros[chave] !== filtrosAplicados[chave]);
  }, [filtros, filtrosAplicados]);

  return {
    data: dadosFiltrados,
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
    carregarDados,
  };
}
