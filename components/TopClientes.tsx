"use client";

import { formatMoeda, formatNumero } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { TopCliente } from "@/lib/types";

interface TopClientesProps {
  dados: TopCliente[] | undefined;
  loading: boolean;
}

export function TopClientes({ dados, loading }: TopClientesProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Top 10 clientes</h2>

      {loading ? (
        <Skeleton height={200} />
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>CPF/CNPJ</th>
              <th>Pedidos</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {(dados ?? []).map((c) => (
              <tr key={c["CPF/CNPJ"]}>
                <td>{c.Cliente}</td>
                <td>{c["CPF/CNPJ"]}</td>
                <td>{formatNumero(c.total_pedidos)}</td>
                <td>{formatMoeda(Number(c.total_vendas))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
