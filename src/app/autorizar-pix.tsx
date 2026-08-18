import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DadosIncompletos } from '@/components/pix/dados-incompletos';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LabeledInput } from '@/components/ui/labeled-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useDadosPix } from '@/hooks/use-dados-pix';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/http';
import { salvarContato } from '@/services/users-api';
import { formatarMoeda } from '@/utils/moeda';

/**
 * Autorização do envio: a senha da conta é revalidada na API de autenticação
 * antes de o Pix sair. Vale para os dois fluxos — o manual e o do chat —, já
 * que ambos passam pela tela de confirmação antes de chegar aqui.
 */
export default function AutorizarPixScreen() {
  const theme = useTheme();
  const { usuario, confirmarSenha, debitar } = useAuth();
  const pix = useDadosPix();
  const alturaTeclado = useKeyboardHeight();

  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  if (!pix) return <DadosIncompletos />;

  async function autorizar() {
    if (!pix || !senha || enviando) return;

    setErro(null);
    setEnviando(true);
    try {
      await confirmarSenha(senha);

      // Simulação: não existe serviço de transferência na arquitetura. O saldo
      // é debitado só no app — e pode ficar negativo, por decisão de escopo.
      await new Promise((resolve) => setTimeout(resolve, 900));
      debitar(pix.valor);

      // Concluído o envio, salva o destinatário na lista de contatos. Só o
      // fluxo do chat resolve nome/banco/apelidos; o envio manual (só chave)
      // não gera contato. É best-effort: falhar aqui não invalida o envio.
      if (pix.nome && usuario) {
        try {
          await salvarContato(usuario.id, {
            nome: pix.nome,
            chavePix: pix.chavePix,
            banco: pix.banco ?? null,
            nomesAlternativos: pix.nomesAlternativos ?? null,
          });
        } catch {
          // O contato não salvo não impede o comprovante de aparecer.
        }
      }

      setEnviado(true);
    } catch (e) {
      // O backend responde "E-mail ou senha inválidos." porque o /login também
      // atende a tela de entrada; aqui só a senha está em jogo.
      if (e instanceof ApiError && e.status === 401) setErro('Senha incorreta.');
      else setErro(e instanceof ApiError ? e.message : 'Não foi possível autorizar o envio.');
    } finally {
      setEnviando(false);
    }
  }

  if (enviado) {
    return (
      <ThemedView style={styles.container}>
        {/* Sem voltar depois de enviado: a tela anterior é a revisão, e voltar
            para ela depois do comprovante só confunde. O headerLeft cobre a
            web, onde o headerBackVisible do native-stack não tem efeito. */}
        <Stack.Screen
          options={{ headerBackVisible: false, headerLeft: () => null, gestureEnabled: false }}
        />
        <ThemedView style={[styles.conteudo, styles.centralizado]} testID="pix-enviado">
          <Ionicons name="checkmark-circle" size={64} color={theme.success} />
          <ThemedText type="subtitle">Pix enviado!</ThemedText>
          <ThemedText type="default" themeColor="textSecondary" style={styles.textoCentral}>
            {formatarMoeda(pix.valor)} para {pix.nome ?? pix.chavePix}
          </ThemedText>
          <PrimaryButton
            label="Voltar ao início"
            testID="botao-voltar-inicio"
            onPress={() => router.dismissTo('/')}
            style={styles.botaoLargo}
          />
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* O teclado cobre a tela sem redimensioná-la (edge-to-edge), então é o
          padding que encolhe a área rolável e mantém o campo à vista. */}
      <SafeAreaView
        style={[styles.safeArea, { paddingBottom: alturaTeclado }]}
        edges={['bottom', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedView style={styles.conteudo}>
            <ThemedText type="default">
              Confirme sua senha para enviar {formatarMoeda(pix.valor)} para{' '}
              {pix.nome ?? pix.chavePix}.
            </ThemedText>

            <LabeledInput
              label="Senha"
              testID="input-senha-pix"
              value={senha}
              onChangeText={(texto) => {
                setSenha(texto);
                setErro(null);
              }}
              placeholder="Sua senha"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              autoFocus
              editable={!enviando}
              erro={erro ?? undefined}
              onSubmitEditing={autorizar}
              returnKeyType="go"
            />

            <PrimaryButton
              label="Autorizar envio"
              testID="botao-autorizar"
              loading={enviando}
              disabled={!senha}
              onPress={autorizar}
            />
            <PrimaryButton
              label="Cancelar"
              variant="secondary"
              disabled={enviando}
              onPress={() => router.back()}
            />
          </ThemedView>
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
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
  },
  conteudo: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
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
  botaoLargo: {
    alignSelf: 'stretch',
  },
});
