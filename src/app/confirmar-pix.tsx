import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { DadosIncompletos } from '@/components/pix/dados-incompletos';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { DadosPix, useDadosPix } from '@/hooks/use-dados-pix';
import { formatarMoeda } from '@/utils/moeda';

/** O envio em si não acontece aqui: a próxima tela pede a senha para autorizá-lo. */
function autorizar(pix: DadosPix) {
  router.push({
    pathname: '/autorizar-pix',
    params: {
      // 'nome' só existe no fluxo do chat; parâmetro indefinido é descartado.
      ...(pix.nome ? { nome: pix.nome } : {}),
      chavePix: pix.chavePix,
      valor: String(pix.valor),
    },
  });
}

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
  const pix = useDadosPix();

  if (!pix) return <DadosIncompletos />;

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.conteudo}>
          <ThemedText type="small" themeColor="textSecondary">
            Confira os dados antes de enviar.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            {!!pix.nome && <Linha rotulo="Nome" valor={pix.nome} />}
            <Linha rotulo="Chave Pix" valor={pix.chavePix} />
            <Linha rotulo="Valor" valor={formatarMoeda(pix.valor)} />
          </ThemedView>

          <PrimaryButton
            label="Confirmar envio"
            testID="botao-confirmar-envio"
            onPress={() => autorizar(pix)}
          />
          <PrimaryButton label="Cancelar" variant="secondary" onPress={() => router.back()} />
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
    // Centraliza em telas largas (web).
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  linha: {
    gap: Spacing.half,
  },
});
