"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { FilterOptions } from "@/lib/types";

// Opções conhecidas da operação de vendas da empresa como garantia contra timeouts do banco
const FALLBACK_OPTIONS: FilterOptions = {
  supervisores: [
    "CARLOS SOUZA",
    "ANA LIMA",
    "RICARDO MELO",
    "MARCOS VINICIUS",
    "FERNANDO ALVES",
    "ROBERTO SANTOS",
  ],
  ramos: [
    "SUPERMERCADO",
    "ATACADO",
    "VAREJO ALIMENTICIO",
    "MERCEARIA",
    "PADARIA / CONFEITARIA",
    "RESTAURANTE / FOOD SERVICE",
    "DISTRIBUIDORA",
    "CONVENIENCIA",
  ],
  fabricantes: [
    "PERDIGAO",
    "LACTA / MONDELEZ",
    "JAGUAR",
    "SEARA",
    "SADIA / BRF",
    "BUNGE",
    "BAUDUCCO",
    "UNILEVER",
    "AMBEV",
    "NESTLE",
    "JBS",
  ],
};

export function useFilterOptions() {
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(FALLBACK_OPTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      try {
        const { data, error } = await supabase.rpc("dashboard_filter_options");
        if (!cancelled && !error && data) {
          const opts = data as FilterOptions;
          setFilterOptions({
            supervisores:
              opts.supervisores && opts.supervisores.length > 0
                ? opts.supervisores
                : FALLBACK_OPTIONS.supervisores,
            ramos:
              opts.ramos && opts.ramos.length > 0
                ? opts.ramos
                : FALLBACK_OPTIONS.ramos,
            fabricantes:
              opts.fabricantes && opts.fabricantes.length > 0
                ? opts.fabricantes
                : FALLBACK_OPTIONS.fabricantes,
          });
        }
      } catch {
        // Se a chamada RPC do banco der timeout, mantém as opções de fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    carregar();

    return () => {
      cancelled = true;
    };
  }, []);

  return { filterOptions, loading };
}
