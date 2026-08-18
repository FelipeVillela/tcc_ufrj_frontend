import { ChatOutcome, PixDados } from '@/services/chat-api.types';

/**
 * Traduz o envelope devolvido pela IA para o que a tela precisa saber.
 *
 * Formato esperado (SYSTEM_PROMPT, core/config.py):
 *   { "mensagem": "texto", "dados": { "status", "nome", "chavePix", "valor" } | null }
 *
 * A conversa termina quando 'dados.status' vier como 'executar' ou 'erro';
 * qualquer outro caso é uma resposta comum e o chat continua.
 */

const MENSAGEM_PADRAO_ERRO = 'Não consegui concluir o pedido. Vamos tentar de novo?';

function ehObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/** Só aceita uma lista de strings; qualquer outra coisa vira null. */
function lerListaDeTexto(bruto: unknown): string[] | null {
  if (!Array.isArray(bruto)) return null;
  const textos = bruto.filter((item): item is string => typeof item === 'string');
  return textos.length > 0 ? textos : null;
}

function lerDados(bruto: unknown): PixDados | null {
  if (!ehObjeto(bruto)) return null;

  const status = bruto.status;
  const valor = bruto.valor;

  return {
    status:
      status === 'coletando' || status === 'executar' || status === 'erro' ? status : undefined,
    nome: typeof bruto.nome === 'string' ? bruto.nome : null,
    chavePix: typeof bruto.chavePix === 'string' ? bruto.chavePix : null,
    valor: typeof valor === 'number' && Number.isFinite(valor) ? valor : null,
    banco: typeof bruto.banco === 'string' ? bruto.banco : null,
    nomesAlternativos: lerListaDeTexto(bruto.nomesAlternativos),
  };
}

export function interpretarResposta(bruto: unknown): ChatOutcome {
  if (!ehObjeto(bruto)) {
    return { kind: 'error', mensagem: MENSAGEM_PADRAO_ERRO };
  }

  const mensagem = typeof bruto.mensagem === 'string' ? bruto.mensagem : '';
  const dados = lerDados(bruto.dados);

  if (dados?.status === 'erro') {
    return { kind: 'error', mensagem: mensagem || MENSAGEM_PADRAO_ERRO };
  }

  if (dados?.status === 'executar') {
    const { nome, chavePix, valor, banco, nomesAlternativos } = dados;

    // 'executar' com campo faltando significa que o modelo finalizou sem ter
    // tudo o que precisa — não dá para seguir para a tela de envio.
    if (nome && chavePix && valor !== null) {
      return {
        kind: 'execute',
        mensagem,
        pix: { nome, chavePix, valor, banco, nomesAlternativos },
      };
    }

    return {
      kind: 'error',
      mensagem: 'Faltaram dados para concluir o Pix. Vamos tentar de novo?',
    };
  }

  return { kind: 'reply', mensagem: mensagem || '...', dados };
}
