/**
 * Espelha o contrato do chat service (tcc_ufrj_chat_service):
 * - backend/models.py  -> MessageRequest / Context / Dados
 * - worker/tasks.py    -> envelope {status, response} gravado no Redis
 * - core/config.py     -> SYSTEM_PROMPT, que define o formato da resposta da IA
 */

/** Estado da coleta, definido pela IA dentro de 'dados'. */
export type DadosStatus = 'coletando' | 'executar' | 'erro';

/** Dados do Pix acumulados ao longo da conversa. */
export interface PixDados {
  status?: DadosStatus;
  nome: string | null;
  chavePix: string | null;
  valor: number | null;
}

export interface ChatContext {
  mensagem: string;
  dados?: PixDados | null;
}

export interface SendMessageRequest {
  user_id: number;
  context: ChatContext;
}

/**
 * O POST /messages responde 200 mesmo em falha, devolvendo {message, detail}
 * sem o message_id — por isso todos os campos são opcionais.
 */
export interface SendMessageResponse {
  message_id?: string;
  message?: string;
  detail?: string;
}

/** Estado do processamento assíncrono (fila Celery + cache Redis). */
export type MessageStatus = 'PENDING' | 'DONE' | 'ERROR' | 'NOT_FOUND';

export interface MessageStatusResponse {
  status: MessageStatus;
  /** Envelope da IA; validado em chat-response.ts. */
  response?: unknown;
  error?: string;
}

/** Resposta da IA já validada: {mensagem, dados}. */
export interface AssistantEnvelope {
  mensagem: string;
  dados: PixDados | null;
}

/** Dados completos, prontos para a tela de envio. */
export interface PixPronto {
  nome: string;
  chavePix: string;
  valor: number;
}

/** Resultado de um turno, já interpretado para a UI. */
export type ChatOutcome =
  | { kind: 'reply'; mensagem: string; dados: PixDados | null }
  | { kind: 'execute'; mensagem: string; pix: PixPronto }
  | { kind: 'error'; mensagem: string };
