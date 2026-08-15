import { getUsersApiBaseUrl } from '@/services/api-config';
import { criarCliente } from '@/services/http';

/**
 * Cliente do bank-users-service (Quarkus, porta 8080).
 * Hoje o app só precisa do login: o saldo exibido na Home é simulado no
 * cliente a partir do valor que vem nesta resposta.
 */

const requisitar = criarCliente(getUsersApiBaseUrl, 'Não foi possível falar com o banco.');

export type PixKeyType = 'CPF' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA';

export interface ChavePix {
  id: number;
  tipo: PixKeyType;
  valor: string;
  criadoEm: string;
}

/** Resposta de POST /login — o mesmo DTO de GET /users/{id}. */
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  saldo: number;
  criadoEm: string;
  chavesPix: ChavePix[];
}

/**
 * Autentica e devolve o usuário. Não há token nem sessão: o backend responde
 * 200 com o usuário, e o app guarda o id para usar nas demais rotas.
 * Credenciais inválidas devolvem 401 com {"erro": "E-mail ou senha inválidos."},
 * que o cliente HTTP converte na mensagem do ApiError.
 */
export function login(email: string, senha: string): Promise<Usuario> {
  return requisitar<Usuario>('/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  });
}
