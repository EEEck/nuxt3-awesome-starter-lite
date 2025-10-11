# Grading Wizard MVP

This repository contains a stripped-down Nuxt 3 frontend scaffold focused on the grading wizard flow. It keeps the core
technologies we need for the MVP—Nuxt 3, Vue 3, Pinia, Tailwind CSS, Vue Query, and Zod—while removing the demo layouts, theme
switchers, and other sample content from the original starter template.

## Features

- ✅ Client-side Nuxt 3 app (`ssr: false`)
- ✅ Tailwind CSS for styling
- ✅ Pinia store powering a six-step grading wizard
- ✅ Vue Query + composable API helper
- ✅ Zod schemas for rubric, answers, and results validation
- ✅ Stub API endpoint for `/api/grade/exam`
- ✅ Playwright smoke test that exercises the entire wizard

## Getting started

```bash
pnpm install
pnpm dev
```

The app will boot at `http://localhost:3000`. Navigate to `/grading-wizard` to walk through the flow.

## Testing

```bash
pnpm exec playwright test
```

## Project structure

```
├── components/grading-wizard   # Individual wizard steps
├── composables                 # API and grading helpers
├── layouts                     # Default shell with navigation
├── lib                         # Shared Zod schemas
├── pages                       # Dashboard, wizard, and placeholder routes
├── server/api                  # Stub endpoint for grading
└── stores                      # Pinia wizard store
```

## License

MIT
