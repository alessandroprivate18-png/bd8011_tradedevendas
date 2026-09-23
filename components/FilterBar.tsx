"use client";

import type { ChangeEvent } from "react";
import type { Filtros, FilterOptions } from "@/lib/types";

interface FilterBarProps {
  options: FilterOptions;
  filtros: Filtros;
  onChange: (novosFiltros: Filtros) => void;
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
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({
      ...filtros,
      [name]: value,
    });
  };

  const handleFabricanteChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const cod = e.target.value;
    onChange({
      ...filtros,
      codFabricante: cod,
      fabricante: cod, // sincroniza código e nome
    });
  };

  return (
    <div className="filter-bar">
      {/* Período de Datas */}
      <div className="filter-field">
        <label className="filter-label">Data inicial</label>
        <input
          type="date"
          name="dataInicio"
          value={filtros.dataInicio}
          onChange={handleInputChange}
          className="filter-input"
        />
      </div>

      <div className="filter-field">
        <label className="filter-label">Data final</label>
        <input
          type="date"
          name="dataFim"
          value={filtros.dataFim}
          onChange={handleInputChange}
          className="filter-input"
        />
      </div>

      {/* Tipo de Venda */}
      <div className="filter-field">
        <label className="filter-label">Tipo de Venda</label>
        <select
          name="tipoVenda"
          value={filtros.tipoVenda}
          onChange={handleInputChange}
          className="filter-select"
        >
          <option value="">Todos</option>
          <option value="1">1 - Venda</option>
          <option value="2">2 - Troca</option>
          <option value="3">3 - Bonificação</option>
          <option value="4">4 - Consignado</option>
          <option value="5">5 - Outras Saídas</option>
          <option value="6">6 - Merchandising</option>
        </select>
      </div>

      {/* Vendedor */}
      <div className="filter-field">
        <label className="filter-label">Cód. Vend / Vendedor</label>
        <input
          type="text"
          name="codVendedor"
          value={filtros.codVendedor}
          onChange={handleInputChange}
          placeholder="Ex: 102 ou Marcelo..."
          className="filter-input"
        />
      </div>

      {/* Supervisor (dim_bd_Equipe) */}
      <div className="filter-field">
        <label className="filter-label">Supervisor</label>
        <select
          name="supervisor"
          value={filtros.supervisor}
          onChange={handleInputChange}
          className="filter-select"
        >
          <option value="">Todos</option>
          {options.supervisores.map((sup) => (
            <option key={sup} value={sup}>
              {sup}
            </option>
          ))}
        </select>
      </div>

      {/* Ramo de Atividade */}
      <div className="filter-field">
        <label className="filter-label">Ramo de atividade</label>
        <select
          name="ramo"
          value={filtros.ramo}
          onChange={handleInputChange}
          className="filter-select"
        >
          <option value="">Todos</option>
          {options.ramos.map((ramo) => (
            <option key={ramo} value={ramo}>
              {ramo}
            </option>
          ))}
        </select>
      </div>

      {/* Fabricante com Cod_Fabricante */}
      <div className="filter-field">
        <label className="filter-label">Fabricante / Cód.</label>
        <select
          name="codFabricante"
          value={filtros.codFabricante || filtros.fabricante}
          onChange={handleFabricanteChange}
          className="filter-select"
        >
          <option value="">Todos</option>
          {options.fabricantes.map((fab) => (
            <option key={String(fab.codigo)} value={String(fab.codigo)}>
              {fab.codigo ? `[${fab.codigo}] ${fab.nome}` : fab.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Busca de Cliente (Nome ou Código) */}
      <div className="filter-field">
        <label className="filter-label">Buscar cliente</label>
        <input
          type="text"
          name="clienteBusca"
          value={filtros.clienteBusca}
          onChange={handleInputChange}
          placeholder="Cód. ou Nome do cliente..."
          className="filter-input"
        />
      </div>

      {/* Botão Limpar Filtros */}
      {temFiltrosAtivos && (
        <div className="filter-action-wrapper" style={{ alignSelf: "flex-end" }}>
          <button
            type="button"
            onClick={onLimpar}
            className="filter-clear-btn"
          >
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}
