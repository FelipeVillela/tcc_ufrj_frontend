/**
 * Cliente HTTP compartilhado pelos dois serviços do backend (chat e users).
 * O que varia entre eles é só a URL base e a mensagem de falha de rede.
 */

export class ApiError extends Error {
  /**
   * Status HTTP, quando a falha veio do servidor. Fica indefinido em erro de
   * rede ou timeout. Permite tratar casos específicos — 401 na autorização do
   * Pix, por exemplo — sem depender do texto da mensagem.
   */
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const TIMEOUT_PADRAO_MS = 15_000;

/** Tenta extrair a mensagem de erro do corpo, no formato {"erro": "..."}. */
async function lerMensagemDeErro(resposta: Response): Promise<string | null> {
  try {
    const corpo = await resposta.json();
    if (corpo && typeof corpo.erro === 'string') return corpo.erro;
  } catch {
    // Corpo vazio ou não-JSON: cai no texto genérico de quem chamou.
  }
  return null;
}

export function criarCliente(
  getBaseUrl: () => string,
  mensagemFalha: string,
  timeoutMs: number = TIMEOUT_PADRAO_MS,
) {
  return async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resposta = await fetch(`${getBaseUrl()}${caminho}`, {
        ...init,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      });

      if (!resposta.ok) {
        const mensagem = await lerMensagemDeErro(resposta);
        throw new ApiError(mensagem ?? `O servidor respondeu ${resposta.status}.`, resposta.status);
      }

      // 204 e afins não têm corpo — chamar .json() aqui estouraria.
      if (resposta.status === 204 || resposta.headers.get('content-length') === '0') {
        return undefined as T;
      }

      return (await resposta.json()) as T;
    } catch (erro) {
      if (erro instanceof ApiError) throw erro;
      if (erro instanceof Error && erro.name === 'AbortError') {
        throw new ApiError('O servidor demorou demais para responder.');
      }
      throw new ApiError(mensagemFalha);
    } finally {
      clearTimeout(timeout);
    }
  };
}
