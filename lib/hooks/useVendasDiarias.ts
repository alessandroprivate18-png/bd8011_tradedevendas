"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type VendaDiaria = {
  dia: string;
  total_vendas: number;
  pedidos: number;
  clientes_atendidos: number;
};

export type AtendimentoVendedor = {
  dia: string;
  Vendedor: string;
  Cod_Vendedor: number;
  clientes_atendidos: number;
  pedidos: number;
  total_vendas: number;
  qtde_roteirizada: number | null;
  pct_roteirizado: number | null;
};

export type VendasDiariasFiltros = {
  dataInicio: string;
  dataFim: string;
  supervisor: string;
  vendedorBusca: string;
  codFabricante: string;
};

const FILTROS_INICIAIS: VendasDiariasFiltros = {
  dataInicio: "",
  dataFim: "",
  supervisor: "",
  vendedorBusca: "",
  codFabricante: "",
};

export function useVendasDiarias() {
  const [vendasDiarias, setVendasDiarias] = useState<VendaDiaria[]>([]);
  const [porVendedor, setPorVendedor] = useState<AtendimentoVendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtros, setFiltros] = useState<VendasDiariasFiltros>(FILTROS_INICIAIS);
  const [filtrosAplicados, setFiltrosAplicados] =
    useState<VendasDiariasFiltros>(FILTROS_INICIAIS);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("vendas_diarias_query", {
      p_tipo: 1,
      p_data_inicio: filtrosAplicados.dataInicio || null,
      p_data_fim: filtrosAplicados.dataFim || null,
      p_supervisor: filtrosAplicados.supervisor || null,
      p_vendedor: filtrosAplicados.vendedorBusca || null,
      p_cod_fabricante: filtrosAplicados.codFabricante
        ? Number(filtrosAplicados.codFabricante)
        : null,
    });

    if (error) {
      setErro(error.message);
      setVendasDiarias([]);
      setPorVendedor([]);
    } else if (data) {
      const result = data as any;
      setVendasDiarias(result.vendas_diarias ?? []);
      setPorVendedor(result.por_vendedor ?? []);
    }
    setLoading(false);
  }, [filtrosAplicados]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const buscar = useCallback(() => setFiltrosAplicados(filtros), [filtros]);
  const limpar = useCallback(() => {
    setFiltros(FILTROS_INICIAIS);
    setFiltrosAplicados(FILTROS_INICIAIS);
  }, []);

  return {
    vendasDiarias,
    porVendedor,
    loading,
    erro,
    filtros,
    setFiltros,
    buscar,
    limpar,
  };
}
