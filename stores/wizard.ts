import { defineStore } from 'pinia'

export type Step =
  | 'profile'
  | 'scan' | 'review' | 'extract'
  | 'rubric-upload' | 'rubric-edit' | 'answers-upload'
  | 'grade' | 'results' | 'export'

export interface ScanDoc {
  id: string
  name: string
  blobUrl: string
  rotations: number
  crop?: { x: number; y: number; w: number; h: number }
}
export interface ExtractResult {
  submissions: Record<string, Record<string, string>>
  coverage: number
  notes?: string[]
}
export interface RubricQuestionCriterion { criterion: string; max_points: number }
export interface RubricQuestion {
  question_id: string; question_text: string; max_points: number
  criteria?: RubricQuestionCriterion[]
}
export interface ExamRubric {
  exam_name?: string; rubric_name?: string
  questions: RubricQuestion[]
}
export interface GradeResult {
  total_score: number; max_score: number
  question_grades: Array<{ question_id: string; score: number; max_points: number }>
  per_student?: Record<string, { score: number; max: number }>
}

interface WizardState {
  // --- Flow control ---
  step: Step

  // --- Scan / Review ---
  docs: ScanDoc[]                  // optional thumbnails or per-page data
  pdfFile?: File | null            // uploaded PDF file
  selectedPageIndices?: number[]   // zero-based indices of chosen pages

  // --- Extract (OCR results) ---
  extract?: ExtractResult

  // --- Rubric (grading schema) ---
  rubric: ExamRubric | null

  // --- Profile & Answers (newer flow) ---
  profileId?: string | null
  answers?: unknown | null

  // --- Grade (results) ---
  results?: GradeResult

  // --- Meta ---
  busy: boolean
  error?: string
}


const STEP_ORDER: Step[] = [
  'profile',
  'rubric-upload',
  'rubric-edit',
  'answers-upload',
  'grade',
  'results',
]

export const useWizard = defineStore('wizard', {
  state: (): WizardState => ({
    step: 'profile', // default entry step for the grading wizard
    docs: [],
    rubric: null,
    profileId: null,
    answers: null,
    busy: false
  }),
  getters: {
    canRun: (state) => !!(state.profileId && state.rubric && state.answers),
  },
  actions: {
    go(step: Step) { this.step = step },
    next() {
      const i = STEP_ORDER.indexOf(this.step)
      if (i >= 0 && i < STEP_ORDER.length - 1) this.step = STEP_ORDER[i + 1]
    },
    prev() {
      const i = STEP_ORDER.indexOf(this.step)
      if (i > 0) this.step = STEP_ORDER[i - 1]
    },
    setBusy(v: boolean) { this.busy = v },
    fail(msg: string) { this.error = msg; this.busy = false },
    clearError() { this.error = undefined },

    // scan/review
    setDocs(docs: ScanDoc[]) { this.docs = structuredClone(docs) },
    updateDoc(id: string, patch: Partial<ScanDoc>) {
      const i = this.docs.findIndex(d => d.id === id)
      if (i >= 0) this.docs[i] = { ...this.docs[i], ...patch }
    },

    // extract
    setExtract(r: ExtractResult) { this.extract = structuredClone(r) },

    // rubric
    setRubric(r: ExamRubric) { this.rubric = structuredClone(r) },
    replaceRubric(r: ExamRubric) { this.rubric = structuredClone(r) },

    // profile & answers
    setProfile(id?: string | null) { this.profileId = id ?? null },
    setAnswers(v: unknown) { this.answers = structuredClone(v) },

    // pdf workflow helpers (legacy components)
    setPdf(file?: File | null) { this.pdfFile = file ?? null },
    setSelectedPages(indices: number[]) { this.selectedPageIndices = [...indices] },

    // grade
    setResults(r: GradeResult) { this.results = structuredClone(r) },

    reset() { this.$reset() }
  }
})

// Back-compat and utilities
export { useWizard as useWizardStore }
export const WIZARD_TOTAL_STEPS = STEP_ORDER.length
