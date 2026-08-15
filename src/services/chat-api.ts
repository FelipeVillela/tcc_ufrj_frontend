import { CURRENT_USER_ID, getChatApiBaseUrl } from '@/services/api-config';
import {
  MessageStatusResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/services/chat-api.types';

export * from '@/services/chat-api.types';

/**
 * Cliente HTTP do chat service (backend/main.py):
 *   POST   /messages                   -> { message_id }
 *   GET    /messages/{id}              -> { status, response? , error? }
 *   DELETE /messages/history/{user_id} -> { status: "CLEARED" }
 */

const TIMEOUT_REQUISICAO_MS = 15_000;

/**
 * Uma resposta passa por fila + Gemini (medido em ~3min numa chamada só) e o
 * worker ainda repete em caso de 429. O teto é o próprio TTL do cache no Redis
 * (CACHE_TTL = 300s em worker/tasks.py): depois disso a chave some e insistir
 * não adianta.
 */
const TIMEOUT_POLLING_MS = 300_000;
const INTERVALO_POLLING_MS = 800;

export class ChatApiError extends Error {}

async function requisitar<T>(caminho: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_REQUISICAO_MS);

  try {
    const resposta = await fetch(`${getChatApiBaseUrl()}${caminho}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });

    if (!resposta.ok) {
      throw new ChatApiError(`O servidor respondeu ${resposta.status}.`);
    }

    return (await resposta.json()) as T;
  } catch (erro) {
    if (erro instanceof ChatApiError) throw erro;
    if (erro instanceof Error && erro.name === 'AbortError') {
      throw new ChatApiError('O servidor demorou demais para responder.');
    }
    throw new ChatApiError('Não foi possível falar com o assistente.');
  } finally {
    clearTimeout(timeout);
  }
}

/** Enfileira a mensagem e devolve o id para acompanhar o processamento. */
export async function sendMessage(req: SendMessageRequest): Promise<string> {
  const resposta = await requisitar<SendMessageResponse>('/messages', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  // O endpoint devolve 200 com {message, detail} quando falha ao enfileirar.
  if (!resposta.message_id) {
    throw new ChatApiError(resposta.detail ?? resposta.message ?? 'O assistente não aceitou a mensagem.');
  }

  return resposta.message_id;
}

export function getMessageStatus(messageId: string): Promise<MessageStatusResponse> {
  return requisitar<MessageStatusResponse>(`/messages/${encodeURIComponent(messageId)}`);
}

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Consulta o resultado até sair de PENDING, dar erro ou estourar o tempo. */
export async function pollMessage(messageId: string): Promise<MessageStatusResponse> {
  const limite = Date.now() + TIMEOUT_POLLING_MS;

  while (Date.now() < limite) {
    const resultado = await getMessageStatus(messageId);

    if (resultado.status === 'DONE') return resultado;

    if (resultado.status === 'ERROR') {
      throw new ChatApiError(resultado.error ?? 'O assistente não conseguiu responder.');
    }

    // O POST grava PENDING antes de enfileirar, então NOT_FOUND aqui significa
    // que o cache expirou — não adianta continuar tentando.
    if (resultado.status === 'NOT_FOUND') {
      throw new ChatApiError('A resposta expirou antes de chegar.');
    }

    await esperar(INTERVALO_POLLING_MS);
  }

  throw new ChatApiError('O assistente demorou demais para responder.');
}

/** Apaga a memória da conversa no servidor (usado no "Nova conversa"). */
export async function clearHistory(userId: number = CURRENT_USER_ID): Promise<void> {
  await requisitar(`/messages/history/${userId}`, { method: 'DELETE' });
}
