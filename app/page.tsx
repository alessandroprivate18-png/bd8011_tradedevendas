"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";

type VendaMensal = {
  mes: string;
  total_vendas: number;
  total_pedidos: number;
  clientes_ativos: number;
};

type TopVendedor = {
  Vendedor: string;
  total_vendas: number;
  total_pedidos: number;
};

type TopProduto = {
  Produto: string;
  qtd_total: number;
  total_vendas: number;
};

type TopCliente = {
  Cliente: string;
  "CPF/CNPJ": string;
  total_vendas: number;
  total_pedidos: number;
};

function formatMoeda(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const card: React.CSSProperties = {
  background: "#171a23",
  borderRadius: 12,
  padding: "20px 24px",
  flex: 1,
  minWidth: 200,
  border: "1px solid #2a2e3a",
};

const cardTitle: React.CSSProperties = {
  fontSize: 13,
  color: "#9099ab",
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const cardValue: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
};

const panel: React.CSSProperties = {
  background: "#171a23",
  borderRadius: 12,
  padding: 20,
  border: "1px solid #2a2e3a",
  marginBottom: 24,
};

export default function DashboardPage() {
  const [vendasMensais, setVendasMensais] = useState<VendaMensal[]>([]);
  const [vendedores, setVendedores] = useState<TopVendedor[]>([]);
  const [produtos, setProdutos] = useState<TopProduto[]>([]);
  const [clientes, setClientes] = useState<TopCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [filtroMes, setFiltroMes] = useState<string>("");
  const [filtroVendedor, setFiltroVendedor] = useState<string>("");

  useEffect(() => {
    async function carregarDadosBase() {
      setLoading(true);
      setErro(null);

      const [mensal, vend, prod, cli] = await Promise.all([
        supabase.from("vw_vendas_mensal").select("*").order("mes"),
        supabase
          .from("vw_top_vendedores")
          .select("*")
          .order("total_vendas", { ascending: false })
          .limit(10),
        supabase
          .from("vw_top_produtos")
          .select("*")
          .order("total_vendas", { ascending: false })
          .limit(10),
        supabase
          .from("vw_top_clientes")
          .select("*")
          .order("total_vendas", { ascending: false })
          .limit(10),
      ]);

      if (mensal.error || vend.error || prod.error || cli.error) {
        setErro(
          mensal.error?.message ||
            vend.error?.message ||
            prod.error?.message ||
            cli.error?.message ||
            "Erro ao carregar dados"
        );
      } else {
        setVendasMensais((mensal.data as VendaMensal[]) ?? []);
        setVendedores((vend.data as TopVendedor[]) ?? []);
        setProdutos((prod.data as TopProduto[]) ?? []);
        setClientes((cli.data as TopCliente[]) ?? []);
      }
      setLoading(false);
    }

    carregarDadosBase();
  }, []);

  // KPIs calculados a partir da visao mensal, respeitando o filtro de mes
  const kpis = useMemo(() => {
    const base = filtroMes
      ? vendasMensais.filter((v) => v.mes === filtroMes)
      : vendasMensais;

    const totalVendas = base.reduce((acc, v) => acc + Number(v.total_vendas), 0);
    const totalPedidos = base.reduce((acc, v) => acc + Number(v.total_pedidos), 0);
    const clientesAtivos = base.reduce(
      (acc, v) => Math.max(acc, Number(v.clientes_ativos)),
      0
    );
    const ticketMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;

    return { totalVendas, totalPedidos, clientesAtivos, ticketMedio };
  }, [vendasMensais, filtroMes]);

  const vendedoresFiltrados = useMemo(() => {
    if (!filtroVendedor) return vendedores;
    return vendedores.filter((v) => v.Vendedor === filtroVendedor);
  }, [vendedores, filtroVendedor]);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Dashboard de Vendas</h1>
      <p style={{ color: "#9099ab", marginBottom: 24 }}>
        Dados consolidados direto do Supabase
      </p>

      {erro && (
        <div
          style={{
            background: "#3a1d22",
            border: "1px solid #7a2f38",
            padding: 16,
            borderRadius: 8,
            marginBottom: 20,
            color: "#ff9aa6",
          }}
        >
          Erro ao carregar dados: {erro}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <select
          value={filtroMes}
          onChange={(e) => setFiltroMes(e.target.value)}
          style={{
            background: "#171a23",
            color: "#e6e6e6",
            border: "1px solid #2a2e3a",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <option value="">Todos os meses</option>
          {vendasMensais.map((v) => (
            <option key={v.mes} value={v.mes}>
              {v.mes}
            </option>
          ))}
        </select>

        <select
          value={filtroVendedor}
          onChange={(e) => setFiltroVendedor(e.target.value)}
          style={{
            background: "#171a23",
            color: "#e6e6e6",
            border: "1px solid #2a2e3a",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <option value="">Todos os vendedores (top 10)</option>
          {vendedores.map((v) => (
            <option key={v.Vendedor} value={v.Vendedor}>
              {v.Vendedor}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={card}>
          <div style={cardTitle}>Total vendido</div>
          <div style={cardValue}>{formatMoeda(kpis.totalVendas)}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Pedidos</div>
          <div style={cardValue}>{kpis.totalPedidos.toLocaleString("pt-BR")}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Clientes ativos</div>
          <div style={cardValue}>{kpis.clientesAtivos.toLocaleString("pt-BR")}</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Ticket médio</div>
          <div style={cardValue}>{formatMoeda(kpis.ticketMedio)}</div>
        </div>
      </div>

      {/* Vendas por mes */}
      <div style={panel}>
        <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
          Vendas por mês
        </h2>
        {loading ? (
          <p style={{ color: "#9099ab" }}>Carregando...</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={vendasMensais}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
              <XAxis dataKey="mes" stroke="#9099ab" />
              <YAxis stroke="#9099ab" />
              <Tooltip
                formatter={(v: number) => formatMoeda(Number(v))}
                contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }}
              />
              <Line
                type="monotone"
                dataKey="total_vendas"
                stroke="#4f8cff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Top vendedores */}
        <div style={{ ...panel, flex: 1, minWidth: 320 }}>
          <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
            Top 10 vendedores
          </h2>
          {loading ? (
            <p style={{ color: "#9099ab" }}>Carregando...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={vendedoresFiltrados} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis type="number" stroke="#9099ab" />
                <YAxis
                  type="category"
                  dataKey="Vendedor"
                  stroke="#9099ab"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v: number) => formatMoeda(Number(v))}
                  contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }}
                />
                <Bar dataKey="total_vendas" fill="#4f8cff" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top produtos */}
        <div style={{ ...panel, flex: 1, minWidth: 320 }}>
          <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
            Top 10 produtos
          </h2>
          {loading ? (
            <p style={{ color: "#9099ab" }}>Carregando...</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={produtos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2e3a" />
                <XAxis type="number" stroke="#9099ab" />
                <YAxis
                  type="category"
                  dataKey="Produto"
                  stroke="#9099ab"
                  width={160}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(v: number) => formatMoeda(Number(v))}
                  contentStyle={{ background: "#171a23", border: "1px solid #2a2e3a" }}
                />
                <Bar dataKey="total_vendas" fill="#34d399" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top clientes */}
      <div style={panel}>
        <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16 }}>
          Top 10 clientes
        </h2>
        {loading ? (
          <p style={{ color: "#9099ab" }}>Carregando...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#9099ab" }}>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  Cliente
                </th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  CPF/CNPJ
                </th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  Pedidos
                </th>
                <th style={{ padding: "8px 4px", borderBottom: "1px solid #2a2e3a" }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c["CPF/CNPJ"]}>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {c.Cliente}
                  </td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {c["CPF/CNPJ"]}
                  </td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {c.total_pedidos}
                  </td>
                  <td style={{ padding: "8px 4px", borderBottom: "1px solid #21242e" }}>
                    {formatMoeda(Number(c.total_vendas))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
