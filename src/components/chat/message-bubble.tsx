import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ChatMessage } from '@/hooks/use-chat';
import { PixPronto } from '@/services/chat-api.types';

export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function MessageBubble({
  message,
  onConfirmarPix,
}: {
  message: ChatMessage;
  onConfirmarPix?: (pix: PixPronto) => void;
}) {
  const theme = useTheme();
  const isUser = message.role === 'user';

  if (message.kind === 'pix-ready' && message.pix) {
    const { nome, chavePix, valor } = message.pix;

    return (
      <ThemedView
        type="backgroundElement"
        style={[styles.bubble, styles.assistantBubble, styles.pixCard, { borderColor: theme.success }]}>
        <ThemedView style={styles.pixCardHeader} type="backgroundElement">
          <Ionicons name="checkmark-circle" size={18} color={theme.success} />
          <ThemedText type="smallBold">Pix pronto para envio</ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.linha}>
          <ThemedText type="small" themeColor="textSecondary">
            Nome
          </ThemedText>
          <ThemedText type="default">{nome}</ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.linha}>
          <ThemedText type="small" themeColor="textSecondary">
            Chave Pix
          </ThemedText>
          <ThemedText type="default">{chavePix}</ThemedText>
        </ThemedView>

        <ThemedView type="backgroundElement" style={styles.linha}>
          <ThemedText type="small" themeColor="textSecondary">
            Valor
          </ThemedText>
          <ThemedText type="default">{formatarMoeda(valor)}</ThemedText>
        </ThemedView>

        <PrimaryButton
          label="Enviar Pix"
          testID="botao-enviar-pix"
          onPress={() => onConfirmarPix?.(message.pix!)}
          style={styles.botao}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView
      type={isUser ? 'backgroundSelected' : 'backgroundElement'}
      style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.assistantBubble,
        message.kind === 'error' && [styles.errorBubble, { borderColor: theme.danger }],
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
  },
  pixCard: {
    minWidth: '82%',
    gap: Spacing.two,
    borderWidth: 1,
    paddingVertical: Spacing.three,
  },
  pixCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  linha: {
    gap: Spacing.half,
  },
  botao: {
    marginTop: Spacing.one,
  },
});
