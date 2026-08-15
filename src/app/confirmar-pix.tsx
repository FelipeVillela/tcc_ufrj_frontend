import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { formatarMoeda } from '@/components/chat/message-bubble';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <ThemedView type="backgroundElement" style={styles.linha}>
      <ThemedText type="small" themeColor="textSecondary">
        {rotulo}
      </ThemedText>
      <ThemedText type="default">{valor}</ThemedText>
    </ThemedView>
  );
}

export default function ConfirmarPixScreen() {
  const theme = useTheme();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Parâmetros de rota chegam sempre como texto — e são omitidos quando nulos.
  const { nome, chavePix, valor } = useLocalSearchParams<{
    nome?: string;
    chavePix?: string;
    valor?: string;
  }>();

  const valorNumerico = Number(valor);
  const dadosValidos = !!nome && !!chavePix && Number.isFinite(valorNumerico) && valorNumerico > 0;

  async function confirmar() {
    setEnviando(true);
    // Simulação: o serviço de transferência ainda não existe na arquitetura.
    await new Promise((resolve) => setTimeout(resolve, 900));
    setEnviando(false);
    setEnviado(true);
  }

  if (!dadosValidos) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.conteudo}>
          <ThemedText type="subtitle">Dados incompletos</ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            Não recebemos todas as informações do Pix. Volte e tente novamente pelo chat.
          </ThemedText>
          <PrimaryButton label="Voltar ao chat" variant="secondary" onPress={() => router.back()} />
        </ThemedView>
      </ThemedView>
    );
  }

  if (enviado) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={[styles.conteudo, styles.centralizado]} testID="pix-enviado">
          <Ionicons name="checkmark-circle" size={64} color={theme.success} />
          <ThemedText type="subtitle">Pix enviado!</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.textoCentral}>
            {formatarMoeda(valorNumerico)} para {nome}
          </ThemedText>
          <PrimaryButton
            label="Voltar ao chat"
            testID="botao-voltar-chat"
            onPress={() => router.dismissTo('/')}
            style={styles.botaoLargo}
          />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.conteudo}>
          <ThemedText type="small" themeColor="textSecondary">
            Confira os dados antes de enviar.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <Linha rotulo="Nome" valor={nome} />
            <Linha rotulo="Chave Pix" valor={chavePix} />
            <Linha rotulo="Valor" valor={formatarMoeda(valorNumerico)} />
          </ThemedView>

          <PrimaryButton
            label="Confirmar envio"
            testID="botao-confirmar-envio"
            loading={enviando}
            onPress={confirmar}
          />
          <PrimaryButton
            label="Cancelar"
            variant="secondary"
            disabled={enviando}
            onPress={() => router.back()}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
  },
  conteudo: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  centralizado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCentral: {
    textAlign: 'center',
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  linha: {
    gap: Spacing.half,
  },
  botaoLargo: {
    alignSelf: 'stretch',
  },
});
