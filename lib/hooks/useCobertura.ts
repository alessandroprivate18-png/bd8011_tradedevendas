"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type CoberturaData = {
  clientes_ativos: number;
  clientes_cadastrados: number;
  cobertura_pct: number;
};

export function useCobertura() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [dados, setDados] = useState<CoberturaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("dashboard_query", {
      p_tipo: 1,
      p_data_inicio: dataInicio || null,
      p_data_fim: dataFim || null,
    });

    if (error) {
      setErro(error.message);
      setDados(null);
    } else if (data) {
      const kpis = (data as any).kpis;
      setDados({
        clientes_ativos: kpis.clientes_ativos,
        clientes_cadastrados: kpis.clientes_cadastrados,
        cobertura_pct: kpis.cobertura_pct,
      });
    }
    setLoading(false);
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { dados, loading, erro, dataInicio, setDataInicio, dataFim, setDataFim };
}
