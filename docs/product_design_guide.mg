Product Design Guide (Wizard + Editors)

Purpose
- Capture the design language we’ve aligned on so new pages/components stay consistent and easy to build.
- Target: modern, minimal, professional (serious B2B), with light theme by default and tasteful color accents.

Core Principles
- Clarity first: strong information hierarchy, low noise, predictable placement.
- Minimal by default: white/neutral surfaces, subtle depth; reserve color for meaning and actions.
- Few choices on screen: show only what’s needed at the step the user is in.
- Accessibility: sufficient contrast, visible focus, descriptive labels, keyboard paths (Undo/Redo, navigation).
- Guardrails, not roadblocks: validate early, suggest fixes (e.g., “Redistribute”), keep users in flow.

Color & Tone
- Base: white surfaces (bg-white), cool grays (slate-50/100/200/300) for borders and secondary text.
- Brand accent: brand-600/500 (primary buttons, key calls to action), brand-50/100 for soft highlights.
- Semantic accents (soft, non-abrasive):
  - Info/Blue for creation and selection chips (blue-50/100/200; text-blue-700).
  - Success/Emerald for confirmations and downloads (emerald-50/100/200; text-emerald-700).
  - Warning/Amber for low confidence or mismatches (amber-300 ring, amber text hints).
- Use subtle gradients sparingly (e.g., card from white → slate-50) to add polish without clutter.

Typography
- System/Inter-like sans; sizes scale gently (14–18 body, 20–24 section titles).
- Headings: weight-medium/semibold; Body: regular; Small metadata: text-slate-500/600.

Surfaces & Depth
- Cards: rounded-2xl, 1px neutral border, small shadow. Add hover:shadow-md and border-slate-300 on hover.
- Section frames: subtle accent like border-l-4 border-l-slate-100.
- Sticky bars: translucent white with backdrop-blur for non-intrusive persistence.

Buttons
- Primary: bg-brand-600 → hover:bg-brand-500, text-white.
- Secondary: bordered neutral (border-slate-300, bg-white, hover:bg-slate-50).
- Soft actions with meaning: blue-50/100 for “Add”, emerald-50/100 for “Download/Success”.
- Tertiary: text/small bordered chips for metadata.

Icons & Chips
- Use lucide icons sparingly to label intent (plus, download, tag, alert-triangle).
- Metadata chips (rounded-full, small): max points, question type, etc.

Wizard UX
- Header: page title + short description. Optional actions (Start over) in header or footer.
- Progress: simple bar + “Step X of Y”.
- Footer: Back | Step status + Start over | Next. Next is gated via store getters (e.g., validations).
- Persistence: restore step + edited JSON on refresh; “Start over” clears state.

Forms & Validation Patterns
- Inline help next to the field/section; top summary list for multiple issues.
- Guardrails example (Rubric Edit):
  - Show Sum: X / Y pts, with amber hint if mismatch.
  - Offer “Redistribute” helper; do not surprise-modify all values unless user asks.
  - Auto-sync question max_points when criteria change; if user edits max_points, show suggestion text.
- Disable Next when critical issues exist; provide clear path to resolve.

Cards (Question Editor)
- Header row: drag handle, title (“Question N”), chips (Max N pts, type if set), small remove button.
- Body grid: Question ID, Max points (with ‘pts’ suffix), Type select (border color reflects confidence).
- Textarea: question text.
- Criteria list: draggable rows; each row has criterion text, points, remove.

Sticky Edit Toolbar (Rubric)
- Left: section title (“Current Rubric”). Right: Add Question, Undo, Redo, Download.
- Soft color accents: Add (blue), Download (emerald), Undo/Redo (neutral).

File Upload (Dropzone)
- Dashed border, subtle brand highlight on hover/drag, centered icon + copy, pill “Browse files”.
- Auto-advance after success (no extra click), persist minimal session metadata.

Motion
- Micro interactions only: hover shadow, slight border color shifts, chips appear/disappear smoothly.
- Avoid large transitions; keep interactions crisp.

Accessibility
- Contrast: target WCAG AA for text and controls.
- Focus styles: visible outlines on interactive elements.
- Keyboard: Ctrl+Z / Ctrl+Shift+Z (Undo/Redo) via hotkeys; Tab order follows visual order.

Persistence
- Stores: persist current step and edited JSON. “Start over” must clear both flow and edit stores.
- Keep keys small and data JSON-only to avoid cloning errors.

Implementation Notes (Nuxt/Vue)
- State: Pinia stores (wizard flow + edit state). Use safe deep clone (structuredClone fallback to JSON).
- Packages (lean, Vue-first):
  - pinia-plugin-persistedstate (store persistence)
  - @vueuse/core (dropzone, hotkeys)
  - vuedraggable (reordering lists)
  - vue-sonner (optional toasts)
- Patterns:
  - Compute validations in the store; UI renders summaries and enables helpers.
  - Footer gating (canNext) derives from store; steps add step-specific checks without template logic.
  - Keep components dumb where possible; call store actions for mutations (undo/redo friendly).

When Adding New Screens
- Prefer light surfaces + subtle borders; use brand for primary actions.
- Reuse footer and progress; stick to the same spacing and chips.
- Provide inline helper text + single-click fixes for common user errors.
- Add sticky toolbars for editing-heavy views; avoid header overcrowding.

References (current code)
- Wizard structure: pages/grading-wizard/index.vue
- Footer: components/grading-wizard/WizardFooter.vue
- Upload: components/grading-wizard/StepRubricUpload.vue
- Rubric edit: components/grading-wizard/StepRubricEdit.vue, stores/rubricEdit.ts
- Flow store: stores/wizard.ts

