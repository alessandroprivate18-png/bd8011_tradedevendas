"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  tipoVenda: "",
  codVendedor: "",
};

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);

  // Debounce da busca por cliente (aceita Nome ou Código)
  const [clienteDebounced, setClienteDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setClienteDebounced(filtros.clienteBusca.trim()), 400);
    return () => clearTimeout(t);
  }, [filtros.clienteBusca]);

  // Debounce do vendedor (código ou nome)
  const [vendedorDebounced, setVendedorDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setVendedorDebounced(filtros.codVendedor.trim()), 350);
    return () => clearTimeout(t);
  }, [filtros.codVendedor]);

  const carregarDados = useCallback(async () => {
    setLoading(true);
    setErro(null);

    let cancelled = false;

    try {
      const fabFiltro = filtros.codFabricante || filtros.fabricante || null;

      const { data: result, error } = await supabase.rpc("dashboard_query", {
        p_data_inicio: filtros.dataInicio || null,
        p_data_fim: filtros.dataFim || null,
        p_supervisor: filtros.supervisor || null,
        p_ramo: filtros.ramo || null,
        p_fabricante: fabFiltro,
        p_cliente: clienteDebounced || null,
        p_tipo: filtros.tipoVenda ? Number(filtros.tipoVenda) : null,
      });

      if (!cancelled) {
        if (error) {
          if (
            error.code === "57014" ||
            error.message?.toLowerCase().includes("timeout")
          ) {
            setErro(
              "⚠️ Limite de tempo atingido no Supabase. O banco de dados precisa do índice na coluna Data para responder rápido."
            );
          } else {
            setErro(error.message);
          }
        } else if (result) {
          setData(result as DashboardData);
        }
      }
    } catch (e: unknown) {
      if (!cancelled) {
        setErro(
          e instanceof Error
            ? e.message
            : "Falha na conexão com o Supabase."
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [
    filtros.dataInicio,
    filtros.dataFim,
    filtros.supervisor,
    filtros.ramo,
    filtros.fabricante,
    filtros.codFabricante,
    filtros.tipoVenda,
    clienteDebounced,
  ]);

  useEffect(() => {
    const cleanup = carregarDados();
    return () => {
      cleanup.then((fn) => fn?.());
    };
  }, [carregarDados]);

  // Filtra em memória se o usuário digitou nome ou código de vendedor
  const dadosFiltrados = useMemo(() => {
    if (!data) return null;
    if (!vendedorDebounced) return data;

    const termo = vendedorDebounced.toLowerCase();
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
        cobertura_pct: null,
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
