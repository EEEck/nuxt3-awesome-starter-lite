import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { AnswersSchema, ResultsSchema, RubricSchema } from '~/lib/schemas'
import type { Answers, Results, Rubric } from '~/lib/schemas'

export type Step =
  | 'profile'
  | 'scan' | 'review' | 'extract'
  | 'rubric-upload' | 'rubric-edit' | 'answers-upload'
  | 'grade' | 'results' | 'export'

const stepOrder = ['profile', 'rubric-upload', 'rubric-edit', 'answers-upload', 'grade', 'results'] as const

export type WizardStep = typeof stepOrder[number]
export type StepAlias = WizardStep | 'scan' | 'review' | 'extract' | 'export'

const stepAliases: Record<StepAlias, WizardStep> = {
  profile: 'profile',
  'rubric-upload': 'rubric-upload',
  'rubric-edit': 'rubric-edit',
  'answers-upload': 'answers-upload',
  grade: 'grade',
  results: 'results',
  scan: 'profile',
  review: 'profile',
  extract: 'answers-upload',
  export: 'results'
}

export const useWizardStore = defineStore('wizard', () => {
  const step = ref(0)
  const profileId = ref<string | null>(null)
  const rubric = ref<Rubric | null>(null)
  const answers = ref<Answers | null>(null)
  const results = ref<Results | null>(null)

  const pdfFile = ref<File | null>(null)
  const selectedPageIndices = ref<number[]>([])

  const canRun = computed(() => Boolean(profileId.value && rubric.value && answers.value))

  function setProfile(id: string | null) {
    profileId.value = id
  }

  // --- Profile & Answers (newer flow) ---
  profileId?: string | null
  answers?: unknown | null

  // --- Grade (results) ---
  results?: GradeResult

  function setAnswers(payload: unknown) {
    answers.value = payload ? AnswersSchema.parse(payload) : null
  }

  function setResults(payload: unknown) {
    results.value = payload ? ResultsSchema.parse(payload) : null
  }

  function setPdf(file: File | null) {
    pdfFile.value = file
    if (!file) {
      selectedPageIndices.value = []
    }
  }

  function setSelectedPages(pages: number[]) {
    selectedPageIndices.value = Array.from(new Set(pages)).sort((a, b) => a - b)
  }

  function next() {
    if (step.value < WIZARD_TOTAL_STEPS - 1) {
      step.value += 1
    }
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
