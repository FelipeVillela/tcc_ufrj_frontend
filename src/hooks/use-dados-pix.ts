import { useLocalSearchParams } from 'expo-router';

export interface DadosPix {
  /**
   * Só o fluxo do chat resolve o destinatário pelos contatos; o envio manual
   * identifica pela chave Pix e não tem nome para exibir.
   */
  nome?: string;
  chavePix: string;
  valor: number;
}

/**
 * Lê o Pix que está sendo enviado a partir dos parâmetros da rota, ou null
 * quando eles não formam um envio válido.
 *
 * As telas de confirmação e de autorização recebem os mesmos parâmetros e as
 * duas são rotas — dá para abrir qualquer uma por deep link, sem parâmetro
 * nenhum —, então a leitura e a validação ficam num lugar só.
 */
export function useDadosPix(): DadosPix | null {
  // Parâmetros de rota chegam sempre como texto — e são omitidos quando nulos.
  const { nome, chavePix, valor } = useLocalSearchParams<{
    nome?: string;
    chavePix?: string;
    valor?: string;
  }>();

  const valorNumerico = Number(valor);
  if (!chavePix || !Number.isFinite(valorNumerico) || valorNumerico <= 0) return null;

  return { nome, chavePix, valor: valorNumerico };
}
