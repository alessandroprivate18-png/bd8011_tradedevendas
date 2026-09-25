"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type ClienteRoteiro = {
  Cod_Cliente: number;
  cliente: string;
  cidade: string | null;
  rede: string | null;
  ultima_compra: string | null;
  valor_medio: number | null;
  proxima_visita: string;
  status: "Positivado" | "Pendente";
  status_fabricante: "Positivado" | "Pendente" | null;
};

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function useRoteiro() {
  const [dia, setDia] = useState(hoje());
  const [busca, setBusca] = useState("");
  const [cidade, setCidade] = useState("");
  const [codFabricantes, setCodFabricantes] = useState<number[]>([]);
  const [clientes, setClientes] = useState<ClienteRoteiro[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc("roteiro_cidades_disponiveis").then(({ data }) => {
      if (data) setCidades(data as string[]);
    });
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);

    const { data, error } = await supabase.rpc("roteiro_do_dia_query", {
      p_data: dia,
      p_cidade: cidade || null,
      p_busca: busca || null,
      p_cod_fabricantes: codFabricantes.length > 0 ? codFabricantes : null,
    });

    if (error) {
      setErro(error.message);
      setClientes([]);
    } else {
      setClientes((data as ClienteRoteiro[]) ?? []);
    }
    setLoading(false);
  }, [dia, cidade, busca, codFabricantes]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return {
    dia,
    setDia,
    busca,
    setBusca,
    cidade,
    setCidade,
    cidades,
    codFabricantes,
    setCodFabricantes,
    clientes,
    loading,
    erro,
  };
}
