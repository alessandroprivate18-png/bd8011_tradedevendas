"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { FiltroAvancadoValor } from "@/components/FiltroAvancado";

export type CelulaMatriz = {
  codigo_fabricante: number;
  fabricante: string;
  ano: number;
  mes: number;
  total_vendas: number;
};

const FILTRO_INICIAL: FiltroAvancadoValor = {
  anos: [2025, 2026],
  meses: [],
  codFabricantes: [],
  tipo: "1",
};

export function useRedesFabricanteMatriz(rede: string) {
  const [filtro, setFiltro] = useState<FiltroAvancadoValor>(FILTRO_INICIAL);
  const [dados, setDados] = useState<CelulaMatriz[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!rede || filtro.codFabricantes.length === 0 || filtro.anos.length === 0) {
      setDados([]);
      return;
    }
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("redes_fabricante_matriz_query", {
      p_rede: rede,
      p_anos: filtro.anos,
      p_meses: filtro.meses.length > 0 ? filtro.meses : null,
      p_cod_fabricantes: filtro.codFabricantes,
      p_tipo: filtro.tipo ? Number(filtro.tipo) : 1,
    });

    if (error) {
      setErro(error.message);
      setDados([]);
    } else {
      setDados((data as CelulaMatriz[]) ?? []);
    }
    setLoading(false);
  }, [rede, filtro]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { filtro, setFiltro, dados, loading, erro };
}
