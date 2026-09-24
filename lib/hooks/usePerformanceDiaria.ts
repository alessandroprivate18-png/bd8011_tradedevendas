"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type PerformanceDiaria = {
  data: string;
  valor_vendido_dia: number;
  pedidos_dia: number;
  clientes_positivados_dia: number;
  clientes_cadastrados: number;
  meta_diaria: number | null;
  mesmo_dia_semana_anterior: number;
  tendencia_14_dias: { dia: string; total_vendas: number; qtd_total: number }[];
};

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function usePerformanceDiaria() {
  const [dataSelecionada, setDataSelecionada] = useState(hoje());
  const [dados, setDados] = useState<PerformanceDiaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("performance_diaria_query", {
      p_data: dataSelecionada,
    });

    if (error) {
      setErro(error.message);
      setDados(null);
    } else {
      setDados(data as PerformanceDiaria);
    }
    setLoading(false);
  }, [dataSelecionada]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { dados, loading, erro, dataSelecionada, setDataSelecionada };
}
