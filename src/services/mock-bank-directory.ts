// Espelha worker/dados.py do backend. Quando o backend estiver disponível,
// a busca por destinatário passa a ser feita por lá e este arquivo pode sair.

export interface Contato {
  nome: string;
  parentesco: string;
}

export const contatos: Contato[] = [
  { nome: 'João Silva', parentesco: 'irmão' },
  { nome: 'Maria Oliveira', parentesco: 'irmão' },
  { nome: 'Ana Souza', parentesco: 'prima' },
  { nome: 'Pedro Rocha', parentesco: 'primo' },
  { nome: 'Gabriel Lima', parentesco: 'tio' },
  { nome: 'João Santos', parentesco: 'vizinho' },
  { nome: 'Carla Pereira', parentesco: 'mãe' },
  { nome: 'Fernando Costa', parentesco: 'pai' },
  { nome: 'Julia Mendes', parentesco: 'tia' },
  { nome: 'Lucas Teixeira', parentesco: 'sobrinho' },
  { nome: 'Marta Guimarães', parentesco: 'avó' },
  { nome: 'Rafaela Fernandes', parentesco: 'amiga' },
  { nome: 'Thiago Almeida', parentesco: 'colega' },
  { nome: 'Sofia Castro', parentesco: 'vizinha' },
  { nome: 'Davi Barbosa', parentesco: 'cunhado' },
  { nome: 'Clara Reis', parentesco: 'sogra' },
  { nome: 'Bento Pires', parentesco: 'padrinho' },
  { nome: 'Helena Nunes', parentesco: 'madrinha' },
  { nome: 'Enzo Dantas', parentesco: 'primo' },
  { nome: 'Luana Vieira', parentesco: 'prima' },
];

export function consultaBancoDeDados(
  termoBuscado: string,
  parametroBuscado: 'nome' | 'parentesco',
): Contato[] {
  const termo = termoBuscado.toLowerCase();
  return contatos.filter((contato) => contato[parametroBuscado].toLowerCase().includes(termo));
}
