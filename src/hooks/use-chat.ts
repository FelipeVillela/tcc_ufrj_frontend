import { useCallback, useRef, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { ChatApiError, clearHistory, pollMessage, sendMessage } from '@/services/chat-api';
import { PixDados, PixPronto } from '@/services/chat-api.types';
import { interpretarResposta } from '@/services/chat-response';

const SAUDACAO = 'Oi! Eu ajudo você a enviar um Pix. Para quem você quer mandar e quanto?';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  kind: 'text' | 'pix-ready' | 'error';
  text?: string;
  pix?: PixPronto;
}

function criaId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mensagemInicial(): ChatMessage {
  return { id: criaId(), role: 'assistant', kind: 'text', text: SAUDACAO };
}

export function useChat() {
  // A conversa é guardada por usuário no servidor, então o chat sempre opera
  // sobre a conta de quem está logado.
  const { usuario } = useAuth();
  const userId = usuario?.id;

  const [messages, setMessages] = useState<ChatMessage[]>([mensagemInicial()]);
  const [isSending, setIsSending] = useState(false);
  /** A conversa acaba quando a IA manda executar o Pix ou reporta erro. */
  const [isFinished, setIsFinished] = useState(false);

  // Fica em ref porque só é lido dentro do envio — não precisa re-renderizar.
  const dadosRef = useRef<PixDados | null>(null);

  const adicionar = useCallback((mensagem: ChatMessage) => {
    setMessages((atual) => [...atual, mensagem]);
  }, []);

  const send = useCallback(
    async (texto: string) => {
      const mensagem = texto.trim();
      if (!mensagem || isSending || isFinished || !userId) return;

      adicionar({ id: criaId(), role: 'user', kind: 'text', text: mensagem });
      setIsSending(true);

      try {
        const messageId = await sendMessage({
          user_id: userId,
          context: { mensagem, dados: dadosRef.current },
        });

        const resultado = await pollMessage(messageId);
        const outcome = interpretarResposta(resultado.response);

        if (outcome.kind === 'execute') {
          dadosRef.current = null;
          setIsFinished(true);
          adicionar({ id: criaId(), role: 'assistant', kind: 'pix-ready', pix: outcome.pix });
          return;
        }

        if (outcome.kind === 'error') {
          setIsFinished(true);
          adicionar({ id: criaId(), role: 'assistant', kind: 'error', text: outcome.mensagem });
          return;
        }

        dadosRef.current = outcome.dados;
        adicionar({ id: criaId(), role: 'assistant', kind: 'text', text: outcome.mensagem });
      } catch (erro) {
        const texto =
          erro instanceof ChatApiError ? erro.message : 'Falha ao conectar com o assistente.';
        setIsFinished(true);
        adicionar({ id: criaId(), role: 'assistant', kind: 'error', text: texto });
      } finally {
        setIsSending(false);
      }
    },
    [adicionar, isFinished, isSending, userId],
  );

  /** Recomeça do zero, apagando também a memória da conversa no servidor. */
  const reset = useCallback(async () => {
    dadosRef.current = null;
    setIsFinished(false);
    setMessages([mensagemInicial()]);

    if (!userId) return;

    try {
      await clearHistory(userId);
    } catch {
      // Se o servidor não responder, a conversa local já foi reiniciada; o
      // histórico remoto expira sozinho por TTL.
    }
  }, [userId]);

  return { messages, isSending, isFinished, send, reset };
}
