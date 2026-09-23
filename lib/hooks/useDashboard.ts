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
  clienteBusca: "",
  tipoVenda: "",
  codVendedor: "",
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);

  // Debounce da busca por cliente
  const [clienteDebounced, setClienteDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setClienteDebounced(filtros.clienteBusca), 500);
    return () => clearTimeout(t);
  }, [filtros.clienteBusca]);

  // Debounce do código do vendedor
  const [vendedorDebounced, setVendedorDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setVendedorDebounced(filtros.codVendedor), 400);
    return () => clearTimeout(t);
  }, [filtros.codVendedor]);

  // Debounce das datas: evita disparar uma consulta a cada mudança
  // rápida em "Data inicial" / "Data final".
  const [dataInicioDebounced, setDataInicioDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDataInicioDebounced(filtros.dataInicio), 400);
    return () => clearTimeout(t);
  }, [filtros.dataInicio]);

  const [dataFimDebounced, setDataFimDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDataFimDebounced(filtros.dataFim), 400);
    return () => clearTimeout(t);
  }, [filtros.dataFim]);

  // Guarda de requisição: cada chamada carrega um número sequencial.
  // Se, quando a resposta voltar, já existir uma chamada mais nova em
  // andamento, essa resposta é descartada — nunca mais sobrescreve a
  // tela com dado de um período antigo.
  const requestIdRef = useRef(0);

  const carregarDados = useCallback(async () => {
    // Início depois do fim: não dispara consulta enquanto o usuário
    // ainda está ajustando o período (evita erro/timeout à toa).
    if (
      dataInicioDebounced &&
      dataFimDebounced &&
      dataInicioDebounced > dataFimDebounced
    ) {
      return;
    }

    const idDaChamada = ++requestIdRef.current;
    setLoading(true);
    setErro(null);

    try {
      const { data: result, error } = await supabase.rpc("dashboard_query", {
        p_data_inicio: dataInicioDebounced || null,
        p_data_fim: dataFimDebounced || null,
        p_supervisor: filtros.supervisor || null,
        p_ramo: filtros.ramo || null,
        p_fabricante: filtros.fabricante || null,
        p_cliente: clienteDebounced || null,
        p_tipo: filtros.tipoVenda ? Number(filtros.tipoVenda) : null,
      });

      // Essa resposta já está desatualizada — uma consulta mais nova
      // foi disparada enquanto esta estava em andamento.
      if (idDaChamada !== requestIdRef.current) return;

      if (error) {
        if (
          error.code === "57014" ||
          error.message?.toLowerCase().includes("timeout")
        ) {
          setErro(
            "⚠️ A consulta atingiu o tempo limite. Execute o script de índices no Supabase para acelerar a tabela de 590 mil linhas."
          );
        } else {
          setErro(error.message);
        }
      } else if (result) {
        setData(result as DashboardData);
      }
    } catch (e: unknown) {
      if (idDaChamada !== requestIdRef.current) return;
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
  }, [
    dataInicioDebounced,
    dataFimDebounced,
    filtros.supervisor,
    filtros.ramo,
    filtros.fabricante,
    filtros.tipoVenda,
    clienteDebounced,
  ]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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
          filtros.tipoVenda ||
          filtros.codVendedor ||
          clienteDebounced
      ),
    [filtros, clienteDebounced]
  );

  const limparFiltros = useCallback(() => {
    setFiltros(FILTROS_INICIAIS);
  }, []);

  return {
    data: dadosFiltrados,
    loading,
    erro,
    kpis,
    ticketMedio,
    filtros,
    setFiltros,
    temFiltrosAtivos,
    limparFiltros,
    carregarDados,
  };
}
