import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';

/**
 * Estado das telas do envio quando os parâmetros da rota não descrevem um Pix
 * válido — na prática, só por deep link, já que os fluxos internos sempre
 * passam chave e valor.
 */
export function DadosIncompletos() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.conteudo}>
        <ThemedText type="subtitle">Dados incompletos</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Não recebemos a chave Pix e o valor do envio. Volte e tente novamente.
        </ThemedText>
        <PrimaryButton label="Voltar" variant="secondary" onPress={() => router.back()} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conteudo: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
});
