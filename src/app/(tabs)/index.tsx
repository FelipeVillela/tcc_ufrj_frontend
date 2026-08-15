import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { formatarMoeda } from '@/utils/moeda';

function Atalho({
  icone,
  titulo,
  descricao,
  onPress,
  testID,
}: {
  icone: keyof typeof Ionicons.glyphMap;
  titulo: string;
  descricao: string;
  onPress: () => void;
  testID?: string;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pressionado}>
      <ThemedView type="backgroundElement" style={styles.atalho}>
        <Ionicons name={icone} size={24} color={theme.accent} />
        <ThemedView type="backgroundElement" style={styles.atalhoTexto}>
          <ThemedText type="smallBold">{titulo}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {descricao}
          </ThemedText>
        </ThemedView>
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </ThemedView>
    </Pressable>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { usuario, sair } = useAuth();

  // O gate de rota impede montar sem usuário; isto só satisfaz o TypeScript.
  if (!usuario) return null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <ThemedView style={styles.cabecalho}>
            <ThemedView>
              <ThemedText type="small" themeColor="textSecondary">
                Olá,
              </ThemedText>
              <ThemedText type="subtitle" testID="home-nome">
                {usuario.nome}
              </ThemedText>
            </ThemedView>

            <Pressable
              onPress={sair}
              testID="botao-sair"
              accessibilityRole="button"
              accessibilityLabel="Sair"
              style={({ pressed }) => pressed && styles.pressionado}>
              <Ionicons name="log-out-outline" size={24} color={theme.textSecondary} />
            </Pressable>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.cardSaldo}>
            <ThemedText type="small" themeColor="textSecondary">
              Saldo disponível
            </ThemedText>
            <ThemedText
              type="title"
              testID="home-saldo"
              style={[styles.saldo, usuario.saldo < 0 && { color: theme.danger }]}>
              {formatarMoeda(usuario.saldo)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.secao}>
            <Atalho
              icone="paper-plane-outline"
              titulo="Enviar Pix"
              descricao="Informe a chave e o valor"
              testID="atalho-enviar-pix"
              onPress={() => router.push('/enviar-pix')}
            />
            <Atalho
              icone="chatbubble-ellipses-outline"
              titulo="Assistente Pix"
              descricao="Envie pedindo em linguagem natural"
              testID="atalho-chat"
              onPress={() => router.push('/chat')}
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
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.four,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardSaldo: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  saldo: {
    fontSize: 36,
    lineHeight: 44,
  },
  secao: {
    gap: Spacing.two,
  },
  atalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  atalhoTexto: {
    flex: 1,
    gap: Spacing.half,
  },
  pressionado: {
    opacity: 0.7,
  },
});
