"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ProdutoABC = {
  Produto: string;
  total_vendas: number;
  qtd_total: number;
  pct: number;
  pct_acumulado: number;
  classe: "A" | "B" | "C";
};

export type ResumoClasse = {
  classe: "A" | "B" | "C";
  qtde_produtos: number;
  total_vendas: number;
  pct_faturamento: number;
};

export function useCurvaABC() {
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [codFabricantes, setCodFabricantes] = useState<number[]>([]);
  const [produtos, setProdutos] = useState<ProdutoABC[]>([]);
  const [resumo, setResumo] = useState<ResumoClasse[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("curva_abc_produtos_query", {
      p_data_inicio: dataInicio || null,
      p_data_fim: dataFim || null,
      p_cod_fabricantes: codFabricantes.length > 0 ? codFabricantes : null,
    });

    if (error) {
      setErro(error.message);
      setProdutos([]);
      setResumo([]);
    } else if (data) {
      const d = data as any;
      setProdutos(d.produtos ?? []);
      setResumo(d.resumo ?? []);
    }
    setLoading(false);
  }, [dataInicio, dataFim, codFabricantes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    produtos,
    resumo,
    loading,
    erro,
    dataInicio,
    setDataInicio,
    dataFim,
    setDataFim,
    codFabricantes,
    setCodFabricantes,
  };
}
