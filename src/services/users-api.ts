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

/** Contato da lista do usuário — espelha o ContactResponse do backend. */
export interface Contato {
  id: string;
  nome: string;
  chavePix: string;
  banco: string | null;
  nomesAlternativos: string[];
  criadoEm: string;
  usadoPorUltimoEm: string;
}

/** Dados enviados ao salvar um contato — espelha o SaveContactRequest. */
export interface SalvarContatoRequest {
  nome: string;
  chavePix: string;
  banco?: string | null;
  nomesAlternativos?: string[] | null;
}

/**
 * Salva (ou atualiza) o destinatário na lista de contatos do usuário, com a
 * permissão dele — chamado ao concluir o envio de um Pix pelo chat. O backend
 * faz upsert pela chave Pix e agrega novos nomes alternativos.
 */
export function salvarContato(
  userId: number,
  contato: SalvarContatoRequest,
): Promise<Contato> {
  return requisitar<Contato>(`/users/${userId}/contacts`, {
    method: 'POST',
    body: JSON.stringify(contato),
  });
}
