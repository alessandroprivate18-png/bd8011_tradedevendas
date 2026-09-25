"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type RedeRanking = {
  rede: string;
  lojas_cadastradas: number;
  lojas_ativas: number;
  total_vendas: number;
  pedidos: number;
  ticket_medio: number | null;
  total_ano_anterior: number | null;
  variacao_yoy_pct: number | null;
};

export type MesRedes = {
  mes: string;
  total_vendas: number;
  total_ano_anterior: number | null;
  variacao_yoy_pct: number | null;
};

export type KpisRedes = {
  total_vendas: number;
  total_ano_anterior: number | null;
  variacao_yoy_pct: number | null;
  redes_ativas: number;
};

export type LojaRede = {
  cliente: string;
  cpf_cnpj: string;
  nome_loja: string | null;
  total_vendas: number;
  pedidos: number;
  ticket_medio: number | null;
  total_ano_anterior: number | null;
  variacao_yoy_pct: number | null;
};

export function useRedes() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [kpis, setKpis] = useState<KpisRedes | null>(null);
  const [ranking, setRanking] = useState<RedeRanking[]>([]);
  const [mensal, setMensal] = useState<MesRedes[]>([]);
  const [yoyDisponivel, setYoyDisponivel] = useState(false);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("redes_query", {
      p_tipo: 1,
      p_data_inicio: dataInicio || null,
      p_data_fim: dataFim || null,
    });

    if (error) {
      setErro(error.message);
      setRanking([]);
    } else if (data) {
      const d = data as any;
      setKpis(d.kpis ?? null);
      setRanking(d.ranking ?? []);
      setMensal(d.mensal ?? []);
      setYoyDisponivel(Boolean(d.yoy_disponivel));
    }
    setLoading(false);
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const carregarLojas = useCallback(
    async (rede: string): Promise<LojaRede[]> => {
      const { data, error } = await supabase.rpc("redes_lojas_query", {
        p_rede: rede,
        p_tipo: 1,
        p_data_inicio: dataInicio || null,
        p_data_fim: dataFim || null,
      });
      if (error) throw new Error(error.message);
      return (data as LojaRede[]) ?? [];
    },
    [dataInicio, dataFim]
  );

  return {
    kpis,
    ranking,
    mensal,
    yoyDisponivel,
    loading,
    erro,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    carregarLojas,
  };
}
