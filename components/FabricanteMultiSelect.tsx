"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FabricanteCodigo } from "@/lib/types";

interface FabricanteMultiSelectProps {
  options: FabricanteCodigo[];
  selecionados: number[];
  onChange: (codigos: number[]) => void;
  label?: string;
}

export function FabricanteMultiSelect({
  options,
  selecionados,
  onChange,
  label = "Fabricante",
}: FabricanteMultiSelectProps) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return options;
    return options.filter(
      (f) =>
        f.nome.toLowerCase().includes(termo) || f.codigo.toString().includes(termo)
    );
  }, [options, busca]);

  function alternar(codigo: number) {
    if (selecionados.includes(codigo)) {
      onChange(selecionados.filter((c) => c !== codigo));
    } else {
      onChange([...selecionados, codigo]);
    }
  }

  function limpar() {
    onChange([]);
  }

  function selecionarFiltrados() {
    const codigosFiltrados = filtrados.map((f) => f.codigo);
    const uniao = new Set([...selecionados, ...codigosFiltrados]);
    onChange(Array.from(uniao));
  }

  const textoResumo =
    selecionados.length === 0
      ? "Todos"
      : selecionados.length === 1
      ? options.find((f) => f.codigo === selecionados[0])?.nome ?? "1 selecionado"
      : `${selecionados.length} selecionados`;

  return (
    <div className="filter-field" ref={containerRef} style={{ position: "relative" }}>
      <label className="filter-label">{label}</label>
      <button
        type="button"
        className="filter-control"
        onClick={() => setAberto((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          minWidth: 200,
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {textoResumo}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0 }} />
      </button>

      {aberto && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            zIndex: 50,
            marginTop: 4,
            width: 320,
            maxHeight: 360,
            display: "flex",
            flexDirection: "column",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
          }}
        >
          <div style={{ padding: 8, borderBottom: "1px solid var(--color-border)" }}>
            <input
              type="text"
              placeholder="Buscar por nome ou código..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: 6,
                padding: "6px 8px",
                boxSizing: "border-box",
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtrados.length === 0 ? (
              <p style={{ padding: 12, fontSize: 13, color: "var(--color-muted)" }}>
                Nenhum fabricante encontrado.
              </p>
            ) : (
              filtrados.map((f) => (
                <label
                  key={f.codigo}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selecionados.includes(f.codigo)}
                    onChange={() => alternar(f.codigo)}
                  />
                  <span>
                    {f.codigo} - {f.nome}
                  </span>
                </label>
              ))
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 8,
              borderTop: "1px solid var(--color-border)",
              gap: 8,
            }}
          >
            <button
              type="button"
              onClick={selecionarFiltrados}
              style={{
                background: "transparent",
                color: "var(--color-accent)",
                border: "none",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Selecionar filtrados
            </button>
            <button
              type="button"
              onClick={limpar}
              style={{
                background: "transparent",
                color: "#ff9aa6",
                border: "none",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
