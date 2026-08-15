/** Formata um número como moeda brasileira (ex.: R$ 1.234,56). */
export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
