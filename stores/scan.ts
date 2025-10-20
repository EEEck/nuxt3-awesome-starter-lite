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
  const step = ref<ScanStep>('mode')
  const uploadType = ref<UploadType>(null)

  // File state
  const file = ref<File | null>(null)
  const pdfPageCount = ref<number | null>(null)
  const error = ref<string | null>(null)

  // Modal state
  const pickerOpen = ref(false)
  const docs = ref<ProcessedDocument[]>([])
  const docsLoading = ref(false)
  const docsError = ref<string | null>(null)

  const canProceedUpload = computed(() => Boolean(uploadType.value && file.value))

  const debugPrompt = computed(() => defaultPrompt(uploadType.value))

  function go(next: ScanStep) { step.value = next }
  function setUploadType(t: UploadType) { uploadType.value = t }

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
  }

  // Lightweight local session store (no network)
  const SESSIONS_KEY = 'scan:sessions'
  function readSessions(): StoredSession[] {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY)
      const arr = raw ? JSON.parse(raw) : []
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }
  function writeSessions(list: StoredSession[]) {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(list))
  }

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

  function openPicker() {
    pickerOpen.value = true
    fetchDocuments()
  }
  function closePicker() { pickerOpen.value = false }

  async function loadDocument(id: string) {
    const session = readSessions().find(s => s.document_id === id)
    if (!session) {
      docsError.value = 'Session not found'
      return
    }
    uploadType.value = session.upload_type
    step.value = 'review'
    pickerOpen.value = false
    // TODO: stash session.data into a SSOT if needed for review UI
  }

  // Helper to store a lightweight JSON from rubric or student upload
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
    pickerOpen, docs, docsLoading, docsError,
    // getters
    canProceedUpload, debugPrompt,
    // actions
    go, setUploadType, setFile, openPicker, closePicker, fetchDocuments, loadDocument, saveSession,
  }
})
