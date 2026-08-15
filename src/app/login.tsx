import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LabeledInput } from '@/components/ui/labeled-input';
import { PrimaryButton } from '@/components/ui/primary-button';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import { useTheme } from '@/hooks/use-theme';
import { ApiError } from '@/services/http';

export default function LoginScreen() {
  const theme = useTheme();
  const { entrar } = useAuth();
  const alturaTeclado = useKeyboardHeight();

  // Em desenvolvimento já vem preenchido com o usuário do seed, para agilizar
  // a demonstração. O outro é teste2@email.com, com a mesma senha.
  const [email, setEmail] = useState(__DEV__ ? 'teste1@email.com' : '');
  const [senha, setSenha] = useState(__DEV__ ? 'senha123' : '');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const podeEntrar = email.trim().length > 0 && senha.length > 0;

  async function submeter() {
    if (!podeEntrar || enviando) return;

    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
      // Sem navegação aqui: o gate no layout raiz troca a rota sozinho assim
      // que o usuário passa a existir.
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : 'Não foi possível entrar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      {/* O teclado cobre a tela sem redimensioná-la (edge-to-edge), então é o
          padding que encolhe a área rolável e deixa o formulário acessível. */}
      <SafeAreaView style={[styles.safeArea, { paddingBottom: alturaTeclado }]}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <ThemedView style={styles.cabecalho}>
            <Ionicons name="wallet-outline" size={48} color={theme.accent} />
            <ThemedText type="subtitle">Internet Banking</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Entre para acessar sua conta
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.formulario}>
            <LabeledInput
              label="E-mail"
              testID="input-email"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!enviando}
            />

            <LabeledInput
              label="Senha"
              testID="input-senha"
              value={senha}
              onChangeText={setSenha}
              placeholder="Sua senha"
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              editable={!enviando}
              onSubmitEditing={submeter}
              returnKeyType="go"
            />

            {!!erro && (
              <ThemedText type="small" themeColor="danger" testID="erro-login">
                {erro}
              </ThemedText>
            )}

            <PrimaryButton
              label="Entrar"
              testID="botao-entrar"
              loading={enviando}
              disabled={!podeEntrar}
              onPress={submeter}
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
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.three,
    gap: Spacing.five,
  },
  cabecalho: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  formulario: {
    gap: Spacing.three,
  },
});
