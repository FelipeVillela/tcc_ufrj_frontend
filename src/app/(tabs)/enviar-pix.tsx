import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LabeledInput } from '@/components/ui/labeled-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { formatarMoeda } from '@/utils/moeda';

/**
 * Converte o texto digitado em centavos: o usuário digita só dígitos e o valor
 * vai preenchendo da direita para a esquerda, como nos apps de banco.
 */
function digitosParaValor(texto: string): number {
  const digitos = texto.replace(/\D/g, '').slice(0, 12);
  return digitos ? Number(digitos) / 100 : 0;
}

export default function EnviarPixScreen() {
  const { usuario } = useAuth();
  const [chavePix, setChavePix] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const alturaTeclado = useKeyboardHeight();

  const valor = digitosParaValor(valorTexto);
  const chaveValida = chavePix.trim().length > 0;
  const podeContinuar = chaveValida && valor > 0;

  // Esta tela é uma aba: continua montada depois que o Pix é enviado. Sem
  // limpar ao ganhar foco, os dígitos do envio anterior permaneceriam no campo
  // e os novos seriam concatenados neles (R$ 300,00 + "500000" viraria
  // R$ 300.005.000,00). Todo envio começa de um formulário em branco.
  useFocusEffect(
    useCallback(() => {
      setChavePix('');
      setValorTexto('');
    }, []),
  );

  function continuar() {
    if (!podeContinuar) return;

    // Sem 'nome': o fluxo manual identifica o destinatário só pela chave.
    router.push({
      pathname: '/confirmar-pix',
      params: { chavePix: chavePix.trim(), valor: String(valor) },
    });
  }

  return (
    <ThemedView style={styles.container}>
      {/* O teclado cobre a tela sem redimensioná-la (edge-to-edge), então é o
          padding que encolhe a área rolável e deixa o formulário acessível. */}
      <SafeAreaView
        style={[styles.safeArea, { paddingBottom: alturaTeclado }]}
        edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedView style={styles.cabecalho}>
            <ThemedText type="subtitle">Enviar Pix</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Informe a chave do destinatário e o valor
            </ThemedText>
          </ThemedView>

          <LabeledInput
            label="Chave Pix"
            testID="input-chave-pix"
            value={chavePix}
            onChangeText={setChavePix}
            placeholder="E-mail, CPF, telefone ou chave aleatória"
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="email"
          />

          <LabeledInput
            label="Valor"
            testID="input-valor"
            value={valor > 0 ? formatarMoeda(valor) : ''}
            onChangeText={setValorTexto}
            placeholder="R$ 0,00"
            keyboardType="number-pad"
            inputMode="numeric"
          />

          {!!usuario && (
            <ThemedText type="small" themeColor="textSecondary">
              Saldo disponível: {formatarMoeda(usuario.saldo)}
            </ThemedText>
          )}

          <PrimaryButton
            label="Continuar"
            testID="botao-continuar"
            disabled={!podeContinuar}
            onPress={continuar}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  scroll: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  cabecalho: {
    gap: Spacing.half,
    paddingBottom: Spacing.one,
  },
});
