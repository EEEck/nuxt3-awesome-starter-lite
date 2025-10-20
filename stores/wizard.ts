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

const STEP_ORDER: Step[] = [
  'profile',
  'rubric-upload',
  'rubric-edit',
  'answers-upload',
  'grade',
  'results',
]

export const useWizard = defineStore('wizard', {
  state: () => ({
    step: 'rubric-upload' as Step, // land on Upload first, order keeps Profile -> Upload for Next flow
    docs: [] as any[],
    rubric: null as any,
    profileId: null as string | null,
    answers: null as any,
    busy: false as boolean,
    error: undefined as string | undefined,
    pdfFile: null as File | null,
    selectedPageIndices: [] as number[],
    extract: undefined as any,
    results: null as any,
  }),
  persist: {
    paths: ['step', 'profileId', 'rubric', 'answers']
  },
  getters: {
    canRun: (state) => !!(state.profileId && state.rubric && state.answers),
    stepIndex: (state) => STEP_ORDER.indexOf(state.step as Step),
    canNext: (state) => {
      switch (state.step) {
        case 'rubric-upload':
          return !!state.rubric
        case 'answers-upload':
          return !!state.answers
        default:
          return true
      }
    },
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

    reset() { this.$reset() },

    startOver() {
      // Full wizard restart: clear volatile state and go to first step
      this.rubric = null as any
      this.answers = null as any
      this.results = null as any
      this.pdfFile = null
      this.selectedPageIndices = []
      // Optional: keep profileId or clear; clearing for a true fresh start
      this.profileId = null
      this.step = STEP_ORDER[0]
    }

    // Lightweight session persistence for wizard JSON (local-only)
    ,saveSession(payload: { data: any; title?: string }) {
      const key = 'wizard:sessions'
      const now = new Date().toISOString()
      const id = (globalThis.crypto?.randomUUID?.() ?? `wiz-${Date.now()}`)
      const entry = {
        id,
        updated_at: now,
        title: payload.title || 'Untitled',
        profileId: this.profileId,
        hasRubric: !!this.rubric,
        hasAnswers: !!this.answers,
        data: payload.data
      }
      const raw = localStorage.getItem(key)
      const list = raw ? (JSON.parse(raw) as any[]) : []
      list.unshift(entry)
      localStorage.setItem(key, JSON.stringify(list))
      return id
    }
    ,listSessions() {
      const key = 'wizard:sessions'
      const raw = localStorage.getItem(key)
      const list = raw ? (JSON.parse(raw) as any[]) : []
      return list.map(({ data, ...meta }) => meta)
    }
    ,loadSession(id: string) {
      const key = 'wizard:sessions'
      const raw = localStorage.getItem(key)
      const list = raw ? (JSON.parse(raw) as any[]) : []
      const entry = list.find((e: any) => e.id === id)
      if (!entry) return false
      // Minimal restore; expand as needed
      this.profileId = entry.profileId ?? null
      // Caller decides how to apply entry.data (rubric or answers)
      return entry
    }
  }
})

// Back-compat and utilities
export { useWizard as useWizardStore }
export const WIZARD_TOTAL_STEPS = STEP_ORDER.length
export const WIZARD_STEPS = STEP_ORDER
