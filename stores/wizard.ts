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

/**
 * Wizard store
 * Manages the multi-step grading flow and holds the current payloads (profile, rubric, answers, results).
 * It does not own network logic; steps call server routes or other stores as needed.
 */
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
    /** Returns true when profile, rubric, and answers are present so grading can run */
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
    /** Jump directly to a wizard step */
    go(step: Step) { this.step = step },
    /** Advance to the next wizard step (no-op at the end) */
    next() {
      const i = STEP_ORDER.indexOf(this.step)
      if (i >= 0 && i < STEP_ORDER.length - 1) this.step = STEP_ORDER[i + 1]
    },
    /** Go back to the previous step (no-op at the start) */
    prev() {
      const i = STEP_ORDER.indexOf(this.step)
      if (i > 0) this.step = STEP_ORDER[i - 1]
    },
    /** Set global busy flag (used by steps while awaiting network) */
    setBusy(v: boolean) { this.busy = v },
    /** Store error message and clear busy flag */
    fail(msg: string) { this.error = msg; this.busy = false },
    /** Clear stored error */
    clearError() { this.error = undefined },

    // scan/review
    /** Replace the list of processed documents used by the scan processor */
    setDocs(docs: ScanDoc[]) { this.docs = structuredClone(docs) },
    /** Patch a processed document entry by ID */
    updateDoc(id: string, patch: Partial<ScanDoc>) {
      const i = this.docs.findIndex(d => d.id === id)
      if (i >= 0) this.docs[i] = { ...this.docs[i], ...patch }
    },

    // extract
    /** Record extracted results (e.g., loaded from scan processor) */
    setExtract(r: ExtractResult) { this.extract = structuredClone(r) },

    // rubric
    /** Set or replace the current rubric */
    setRubric(r: ExamRubric) { this.rubric = structuredClone(r) },
    /** Replace the current rubric (alias for setRubric; used by edit store) */
    replaceRubric(r: ExamRubric) { this.rubric = structuredClone(r) },

    // profile & answers
    /** Set current grading profile by ID (nullable) */
    setProfile(id?: string | null) { this.profileId = id ?? null },
    /** Replace the current answers payload */
    setAnswers(v: unknown) { this.answers = structuredClone(v) },

    // pdf workflow helpers (legacy components)
    /** Assign an uploaded PDF to wizard context */
    setPdf(file?: File | null) { this.pdfFile = file ?? null },
    /** Record selected page indices for the uploaded PDF */
    setSelectedPages(indices: number[]) { this.selectedPageIndices = [...indices] },

    // grade
    /** Store grading results */
    setResults(r: GradeResult) { this.results = structuredClone(r) },

    /** Reset the entire wizard store */
    reset() { this.$reset() },

    /**
     * Full wizard restart: clear volatile state and go to first step.
     * Keeps no prior state to ensure a clean slate.
     */
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
    /** Persist a lightweight wizard session to localStorage for later reuse. Returns session ID. */
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
    /** List prior saved sessions without loading their payloads */
    ,listSessions() {
      const key = 'wizard:sessions'
      const raw = localStorage.getItem(key)
      const list = raw ? (JSON.parse(raw) as any[]) : []
      return list.map(({ data, ...meta }) => meta)
    }
    /** Load a saved session metadata and restore selective fields (e.g., profileId). */
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
