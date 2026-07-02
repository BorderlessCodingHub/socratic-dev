import type { ChallengeKind } from '@/domain/challenge-kinds'
import type { Locale } from '@/lib/i18n'
import { languageDirective } from './locale'

const CODE_SYS = `Você resolve um desafio de programação. Sua solução DEVE passar em TODOS os testes fornecidos pelo usuário — esses testes são a verdade do desafio. Retorne APENAS o código da solução final, completo e correto, na linguagem da stack, com "export" nas funções pedidas. SEM markdown, SEM cercas de código, SEM explicação — somente o código que vai direto no editor.`

const DESIGN_SYS = `Você é um staff engineer resolvendo um desafio de SYSTEM DESIGN com um diagrama de arquitetura profissional.
Responda APENAS com JSON válido, sem markdown nem texto fora do JSON:
{ "nodes": [{ "id": string, "label": string, "type": string, "note": string, "tier": number }], "edges": [{ "from": string, "to": string, "label": string, "dashed": boolean }] }

NODES (6 a 10 componentes):
- "type" DEVE ser um de:
  "client" = app ou browser do usuário
  "cdn" = assets servidos na borda
  "lb" = balanceador de carga
  "gateway" = porta de entrada da API
  "service" = serviço de lógica de negócio
  "worker" = processamento em background
  "queue" = fila de mensagens/eventos
  "cache" = leitura rápida em memória
  "database" = dados transacionais persistentes
  "storage" = arquivos e objetos
  "search" = índice de busca dedicado
  "external" = serviço de terceiros
- "label": 1 a 2 palavras (ex.: "API", "Postgres", "Redis"). NUNCA nomes de pessoas do briefing — o diagrama é genérico.
- "note": MÁXIMO 4 palavras, sem repetir o label (ex.: "valida tokens", "réplicas de leitura").
- "tier" (opcional, 0 a 5): força a camada vertical — 0 = cliente no topo, 5 = dados na base. Use só quando a topologia pedir (ex.: worker ao lado da queue, search na camada dos dados). Se omitir, a camada é inferida do type.

EDGES:
- "label": 1 a 2 palavras de ação (ex.: "consulta", "publica evento"). from/to = ids existentes, sem self-loop.
- "dashed": true APENAS em fluxos assíncronos (fila, eventos, jobs). Omita em chamadas síncronas.

EXIGÊNCIAS de arquitetura:
- Pelo menos um "database".
- Caminho claro do topo à base, sem pular camadas (cliente NUNCA fala direto com o banco).
- Pelo menos uma camada com 2+ nós lado a lado — nada de coluna única.
- Se o briefing pedir escala, mostre réplicas/shards (ex.: service "API ×N" com note "réplicas", ou dois services em paralelo).
- Escolha só os types que o problema exige, como você defenderia num design review.`

export function solvePasteSystem(kind: ChallengeKind, locale: Locale): string {
  const base = kind === 'design' ? DESIGN_SYS : CODE_SYS
  return `${base}\n${languageDirective(locale)}`
}
