// Tipos centralizados do Dashboard de Vendas

export type VendaMensal = {
  mes: string;
  total_vendas: number;
  total_pedidos: number;
  crescimento_pct: number | null;
  cobertura_pct: number | null;
  cobertura_crescimento_pp: number | null;
};

export type TopVendedor = {
  Vendedor: string;
  total_vendas: number;
  total_pedidos: number;
};

export type TopProduto = {
  Produto: string;
  qtd_total: number;
  total_vendas: number;
};

export type TopCliente = {
  Cliente: string;
  "CPF/CNPJ": string;
  total_vendas: number;
  total_pedidos: number;
};

export type Kpis = {
  total_vendas: number;
  total_pedidos: number;
  clientes_ativos: number;
  clientes_cadastrados: number;
  cobertura_pct: number;
};

export type DashboardData = {
  kpis: Kpis;
  vendas_mensal: VendaMensal[];
  top_vendedores: TopVendedor[];
  top_produtos: TopProduto[];
  top_clientes: TopCliente[];
};

export type FabricanteCodigo = {
  codigo: number;
  nome: string;
};

export type FilterOptions = {
  supervisores: string[];
  ramos: string[];
  fabricantes: string[];
  fabricantes_codigo: FabricanteCodigo[];
};

export type Filtros = {
  dataInicio: string;
  dataFim: string;
  supervisor: string;
  ramo: string;
  fabricante: string;
  codFabricante: string; // codigo do fabricante (Cod_Fabricante), separado do nome
  clienteBusca: string; // aceita nome OU codigo do cliente
  tipoVenda: string; // 1=Venda, 2=Troca, 3=Bonificação, 4=Consignado, 5=Outras Saídas, 6=Merchandising
  codVendedor: string; // Código ou nome do vendedor
};

export const TIPOS_VENDA = [
  { id: "1", label: "1 - Venda" },
  { id: "2", label: "2 - Troca" },
  { id: "3", label: "3 - Bonificação" },
  { id: "4", label: "4 - Consignado" },
  { id: "5", label: "5 - Outras Saídas" },
  { id: "6", label: "6 - Merchandising" },
] as const;

export type RedeCliente = {
  "Cod._1"?: number;
  Rede: string;
  Codigo: number;
  "Cpf/Cnpj": string;
  Cliente: string;
  Status: string;
  id_Redes: number;
};

export type ActiveTab = "visao-geral" | "vendas" | "clientes" | "produtos" | "redes";
