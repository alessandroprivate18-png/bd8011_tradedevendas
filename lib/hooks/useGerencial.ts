"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type VendedorRanking = {
  Cod_Vendedor: number;
  Vendedor: string;
  total_vendas: number;
  clientes_ativos: number;
  carteira_total: number;
  cobertura_pct: number | null;
};

export type Fabricante = {
  Fabricante: string;
  total_vendas: number;
  pct: number;
};

export function useGerencial() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [ranking, setRanking] = useState<VendedorRanking[]>([]);
  const [fabricantes, setFabricantes] = useState<Fabricante[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const [rankingRes, fabricantesRes] = await Promise.all([
      supabase.rpc("ranking_vendedores_query", {
        p_data_inicio: dataInicio || null,
        p_data_fim: dataFim || null,
      }),
      supabase.rpc("participacao_fabricantes_query", {
        p_data_inicio: dataInicio || null,
        p_data_fim: dataFim || null,
        p_limite: 6,
      }),
    ]);

    if (rankingRes.error || fabricantesRes.error) {
      setErro(rankingRes.error?.message || fabricantesRes.error?.message || "Erro ao carregar");
    } else {
      setRanking((rankingRes.data as VendedorRanking[]) ?? []);
      setFabricantes((fabricantesRes.data as Fabricante[]) ?? []);
    }
    setLoading(false);
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    ranking,
    fabricantes,
    loading,
    erro,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
  };
}
