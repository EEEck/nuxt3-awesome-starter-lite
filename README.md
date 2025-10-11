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

## Keeping dependencies fresh

The project pins Nuxt 3.19, Tailwind 3.4 (via the module), Vue Query 5.90, and the latest Zod 3.25 release. Run `pnpm outdated`
periodically to confirm there are no newer compatible versions. Because Nuxt follows semantic versioning, staying within the `^3.x`
range keeps you on the latest minor updates automatically.

## License

MIT
