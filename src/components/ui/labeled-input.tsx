import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type LabeledInputProps = TextInputProps & {
  label: string;
  /** Mensagem de validação exibida abaixo do campo. */
  erro?: string;
};

/**
 * Campo de formulário com rótulo, no mesmo idiom visual do chat-composer:
 * o container arredondado carrega o fundo e a cor do texto vem do tema.
 */
export function LabeledInput({ label, erro, style, ...rest }: LabeledInputProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.wrapper}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>

      <ThemedView
        type="backgroundElement"
        style={[styles.campo, !!erro && { borderColor: theme.danger, borderWidth: 1 }]}>
        <TextInput
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }, style]}
          {...rest}
        />
      </ThemedView>

      {!!erro && (
        <ThemedText type="small" themeColor="danger">
          {erro}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.one,
  },
  campo: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    minHeight: 48,
  },
  input: {
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: Spacing.two,
  },
});
