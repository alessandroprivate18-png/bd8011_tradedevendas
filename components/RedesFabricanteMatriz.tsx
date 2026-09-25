"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { formatMoeda } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { FabricanteMultiSelect } from "@/components/FabricanteMultiSelect";
import {
  useRedesFabricanteMatriz,
  ANOS_DISPONIVEIS,
} from "@/lib/hooks/useRedesFabricanteMatriz";
import type { FilterOptions } from "@/lib/types";
import type { RedeRanking } from "@/lib/hooks/useRedes";

const NOMES_MESES = [
  "JAN", "FEV", "MAR", "ABR", "MAI", "JUN",
  "JUL", "AGO", "SET", "OUT", "NOV", "DEZ",
];

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

interface RedesFabricanteMatrizProps {
  ranking: RedeRanking[];
  filterOptions: FilterOptions;
}

export function RedesFabricanteMatriz({ ranking, filterOptions }: RedesFabricanteMatrizProps) {
  const [rede, setRede] = useState("");
  const {
    anos,
    setAnos,
    meses,
    setMeses,
    codFabricantes,
    setCodFabricantes,
    dados,
    loading,
    erro,
  } = useRedesFabricanteMatriz(rede);

  useEffect(() => {
    if (!rede && ranking.length > 0) setRede(ranking[0].rede);
  }, [ranking, rede]);

  const mesesColuna = meses.length > 0 ? [...meses].sort((a, b) => a - b) : [1,2,3,4,5,6,7,8,9,10,11,12];
  const anosOrdenados = [...anos].sort((a, b) => a - b);

  const porFabricante = useMemo(() => {
    const grupos = new Map<string, { total: Map<string, number> }>();
    for (const linha of dados) {
      if (!grupos.has(linha.fabricante)) grupos.set(linha.fabricante, { total: new Map() });
      const chave = `${linha.ano}-${linha.mes}`;
      const grupo = grupos.get(linha.fabricante)!;
      grupo.total.set(chave, (grupo.total.get(chave) ?? 0) + linha.total_vendas);
    }
    return grupos;
  }, [dados]);

  const nomesFabricantes = Array.from(porFabricante.keys()).sort();

  return (
    <div className="panel" style={{ marginTop: 24 }}>
      <h2 className="panel-title">Comparativo por fabricante</h2>

      <div className="filter-row" style={{ marginBottom: 16 }}>
        <div className="filter-field">
          <label className="filter-label">Rede</label>
          <select
            className="filter-control"
            value={rede}
            onChange={(e) => setRede(e.target.value)}
            style={{ minWidth: 200 }}
          >
            {ranking.map((r) => (
              <option key={r.rede} value={r.rede}>
                {r.rede}
              </option>
            ))}
          </select>
        </div>

        <CheckboxDropdown
          label="Ano"
          opcoes={ANOS_DISPONIVEIS}
          selecionados={anos}
          onChange={setAnos}
          formatarLabel={(v) => String(v)}
        />

        <CheckboxDropdown
          label="Mês"
          opcoes={[1,2,3,4,5,6,7,8,9,10,11,12]}
          selecionados={meses}
          onChange={setMeses}
          formatarLabel={(v) => NOMES_MESES[v - 1]}
        />

        <FabricanteMultiSelect
          options={filterOptions.fabricantes_codigo}
          selecionados={codFabricantes}
          onChange={setCodFabricantes}
          label="Fabricante"
        />
      </div>

      {erro && (
        <div style={{ color: "#ff9aa6", fontSize: 13, marginBottom: 16 }}>{erro}</div>
      )}

      {codFabricantes.length === 0 ? (
        <p style={{ color: "var(--color-muted)" }}>
          Selecione ao menos um fabricante para montar a comparação.
        </p>
      ) : loading ? (
        <Skeleton height={200} />
      ) : (
        <div className="table-wrapper">
          <table className="data-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ minWidth: 200 }}>{rede}</th>
                <th>Ano</th>
                {mesesColuna.map((m) => (
                  <th key={m}>{NOMES_MESES[m - 1]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {nomesFabricantes.map((nome) => {
                const grupo = porFabricante.get(nome)!;
                return (
                  <>
                    {anosOrdenados.map((ano, idxAno) => (
                      <tr key={`${nome}-${ano}`}>
                        {idxAno === 0 && (
                          <td
                            rowSpan={anosOrdenados.length + 1}
                            style={{
                              background: "#f2a65a22",
                              fontWeight: 700,
                              verticalAlign: "top",
                            }}
                          >
                            {nome}
                          </td>
                        )}
                        <td>{ano}</td>
                        {mesesColuna.map((m) => (
                          <td key={m}>
                            {formatMoeda(grupo.total.get(`${ano}-${m}`) ?? 0)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr key={`${nome}-pct`} style={{ background: "#171a2380" }}>
                      <td style={{ color: "var(--color-muted)" }}>%</td>
                      {mesesColuna.map((m) => {
                        if (anosOrdenados.length !== 2) {
                          return <td key={m} style={{ color: "var(--color-muted)" }}>—</td>;
                        }
                        const [a1, a2] = anosOrdenados;
                        const v1 = grupo.total.get(`${a1}-${m}`) ?? 0;
                        const v2 = grupo.total.get(`${a2}-${m}`) ?? 0;
                        const pct = v1 > 0 ? Math.round(((v2 - v1) / v1) * 1000) / 10 : null;
                        return (
                          <td
                            key={m}
                            style={{ color: pct == null ? "var(--color-muted)" : pct >= 0 ? "#34d399" : "#ff9aa6" }}
                          >
                            {pct == null ? "—" : `${pct > 0 ? "+" : ""}${pct}%`}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
