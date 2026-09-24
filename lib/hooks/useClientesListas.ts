"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ClienteAlvo = {
  ID_CLIENTE: number;
  cliente: string;
  vendedor: string | null;
  cidade: string | null;
  ultima_compra: string | null;
  valor_medio: number | null;
  dias_sem_comprar?: number;
};

export function useClientesListas(dataInicio: string, dataFim: string) {
  const [naoPositivados, setNaoPositivados] = useState<ClienteAlvo[]>([]);
  const [totalNaoPositivados, setTotalNaoPositivados] = useState(0);
  const [inativos, setInativos] = useState<ClienteAlvo[]>([]);
  const [totalInativos, setTotalInativos] = useState(0);
  const [diasInativo, setDiasInativo] = useState(60);
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);

    const [npRes, inRes] = await Promise.all([
      supabase.rpc("clientes_nao_positivados_query", {
        p_data_inicio: dataInicio || null,
        p_data_fim: dataFim || null,
        p_limite: 50,
      }),
      supabase.rpc("clientes_inativos_query", {
        p_dias_minimo: diasInativo,
        p_limite: 50,
      }),
    ]);

    if (npRes.data) {
      const d = npRes.data as any;
      setNaoPositivados(d.clientes ?? []);
      setTotalNaoPositivados(d.total ?? 0);
    }
    if (inRes.data) {
      const d = inRes.data as any;
      setInativos(d.clientes ?? []);
      setTotalInativos(d.total ?? 0);
    }
    setLoading(false);
  }, [dataInicio, dataFim, diasInativo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    naoPositivados,
    totalNaoPositivados,
    inativos,
    totalInativos,
    diasInativo,
    setDiasInativo,
    loading,
  };
}
