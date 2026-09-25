"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoeda } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { FiltroAvancado, NOMES_MESES } from "@/components/FiltroAvancado";
import type { FiltroAvancadoValor } from "@/components/FiltroAvancado";
import { useRedesFabricanteMatriz } from "@/lib/hooks/useRedesFabricanteMatriz";
import type { FilterOptions } from "@/lib/types";
import type { RedeRanking } from "@/lib/hooks/useRedes";

interface RedesFabricanteMatrizProps {
  ranking: RedeRanking[];
  filterOptions: FilterOptions;
}

export function RedesFabricanteMatriz({ ranking, filterOptions }: RedesFabricanteMatrizProps) {
  const [rede, setRede] = useState("");
  const { filtro, setFiltro, dados, loading, erro } = useRedesFabricanteMatriz(rede);

  useEffect(() => {
    if (!rede && ranking.length > 0) setRede(ranking[0].rede);
  }, [ranking, rede]);

  const mesesColuna =
    filtro.meses.length > 0
      ? [...filtro.meses].sort((a, b) => a - b)
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const anosOrdenados = [...filtro.anos].sort((a, b) => a - b);

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

        <FiltroAvancado
          fabricantesOptions={filterOptions.fabricantes_codigo}
          valor={filtro}
          onChange={setFiltro}
        />
      </div>

      {erro && <div style={{ color: "#ff9aa6", fontSize: 13, marginBottom: 16 }}>{erro}</div>}

      {filtro.codFabricantes.length === 0 ? (
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
