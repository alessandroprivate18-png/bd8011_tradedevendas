export interface Filtros {
  dataInicio: string;
  dataFim: string;
  supervisor: string;
  ramo: string;
  fabricante: string;
  codFabricante: string;
  clienteBusca: string;
  tipoVenda: string;
  codVendedor: string;
}

export interface FabricanteItem {
  codigo: string | number;
  nome: string;
}

export interface FilterOptions {
  supervisores: string[];
  ramos: string[];
  fabricantes: FabricanteItem[];
}

export interface Kpis {
  total_vendas: number;
  total_pedidos: number;
  clientes_ativos: number;
  cobertura_pct?: number | null;
}

export interface VendaMensal {
  mes: string;
  total_vendas: number;
  total_pedidos: number;
  crescimento_pct: number | null;
  clientes_ativos?: number;
  cobertura_pct?: number | null;
  crescimento_cobertura_pct?: number | null;
}

export interface VendedorRanking {
  Vendedor: string;
  total_vendas: number;
  total_pedidos?: number;
}

export interface ProdutoRanking {
  Produto: string;
  total_vendas: number;
  quantidade?: number;
}

export interface ClienteRanking {
  Cliente: string;
  total_vendas: number;
  pedidos?: number;
}

export interface DashboardData {
  kpis: Kpis;
  vendas_mensal: VendaMensal[];
  top_vendedores: VendedorRanking[];
  top_produtos: ProdutoRanking[];
  top_clientes: ClienteRanking[];
}

export type ActiveTab =
  | "visao-geral"
  | "vendas"
  | "clientes"
  | "produtos"
  | "redes";
