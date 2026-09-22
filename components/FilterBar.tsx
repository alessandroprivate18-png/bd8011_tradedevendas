"use client";

import { TIPOS_VENDA } from "@/lib/types";
import type { FilterOptions, Filtros } from "@/lib/types";

interface FilterBarProps {
  options: FilterOptions;
  filtros: Filtros;
  onChange: (filtros: Filtros) => void;
  temFiltrosAtivos: boolean;
  onLimpar: () => void;
}

export function FilterBar({
  options,
  filtros,
  onChange,
  temFiltrosAtivos,
  onLimpar,
}: FilterBarProps) {
  function set(field: keyof Filtros, value: string) {
    onChange({ ...filtros, [field]: value });
  }

  return (
    <div className="panel" style={{ marginBottom: 24 }}>
      <div className="filter-row">
        {/* Período */}
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

        {/* Tipo de Operação */}
        <div className="filter-field">
          <label className="filter-label" style={{ fontWeight: 600, color: "var(--color-accent)" }}>
            Tipo de Venda
          </label>
          <select
            className="filter-control"
            value={filtros.tipoVenda}
            onChange={(e) => set("tipoVenda", e.target.value)}
            style={{ fontWeight: filtros.tipoVenda ? 600 : 400 }}
          >
            {TIPOS_VENDA.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Novo Filtro: Cód. Vendedor */}
        <div className="filter-field">
          <label className="filter-label" style={{ fontWeight: 600 }}>
            Cód. Vend / Vendedor
          </label>
          <input
            type="text"
            className="filter-control"
            placeholder="Ex: 102 ou Marcelo..."
            value={filtros.codVendedor}
            onChange={(e) => set("codVendedor", e.target.value)}
            style={{ minWidth: 150 }}
          />
        </div>

        {/* Supervisor */}
        <div className="filter-field">
          <label className="filter-label">Supervisor</label>
          <select
            className="filter-control"
            value={filtros.supervisor}
            onChange={(e) => set("supervisor", e.target.value)}
          >
            <option value="">Todos</option>
            {options.supervisores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Ramo */}
        <div className="filter-field">
          <label className="filter-label">Ramo de atividade</label>
          <select
            className="filter-control"
            value={filtros.ramo}
            onChange={(e) => set("ramo", e.target.value)}
          >
            <option value="">Todos</option>
            {options.ramos.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Fabricante */}
        <div className="filter-field">
          <label className="filter-label">Fabricante</label>
          <select
            className="filter-control"
            value={filtros.fabricante}
            onChange={(e) => set("fabricante", e.target.value)}
          >
            <option value="">Todos</option>
            {options.fabricantes.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Buscar Cliente */}
        <div className="filter-field">
          <label className="filter-label">Buscar cliente</label>
          <input
            type="text"
            className="filter-control filter-input"
            placeholder="Nome do cliente..."
            value={filtros.clienteBusca}
            onChange={(e) => set("clienteBusca", e.target.value)}
          />
        </div>

        {temFiltrosAtivos && (
          <button className="btn-clear" onClick={onLimpar}>
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
