"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Rede = {
  Rede: string;
  qtd_lojas: number;
  lojas_ativas: number;
  total_vendas: number;
  total_pedidos: number;
  yoy_pct: number | null;
};

export function useRedes() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [redes, setRedes] = useState<Rede[]>([]);
  const [totalRedes, setTotalRedes] = useState(0);
  const [totalLojas, setTotalLojas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("redes_query", {
      p_data_inicio: dataInicio || null,
      p_data_fim: dataFim || null,
    });

    if (error) {
      setErro(error.message);
      setRedes([]);
    } else if (data) {
      const d = data as any;
      setRedes(d.redes ?? []);
      setTotalRedes(d.total_redes ?? 0);
      setTotalLojas(d.total_lojas ?? 0);
    }
    setLoading(false);
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    redes,
    totalRedes,
    totalLojas,
    loading,
    erro,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
  };
}
