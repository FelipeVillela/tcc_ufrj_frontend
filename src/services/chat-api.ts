import { processaMensagem } from '@/services/mock-chat-agent';
import {
  MessageStatusResponse,
  SendMessageRequest,
  SendMessageResponse,
} from '@/services/chat-api.types';

export * from '@/services/chat-api.types';

// Mock do backend descrito em backend/main.py:
//   POST /messages        -> { message_id }
//   GET  /messages/{id}    -> { status: PENDING | DONE | ERROR, response? }
//
// Quando a API real existir, troque o corpo destas duas funções por
// chamadas fetch (mesmos formatos de request/response) e o resto do app
// (use-chat.ts em diante) não muda.

const RESPOSTA_MIN_MS = 500;
const RESPOSTA_MAX_MS = 1200;

const resultados = new Map<string, MessageStatusResponse>();

function delayAleatorio() {
  const ms = RESPOSTA_MIN_MS + Math.random() * (RESPOSTA_MAX_MS - RESPOSTA_MIN_MS);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendMessage(req: SendMessageRequest): Promise<SendMessageResponse> {
  const message_id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  resultados.set(message_id, { status: 'PENDING' });

  delayAleatorio().then(() => {
    try {
      const response = processaMensagem(req.context.mensagem, req.context.dados);
      resultados.set(message_id, { status: 'DONE', response });
    } catch (e) {
      resultados.set(message_id, { status: 'ERROR', error: String(e) });
    }
  });

  return { message_id };
}

export async function getMessageStatus(messageId: string): Promise<MessageStatusResponse> {
  return resultados.get(messageId) ?? { status: 'NOT_FOUND' };
}

export async function pollMessage(
  messageId: string,
  { intervalMs = 400, timeoutMs = 15000 } = {},
): Promise<MessageStatusResponse> {
  const inicio = Date.now();

  while (Date.now() - inicio < timeoutMs) {
    const resultado = await getMessageStatus(messageId);
    if (resultado.status !== 'PENDING') return resultado;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { status: 'ERROR', error: 'Tempo limite excedido ao aguardar resposta.' };
}
