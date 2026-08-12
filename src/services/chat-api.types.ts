// Espelha backend/models.py e o formato de resposta produzido por
// worker/chat_process.py, para que trocar o mock por chamadas HTTP reais
// não exija mudar nada além de src/services/chat-api.ts.

export interface PixDados {
  destinatario: string | null;
  valor: number | null;
}

export interface ChatContext {
  mensagem: string;
  dados: PixDados | null;
}

export interface SendMessageRequest {
  user_id: number;
  context: ChatContext;
}

export interface SendMessageResponse {
  message_id: string;
}

export interface AssistantReply {
  mensagem: string;
  dados: PixDados | null;
}

export interface PixExecutePayload {
  status: 'executar';
  pix: {
    destinatario: string;
    valor: number;
  };
}

export type AssistantResponse = AssistantReply | PixExecutePayload;

export function isPixExecutePayload(response: AssistantResponse): response is PixExecutePayload {
  return 'status' in response && response.status === 'executar';
}

export type MessageStatus = 'PENDING' | 'DONE' | 'ERROR' | 'NOT_FOUND';

export interface MessageStatusResponse {
  status: MessageStatus;
  response?: AssistantResponse;
  error?: string;
}
