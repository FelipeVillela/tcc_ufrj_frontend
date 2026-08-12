import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ChatMessage } from '@/hooks/use-chat';

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  if (message.kind === 'pix-ready' && message.pix) {
    return (
      <ThemedView type="backgroundElement" style={[styles.bubble, styles.assistantBubble, styles.pixCard]}>
        <ThemedView style={styles.pixCardHeader} type="backgroundElement">
          <Ionicons name="checkmark-circle" size={18} color="#2e9e5b" />
          <ThemedText type="smallBold">Intenção reconhecida</ThemedText>
        </ThemedView>
        <ThemedText type="small" themeColor="textSecondary">
          Pix pronto para seguir para a tela de envio:
        </ThemedText>
        <ThemedText type="default">Destinatário: {message.pix.destinatario}</ThemedText>
        <ThemedText type="default">Valor: {formatarMoeda(message.pix.valor)}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      type={isUser ? 'backgroundSelected' : 'backgroundElement'}
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        message.kind === 'error' && styles.errorBubble,
      ]}>
      <ThemedText type="default" themeColor={message.kind === 'error' ? 'textSecondary' : 'text'}>
        {message.text}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '82%',
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: Spacing.half,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: Spacing.half,
  },
  errorBubble: {
    borderWidth: 1,
    borderColor: '#c94b4b',
  },
  pixCard: {
    gap: Spacing.half,
    borderWidth: 1,
    borderColor: '#2e9e5b',
  },
  pixCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
