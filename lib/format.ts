// Utilitários de formatação

export function formatMoeda(v: number): string {
  return (v ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatNumero(v: number): string {
  return (v ?? 0).toLocaleString("pt-BR");
}
