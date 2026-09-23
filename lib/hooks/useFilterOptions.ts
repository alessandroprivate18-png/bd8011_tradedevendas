"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { FilterOptions, FabricanteItem } from "@/lib/types";

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
    { codigo: "1", nome: "PERDIGAO" },
    { codigo: "2", nome: "LACTA / MONDELEZ" },
    { codigo: "3", nome: "SEARA" },
    { codigo: "4", nome: "SADIA / BRF" },
    { codigo: "5", nome: "AMBEV" },
    { codigo: "6", nome: "NESTLE" },
  ],
};

export function useFilterOptions() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(FALLBACK_OPTIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function carregar() {
      try {
        // 1. Supervisores direto da tabela dimensional dim_bd_Equipe
        const supPromise = supabase
          .from("dim_bd_Equipe")
          .select("Supervisor")
          .not("Supervisor", "is", null);

        // 2. Ramos e Fabricantes via RPC ou direto da view agregada
        const rpcPromise = supabase.rpc("dashboard_filter_options");
        const fabPromise = supabase
          .from("vw_top_fabricantes")
          .select("*")
          .limit(100);

        const [supRes, rpcRes, fabRes] = await Promise.allSettled([
          supPromise,
          rpcPromise,
          fabPromise,
        ]);

        let supervisores: string[] = [];
        if (supRes.status === "fulfilled" && supRes.value.data) {
          const raw = supRes.value.data
            .map((item: any) => item.Supervisor?.toString().trim())
            .filter(Boolean);
          supervisores = Array.from(new Set(raw)).sort();
        }

        let ramos: string[] = [];
        let fabricantes: FabricanteItem[] = [];

        if (rpcRes.status === "fulfilled" && rpcRes.value.data) {
          const opts = rpcRes.value.data as any;
          if (opts.ramos?.length) ramos = opts.ramos;
          if (opts.fabricantes?.length) {
            fabricantes = opts.fabricantes.map((f: any) =>
              typeof f === "object"
                ? { codigo: f.codigo ?? f.Cod_Fabricante, nome: f.nome ?? f.Fabricante }
                : { codigo: f, nome: f }
            );
          }
        }

        // Fallback de fabricantes via view se o RPC não trouxer
        if (fabricantes.length === 0 && fabRes.status === "fulfilled" && fabRes.value.data) {
          fabricantes = fabRes.value.data
            .map((f: any) => ({
              codigo: String(f.Cod_Fabricante ?? f.cod_fabricante ?? f.Fabricante),
              nome: String(f.Fabricante ?? f.nome),
            }))
            .filter((f) => f.nome);
        }

        if (!cancelled) {
          setFilterOptions({
            supervisores: supervisores.length > 0 ? supervisores : FALLBACK_OPTIONS.supervisores,
            ramos: ramos.length > 0 ? ramos : FALLBACK_OPTIONS.ramos,
            fabricantes: fabricantes.length > 0 ? fabricantes : FALLBACK_OPTIONS.fabricantes,
          });
        }
      } catch (e) {
        console.error("Erro ao carregar opções de filtros:", e);
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
