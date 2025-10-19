# UI Refactor Guide

This guide describes how we will migrate the legacy frontend to the Nuxt 3 + Pinia stack while preserving user-facing UX (colors, wording, and button behaviors).

## Principles

- Preserve current color scheme and the exact wording/features of most buttons.
- Replace ad‑hoc event buses and custom datastores with Pinia stores and composables.
- Prefer small, incremental PRs that ship value without breaking flows.
- Keep pages thin; push logic into composables and UI into feature components.

## Process

1) Inventory legacy UI
   - Read through `old_reference_frontedn/` and map screens/components to current features.
   - Identify feature gaps vs. the MVP wizard/profile flows.

2) Prioritize migration
   - Move only what’s needed to support the MVP (profiles + grading wizard).
   - Defer or stub features not required for the MVP.

3) Create structure in the new app
   - Feature components go under `components/<feature>/` (e.g., `components/grading-wizard`, `components/ai-assistant`).
   - Global UI assets (icons, tokens) live under `lib/ui/` (e.g., `lib/ui/icons.ts`).
   - Feature constants/types live under `lib/<feature>/` and `types/`.
   - Domain state uses Pinia stores under `stores/` (e.g., `stores/profiles.ts`, `stores/wizard.ts`).

4) Port behavior faithfully
   - Keep colors and copy as in legacy unless there’s a clear UX win.
   - Match button semantics and flows (enable/disable, next/back) to avoid surprise.

5) Replace legacy patterns with SOTA Vue
   - Use Pinia instead of custom datastores.
   - Use composables (`composables/use...`) instead of event buses.
   - Prefer script setup SFCs, props/emits, and `defineModel`/`v-model` over manual sync.

6) Validate incrementally
   - After each slice, run through the flow end‑to‑end.
   - Keep API mocks (`server/api/*`) until backend is wired; add schema validation later.

## Quick Checklist

- [ ] Map legacy screens → new routes/components.
- [ ] Confirm preserved wording/colors for each migrated view.
- [ ] Replace event bus or custom store usages with Pinia actions/getters.
- [ ] Extract any repeated constants (icons, templates) under `lib/`.
- [ ] Add minimal composable(s) if state/actions spread over multiple components.

