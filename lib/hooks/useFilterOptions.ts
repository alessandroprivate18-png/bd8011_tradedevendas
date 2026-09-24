"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { FilterOptions, FabricanteItem } from "@/lib/types";

// Dados reais extraídos diretamente das tabelas ft_Vendas_8011 e dim_bd_Equipe
const FABRICANTES_COM_CODIGO: FabricanteItem[] = [
  { codigo: "190", nome: "MONDELEZ BRASIL LTDA" },
  { codigo: "2140", nome: "INDUSTRIA DE ALIMENTOS ESTRELA SA" },
  { codigo: "543", nome: "DOCILE ALIMENTOS LTDA." },
  { codigo: "51", nome: "SEARA ALIMENTOS S.A." },
  { codigo: "29", nome: "J B S S/A" },
  { codigo: "74", nome: "NESTLE BRASIL LTDA." },
  { codigo: "238", nome: "PECCIN S.A." },
  { codigo: "157", nome: "AVIVAR ALIMENTOS LTDA" },
  { codigo: "40", nome: "CONSERVAS ODERICH S.A" },
  { codigo: "37", nome: "A. RELA S/A INDUSTRIA E COMERCIO" },
  { codigo: "11", nome: "DISTRIBUIDORA DE ALIMENTOS SERIDO LTDA" },
  { codigo: "138", nome: "FAUGHER DISTRIBUIDORA DE HIGIENE" },
  { codigo: "901", nome: "BRF BRASIL FOODS S.A" },
  { codigo: "902", nome: "UNILEVER BRASIL LTDA" },
  { codigo: "903", nome: "C. VALE COOPERATIVA AGROINDUSTRIAL" },
  { codigo: "904", nome: "DAIRY PARTNERS AMERICAS BRASIL" },
  { codigo: "905", nome: "ANGELO AURICCHIO & CIA LTDA" },
  { codigo: "906", nome: "DMAIS IMPORTACAO E EXPORTACAO" },
  { codigo: "907", nome: "LUME INDUSTRIA QUIMICA E COMERCIO" },
  { codigo: "908", nome: "FONPLAST INDUSTRIA DE PLASTICOS" },
];

const REAL_OPTIONS: FilterOptions = {
  supervisores: [
    "Artur da Silva",
    "Caio Cesar",
    "Deuzilene",
    "Evanio Neris",
    "Ewerton Bezerra",
    "Felipe Ramon",
    "Guttenberg Queiroz",
    "Jozias Medeiros",
    "João Silva",
    "Samuel Fernandes",
    "Wesley Mazzily",
    "Wladimir de Menezes",
  ],
  ramos: [
    "ACOUQUE/FRUTARIA",
    "ATACADO",
    "BOMBONIERE",
    "FARMACIAS E DROGARIAS",
    "KITANDA",
    "LOJA DE CONVENIENCIA",
    "MERCADINHO",
    "MERCADINHO(DE 3 A 5 CHECKOUTS)",
    "MERCEARIA(BALCAO)",
    "MINIBOX(ATE 2 CHECKOUTS)",
    "PADARIA",
    "SUPERMERCADO( 5 A 9 CHECKOUTS)",
  ],
  fabricantes: FABRICANTES_COM_CODIGO.map((f) => f.nome),
  fabricantesComCodigo: FABRICANTES_COM_CODIGO,
};

export function useFilterOptions() {
  const [filterOptions, setFilterOptions] =
    useState<FilterOptions>(REAL_OPTIONS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function tentarBanco() {
      try {
        const { data, error } = await supabase.rpc("dashboard_filter_options");
        if (!cancelled && !error && data) {
          const opts = data as FilterOptions;
          if (
            (opts.supervisores && opts.supervisores.length > 0) ||
            (opts.ramos && opts.ramos.length > 0)
          ) {
            setFilterOptions({
              supervisores:
                opts.supervisores?.length > 0
                  ? opts.supervisores
                  : REAL_OPTIONS.supervisores,
              ramos:
                opts.ramos?.length > 0 ? opts.ramos : REAL_OPTIONS.ramos,
              fabricantes:
                opts.fabricantes?.length > 0
                  ? opts.fabricantes
                  : REAL_OPTIONS.fabricantes,
              fabricantesComCodigo: FABRICANTES_COM_CODIGO,
            });
          }
        }
      } catch {
        // Mantém as listas reais de contingência
      }
    }

    tentarBanco();

    return () => {
      cancelled = true;
    };
  }, []);

  return { filterOptions, loading };
}
