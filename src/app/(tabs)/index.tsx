import { router } from 'expo-router';
import { useRef } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChatComposer } from '@/components/chat/chat-composer';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { ChatMessage, useChat } from '@/hooks/use-chat';
import { PixPronto } from '@/services/chat-api.types';

export default function ChatScreen() {
  const { messages, isSending, isFinished, send, reset } = useChat();
  const listRef = useRef<FlatList<ChatMessage>>(null);

  function irParaEnvio(pix: PixPronto) {
    router.push({
      // Os parâmetros trafegam como texto na URL; a tela de destino converte
      // o valor de volta para número.
      pathname: '/confirmar-pix',
      params: { nome: pix.nome, chavePix: pix.chavePix, valor: String(pix.valor) },
    });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ThemedView style={styles.header}>
          <ThemedText type="subtitle">Assistente Pix</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Diga para quem e quanto você quer enviar
          </ThemedText>
        </ThemedView>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} onConfirmarPix={irParaEnvio} />
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isSending ? <TypingIndicator /> : null}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={BottomTabInset}
          style={styles.composerWrapper}>
          {isFinished ? (
            <PrimaryButton
              label="Nova conversa"
              variant="secondary"
              testID="botao-nova-conversa"
              onPress={reset}
            />
          ) : (
            <ChatComposer onSend={send} disabled={isSending} />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingBottom: BottomTabInset,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.select({ web: Spacing.four, default: Spacing.two }),
    paddingBottom: Spacing.three,
    gap: Spacing.half,
  },
  listContent: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    flexGrow: 1,
  },
  composerWrapper: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
