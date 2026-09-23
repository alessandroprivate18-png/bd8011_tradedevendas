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
        const { data, error } = await supabase.rpc("dashboard_filter_options");

        if (error) {
          console.error("Erro ao carregar opções de filtro:", error.message);
          return;
        }

        if (!cancelled && data) {
          const opts = data as any;
          setFilterOptions({
            supervisores: opts.supervisores ?? [],
            ramos: opts.ramos ?? [],
            fabricantes: opts.fabricantes ?? [],
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
