"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { FilterOptions } from "@/lib/types";

export function useFilterOptions() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    supervisores: [],
    ramos: [],
    fabricantes: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function carregarFiltros() {
      try {
        // 1. Buscar Supervisores direto da tabela dimensional dim_bd_Equipe
        const supPromise = supabase
          .from("dim_bd_Equipe")
          .select("Supervisor")
          .not("Supervisor", "is", null);

        // 2. Tentar buscar Ramos e Fabricantes via RPC otimizada ou fallback
        const rpcPromise = supabase.rpc("dashboard_filter_options");

        const [supRes, rpcRes] = await Promise.allSettled([supPromise, rpcPromise]);

        let supervisoresUnicos: string[] = [];
        if (supRes.status === "fulfilled" && supRes.value.data) {
          const raw = supRes.value.data
            .map((item: any) => item.Supervisor?.toString().trim())
            .filter(Boolean);
          supervisoresUnicos = Array.from(new Set(raw)).sort();
        }

        let ramos: string[] = [];
        let fabricantes: any[] = [];

        if (rpcRes.status === "fulfilled" && rpcRes.value.data) {
          const opts = rpcRes.value.data as any;
          if (opts.ramos && opts.ramos.length > 0) ramos = opts.ramos;
          if (opts.fabricantes && opts.fabricantes.length > 0) fabricantes = opts.fabricantes;
        }

        // Se o RPC não respondeu os ramos/fabricantes, busca de vw_top_fabricantes ou ft_Vendas_8011
        if (fabricantes.length === 0) {
          const { data: fabData } = await supabase
            .from("vw_top_fabricantes")
            .select("Fabricante")
            .limit(50);

          if (fabData) {
            fabricantes = Array.from(
              new Set(fabData.map((f: any) => f.Fabricante).filter(Boolean))
            ).sort();
          }
        }

        if (!cancelled) {
          setFilterOptions({
            supervisores: supervisoresUnicos,
            ramos: ramos,
            fabricantes: fabricantes,
          });
        }
      } catch (err) {
        console.error("Erro ao carregar opções de filtro:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    carregarFiltros();

    return () => {
      cancelled = true;
    };
  }, []);

  return { filterOptions, loading };
}
