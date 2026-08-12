import { useCallback, useRef, useState } from 'react';

import { isPixExecutePayload, pollMessage, sendMessage } from '@/services/chat-api';
import { PixDados } from '@/services/chat-api.types';

const MOCK_USER_ID = 1;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  kind: 'text' | 'pix-ready' | 'error';
  text?: string;
  pix?: { destinatario: string; valor: number };
}

function criaId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: criaId(),
      role: 'assistant',
      kind: 'text',
      text: 'Oi! Eu ajudo você a enviar um Pix. Para quem você quer mandar e quanto?',
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const dadosRef = useRef<PixDados | null>(null);

  const send = useCallback(async (texto: string) => {
    const mensagem = texto.trim();
    if (!mensagem || isSending) return;

    setMessages((atual) => [...atual, { id: criaId(), role: 'user', kind: 'text', text: mensagem }]);
    setIsSending(true);

    try {
      const { message_id } = await sendMessage({
        user_id: MOCK_USER_ID,
        context: { mensagem, dados: dadosRef.current },
      });

      const resultado = await pollMessage(message_id);

      const response = resultado.response;

      if (resultado.status === 'DONE' && response) {
        if (isPixExecutePayload(response)) {
          dadosRef.current = null;
          setMessages((atual) => [
            ...atual,
            { id: criaId(), role: 'assistant', kind: 'pix-ready', pix: response.pix },
          ]);
        } else {
          dadosRef.current = response.dados;
          setMessages((atual) => [
            ...atual,
            { id: criaId(), role: 'assistant', kind: 'text', text: response.mensagem },
          ]);
        }
      } else {
        setMessages((atual) => [
          ...atual,
          {
            id: criaId(),
            role: 'assistant',
            kind: 'error',
            text: resultado.error ?? 'Não consegui processar sua mensagem agora.',
          },
        ]);
      }
    } catch {
      setMessages((atual) => [
        ...atual,
        { id: criaId(), role: 'assistant', kind: 'error', text: 'Falha ao conectar com o assistente.' },
      ]);
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  return { messages, isSending, send };
}
