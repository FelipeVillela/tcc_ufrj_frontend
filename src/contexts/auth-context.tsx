import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { login as loginNaApi, Usuario } from '@/services/users-api';

/**
 * Sessão do usuário.
 *
 * O backend não emite token: o login devolve o usuário e o app guarda o id
 * para usar nas rotas seguintes. A sessão é persistida para o app não voltar
 * ao login a cada reinício.
 *
 * O 'saldo' guardado aqui é SIMULADO: começa com o valor real vindo do login e
 * é debitado localmente a cada Pix enviado, já que não existe endpoint de
 * transferência. Por isso o usuário é regravado no storage a cada débito.
 */

const CHAVE_STORAGE = '@tcc:usuario';

interface AuthContextValue {
  usuario: Usuario | null;
  /** true enquanto a sessão salva está sendo lida do storage, no boot. */
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  /** Aplica um envio ao saldo simulado. Pode deixá-lo negativo, de propósito. */
  debitar: (valor: number) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    AsyncStorage.getItem(CHAVE_STORAGE)
      .then((bruto) => {
        if (!ativo || !bruto) return;
        setUsuario(JSON.parse(bruto) as Usuario);
      })
      .catch(() => {
        // Sessão corrompida não pode impedir o login.
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });

    return () => {
      ativo = false;
    };
  }, []);

  const guardar = useCallback(async (novo: Usuario | null) => {
    setUsuario(novo);
    if (novo) {
      await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(novo));
    } else {
      await AsyncStorage.removeItem(CHAVE_STORAGE);
    }
  }, []);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      const autenticado = await loginNaApi(email.trim(), senha);
      await guardar(autenticado);
    },
    [guardar],
  );

  const sair = useCallback(async () => {
    await guardar(null);
  }, [guardar]);

  const debitar = useCallback((valor: number) => {
    setUsuario((atual) => {
      if (!atual) return atual;
      const atualizado = { ...atual, saldo: atual.saldo - valor };
      // Persiste sem bloquear a UI; falhar aqui só custa o saldo no reinício.
      AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(atualizado)).catch(() => {});
      return atualizado;
    });
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, entrar, sair, debitar }),
    [usuario, carregando, entrar, sair, debitar],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return contexto;
}

/**
 * Para telas que só existem autenticadas: evita checar null em toda linha.
 * O gate de rota (Stack.Protected) garante que não são montadas sem usuário.
 */
export function useUsuario(): Usuario {
  const { usuario } = useAuth();
  if (!usuario) {
    throw new Error('Esta tela exige um usuário autenticado.');
  }
  return usuario;
}
