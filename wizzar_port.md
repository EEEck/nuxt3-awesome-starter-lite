# Grading Wizard Port Plan

Goal: Recreate the legacy grading wizard (step-by-step flow) in the Nuxt 3 stack, preserving key UX and interaction patterns from `old_reference_frontedn/frontend/pages/grading-wizard/templates` while aligning to modern components, Pinia store, and Nuxt conventions.

## Scope & Outcomes
- Clean entry at `/grading-wizard` with clear step navigation and progress.
- Steps: Profile → Rubric Upload → Rubric Review → Answers Upload → Run Grading → Results.
- Optional legacy scan/selection flow to be integrated later (PDF upload + page selection).
- Replace legacy EventBus actions with Pinia state and actions.
- Use Nuxt server route for mock grading; keep types and Zod schemas for payloads.

## Reference Mapping (Legacy → New)
- ProfileStepTemplate.js → `components/grading-wizard/StepProfile.vue`
- RubricStepTemplate.js → `components/grading-wizard/StepRubricUpload.vue`
- RubricEditStepTemplate.js → `components/grading-wizard/StepRubricEdit.vue` + `RubricEditor.vue`
- UploadStepTemplate/ReviewStepTemplate (answers) → `components/grading-wizard/StepAnswersUpload.vue`
- GradingStepTemplate.js → `components/grading-wizard/StepGradingRun.vue` (or `StepGrade.vue` until unified)
- Results rendering (wizard:grading-complete) → `components/grading-wizard/StepResults.vue`
- ScanRubricStepTemplate.js + file management → `components/grading-wizard/StepScanPdf.vue` + `LegacyPdfPicker.vue` (optional phase)

## Data Model (Pinia: `stores/wizard.ts`)
- step: current step key with fixed order.
- profileId?: string
- rubric: ExamRubric | null
- answers?: unknown (validated by Zod schema)
- results?: GradeResult
- busy: boolean, error?: string
- Optional scan data: pdfFile?: File, selectedPageIndices?: number[], docs: ScanDoc[]

Getters & Actions
- `canRun`: profileId && rubric && answers
- Navigation: `go(step)`, `next()`, `prev()`, `reset()`
- Mutations: `setProfile`, `setRubric`, `replaceRubric`, `setAnswers`, `setResults`
- Optional: `setPdf`, `setSelectedPages`, `setDocs`, `updateDoc`, `setExtract`

## Routes & Structure
- `pages/grading-wizard/index.vue`: orchestrates steps, progress bar, and reset.
- `pages/index.vue`: landing page with link to the wizard.
- Keep `/grading-wizard` canonical; no aliasing required.

## UX & Behaviors
- Each step should validate minimal inputs and call `wizard.next()`.
- Uploads: JSON-only for rubric and answers (drag/drop or file input).
- Grading run: call `POST /api/grade/exam` (mock), on success set results and advance.
- Results: simple list with summary; “Start over” resets store.

## Phased Milestones
1) Skeleton & Store
   - Confirm route, steps, and store API (done/ongoing).
2) Profile + Rubric Upload
   - Port UX copy and basic validation from legacy templates.
3) Rubric Review
   - Hook `RubricEditor.vue` behavior; enable replace/undo basics if needed.
4) Answers Upload
   - Validate against Zod schema; show first error inline.
5) Grading Execution
   - Call Nuxt server mock; wire success/err states; disable double-submit.
6) Results View
   - Render per-student/per-question summaries.
7) Optional PDF Scan Flow
   - Recreate legacy selection affordances via `LegacyPdfPicker.vue`.

## Risks & Notes
- Legacy EventBus patterns: replaced by Pinia; ensure feature parity without 1:1 ports.
- Schema drift: ensure `lib/schemas.ts` matches payload used in steps and API.
- Keep components small and composable to avoid monolith step files.

## Next Actions (Start)
- Unify grading step (use `StepGradingRun.vue`) and remove/retire `StepGrade.vue` after parity.
- Tighten `StepResults.vue` fields to match server response (add types and computed mappings).
- Improve `StepRubricUpload.vue` UX to mirror legacy hints and error states.

