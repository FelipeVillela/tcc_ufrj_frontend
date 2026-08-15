import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { Colors } from '@/constants/theme';

// Garante que a pilha sempre tenha as abas na base: sem isso, abrir
// /confirmar-pix direto por deep link deixaria a tela sem botão de voltar.
export const unstable_settings = { anchor: '(tabs)' };

function RootNavigator() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { usuario, carregando } = useAuth();

  // Enquanto a sessão salva é lida do storage, não renderiza rota nenhuma —
  // caso contrário a tela de login pisca antes de o usuário ser restaurado.
  if (carregando) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Protected guard={!usuario}>
        <Stack.Screen name="login" />
      </Stack.Protected>

      <Stack.Protected guard={!!usuario}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="confirmar-pix"
          options={{
            headerShown: true,
            title: 'Confirmar Pix',
            headerBackTitle: 'Voltar',
            // O tema padrão do React Navigation usa um cinza que destoa do
            // branco puro das telas; por isso as cores vêm explícitas.
            headerTintColor: colors.text,
            headerStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
