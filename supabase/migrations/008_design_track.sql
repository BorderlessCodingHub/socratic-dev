-- Design System challenge track: a second kind of challenge where the user
-- draws on an Excalidraw canvas and Claude reviews it (vision) instead of code.

alter table public.challenges
  add column if not exists kind text not null default 'code'
  check (kind in ('code', 'design'));

-- Design challenges have no programming language; allow stack = 'design'.
alter table public.challenges drop constraint if exists challenges_stack_check;
alter table public.challenges
  add constraint challenges_stack_check
  check (stack in ('javascript', 'typescript', 'design'));

-- Seed two design-system challenges.
insert into public.challenges (title, description, stack, level, client_briefing, intro, kind)
values
  (
    'Tokens de cor para dark mode',
    'Desenhe a arquitetura de tokens de cor que suporta light e dark mode sem reescrever componentes.',
    'design',
    'intermediate',
    $b$A fintech NuBlue está crescendo e o time de design pediu um sistema de tokens de cor que funcione em light E dark mode sem reescrever os componentes.

Desenhe no canvas a arquitetura em 3 camadas e ligue com setas quem referencia quem:
1. Tokens PRIMITIVOS (ex.: blue-500, gray-900, white) — a paleta crua.
2. Tokens SEMÂNTICOS (ex.: bg-surface, text-primary, border-default) — apontam para primitivos.
3. COMPONENTES (ex.: Botão, Card) — consomem só os semânticos, nunca os primitivos.

Mostre também como o dark mode troca o mapeamento semântico → primitivo (o componente não muda).$b$,
    $i$Olá. Antes de desenhar, pense: por que um Botão NUNCA deveria apontar direto para "blue-500"? O que precisa existir no meio — e por quê?$i$,
    'design'
  ),
  (
    'Anatomia de um componente Botão',
    'Mapeie as variantes, estados e tokens de um componente Botão de design system.',
    'design',
    'beginner',
    $b$Uma startup vai construir o primeiro componente do design system: o Botão.

Desenhe no canvas a anatomia dele, separando claramente:
- VARIANTES: primary, secondary, ghost, destructive.
- ESTADOS: default, hover, focus, disabled, loading.
- TOKENS que cada combinação consome: cor de fundo, cor de texto, borda, espaçamento.

Organize de forma que fique óbvio o que é variante vs estado, e o que muda em cada caso.$b$,
    $i$Olá. Pra começar: qual a diferença entre uma "variante" e um "estado" de um botão? Por que vale separar os dois desde o início?$i$,
    'design'
  );
