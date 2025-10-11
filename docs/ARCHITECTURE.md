# Architecture overview

This document supplements the README with details about how the grading wizard MVP is assembled and where to extend it when you
start iterating on the product.

## Application shell & routing

- `app.vue` registers shared metadata and wraps every page in the default layout while providing a loading indicator. Use this file
to register global head tags or application-wide providers.
- `layouts/default.vue` pipes all pages through `AppShell`, which renders the navigation menu and beta badge. Edit the `links`
array to control the items in the sidebar/topbar.
- Nuxt automatically treats files under `pages/` as routes. The grading wizard lives at `pages/grading-wizard/index.vue`, which
defines the step registry and progress UI.

## State management

- `stores/wizard.ts` is a Pinia store that tracks the current step, uploaded rubric/answers/results, and derived status such as
`canRun`. Methods like `next`, `previous`, and `goTo` guard against invalid indices. Because all setters parse payloads with the
Zod schemas, invalid data is rejected immediately.
- Steps import the store via `useWizardStore()`. For example, `components/grading-wizard/StepProfile.vue` synchronizes local input
with `wizard.setProfile` and advances the flow when the user clicks **Next**.

## Forms, uploads, and validation

- Shared Zod schemas live in `lib/schemas.ts`. They describe the rubric questions, answer submissions, and aggregated results.
Because both the client and the server import from the same file, the shape stays consistent end-to-end.
- Step components use the schemas indirectly by calling the Pinia setters; the stub API uses them directly to parse incoming data
and to validate the response shape before returning it to the client.

## Server communication

- A single mock endpoint exists at `server/api/grade/exam.post.ts`. It accepts the payload from the wizard, optionally derives an
average score, and responds with data shaped like the eventual grading service. Swap this handler for a real integration when the
backend is ready, or create additional files under `server/api` to expand the mock surface.
- Use Vue Query (`@tanstack/vue-query`) to wrap calls to these endpoints inside the step components. Mutations give you request
status flags for loading spinners and error banners.

## UI composition

- UI primitives such as `AppShell`, `PageHeader`, and `KpiCard` live under `components/ui/`. They provide a consistent, enterprise-
ready look while staying lightweight enough for iteration. Replace or simplify them if you want a barebones MVP aesthetic.
- The wizard steps themselves focus on the core interactions (profile selection, uploads, review, results) and lean on Tailwind
utility classes for styling. Start here if you plan to restyle the experience.

## Testing strategy

- `tests/wizard.spec.ts` is a Playwright smoke test that automates the happy path through every step, ensuring the UI wiring and
store updates stay intact as you refactor. Extend this file with regression checks for edge cases (e.g., validation errors).
- When the API starts returning real responses, add fixtures or mock service workers so the Playwright run stays deterministic.

## Where to simplify further

- Remove dark-mode support by deleting the `@nuxtjs/color-mode` module and the `ThemeToggle` component once you decide on a single
brand palette.
- If file uploads are unnecessary for the first milestone, replace them with textarea pastes to keep the UX friction low.
- Consider consolidating the sidebar navigation if the wizard becomes the only primary route; this reduces layout chrome and keeps
the focus on the core flow.
