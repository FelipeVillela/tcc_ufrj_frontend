import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolve o endereço dos serviços do backend.
 *
 * O ponto delicado é o Expo Go em celular físico: ali 'localhost' é o próprio
 * telefone, não a máquina de desenvolvimento. Como o Metro já roda no IP da
 * rede local, reaproveitamos esse mesmo host trocando só a porta — assim não é
 * preciso editar um IP na mão a cada troca de rede.
 */

const PORTA_CHAT = 8000;
const PORTA_USERS = 8080;

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

function resolveBaseUrl(porta: number, override: string | undefined): string {
  // 1) Override explícito, quando informado.
  if (override) return override.replace(/\/+$/, '');

  // 2) Nativo em desenvolvimento: mesmo IP do Metro, porta do serviço.
  if (Platform.OS !== 'web') {
    const host = getMetroHost();
    if (host) return `http://${host}:${porta}`;
  }

  // 3) Web: mesmo host que serviu a página.
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    return `${window.location.protocol}//${window.location.hostname}:${porta}`;
  }

  return `http://localhost:${porta}`;
}

/**
 * Resolvido de forma preguiçosa (e não em constantes de módulo) porque o
 * app.json usa web.output 'static': as rotas são pré-renderizadas no Node, onde
 * 'window' não existe.
 */
function criarResolvedor(nome: string, porta: number, override: () => string | undefined) {
  let cache: string | undefined;

  return function getBaseUrl(): string {
    if (cache === undefined) {
      cache = resolveBaseUrl(porta, override());
      if (__DEV__) console.log(`[api] ${nome} em`, cache);
    }
    return cache;
  };
}

// As leituras de process.env precisam ser estas expressões literais: o Babel do
// Expo só substitui process.env.EXPO_PUBLIC_* quando escrito exatamente assim.
export const getChatApiBaseUrl = criarResolvedor(
  'chat service',
  PORTA_CHAT,
  () => process.env.EXPO_PUBLIC_CHAT_API_URL,
);

export const getUsersApiBaseUrl = criarResolvedor(
  'users service',
  PORTA_USERS,
  () => process.env.EXPO_PUBLIC_USERS_API_URL,
);
