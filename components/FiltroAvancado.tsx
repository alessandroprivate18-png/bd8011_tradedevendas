"use client";

import { useEffect, useRef, useState } from "react";
import { FabricanteMultiSelect } from "@/components/FabricanteMultiSelect";
import type { FabricanteCodigo } from "@/lib/types";

export const ANOS_DISPONIVEIS = [2024, 2025, 2026, 2027];
export const NOMES_MESES = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];
export const MESES_DISPONIVEIS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export type FiltroAvancadoValor = {
  anos: number[];
  meses: number[];
  codFabricantes: number[];
};

function CheckboxDropdown({
  label,
  opcoes,
  selecionados,
  onChange,
  formatarLabel,
}: {
  label: string;
  opcoes: number[];
  selecionados: number[];
  onChange: (valores: number[]) => void;
  formatarLabel: (v: number) => string;
}) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  function alternar(v: number) {
    onChange(
      selecionados.includes(v) ? selecionados.filter((x) => x !== v) : [...selecionados, v]
    );
  }

  const resumo =
    selecionados.length === 0
      ? "Nenhum"
      : selecionados.length === opcoes.length
      ? "Todos"
      : selecionados.map(formatarLabel).join(", ");

  return (
    <div className="filter-field" ref={ref} style={{ position: "relative" }}>
      <label className="filter-label">{label}</label>
      <button
        type="button"
        className="filter-control"
        onClick={() => setAberto((v) => !v)}
        style={{
          minWidth: 160,
          textAlign: "left",
          cursor: "pointer",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {resumo}
      </button>
      {aberto && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 50,
            marginTop: 4,
            width: 220,
            maxHeight: 260,
            overflowY: "auto",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            padding: 6,
          }}
        >
          {opcoes.map((v) => (
            <label
              key={v}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selecionados.includes(v)}
                onChange={() => alternar(v)}
              />
              {formatarLabel(v)}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface FiltroAvancadoProps {
  fabricantesOptions: FabricanteCodigo[];
  valor: FiltroAvancadoValor;
  onChange: (valor: FiltroAvancadoValor) => void;
}

export function FiltroAvancado({ fabricantesOptions, valor, onChange }: FiltroAvancadoProps) {
  return (
    <>
      <CheckboxDropdown
        label="Ano"
        opcoes={ANOS_DISPONIVEIS}
        selecionados={valor.anos}
        onChange={(anos) => onChange({ ...valor, anos })}
        formatarLabel={(v) => String(v)}
      />
      <CheckboxDropdown
        label="Mês"
        opcoes={MESES_DISPONIVEIS}
        selecionados={valor.meses}
        onChange={(meses) => onChange({ ...valor, meses })}
        formatarLabel={(v) => NOMES_MESES[v - 1]}
      />
      <FabricanteMultiSelect
        options={fabricantesOptions}
        selecionados={valor.codFabricantes}
        onChange={(codFabricantes) => onChange({ ...valor, codFabricantes })}
        label="Fabricante"
      />
    </>
  );
}
