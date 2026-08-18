import { useLocalSearchParams } from 'expo-router';

export interface DadosPix {
  /**
   * Só o fluxo do chat resolve o destinatário pelos contatos; o envio manual
   * identifica pela chave Pix e não tem nome para exibir.
   */
  nome?: string;
  chavePix: string;
  valor: number;
  /** Banco de destino e apelidos: só o fluxo do chat os fornece, para salvar
   * o contato após o envio. */
  banco?: string;
  nomesAlternativos?: string[];
}

/** Lê uma lista de strings serializada em JSON no parâmetro de rota. */
function lerNomesAlternativos(bruto?: string): string[] | undefined {
  if (!bruto) return undefined;
  try {
    const lista = JSON.parse(bruto);
    if (Array.isArray(lista)) {
      const textos = lista.filter((item): item is string => typeof item === 'string');
      return textos.length > 0 ? textos : undefined;
    }
  } catch {
    // Parâmetro malformado é o mesmo que ausente: o envio segue sem apelidos.
  }
  return undefined;
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
  const { nome, chavePix, valor, banco, nomesAlternativos } = useLocalSearchParams<{
    nome?: string;
    chavePix?: string;
    valor?: string;
    banco?: string;
    nomesAlternativos?: string;
  }>();

  const valorNumerico = Number(valor);
  if (!chavePix || !Number.isFinite(valorNumerico) || valorNumerico <= 0) return null;

  return {
    nome,
    chavePix,
    valor: valorNumerico,
    banco,
    nomesAlternativos: lerNomesAlternativos(nomesAlternativos),
  };
}
