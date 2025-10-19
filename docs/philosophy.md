# Engineering Philosophy

Our goal is to ship a useful MVP quickly, while keeping a clear path to scale the codebase safely. We optimize for developer speed now, and codebase clarity over time.

## Pragmatic Plan

- Keep page components as orchestrators; split heavy UI into small feature components.
- Centralize feature logic in composables when it starts to sprawl.
- Use Pinia for domain state (`profiles`, `wizard`); avoid ad‑hoc globals.
- Extract shared constants/types once they are used in 2+ places.
- Favor incremental refactors over big‑bang rewrites.

## MVP Guardrails

- Routing/pages: Pages own navigation and data loading; children stay “dumb” (props in, events out).
- State: Pinia stores only for domain state; `useState` only for trivial globals.
- Validation: Minimal client checks now; add schema validation (e.g., zod) at API boundaries when stabilized.
- UI: Keep the current color scheme and button wording as‑is during MVP.
- Dependencies: Add only high‑leverage libs that reduce code (VueUse, zod, Headless UI); avoid heavy infra changes.

## “SOTA” Vue/Nuxt Stack Choices

- State: Pinia (`@pinia/nuxt`).
- Utilities: `@vueuse/nuxt` for storage, clipboard, debounced refs, etc.
- Forms: `vee-validate` + `zod` when forms get complex.
- Data fetching: Nuxt `$fetch` or `useFetch`; consider `@tanstack/vue-query` if you need caching/invalidations.
- Icons: `nuxt-icon` + a small `iconMap` in `lib/ui/icons.ts`.

## File/Code Organization

- Components live under `components/<feature>/...` (e.g., `components/ai-assistant/...`).
- Composables live under `composables/use<Feature>.ts` (e.g., `useAiAssistant`).
- Shared constants/types under `lib/<feature>/...` and `types/` as needed.
- Server endpoints validate input and return typed responses; keep mocks while backend stabilizes.

