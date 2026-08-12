# TCC UFRJ — Frontend

Aplicativo móvel do banco, feito em **React Native (Expo)**. É o módulo de
interface do Trabalho de Conclusão de Curso de Engenharia de Computação e
Informação (UFRJ).

## Sobre o projeto

Interfaces gráficas de aplicativos bancários podem ser excludentes para
usuários idosos ou com baixo letramento digital. O trabalho investiga o uso de
**Modelos de Linguagem em Larga Escala (LLMs)** como interface assistiva para o
PIX: o usuário pede a transferência em linguagem natural — *"manda 50 reais pra
minha mãe"* — e o sistema interpreta a intenção, extrai destinatário e valor,
resolve o contato por palavras-chave (*mãe*, *irmão*, *chefe*, um apelido…) e
preenche a tela de confirmação do PIX.

Este repositório contém a **tela de chat** que conduz esse fluxo: coleta os
dados, trata ambiguidades ("encontrei mais de uma pessoa…"), pede a confirmação
e, ao final, produz o PIX pronto para seguir para a tela de envio.

> Protótipo acadêmico: não há integração real com o Banco Central ou
> instituições financeiras.

## Os outros módulos do sistema

O app é só uma parte. Para o sistema funcionar de ponta a ponta, é preciso
baixar também:

| Módulo | Repositório | Stack | Papel |
|---|---|---|---|
| **Frontend** (este) | [tcc_ufrj_frontend](https://github.com/FelipeVillela/tcc_ufrj_frontend) | React Native (Expo) | Aplicativo do banco, com a tela de chat |
| Chat Service | [tcc_ufrj_chat_service](https://github.com/FelipeVillela) | FastAPI + Celery + Redis | Recebe as mensagens, enfileira e chama a LLM (Google Gemini) |
| Users Service | [tcc_ufrj_users_service](https://github.com/FelipeVillela) | Quarkus (Java) + PostgreSQL + MongoDB | Usuários, saldo, chaves PIX e lista de contatos |

> Os links do Chat Service e do Users Service apontam temporariamente para a
> home do GitHub — os repositórios ainda serão criados.

**Enquanto os serviços não estiverem no ar, o app funciona sozinho**: a camada
de serviço usa dados simulados no próprio cliente
([`src/services/`](src/services/)), respeitando o mesmo contrato da API real —
trocar o mock por `fetch` não exige mudar o restante do app.

## Como executar

### Pré-requisitos

- Node.js 20+
- O app **Expo Go** no celular, ou um emulador Android / simulador iOS

### Rodando

```bash
npm install
npx expo start
```

Escaneie o QR code com o Expo Go, ou pressione `a` (Android), `i` (iOS) ou `w`
(navegador) no terminal.

> **Versão do SDK.** O projeto está no **Expo SDK 54** porque essa é a versão
> que o Expo Go publicado nas lojas suporta hoje. Cada versão do Expo Go aceita
> um único SDK — subir o projeto para um SDK mais novo faz o app recusar o
> projeto com *"Project is incompatible with this version of Expo Go"*.

## Estrutura

```
src/
├── app/                  # rotas (expo-router, file-based routing)
│   ├── _layout.tsx       # navegação por abas
│   ├── index.tsx         # tela de chat (Assistente Pix)
│   └── explore.tsx
├── components/chat/      # bolhas de mensagem, campo de envio, indicador
├── hooks/use-chat.ts     # estado da conversa e ciclo de envio/consulta
└── services/             # contrato da API + mock do backend
```

A camada de serviço espelha o contrato do Chat Service:

| Arquivo | Papel |
|---|---|
| `chat-api.types.ts` | Tipos do request/response, iguais aos do backend |
| `chat-api.ts` | `POST /messages` + `GET /messages/{id}` (hoje simulados) |
| `mock-chat-agent.ts` | Simula o agente da LLM enquanto o backend não está no ar |
| `mock-bank-directory.ts` | Lista de contatos simulada |

O fluxo é **assíncrono**, como no backend real: o envio devolve um
`message_id` e a resposta é buscada por *polling*.

## Scripts

```bash
npm start          # inicia o Metro (mesmo que npx expo start)
npm run android    # abre no Android
npm run ios        # abre no iOS
npm run web        # abre no navegador
npm run lint       # ESLint
npx tsc --noEmit   # checagem de tipos
```
