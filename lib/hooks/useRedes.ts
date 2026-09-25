"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { FiltroAvancadoValor } from "@/components/FiltroAvancado";

export type RedeRanking = {
  rede: string;
  lojas_cadastradas: number;
  lojas_ativas: number;
  total_vendas: number;
  pedidos: number;
  ticket_medio: number | null;
};

export type KpisRedes = {
  total_vendas: number;
  redes_ativas: number;
};

export type LojaRede = {
  cliente: string;
  cpf_cnpj: string;
  codigo_cliente: number;
  bairro: string | null;
  cidade: string | null;
  total_vendas: number;
  pedidos: number;
  volume: number;
  qt_skus: number;
  ticket_medio: number | null;
};

export const FILTRO_REDES_PADRAO: FiltroAvancadoValor = {
  anos: [2026],
  meses: [],
  codFabricantes: [],
  tipo: "1",
};

// Ranking + KPIs, dirigido pelo filtro avancado (Tipo/Ano/Mes/Fabricante).
// Cada tela que usa esse hook tem seu proprio estado de filtro, independente.
export function useRedesRanking(filtroInicial: FiltroAvancadoValor = FILTRO_REDES_PADRAO) {
  const [filtro, setFiltro] = useState<FiltroAvancadoValor>(filtroInicial);
  const [kpis, setKpis] = useState<KpisRedes | null>(null);
  const [ranking, setRanking] = useState<RedeRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("redes_ranking_query", {
      p_anos: filtro.anos.length > 0 ? filtro.anos : null,
      p_meses: filtro.meses.length > 0 ? filtro.meses : null,
      p_cod_fabricantes: filtro.codFabricantes.length > 0 ? filtro.codFabricantes : null,
      p_tipo: filtro.tipo ? Number(filtro.tipo) : 1,
    });

    if (error) {
      setErro(error.message);
      setRanking([]);
    } else if (data) {
      const d = data as any;
      setKpis(d.kpis ?? null);
      setRanking(d.ranking ?? []);
    }
    setLoading(false);
  }, [filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { filtro, setFiltro, kpis, ranking, loading, erro };
}

// Drill-down: lojas (CNPJs) de uma rede especifica, sob demanda (ao expandir
// uma linha). Recebe o MESMO filtro do painel pai, para os totais baterem.
export function useLojasDeRede() {
  const carregarLojas = useCallback(
    async (rede: string, filtro: FiltroAvancadoValor): Promise<LojaRede[]> => {
      const { data, error } = await supabase.rpc("redes_lojas_query", {
        p_rede: rede,
        p_anos: filtro.anos.length > 0 ? filtro.anos : null,
        p_meses: filtro.meses.length > 0 ? filtro.meses : null,
        p_cod_fabricantes: filtro.codFabricantes.length > 0 ? filtro.codFabricantes : null,
        p_tipo: filtro.tipo ? Number(filtro.tipo) : 1,
      });
      if (error) throw new Error(error.message);
      return (data as LojaRede[]) ?? [];
    },
    []
  );

  return { carregarLojas };
}
