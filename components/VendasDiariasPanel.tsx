"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useVendasDiarias } from "@/lib/hooks/useVendasDiarias";
import { FabricanteMultiSelect } from "@/components/FabricanteMultiSelect";
import type { FilterOptions } from "@/lib/types";

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

interface VendasDiariasPanelProps {
  filterOptions: FilterOptions;
}

export function VendasDiariasPanel({ filterOptions }: VendasDiariasPanelProps) {
  const {
    vendasDiarias,
    porVendedor,
    loading,
    erro,
    filtros,
    setFiltros,
    buscar,
    limpar,
  } = useVendasDiarias();

  function set(field: keyof typeof filtros, value: string) {
    setFiltros({ ...filtros, [field]: value });
  }

  const temRoteiro = porVendedor.some((v) => v.qtde_roteirizada != null);

  return (
    <>
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="filter-row">
          <div className="filter-field">
            <label className="filter-label">Data inicial</label>
            <input
              type="date"
              className="filter-control"
              value={filtros.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Data final</label>
            <input
              type="date"
              className="filter-control"
              value={filtros.dataFim}
              onChange={(e) => set("dataFim", e.target.value)}
            />
          </div>
          <div className="filter-field">
            <label className="filter-label">Supervisor</label>
            <select
              className="filter-control"
              value={filtros.supervisor}
              onChange={(e) => set("supervisor", e.target.value)}
            >
              <option value="">Todos</option>
              {filterOptions.supervisores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label className="filter-label">Cód. Vend / Vendedor</label>
            <input
              type="text"
              className="filter-control"
              placeholder="Ex: 102 ou Marcelo..."
              value={filtros.vendedorBusca}
              onChange={(e) => set("vendedorBusca", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && buscar()}
            />
          </div>
          <FabricanteMultiSelect
            options={filterOptions.fabricantes_codigo}
            selecionados={filtros.codFabricantes}
            onChange={(codigos) => setFiltros({ ...filtros, codFabricantes: codigos })}
            label="Cód. Fabricante"
          />
          <button onClick={buscar} className="btn-clear">
            Pesquisar
          </button>
          <button onClick={limpar} className="btn-clear">
            Limpar filtros
          </button>
        </div>
      </div>

      {erro && (
        <div className="panel" style={{ borderColor: "#7a2f38", color: "#ff9aa6", marginBottom: 20 }}>
          {erro}
        </div>
      )}

      <div className="panel" style={{ marginBottom: 24 }}>
        <h2 className="panel-title">Vendas diárias</h2>
        {loading ? (
          <Skeleton height={240} />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={vendasDiarias}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="dia" stroke="var(--color-muted)" />
              <YAxis stroke="var(--color-muted)" />
              <Tooltip
                formatter={(v: number, name: string) =>
                  name === "total_vendas" ? formatMoeda(Number(v)) : v
                }
                contentStyle={TOOLTIP_STYLE}
              />
              <Line
                type="monotone"
                dataKey="total_vendas"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={false}
                name="Total vendido"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="panel">
        <h2 className="panel-title">Clientes atendidos por vendedor / dia</h2>
        {!temRoteiro && (
          <p style={{ fontSize: 13, color: "var(--color-muted)", marginTop: -8, marginBottom: 16 }}>
            A coluna "% roteirizado" fica disponível assim que a base de roteiro/planejamento for importada.
          </p>
        )}
        {loading ? (
          <Skeleton height={200} />
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Vendedor</th>
                  <th>Clientes atendidos</th>
                  <th>Qtde roteirizada</th>
                  <th>% roteirizado</th>
                  <th>Pedidos</th>
                  <th>Total vendido</th>
                </tr>
              </thead>
              <tbody>
                {porVendedor.map((v, i) => (
                  <tr key={`${v.dia}-${v.Cod_Vendedor}-${i}`}>
                    <td>{v.dia}</td>
                    <td>{v.Vendedor}</td>
                    <td>{formatNumero(v.clientes_atendidos)}</td>
                    <td>{v.qtde_roteirizada == null ? "—" : formatNumero(v.qtde_roteirizada)}</td>
                    <td>{v.pct_roteirizado == null ? "—" : `${v.pct_roteirizado}%`}</td>
                    <td>{v.pedidos}</td>
                    <td>{formatMoeda(v.total_vendas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
