import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { NativeSyntheticEvent, Pressable, StyleSheet, TextInput, TextInputKeyPressEventData } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function ChatComposer({
  onSend,
  disabled,
}: {
  onSend: (texto: string) => void;
  disabled?: boolean;
}) {
  const [texto, setTexto] = useState('');
  const theme = useTheme();

  function enviar() {
    if (!texto.trim() || disabled) return;
    onSend(texto);
    setTexto('');
  }

  // Em TextInput multiline, o Enter não dispara onSubmitEditing (ele quebra
  // linha) em nenhuma plataforma, então o envio por teclado é feito aqui.
  function handleKeyPress(e: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    if (e.nativeEvent.key === 'Enter') {
      (e as unknown as { preventDefault?: () => void }).preventDefault?.();
      enviar();
    }
  }

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <TextInput
        value={texto}
        onChangeText={setTexto}
        placeholder="Escreva uma mensagem"
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text }]}
        multiline
        onKeyPress={handleKeyPress}
        editable={!disabled}
        testID="chat-input"
      />
      <Pressable
        onPress={enviar}
        disabled={disabled || !texto.trim()}
        style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
        testID="chat-send-button">
        <Ionicons
          name="arrow-up-circle"
          size={28}
          color={disabled || !texto.trim() ? theme.textSecondary : '#3c87f7'}
        />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 120,
  },
  sendButton: {
    paddingBottom: 2,
  },
  pressed: {
    opacity: 0.6,
  },
});
