Backend Integration Guide

Overview
- The app ships with a minimal fake backend using Nuxt server routes under `server/api/*` to keep the UI testable end‑to‑end.
- Replace or proxy these routes to your real services as they become available. Keep payloads aligned with the Zod schemas in `lib/schemas.ts`.

Current mock endpoints
- `POST /api/grade/exam`
  - Input: `{ rubric, submissions, context? }`
  - Output: `ResultsSchema` (per‑student results and per‑question breakdown)
- `POST /api/process-student-scan`
  - Input: `FormData { file, custom_instructions?, pages? }`
  - Output: `{ student_name, answers, confidence?, question_confidence? }`
- `POST /api/process-rubric-scan`
  - Input: `FormData { file, custom_instructions?, pages? }`
  - Output: `{ exam_name, general_instructions, questions[], confidence? }`
- `POST /api/pdf-page-count`
  - Input: `FormData { file }` → Output: `{ page_count }`
- `POST /api/pdf-slice`
  - Input: `FormData { file, pages }` → Output: subset PDF blob
- `POST /api/question-types/detect`
  - Input: `{ exam_rubric, profile? }` → Output: `{ question_types: [{ question_index, detected_type, confidence }] }`
- `POST /api/rubric-feedback`
  - Input: `{ exam_rubric, clarification }` → Output: `{ feedback }`
- `POST /api/processed-documents`, `GET /api/processed-documents/:id`
  - Local session persistence for the scan processor (in-memory / local storage facade).

Environment / configuration
- Public base URL: `NUXT_PUBLIC_API_BASE` (optional). If set, client calls can proxy to your backend.
- Authentication: add your auth plugin/middleware and forward cookies/headers from client to server routes.

Migration plan
1) Stabilize request/response shapes with Zod schemas in `lib/schemas.ts` (shared at client boundaries).
2) Swap the handler bodies in `server/api/*` to call your real services (or proxy them) and pass through validated data.
3) Keep mocks available behind a feature flag (e.g., `NUXT_PUBLIC_USE_MOCKS=false`) for local/offline development.
4) Extend stores to include IDs/links your backend returns (document IDs, job IDs, etc.) rather than synthesizing them.

Contracts owned by stores
- `stores/rubricEdit.ts` coordinates rubric editing, ensures criteria sums match question max points, and performs client validation.
- `stores/scan.ts` orchestrates scan upload → processing → review, and computes review progress; it is backend‑agnostic.
- `stores/wizard.ts` only wires steps and holds current payloads; it does not own network logic.

Testing
- Keep Playwright smoke tests running against the mocks to guard UI flows while you enable real endpoints behind a flag.

