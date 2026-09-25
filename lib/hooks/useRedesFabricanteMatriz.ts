"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type CelulaMatriz = {
  codigo_fabricante: number;
  fabricante: string;
  ano: number;
  mes: number;
  total_vendas: number;
};

const ANOS_DISPONIVEIS = [2024, 2025, 2026, 2027];
export { ANOS_DISPONIVEIS };

export function useRedesFabricanteMatriz(rede: string) {
  const [anos, setAnos] = useState<number[]>([2025, 2026]);
  const [meses, setMeses] = useState<number[]>([]);
  const [codFabricantes, setCodFabricantes] = useState<number[]>([]);
  const [dados, setDados] = useState<CelulaMatriz[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (!rede || codFabricantes.length === 0 || anos.length === 0) {
      setDados([]);
      return;
    }
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("redes_fabricante_matriz_query", {
      p_rede: rede,
      p_anos: anos,
      p_meses: meses.length > 0 ? meses : null,
      p_cod_fabricantes: codFabricantes,
    });

    if (error) {
      setErro(error.message);
      setDados([]);
    } else {
      setDados((data as CelulaMatriz[]) ?? []);
    }
    setLoading(false);
  }, [rede, anos, meses, codFabricantes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    anos,
    setAnos,
    meses,
    setMeses,
    codFabricantes,
    setCodFabricantes,
    dados,
    loading,
    erro,
  };
}
