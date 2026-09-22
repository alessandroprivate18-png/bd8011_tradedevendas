"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatMoeda } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import type { TopProduto } from "@/lib/types";

interface TopProdutosProps {
  dados: TopProduto[] | undefined;
  loading: boolean;
}

const TOOLTIP_STYLE = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  borderRadius: "8px",
};

export function TopProdutos({ dados, loading }: TopProdutosProps) {
  return (
    <div className="panel">
      <h2 className="panel-title">Top 10 produtos</h2>

      {loading ? (
        <Skeleton height={280} />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dados ?? []} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
            />
            <XAxis type="number" stroke="var(--color-muted)" />
            <YAxis
              type="category"
              dataKey="Produto"
              stroke="var(--color-muted)"
              width={160}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(v: number) => formatMoeda(Number(v))}
              contentStyle={TOOLTIP_STYLE}
            />
            <Bar dataKey="total_vendas" fill="var(--color-success)" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
