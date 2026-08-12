import { consultaBancoDeDados } from '@/services/mock-bank-directory';
import { AssistantResponse, PixDados } from '@/services/chat-api.types';


// Simula, no cliente, o comportamento descrito em worker/chat_process.py +
// core/config.py (SYSTEM_PROMPT) para permitir desenvolver e demonstrar a
// tela de chat antes do backend estar no ar. Nenhuma regra daqui é "de
// verdade" — é só o suficiente para exercitar o fluxo de extração de
// intenção -> dados de Pix.

const PARENTESCOS = [
  'irmão',
  'irmã',
  'prima',
  'primo',
  'tio',
  'tia',
  'vizinho',
  'vizinha',
  'mãe',
  'pai',
  'sobrinho',
  'sobrinha',
  'avó',
  'avô',
  'amiga',
  'amigo',
  'colega',
  'cunhado',
  'cunhada',
  'sogra',
  'sogro',
  'padrinho',
  'madrinha',
];

const PALAVRAS_CONFIRMACAO = ['sim', 'pode enviar', 'confirmo', 'confirmar', 'ok', 'isso mesmo'];

function normaliza(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function extraiValor(mensagem: string): number | null {
  const match = mensagem.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)/i);
  if (!match) return null;

  const bruto = match[1];
  const numero = bruto.includes(',')
    ? Number(bruto.replace(/\./g, '').replace(',', '.'))
    : Number(bruto);

  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function buscaDestinatario(mensagem: string): { nome: string | null; ambiguos: string[] } {
  const mensagemNormalizada = normaliza(mensagem);

  const parentescoEncontrado = PARENTESCOS.find((p) => mensagemNormalizada.includes(normaliza(p)));
  if (parentescoEncontrado) {
    const resultados = consultaBancoDeDados(parentescoEncontrado, 'parentesco');
    if (resultados.length === 1) return { nome: resultados[0].nome, ambiguos: [] };
    if (resultados.length > 1) return { nome: null, ambiguos: resultados.map((r) => r.nome) };
  }

  const palavras = mensagem.match(/[A-ZÀ-Ú][\wÀ-ú]*/g) ?? [];
  for (const palavra of palavras) {
    const resultados = consultaBancoDeDados(palavra, 'nome');
    if (resultados.length === 1) return { nome: resultados[0].nome, ambiguos: [] };
    if (resultados.length > 1) return { nome: null, ambiguos: resultados.map((r) => r.nome) };
  }

  return { nome: null, ambiguos: [] };
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function processaMensagem(mensagem: string, dadosAtuais: PixDados | null): AssistantResponse {
  const dados: PixDados = { destinatario: dadosAtuais?.destinatario ?? null, valor: dadosAtuais?.valor ?? null };
  const mensagemNormalizada = normaliza(mensagem);

  const valorExtraido = extraiValor(mensagem);
  if (valorExtraido !== null) dados.valor = valorExtraido;

  let listaAmbigua: string[] = [];
  if (!dados.destinatario) {
    const { nome, ambiguos } = buscaDestinatario(mensagem);
    if (nome) dados.destinatario = nome;
    else if (ambiguos.length) listaAmbigua = ambiguos;
  }

  const confirmou = PALAVRAS_CONFIRMACAO.some((p) => mensagemNormalizada.includes(p));
  if (confirmou && dados.destinatario && dados.valor) {
    return {
      status: 'executar',
      pix: { destinatario: dados.destinatario, valor: dados.valor },
    };
  }

  if (listaAmbigua.length) {
    return {
      mensagem: `Encontrei mais de uma pessoa: ${listaAmbigua.join(', ')}. Qual deles?`,
      dados,
    };
  }

  if (!dados.destinatario) {
    return {
      mensagem: 'Para quem você quer enviar o Pix?',
      dados,
    };
  }

  if (!dados.valor) {
    return {
      mensagem: `Qual valor você quer enviar para ${dados.destinatario}?`,
      dados,
    };
  }

  return {
    mensagem: `Você deseja enviar um Pix de ${formatarMoeda(dados.valor)} para ${dados.destinatario}?`,
    dados,
  };
}
