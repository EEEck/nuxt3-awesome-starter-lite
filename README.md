# Grading Wizard MVP

A focused Nuxt 3 frontend for exploring an end-to-end grading workflow. The project keeps only the flows, components, and tooling
required for the multi-step "grading wizard" experience so you can experiment quickly without carrying extra demo UI baggage.

## Tech stack

| Area | Choice | Notes |
| --- | --- | --- |
| Framework | [Nuxt 3](https://nuxt.com/) (`nuxt@^3.19.3`) | Server-side rendering is enabled (`ssr: true`) and can be toggled if you prefer a client-only build. |
| UI | Tailwind CSS via `@nuxtjs/tailwindcss` | Global styles live in `assets/css/main.css` with additional design tokens in `tailwind.config.ts`. |
| State | Pinia store (`stores/wizard.ts`) | Centralizes wizard state and guards transitions between the six steps. |
| Data fetching | `@tanstack/vue-query` + composable API helper | Use query/mutation hooks inside wizard steps to call Nuxt server routes or external APIs. |
| Validation | Zod schemas in `lib/schemas.ts` | Shared between the client store and API routes to keep payloads aligned. |
| Testing | Playwright (`pnpm exec playwright test`) | Smoke test walks through the entire wizard to ensure regressions are caught early. |

## Getting started

### Prerequisites

- Node.js 18.19+ (matches the Nuxt 3 requirement)
- [pnpm](https://pnpm.io/) 8+

### Installation & local development

```bash
pnpm install             # install dependencies
pnpm dev                 # start Nuxt in development mode
```

The dev server boots at [http://localhost:3000](http://localhost:3000). Navigate to `/grading-wizard` to run through the workflow
from profile selection to results review.

Optional environment variables live in `nuxt.config.ts` (for example `NUXT_PUBLIC_API_BASE`). Provide them via `.env` or your shell if
you later connect to a real backend.

### Production build & preview

```bash
pnpm build               # compile for production
pnpm preview             # serve the built output locally
```

## Architecture overview

- Routing
  - `pages/grading-wizard` drives the step-by-step flow (profile → rubric → answers → grade → results).
  - `components/scan-processor` provides an optional split‑view to review AI‑extracted rubric/answers.
- State (Pinia)
  - `stores/wizard.ts` holds wizard step, selected profile, rubric, answers, and results.
  - `stores/rubricEdit.ts` manages rubric editing with undo/redo and validation.
  - `stores/scan.ts` powers the scan‑processor (upload, processing, review, export).
  - `stores/profiles.ts` provides grading profiles and question type catalogs.
- Shared UI building blocks
  - `components/shared/BaseReviewCard.vue`: consistent card chrome and accent behavior.
  - `components/shared/RubricQuestionEditor.vue`: question fields + criteria list, with validation badges.
  - `components/shared/ReviewActions.vue`: Approve/Flag/Remove actions (configurable).
  - `types/rubric.ts`: Criterion, RubricQuestion, ExamRubric types.
- Cards (composition over duplication)
  - Wizard: `components/cards/RubricQuestionCard.vue` (adds Question Type; no approve/flag).
  - Scan: `components/scan-processor/cards/RubricQuestionCard.vue` (approve/flag/remove; no Question Type).
  - `components/cards/StudentAnswerCard.vue` is shared; scan enables glow/confidence/clickable via props.

Data flow: parents pass immutable data to cards; cards emit granular updates (e.g., `update:questionId`, `update-criterion`). Stores apply the change, and auto‑sync rules (like criteria sum → max points) live in the stores.

### Testing

```bash
pnpm exec playwright test
```

Playwright runs the bundled smoke test that walks each wizard step. Use the `--ui` flag for an interactive runner during debugging.

## Project tour

```
├── app.vue                      # Application shell and layout injection
├── pages/grading-wizard         # Wizard route, step registration, and layout
├── components/grading-wizard    # Individual step implementations
├── stores/wizard.ts             # Pinia store managing step state & payloads
├── lib/schemas.ts               # Zod schemas shared across client & server
├── server/api/grade/exam.post.ts# Stubbed grading endpoint returning mock data
└── tests                        # Playwright smoke test
```

### Wizard flow in detail

1. `pages/grading-wizard/index.vue` wires the six steps, renders progress UI, and swaps the active component via `<component :is>`.
   It also exposes a "Reset wizard" action for quick testing.
2. Each step component (`components/grading-wizard/*.vue`) talks to the Pinia store. For example `StepProfile.vue` binds the selected
   profile ID and calls `wizard.next()` once a value is present.
3. The store (`stores/wizard.ts`) keeps track of the current step, uploaded assets, and derived state (`canRun`) before allowing the
   grading run. Shared setters use the Zod schemas to validate payloads.
4. The mock API at `server/api/grade/exam.post.ts` parses the incoming payload, synthesizes per-student scores, and returns a
   `ResultsSchema` response so the UI can render realistic data.

## Tips for faster MVP iterations

- **Disable optional polish** – If you do not need server rendering or theming yet, flip `ssr` to `false` and remove
  `@nuxtjs/color-mode` to shrink the surface area while prototyping.
- **Simplify styling tokens** – Tailwind is already configured; trimming the custom shadows, gradients, and typography in the step
  components can help you reach a neutral "startup MVP" look faster.
- **Stub services aggressively** – Keep using the `server/api` directory for lightweight mocks so the UI flow stays testable while the
  real grading service evolves.

## Productivity add-ons worth considering

- `@nuxt/devtools` for real-time component/state inspection inside the browser.
- `@vueuse/core` to lean on battle-tested composition utilities instead of writing boilerplate watchers or computed helpers.
- `nuxt-icon` or `@iconify/vue` if you need lightweight icons without importing a design system.
- `@nuxt/eslint` (or a simple ESLint config) once the codebase grows to keep conventions consistent.

These can be added incrementally without disrupting the current structure.

## Integrating into another Nuxt app

1) Copy directories (or mount as a package):
   - `components/shared`, `components/cards`, `components/grading-wizard`, `components/scan-processor`
   - `stores` (at least `wizard.ts`, `rubricEdit.ts`, `profiles.ts`, `scan.ts`)
   - `types/rubric.ts`, any used `lib/*` (e.g., `lib/schemas.ts`)
2) Ensure modules in `nuxt.config.ts`:
   - `@pinia/nuxt`, `@nuxtjs/tailwindcss`, `@vueuse/nuxt`, and your icon solution (`nuxt-icon`)
3) Add routes/pages
   - Mount `pages/grading-wizard` (or nest under your app’s route). Optionally expose the scan processor page.
4) Server stubs (optional while wiring backend)
   - Keep `server/api/*` mocks or point to your backend via env (e.g., `NUXT_PUBLIC_API_BASE`).
5) Styling
   - Merge Tailwind config tokens if needed; shared components only rely on Tailwind utilities.
6) QA
   - Run `pnpm dev`, visit `/grading-wizard`, and walk through the steps. If using the scan processor, exercise upload → review.

## Developer API docs

- Store and types API (Markdown via TypeDoc)
  - `pnpm docs:api` → outputs Markdown under `docs/api/` for all TS stores and types.
  - We use TSDoc/JSDoc comments on store actions/getters to drive this.
- Component props/events (Markdown via vue-docgen)
  - `pnpm docs:components` → outputs Markdown under `docs/components/` for all Vue SFCs in `components/`.
  - vue‑docgen parses `script setup` props/emits and generates tables automatically.

See `docs/backend_integration.md` for how the current mock endpoints map to real services and how to switch over.

## Keeping dependencies fresh

The project pins Nuxt 3.19, Tailwind 3.4 (via the module), Vue Query 5.90, and the latest Zod 3.25 release. Run `pnpm outdated`
periodically to confirm there are no newer compatible versions. Because Nuxt follows semantic versioning, staying within the `^3.x`
range keeps you on the latest minor updates automatically.

## Vue/Nuxt packages used

- `nuxt`
  - Nuxt 3 app framework (routing, server routes, dev server, build).
- `@pinia/nuxt` + `pinia`
  - State management. Provides `defineStore` and Nuxt auto‑registration of stores under `stores/`.
- `@vueuse/core`
  - Utility composables (e.g., `useMagicKeys`, drag/resize helpers). Reduces boilerplate watchers/refs.
- `@tanstack/vue-query`
  - Data fetching/cache. Use queries/mutations for server calls, optimistic updates, retries.
- `@nuxtjs/tailwindcss`
  - Tailwind integration and build‑time config. All components styled with Tailwind utilities.
- `@nuxt/icon`
  - Lightweight icon component that renders Iconify sets (lucide/mdi bundled as dev deps).
- `zod`
  - Runtime schema validation for payloads and API IO (`lib/schemas.ts`).
- `vuedraggable`
  - Drag‑and‑drop lists (reordering criteria/questions). Wizard uses a visible drag handle.
- `vue-sonner`
  - Toast notifications (e.g., detect question types feedback).
- `pdf-lib`
  - Client‑side PDF slicing/processing utilities used by the scan processor.

## License

MIT
# Docker
## Quick Start
1) Build and start the dev server
`docker compose up --build`

2) Open the app
→ http://localhost:3000

## Comon Tasks
Rebuild after changing dependencies or Dockerfile
`docker compose build --no-cache`
`docker compose up`
Install new package 
# runtime dep
`docker compose exec web pnpm add <package>`

# dev dep
`docker compose exec web pnpm add -D <package>`

clean reset: 
If the named volumes are stale, do a clean reset:
```bash
docker compose down
docker volume rm nuxt3-awesome-starter-lite_node_modules nuxt3-awesome-starter-lite_pnpm-store
docker compose up --build
```
## Ports & volumes

App: http://localhost:3000

HMR (WebSocket): 24678

Volumes: ./ → /app (your code, live-mounted)

named volumes for /app/node_modules and /pnpm/store (fast installs)

Troubleshooting

Changes don’t hot-reload? We enable polling (CHOKIDAR_USEPOLLING=1) in the service. If needed, restart docker compose up.

Package install fails? Run the add command via docker compose exec web … so node_modules stays inside the container.

Port in use? Change the host port mapping in docker-compose.yml (e.g., 3001:3000) and restart.
