import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
// Safe deep clone for plain JSON-ish data coming from Pinia/state
function deepClone<T>(v: T): T {
  try { /* @ts-ignore */ return structuredClone(v) } catch { return JSON.parse(JSON.stringify(v)) as T }
}
import { useWizardStore } from '~/stores/wizard'

export interface Criterion { criterion: string; max_points: number }
export interface RubricQuestion {
  question_id: string
  question_text: string
  max_points: number
  question_type?: string
  criteria: Criterion[]
}
export interface ExamRubric {
  exam_name?: string
  rubric_name?: string
  general_instructions?: string
  questions: RubricQuestion[]
}

interface DetectionHint { typeId: string; name: string; confidence: number }

export const useRubricEditStore = defineStore('rubricEdit', () => {
  const wizard = useWizardStore()

  const past = ref<ExamRubric[]>([])
  const present = ref<ExamRubric | null>(null)
  const future = ref<ExamRubric[]>([])
  const detection = ref<Record<number, DetectionHint | null>>({})
  const aiFeedback = ref<string | null>(null)
  const aiFeedbackLoading = ref(false)

  function initFromWizard() {
    if (wizard.rubric) {
      present.value = deepClone(wizard.rubric as any)
      past.value = []
      future.value = []
      detection.value = {}
    }
  }

  // keep wizard.rubric in sync
  watch(present, (v) => { if (v) wizard.replaceRubric(deepClone(v) as any) })

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)
  const questions = computed(() => present.value?.questions ?? [])
  const totalPoints = computed(() => questions.value.reduce((s,q)=>s+(q.max_points||0),0))

  // Validation: mirror legacy guardrails (non-negative, sum match, non-empty ids/text)
  const validationIssues = computed(() => {
    const issues: { index: number; message: string; code: string }[] = []
    const r = present.value
    if (!r) return issues
    r.questions.forEach((q, idx) => {
      const qMax = Number(q.max_points) || 0
      const sum = (q.criteria || []).reduce((s, c) => s + (Number(c.max_points) || 0), 0)
      if (qMax < 0) issues.push({ index: idx, code: 'negative-max', message: `Question ${idx + 1}: Max points cannot be negative` })
      if (sum > 0 && qMax !== sum) issues.push({ index: idx, code: 'mismatch', message: `Question ${idx + 1}: Total points (${qMax}) doesn't match sum of criteria (${sum})` })
      if (!String(q.question_id || '').trim()) issues.push({ index: idx, code: 'empty-id', message: `Question ${idx + 1}: Question ID cannot be empty` })
      if (!String(q.question_text || '').trim()) issues.push({ index: idx, code: 'empty-text', message: `Question ${idx + 1}: Question text cannot be empty` })
    })
    return issues
  })
  const hasValidationIssues = computed(() => validationIssues.value.length > 0)

  function commit(next: ExamRubric) {
    if (!present.value) { present.value = deepClone(next); return }
    past.value.push(deepClone(present.value))
    present.value = deepClone(next)
    future.value = []
  }

  function undo() {
    if (!canUndo.value) return
    const prev = past.value.pop()!
    future.value.unshift(deepClone(present.value!))
    present.value = prev
  }
  function redo() {
    if (!canRedo.value) return
    const next = future.value.shift()!
    past.value.push(deepClone(present.value!))
    present.value = next
  }

  function setExamName(name: string) {
    if (!present.value) return
    commit({ ...present.value, exam_name: name })
  }
  function setGeneralInstructions(text: string) {
    if (!present.value) return
    commit({ ...present.value, general_instructions: text })
  }
  function setTotalQuestions(n: number) {
    if (!present.value) return
    const current = deepClone(present.value)
    const cur = current.questions.length
    if (n === cur) return
    if (n > cur) {
      for (let i = cur; i < n; i++) {
        current.questions.push({
          question_id: `Q${i+1}`,
          question_text: '',
          max_points: 10,
          criteria: [{ criterion: '', max_points: 10 }]
        })
      }
    } else {
      current.questions = current.questions.slice(0, n)
    }
    commit(current)
  }
  function setQuestionField(i: number, field: keyof RubricQuestion, value: any) {
    if (!present.value) return
    const next = deepClone(present.value)
    // @ts-ignore
    next.questions[i][field] = field === 'max_points' ? Number(value) : value
    commit(next)
  }
  function addQuestion() {
    if (!present.value) return
    const next = deepClone(present.value)
    const idx = next.questions.length
    next.questions.push({ question_id: `Q${idx+1}`, question_text: '', max_points: 10, criteria: [{ criterion:'', max_points: 10 }] })
    commit(next)
  }
  function removeQuestion(i: number) {
    if (!present.value) return
    const next = deepClone(present.value)
    if (next.questions.length <= 1) return
    next.questions.splice(i,1)
    next.questions.forEach((q, j) => { q.question_id = `Q${j+1}` })
    commit(next)
  }
  function addCriterion(i: number) {
    if (!present.value) return
    const next = deepClone(present.value)
    next.questions[i].criteria.push({ criterion: '', max_points: 1 })
    // Auto-sync question max points to sum of criteria
    const sum = next.questions[i].criteria.reduce((s, c) => s + (Number(c.max_points) || 0), 0)
    next.questions[i].max_points = sum
    commit(next)
  }
  function removeCriterion(i: number, j: number) {
    if (!present.value) return
    const next = deepClone(present.value)
    if (next.questions[i].criteria.length <= 1) return
    next.questions[i].criteria.splice(j,1)
    // Auto-sync question max points to sum of criteria
    const sum = next.questions[i].criteria.reduce((s, c) => s + (Number(c.max_points) || 0), 0)
    next.questions[i].max_points = sum
    commit(next)
  }
  function setCriterion(i: number, j: number, field: keyof Criterion, v: any) {
    if (!present.value) return
    const next = deepClone(present.value)
    // @ts-ignore
    next.questions[i].criteria[j][field] = field === 'max_points' ? Number(v) : String(v)
    // Auto-sync question max points to sum of criteria whenever a sub-criterion changes
    const sum = next.questions[i].criteria.reduce((s, c) => s + (Number(c.max_points) || 0), 0)
    next.questions[i].max_points = sum
    commit(next)
  }

  // Reorder / bulk setters and helpers
  function setQuestions(newQs: RubricQuestion[]) {
    if (!present.value) return
    const next = deepClone(present.value)
    next.questions = deepClone(newQs)
    next.questions.forEach((q, idx) => { if (!q.question_id) q.question_id = `Q${idx+1}` })
    commit(next)
  }

  function setCriteria(i: number, newCriteria: Criterion[]) {
    if (!present.value) return
    const next = deepClone(present.value)
    next.questions[i].criteria = deepClone(newCriteria)
    commit(next)
  }

  function redistributeCriteriaEvenly(i: number) {
    if (!present.value) return
    const next = deepClone(present.value)
    const q = next.questions[i]
    const n = q.criteria.length || 1
    const total = Number(q.max_points) || 0
    const base = Math.floor(total / n)
    let remainder = total - base * n
    q.criteria.forEach((c) => {
      c.max_points = base + (remainder > 0 ? 1 : 0)
      if (remainder > 0) remainder--
    })
    commit(next)
  }

  async function detectQuestionTypes() {
    if (!present.value) return
    const profile = wizard.profileId ? undefined : undefined // placeholder; we can expand to include profile data later
    try {
      const res = await fetch('/api/question-types/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_rubric: present.value, profile })
      })
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data?.question_types)) {
        data.question_types.forEach((d: any) => {
          const idx = Number(d.question_index) ?? 0
          const detected = d.detected_type || d.detectedType
          if (detected) {
            detection.value[idx] = { typeId: detected.id, name: detected.name, confidence: Number(d.confidence) || 0 }
            if ((Number(d.confidence) || 0) >= 0.4) {
              setQuestionField(idx, 'question_type', detected.id)
            }
          } else {
            detection.value[idx] = null
          }
        })
      }
    } catch (e) {
      // ignore; UI can show a toast later
    }
  }

  // AI rubric feedback (placeholder until backend connected)
  async function requestFeedback(clarification: string) {
    if (!present.value) return
    aiFeedbackLoading.value = true
    try {
      // Try backend if available
      const res = await fetch('/api/rubric-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_rubric: present.value, clarification })
      })
      if (res.ok) {
        const data = await res.json().catch(() => ({}))
        aiFeedback.value = (data?.feedback || data?.text || JSON.stringify(data)) ?? null
      } else {
        // Graceful fallback placeholder
        aiFeedback.value = `AI feedback (preview). Clarification: ${clarification || '—'}\n\n• Criteria appear balanced for current max points.\n• Consider clarifying examples in question texts.\n• Ensure partial credit notes align with question types.`
      }
    } catch {
      aiFeedback.value = `AI feedback (offline preview).\n\n• Criteria appear balanced.\n• Consider adding guidance on expected keywords.`
    } finally {
      aiFeedbackLoading.value = false
    }
  }

  function dismissFeedback() { aiFeedback.value = null }

  function download() {
    if (!present.value) return
    const blob = new Blob([JSON.stringify(present.value, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${present.value.exam_name || 'rubric'}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(a.href)
  }

  function clearAll() {
    past.value = []
    future.value = []
    present.value = null
    detection.value = {}
  }

  return {
    // state
    present, past, future, detection, aiFeedback, aiFeedbackLoading,
    // computed
    canUndo, canRedo, questions, totalPoints, validationIssues, hasValidationIssues,
    // actions
    initFromWizard, commit, undo, redo,
    setExamName, setGeneralInstructions, setTotalQuestions,
    setQuestionField, addQuestion, removeQuestion,
    addCriterion, removeCriterion, setCriterion,
    setQuestions, setCriteria, redistributeCriteriaEvenly,
    detectQuestionTypes, requestFeedback, dismissFeedback, download, clearAll,
  }
}, {
  persist: {
    paths: ['present']
  }
})
