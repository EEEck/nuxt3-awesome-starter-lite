import { defineStore } from 'pinia'
import { AnswersSchema, ResultsSchema, RubricSchema } from '~/lib/schemas'
import type { Answers, Results, Rubric } from '~/lib/schemas'

export const WIZARD_TOTAL_STEPS = 6

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

type WizardState = {
  step: number
  profileId: string | null
  rubric: Rubric | null
  answers: Answers | null
  results: Results | null
  pdfFile: File | null
  selectedPageIndices: number[]
}

export const useWizardStore = defineStore('wizard', {
  state: (): WizardState => ({
    step: 0,
    profileId: null,
    rubric: null,
    answers: null,
    results: null,
    pdfFile: null,
    selectedPageIndices: []
  }),
  getters: {
    canRun: (state) => Boolean(state.profileId && state.rubric && state.answers),
    totalSteps: () => WIZARD_TOTAL_STEPS
  },
  actions: {
    setProfile(id: string | null) {
      this.profileId = id
    },
    setRubric(payload: unknown) {
      this.rubric = payload ? RubricSchema.parse(payload) : null
    },
    setAnswers(payload: unknown) {
      this.answers = payload ? AnswersSchema.parse(payload) : null
    },
    setResults(payload: unknown) {
      this.results = payload ? ResultsSchema.parse(payload) : null
    },
    setPdf(file: File | null) {
      this.pdfFile = file
      if (!file) {
        this.selectedPageIndices = []
      }
    },
    setSelectedPages(pages: number[]) {
      this.selectedPageIndices = Array.from(new Set(pages)).sort((a, b) => a - b)
    },
    next() {
      if (this.step < WIZARD_TOTAL_STEPS - 1) {
        this.step += 1
      }
    },
    previous() {
      if (this.step > 0) {
        this.step -= 1
      }
    },
    goTo(target: number) {
      if (target >= 0 && target < WIZARD_TOTAL_STEPS) {
        this.step = target
      }
    },
    go(name: StepAlias) {
      const normalized = stepAliases[name]
      if (!normalized) return
      const target = stepOrder.indexOf(normalized)
      if (target !== -1) {
        this.goTo(target)
      }
    },
    reset() {
      this.step = 0
      this.profileId = null
      this.rubric = null
      this.answers = null
      this.results = null
      this.setPdf(null)
    }
  }
})

export const useWizard = useWizardStore
