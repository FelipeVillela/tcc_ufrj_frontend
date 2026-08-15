import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolve o endereço do chat service.
 *
 * O ponto delicado é o Expo Go em celular físico: ali 'localhost' é o próprio
 * telefone, não a máquina de desenvolvimento. Como o Metro já roda no IP da
 * rede local, reaproveitamos esse mesmo host trocando só a porta — assim não é
 * preciso editar um IP na mão a cada troca de rede.
 */

const CHAT_API_PORT = 8000;

/**
 * Host do Metro, sem esquema (ex.: '192.168.0.42:8081'). Vem preenchido no
 * Expo Go e em dev builds; é undefined na web e em builds de produção.
 */
function getMetroHost(): string | undefined {
  const expoGoConfig = Constants.expoGoConfig as { debuggerHost?: string } | null | undefined;
  const hostUri = Constants.expoConfig?.hostUri ?? expoGoConfig?.debuggerHost;
  if (!hostUri) return undefined;

  // Mantém só o host: cobre 'host:porta', '[::1]:porta' e caminhos no fim.
  const match = /^(\[[^\]]+\]|[^:/?#]+)/.exec(hostUri);
  return match?.[1] || undefined;
}

function resolveChatApiBaseUrl(): string {
  // 1) Override explícito. Precisa ser esta expressão literal: o Babel do Expo
  // só substitui process.env.EXPO_PUBLIC_* quando escrito exatamente assim.
  const override = process.env.EXPO_PUBLIC_CHAT_API_URL;
  if (override) return override.replace(/\/+$/, '');

  // 2) Nativo em desenvolvimento: mesmo IP do Metro, porta da API.
  if (Platform.OS !== 'web') {
    const host = getMetroHost();
    if (host) return `http://${host}:${CHAT_API_PORT}`;
  }

  // 3) Web: mesmo host que serviu a página.
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:${CHAT_API_PORT}`;
  }

  return `http://localhost:${CHAT_API_PORT}`;
}

let cache: string | undefined;

/**
 * Resolvido de forma preguiçosa (e não em uma constante de módulo) porque o
 * app.json usa web.output 'static': as rotas são pré-renderizadas no Node, onde
 * 'window' não existe.
 */
export function getChatApiBaseUrl(): string {
  if (cache === undefined) {
    cache = resolveChatApiBaseUrl();
    if (__DEV__) console.log('[api] chat service em', cache);
  }
  return cache;
}

/** Usuário fixo enquanto não existe login (o seed do users-service cria o id 1). */
export const CURRENT_USER_ID = 1;
