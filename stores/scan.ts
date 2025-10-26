import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ScanStep = 'mode' | 'upload' | 'process' | 'review'
export type UploadType = 'student' | 'rubric' | null

export interface ProcessedDocument {
  document_id: string
  original_filename: string
  upload_type: 'student' | 'rubric'
  updated_at: string
}

interface StoredSession extends ProcessedDocument {
  data: any
}

function formatFileSize(bytes: number) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB'] as const
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(2))
  return `${val} ${sizes[i]}`
}

function defaultPrompt(uploadType: UploadType) {
  if (uploadType === 'student') {
    return `You are an AI assistant specialized in extracting student responses from scanned worksheets.

TASK: Extract student information and answers from the uploaded document.

INSTRUCTIONS:
1. Extract the student's name from the document
2. Identify all question-answer pairs
3. Extract the exact text of each student response
4. Use clear question identifiers (Q1, Q2, etc. or as labeled)
5. Preserve the original wording of student responses

OUTPUT FORMAT:
{
  "student_name": "Full Name",
  "answers": {
    "Q1": "Student's exact answer text",
    "Q2": "Student's exact answer text"
  },
  "confidence": 0.85,
  "confidence_justification": "Clear handwriting and well-structured document"
}

Focus on accuracy and completeness. If text is unclear, note it in the answer.`
  }
  // rubric (or null as default)
  return `You are an AI assistant specialized in extracting rubric information from scanned documents.

TASK: Extract grading rubric structure and criteria from the uploaded document.

INSTRUCTIONS:
1. Extract the exam/assignment name
2. Identify all questions and their point values
3. Extract grading criteria for each question
4. Capture any general instructions

OUTPUT FORMAT:
{
  "exam_name": "Assignment Name",
  "general_instructions": "Any general grading instructions",
  "questions": [
    {
      "question_id": "Q1",
      "question_text": "Full question text",
      "max_points": 5,
      "criteria": [
        { "criterion": "Criterion description", "max_points": 3 }
      ]
    }
  ],
  "confidence": 0.90,
  "confidence_justification": "Well-structured rubric with clear point allocations"
}

Focus on extracting complete grading criteria and point distributions.`
}

export const useScanStore = defineStore('scan', () => {
  // Step state
  const step = ref<ScanStep>('upload')
  const uploadType = ref<UploadType>(null)

  // File state
  const file = ref<File | null>(null)
  const pdfPageCount = ref<number | null>(null)
  const error = ref<string | null>(null)

  // Upload details
  const pageSelection = ref<{ type: 'all' | 'custom'; custom: string | null }>({ type: 'all', custom: null })
  const pageRangeValid = ref<boolean>(true)
  const pageRangeMessage = ref<string>('')
  const customInstructions = ref<string>('')
  // For preview
  const pdfPreviewUrl = ref<string | null>(null)
  const imagePreviewUrl = ref<string | null>(null)

  // Modal state
  const pickerOpen = ref(false)
  const docs = ref<ProcessedDocument[]>([])
  const docsLoading = ref(false)
  const docsError = ref<string | null>(null)

  const canProceedUpload = computed(() => Boolean(uploadType.value && file.value))

  const debugPrompt = computed(() => defaultPrompt(uploadType.value))

  // Processing state
  const processingStatus = ref<'idle' | 'processing' | 'retry' | 'error' | 'success'>('idle')
  const processingTitle = ref<string>('AI Vision Processing')
  const processingMessage = ref<string>('Initializing models...')
  const processingProgress = ref<number>(0)

  // Output state
  const processedData = ref<any | null>(null)
  const cards = ref<Record<string, { flagged: boolean; accepted: boolean }>>({})
  const activeCardId = ref<string | null>(null)
  // History (undo/redo)
  const past = ref<{ data: any, cards: any }[]>([])
  const future = ref<{ data: any, cards: any }[]>([])
  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  /** Snapshot current processed data and cards for undo/redo */
  function snapshot() {
    past.value.push({ data: deepClone(processedData.value), cards: deepClone(cards.value) })
    if (past.value.length > 50) past.value.shift()
    future.value = []
  }

  function deepClone<T>(v: T): T { try { /* @ts-ignore */ return structuredClone(v) } catch { return JSON.parse(JSON.stringify(v)) as T } }

  /** Change the current scan step */
  function go(next: ScanStep) { step.value = next }
  /** Assign current upload type (student|rubric) */
  function setUploadType(t: UploadType) { uploadType.value = t }

  /** Bind a selected file and create preview URLs */
  function setFile(f: File | null) {
    error.value = null
    file.value = null
    if (!f) return

    const allowed = ['.pdf', '.jpg', '.jpeg', '.png']
    const ext = `.${f.name.split('.').pop()?.toLowerCase()}`
    if (!allowed.includes(ext)) { error.value = `Unsupported file type "${ext}". Please select a PDF, JPEG, or PNG file.`; return }

    const max = 50 * 1024 * 1024
    if (f.size > max) { error.value = `File size (${formatFileSize(f.size)}) exceeds the 50MB limit.`; return }

    if (f.size < 1024) { error.value = `File size (${formatFileSize(f.size)}) is too small. Please select a valid document.`; return }

    file.value = f

    // Setup preview URLs
    revokePreviewUrls()
    if (ext === '.pdf') {
      pdfPreviewUrl.value = URL.createObjectURL(f)
    } else {
      imagePreviewUrl.value = URL.createObjectURL(f)
    }
  }

  /** Clear current file and revoke preview URLs */
  function removeFile() {
    file.value = null
    pdfPageCount.value = null
    pageSelection.value = { type: 'all', custom: null }
    pageRangeValid.value = true
    pageRangeMessage.value = ''
    revokePreviewUrls()
  }

  /** Revoke any object URLs created for previews */
  function revokePreviewUrls() {
    if (pdfPreviewUrl.value) { URL.revokeObjectURL(pdfPreviewUrl.value); pdfPreviewUrl.value = null }
    if (imagePreviewUrl.value) { URL.revokeObjectURL(imagePreviewUrl.value); imagePreviewUrl.value = null }
  }

  /** Store optional custom instructions for the backend */
  function setCustomInstructions(text: string) {
    customInstructions.value = text
  }

  /** Set page selection mode (all|custom); resets message on 'all' */
  function setPageSelection(type: 'all'|'custom') {
    pageSelection.value.type = type
    if (type === 'all') {
      pageSelection.value.custom = null
      pageRangeValid.value = true
      pageRangeMessage.value = ''
    }
  }

  /** Update the custom page selection text (validation separate) */
  function setCustomPages(input: string) {
    pageSelection.value.custom = input
  }

  /** Validate custom page ranges against detected PDF page count */
  function validatePageRange(input: string) {
    // Empty is valid when using 'all'
    if (!input) { pageRangeValid.value = true; pageRangeMessage.value = ''; return true }
    const count = pdfPageCount.value
    if (!count) { pageRangeValid.value = true; pageRangeMessage.value = ''; return true }
    try {
      const parts = input.split(',')
      const out: number[] = []
      for (let p of parts) {
        p = p.trim()
        if (!p) continue
        if (p.includes('-')) {
          const [a, b] = p.split('-').map(s => parseInt(s.trim(), 10))
          if (!a || !b || a < 1 || b > count) throw new Error(`Range "${p}" outside 1-${count}`)
          if (a > b) throw new Error(`Invalid range "${p}": start should be <= end`)
          for (let i = a; i <= b; i++) out.push(i)
        } else {
          const n = parseInt(p, 10)
          if (!n || n < 1 || n > count) throw new Error(`Page ${p} outside 1-${count}`)
          out.push(n)
        }
      }
      pageRangeValid.value = true
      pageRangeMessage.value = `${out.length} page(s) selected`
      return true
    } catch (e: any) {
      pageRangeValid.value = false
      pageRangeMessage.value = e?.message || 'Invalid page range'
      return false
    }
  }

  /** Call backend to detect page count (falls back to heuristic) */
  async function detectPdfPageCount() {
    if (!file.value) return
    try {
      const fd = new FormData()
      fd.append('file', file.value)
      const res = await fetch('/api/pdf-page-count', { method: 'POST', body: fd })
      if (res.ok) {
        const data = await res.json()
        pdfPageCount.value = Number(data?.page_count ?? null)
      } else {
        // fallback estimate by size
        const kb = (file.value.size / 1024)
        let est = 1
        if (kb < 150) est = Math.max(1, Math.ceil(kb / 100))
        else if (kb < 500) est = Math.max(2, Math.ceil(kb / 120))
        else est = Math.max(3, Math.ceil(kb / 150))
        pdfPageCount.value = est
      }
    } catch {
      // ignore errors; keep null
    }
  }

  /** Update processing status and optional text/progress */
  function setProcessing(status: 'idle'|'processing'|'retry'|'error'|'success', title?: string, message?: string, progress?: number) {
    processingStatus.value = status
    if (title) processingTitle.value = title
    if (message) processingMessage.value = message
    if (typeof progress === 'number') processingProgress.value = progress
  }

  /** Upload the file and orchestrate processing → formatting results */
  async function processDocument() {
    if (!file.value || !uploadType.value) return
    // Move to process step
    go('process')
    setProcessing('processing', 'AI Vision Processing', 'Analyzing document structure and extracting content...', 20)
    try {
      let toSendFile: File | Blob = file.value

      // If PDF and custom page selection, pre-slice via Nuxt server to keep the Python backend clean
      const isPdf = /\.pdf$/i.test(file.value.name)
      if (isPdf && pageSelection.value.type === 'custom' && pageSelection.value.custom) {
        const sliceForm = new FormData()
        sliceForm.append('file', file.value)
        sliceForm.append('pages', pageSelection.value.custom)
        const sliceRes = await fetch('/api/pdf-slice', { method: 'POST', body: sliceForm })
        if (!sliceRes.ok) throw new Error(await sliceRes.text())
        const slicedBlob = await sliceRes.blob()
        toSendFile = new File([slicedBlob], file.value.name.replace(/\.pdf$/i, '') + '.subset.pdf', { type: 'application/pdf' })
        // Update local preview to show only the selected pages
        try {
          if (pdfPreviewUrl.value) URL.revokeObjectURL(pdfPreviewUrl.value)
        } catch {}
        pdfPreviewUrl.value = URL.createObjectURL(slicedBlob)
      }

      const fd = new FormData()
      fd.append('file', toSendFile)
      if (customInstructions.value) fd.append('custom_instructions', customInstructions.value)
      // include page selection when custom
      if (pageSelection.value.type === 'custom' && pageSelection.value.custom) {
        fd.append('pages', pageSelection.value.custom)
      }
      const endpoint = uploadType.value === 'student' ? '/api/process-student-scan' : '/api/process-rubric-scan'
      const res = await fetch(endpoint, { method: 'POST', body: fd })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Processing failed')
      }
      setProcessing('processing', 'Formatting Results', 'Structuring extracted content...', 75)
      const json = await res.json()
      processedData.value = json
      // Auto-flag low-confidence answers for student uploads
      if (uploadType.value === 'student' && processedData.value?.answers) {
        try {
          const qc: Record<string, number> = processedData.value.question_confidence || {}
          Object.keys(processedData.value.answers || {}).forEach((qid) => {
            const c = typeof qc[qid] === 'number' ? Number(qc[qid]) : null
            // Fallback heuristic: short answers less confident
            const ans = String(processedData.value.answers[qid] || '')
            const fallback = ans ? Math.max(0.45, Math.min(0.95, 0.55 + Math.log10(ans.length + 1) / 10)) : 0.45
            const conf = c ?? fallback
            if (conf < 0.7) {
              ensureCard(qid)
              cards.value[qid].flagged = true
              cards.value[qid].accepted = false
            }
          })
        } catch {}
      }
      setProcessing('success', 'Processing Complete', 'Ready for review', 100)
      // Persist lightweight session locally
      saveSession({ original_filename: file.value.name, upload_type: uploadType.value as 'student'|'rubric' }, json)
      // Advance to review
      go('review')
    } catch (e: any) {
      setProcessing('error', 'Processing Failed', e?.message || 'An error occurred', 100)
    }
  }

  // Review updates (student uploads)
  /** Update the student name inside processedData */
  function setStudentName(name: string) {
    if (!processedData.value) return
    snapshot()
    processedData.value = { ...processedData.value, student_name: name }
  }

  /** Update answer for a question ID with snapshot */
  function setAnswer(qid: string, text: string) {
    if (!processedData.value) return
    snapshot()
    const answers = { ...(processedData.value.answers || {}) }
    answers[qid] = text
    processedData.value = { ...processedData.value, answers }
  }

  /** Remove an answer entry by question ID with snapshot */
  function removeAnswer(qid: string) {
    if (!processedData.value) return
    snapshot()
    const answers = { ...(processedData.value.answers || {}) }
    delete answers[qid]
    processedData.value = { ...processedData.value, answers }
  }

  // Simple card state (flag/accept)
  function ensureCard(id: string) { if (!cards.value[id]) cards.value[id] = { flagged: false, accepted: false }; return cards.value[id] }
  /** Toggle flagged state for a card ID */
  function toggleFlag(id: string) { snapshot(); const c = ensureCard(id); c.flagged = !c.flagged; if (c.flagged) c.accepted = false }
  /** Toggle accepted state for a card ID */
  function toggleAccept(id: string) { snapshot(); const c = ensureCard(id); c.accepted = !c.accepted; if (c.accepted) c.flagged = false }
  /** Track which card is active (e.g., to highlight on the document) */
  function setActiveCard(id: string | null) { activeCardId.value = id }

  // -------- Rubric helpers (wizard review) --------
  /** Locate a rubric question index by its question_id */
  function findQuestionIndexById(qid: string): number {
    const qs = processedData.value?.questions || []
    return qs.findIndex((q: any) => String(q.question_id || '') === String(qid))
  }
  /** Recalculate a question's max_points from its criteria sum */
  function recomputeQuestionMaxPoints(q: any) {
    if (!q || !Array.isArray(q.criteria)) return
    const sum = q.criteria.reduce((s: number, c: any) => s + (Number(c.max_points) || 0), 0)
    q.max_points = sum
  }
  /** Update a rubric field for question with id (snapshot included) */
  function updateRubricField(qid: string, field: 'question_id'|'max_points'|'question_text', value: any) {
    if (!processedData.value) return
    snapshot()
    const idx = findQuestionIndexById(qid)
    if (idx < 0) return
    const qs = [...processedData.value.questions]
    const q = { ...qs[idx] }
    // @ts-ignore
    q[field] = field === 'max_points' ? Number(value) : value
    qs[idx] = q
    processedData.value = { ...processedData.value, questions: qs }
  }
  /** Append a criterion to a rubric question by id */
  function addCriterionToQuestion(qid: string) {
    if (!processedData.value) return
    snapshot()
    const idx = findQuestionIndexById(qid)
    if (idx < 0) return
    const qs = [...processedData.value.questions]
    const q = { ...qs[idx] }
    const crit = Array.isArray(q.criteria) ? [...q.criteria] : []
    crit.push({ criterion: '', max_points: 1 })
    q.criteria = crit
    recomputeQuestionMaxPoints(q)
    qs[idx] = q
    processedData.value = { ...processedData.value, questions: qs }
  }
  /** Remove a criterion from a rubric question by id */
  function removeCriterionFromQuestion(qid: string, cIdx: number) {
    if (!processedData.value) return
    snapshot()
    const idx = findQuestionIndexById(qid)
    if (idx < 0) return
    const qs = [...processedData.value.questions]
    const q = { ...qs[idx] }
    const crit = Array.isArray(q.criteria) ? [...q.criteria] : []
    if (crit.length <= 1) return
    crit.splice(cIdx, 1)
    q.criteria = crit
    recomputeQuestionMaxPoints(q)
    qs[idx] = q
    processedData.value = { ...processedData.value, questions: qs }
  }
  /** Update a sub-criterion for a rubric question by id */
  function setCriterionInQuestion(qid: string, cIdx: number, field: 'criterion'|'max_points', value: any) {
    if (!processedData.value) return
    snapshot()
    const idx = findQuestionIndexById(qid)
    if (idx < 0) return
    const qs = [...processedData.value.questions]
    const q = { ...qs[idx] }
    const crit = Array.isArray(q.criteria) ? [...q.criteria] : []
    if (!crit[cIdx]) return
    const c = { ...crit[cIdx] }
    // @ts-ignore
    c[field] = field === 'max_points' ? Number(value) : String(value)
    crit[cIdx] = c
    q.criteria = crit
    recomputeQuestionMaxPoints(q)
    qs[idx] = q
    processedData.value = { ...processedData.value, questions: qs }
  }
  /** Remove rubric question by index in processedData */
  function removeQuestion(index: number) {
    if (!processedData.value) return
    snapshot()
    const qs = [...(processedData.value.questions || [])]
    if (index < 0 || index >= qs.length) return
    qs.splice(index, 1)
    // re-number ids if blank
    qs.forEach((q: any, i: number) => { if (!q.question_id) q.question_id = `Q${i + 1}` })
    processedData.value = { ...processedData.value, questions: qs }
  }

  /** Undo last edit to processedData/cards */
  function undo() {
    if (!canUndo.value) return
    const last = past.value.pop()!
    future.value.unshift({ data: deepClone(processedData.value), cards: deepClone(cards.value) })
    processedData.value = deepClone(last.data)
    cards.value = deepClone(last.cards)
  }
  /** Redo last undone edit to processedData/cards */
  function redo() {
    if (!canRedo.value) return
    const next = future.value.shift()!
    past.value.push({ data: deepClone(processedData.value), cards: deepClone(cards.value) })
    processedData.value = deepClone(next.data)
    cards.value = deepClone(next.cards)
  }

  // Review progress
  const reviewProgress = computed(() => {
    let total = 0
    let done = 0
    if (!processedData.value) return { total, done, percent: 0 }
    if (uploadType.value === 'student') {
      const answers = processedData.value.answers || {}
      total = Object.keys(answers).length
      done = Object.entries(cards.value).reduce((acc, [id, st]) => acc + ((st.flagged || st.accepted) && answers[id] ? 1 : 0), 0)
    } else {
      const questions = processedData.value.questions || []
      total = questions.length
      done = Object.entries(cards.value).reduce((acc, [id, st]) => acc + ((st.flagged || st.accepted) ? 1 : 0), 0)
    }
    const percent = total ? Math.round((done / total) * 100) : 0
    return { total, done, percent }
  })

  // Backend persistence (align to hub)
  const lastSavedId = ref<string | null>(null)
  /** Persist processedData to backend (mock) and return id */
  async function saveToBackend() {
    if (!processedData.value) return null
    const res = await fetch('/api/processed-documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(processedData.value) })
    if (!res.ok) return null
    const data = await res.json()
    lastSavedId.value = data?.document_id || null
    return lastSavedId.value
  }
  /** Download processedData as a JSON file */
  function exportJson(filename?: string) {
    if (!processedData.value) return
    const name = filename || `${uploadType.value || 'document'}_${new Date().toISOString().slice(0,10)}.json`
    const blob = new Blob([JSON.stringify(processedData.value, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  // Lightweight local session store (no network)
  const SESSIONS_KEY = 'scan:sessions'
  /** Load saved sessions list from localStorage */
  function readSessions(): StoredSession[] {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY)
      const arr = raw ? JSON.parse(raw) : []
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  /** Write sessions list to localStorage */
  function writeSessions(list: StoredSession[]) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(list))
  }

  /** Refresh the local sessions list for the document picker */
  async function fetchDocuments() {
    docsLoading.value = true
    docsError.value = null
    try {
      const sessions = readSessions()
      // Only expose metadata in picker
      docs.value = sessions.map(({ data, ...meta }) => meta)
    } catch (e: any) {
      docsError.value = e?.message || 'Failed to load documents'
    } finally {
      docsLoading.value = false
    }
  }

  /** Open the document picker modal and load sessions */
  function openPicker() {
    pickerOpen.value = true
    fetchDocuments()
  }
  /** Close the document picker modal */
  function closePicker() { pickerOpen.value = false }

  /** Load a stored session by id and jump to review */
  async function loadDocument(id: string) {
    const session = readSessions().find(s => s.document_id === id)
    if (!session) {
      docsError.value = 'Session not found'
      return
    }
    uploadType.value = session.upload_type
    processedData.value = session.data
    step.value = 'review'
    pickerOpen.value = false
    // TODO: stash session.data into a SSOT if needed for review UI
  }

  // Helper to store a lightweight JSON from rubric or student upload
  /** Persist a new local session and return its id */
  function saveSession(meta: { original_filename: string; upload_type: 'student'|'rubric' }, data: any) {
    const now = new Date().toISOString()
    const id = (globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}`)
    const next: StoredSession = {
      document_id: id,
      original_filename: meta.original_filename,
      upload_type: meta.upload_type,
      updated_at: now,
      data
    }
    const all = readSessions()
    all.unshift(next)
    writeSessions(all)
    return id
  }

  return {
    // state
    step, uploadType, file, pdfPageCount, error,
    pageSelection, pageRangeValid, pageRangeMessage, customInstructions,
    pdfPreviewUrl, imagePreviewUrl,
    processingStatus, processingTitle, processingMessage, processingProgress,
    processedData, cards, activeCardId,
    past, future, canUndo, canRedo, reviewProgress, lastSavedId,
    pickerOpen, docs, docsLoading, docsError,
    // getters
    canProceedUpload, debugPrompt,
    // actions
    go, setUploadType, setFile, removeFile,
    setCustomInstructions, setPageSelection, setCustomPages, validatePageRange,
    detectPdfPageCount, setProcessing, processDocument,
    setStudentName, setAnswer, removeAnswer, toggleFlag, toggleAccept, setActiveCard,
    // rubric helpers
    updateRubricField, addCriterionToQuestion, removeCriterionFromQuestion, setCriterionInQuestion, removeQuestion,
    undo, redo, saveToBackend, exportJson,
    openPicker, closePicker, fetchDocuments, loadDocument, saveSession,
  }
})
