<div align="center">

# socratic.dev

**The AI never gives you the answer. It leads you to it.**

A Socratic programming tutor: you solve real code and architecture challenges,
and the AI answers questions with questions — like a good tech lead in a pair programming session.

[Stack](#stack) · [How it works](#how-it-works) · [Running locally](#running-locally) · [Architecture](#architecture) · [Deploy](#deploy)

</div>

---

## The problem

AI tools today hand you the finished answer. You paste it, it works, and you learned nothing.
In the interview — or in real work — the cheat sheet isn't there.

**socratic.dev flips that.** The AI has a single unbreakable rule: **never reveal the solution.**
It asks, probes, points to the next step — and forces you to think. Learning happens
in the effort, not in the answer.

## Two tracks

| Track | What you do | How the AI evaluates |
|---|---|---|
| **Code** | Solve challenges in a real Monaco editor, with hidden tests running in the browser | Socratic tutor via text + real tests executed in a sandbox |
| **System Design** *(architecture)* | Draw the architecture on an Excalidraw canvas — services, databases, queues, data flow | The AI **sees the diagram** (vision) and interrogates every distribution/scaling decision |

From beginner to big-tech level — difficulty scales with your profile.

## How it works

```
Onboarding  →  pick a track + stack + level
            →  the AI GENERATES (or reuses) a tailor-made challenge

Workspace   →  you solve it (code in Monaco / architecture in Excalidraw)
            →  talk to the tutor: it only asks questions
            →  ask for a hint when stuck (costs from your balance)

Submit      →  Code:    runs the hidden tests → real pass/fail
            →  Design:  exports the PNG → Claude analyzes the image → feedback
            →  metrics: independence, hints used, time
```

### The AI is indispensable by design

Remove the AI and the product ceases to exist. It is not a garnish — it **generates the challenges**,
**drives the Socratic dialogue**, **analyzes the architecture diagram through vision** and **measures your
independence**. There is no static fallback: without AI there is no challenge, no tutor, no evaluation.

## Features

- **Socratic tutor** — `claude-sonnet-5` with prompts that forbid revealing the solution; separate modes for code and design.
- **Monaco editor + real runner** — JS/TS tests run in an isolated **Web Worker** (transpiled via `sucrase`), with a timeout. Nothing is hardcoded; the green only shows up if the tests pass.
- **Excalidraw canvas + Claude Vision** — the diagram becomes a PNG and is analyzed by vision; the chat uses a *text summary* of the elements to save tokens, and vision is only called on submit.
- **Smart challenge generation** — difficulty depends heavily on the level; advanced targets FAANG-style tests.
- **Reusable library** — every generated challenge becomes a shared pool: the next person gets it instantly, without regenerating (less waiting, lower cost). Deduplication so nothing repeats.
- **Hint economy (SaaS)** — free weekly balance + purchasable extra hints + "Solve it for me" as an expensive last resort that **applies** the solution straight into the editor / canvas.
- **Solve it for me** — doesn't return text: it writes the code into Monaco, or builds the diagram in Excalidraw (layered, didactic layout with labeled arrows).
- **Dashboard** — GitHub-style activity heatmap, independence ring, paginated history with resume-where-you-left-off.
- **Persistent drafts** — code + chat survive an F5 (localStorage).

## Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, React Compiler) |
| UI | **React 19**, **Tailwind v4**, Base UI, Motion, Recharts, Lucide |
| Editor / Canvas | **Monaco** (code) · **Excalidraw** (architecture) |
| AI | **Claude** via `@anthropic-ai/sdk` (text + vision, adaptive thinking + effort, prompt caching, streaming) |
| Backend | **Supabase** — Postgres, Auth, RLS |
| Code execution | **Web Worker** + `sucrase` (in-browser sandbox) |
| Language | **TypeScript** (strict) |

## Running locally

**Prerequisites:** Node 20+, a [Supabase](https://supabase.com) account and an [Anthropic](https://console.anthropic.com) API key.

```bash
# 1. Install dependencies (Excalidraw's peer deps require the flag)
npm install --legacy-peer-deps

# 2. Configure environment variables
cp .env.example .env.local   # then fill in the values

# 3. Apply the migrations to your Supabase project
supabase link --project-ref <your-ref>
supabase db push

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # anon key (public)
SUPABASE_SERVICE_ROLE_KEY=       # service-role key (server only — never expose to the client)
ANTHROPIC_API_KEY=               # Anthropic API key
```

> `.env.local` is in `.gitignore`. **Never** commit keys. In production, set them in Cloudflare Workers Variables/Secrets (or your host’s dashboard). See [Deploy](#deploy).

## Architecture

The project is organized in a feature-based structure, separating UI, domain, integrations and application logic.

```
src/
├─ app/                 App Router routes and minimal entrypoints
│  ├─ api/              Only the HTTP routes still exposed
│  ├─ challenge/
│  ├─ challenges/
│  ├─ dashboard/
│  ├─ design/
│  ├─ login/
│  ├─ onboarding/
│  ├─ profile/
│  └─ page.tsx
├─ components/          Shared components
│  └─ ui/
├─ domain/              Domain constants and rules
├─ features/            Per-feature modules
│  ├─ auth/
│  ├─ challenges/
│  ├─ dashboard/
│  ├─ design/
│  ├─ hints/
│  ├─ landing/
│  ├─ onboarding/
│  ├─ profile/
│  └─ runner/
├─ hooks/               Shared hooks
└─ lib/                 Integrations and infrastructure
   ├─ ai/
   ├─ api/
   └─ supabase/
```


## Deploy

### Cloudflare Workers (OpenNext) — recommended for labs

This app deploys to **Cloudflare Workers** via [@opennextjs/cloudflare](https://opennext.js.org/cloudflare).

**Build command** (Workers Builds / CI) must use OpenNext, not plain `next build`:

```bash
bun run build:cloudflare
# equivalent: npx opennextjs-cloudflare build
```

Deploy scripts already wrap that:

```bash
bun run deploy    # build + deploy
bun run preview   # build + local preview
```

`bun run build` (`next build`) is fine for local validation, but Cloudflare production should run **`build:cloudflare`**.

#### Required Variables / secrets in Workers Builds

Set these in **Cloudflare → Workers → your app → Settings → Variables and Secrets** (and ensure they are available to the **build** step for any `NEXT_PUBLIC_*` values):

| Name | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Build + runtime Variable | Required at build for client bundles |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build + runtime Variable | Required at build for client bundles |
| `NEXT_PUBLIC_SITE_URL` | Build + runtime Variable | Public origin incl. labs basePath, e.g. `https://labs.borderlesscoding.com/socratic-dev` |
| `SUPABASE_SERVICE_ROLE_KEY` | Runtime **Secret** | Server only — never `NEXT_PUBLIC_` |
| `ANTHROPIC_API_KEY` | Runtime **Secret** | Server only |
| `STRIPE_SECRET_KEY` | Runtime **Secret** | If checkout is enabled |
| `STRIPE_WEBHOOK_SECRET` | Runtime **Secret** | If webhooks are enabled |
| `NEXT_PUBLIC_SENTRY_DSN` | Build + runtime Variable | Optional |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Build + runtime Variable | Optional |

> A code change makes Supabase clients initialize lazily so missing env no longer crashes **module import** during page-data collection — but you still **must** set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as Workers build Variables. Without them, client routes and auth will fail at runtime (and some client bundles may still need them inlined at build).

After deploying, in **Supabase → Authentication → URL Configuration**, set **Site URL** and **Redirect URLs** for the labs origin (including `/socratic-dev`).

### Vercel (alternative)

1. Import the repository on **Vercel** (it detects Next.js automatically).
2. Set the environment variables from [Environment variables](#environment-variables) above.
3. Configure Supabase Auth redirect URLs for your production domain.

```bash
bun run build   # validate a plain Next production build locally
```

## Scripts

| Command | What |
|---|---|
| `bun run dev` / `npm run dev` | Dev server (Turbopack) |
| `bun run build` | Plain Next production build |
| `bun run build:cloudflare` | OpenNext Cloudflare build (use this on CF) |
| `bun run deploy` | OpenNext build + Cloudflare deploy |
| `bun run start` | Serve the Next build |
| `bun run format` | Prettier |

---

<div align="center">
© 2026 Socratic.dev
</div>

