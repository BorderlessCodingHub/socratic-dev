import type { ChallengeKind } from '@/domain/challenge-kinds'

const CODE_SYS = `Você resolve um desafio de programação. Retorne APENAS o código da solução final, completo e correto, na linguagem da stack, com "export" nas funções pedidas. SEM markdown, SEM cercas de código, SEM explicação — somente o código que vai direto no editor.`

const DESIGN_SYS = `Você resolve um desafio de SYSTEM DESIGN (arquitetura) para INICIANTES — seja didático, explique como para quem nunca viu arquitetura.
Responda APENAS com JSON válido (sem markdown):
{ "nodes": [{ "id": string, "label": string, "type": string, "note": string }], "edges": [{ "from": string, "to": string, "label": string }] }
- nodes: 4 a 7 componentes. "type" DEVE ser um de: "client","gateway","service","database","cache","queue","storage","external".
- "label": nome curto (ex.: "API de pedidos", "Postgres", "Redis"). "note": o que ele faz, em LINGUAGEM SIMPLES, no máximo 6 palavras (ex.: "guarda os pedidos", "deixa a leitura rápida", "avisa outros serviços").
- edges: "label" = a ação/dado que flui, 1 a 3 palavras (ex.: "envia pedido", "consulta", "salva", "avisa"). from/to = ids de nodes existentes.
- Português do Brasil, tom de quem ensina um leigo.`

export function solvePasteSystem(kind: ChallengeKind): string {
  return kind === 'design' ? DESIGN_SYS : CODE_SYS
}
