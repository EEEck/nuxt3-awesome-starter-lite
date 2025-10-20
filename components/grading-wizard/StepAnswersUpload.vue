<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDropZone } from '@vueuse/core'
import { useWizardStore } from '~/stores/wizard'
import { AnswersSchema } from '~/lib/schemas'

const wizard = useWizardStore()
const error = ref<string | null>(null)
const uploadedName = ref<string | null>(null)
const dragOver = ref(false)
const editorOpen = ref(false)
const editText = ref('')
const dropEl = ref<HTMLElement | null>(null)
const showPreview = ref(false)

function refreshEditTextFromState() {
  if (wizard.answers) editText.value = JSON.stringify(wizard.answers, null, 2)
}

function coerceAnswerValue(value: unknown) {
  if (value === null) return null
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (typeof value === 'undefined') return ''
  try { return JSON.stringify(value) } catch { return String(value) }
}

function normalizeAnswersPayload(raw: unknown) {
  // Accept either new object schema or legacy array format
  const direct = AnswersSchema.safeParse(raw)
  if (direct.success) return direct.data

  if (Array.isArray(raw)) {
    const submissions = raw.map((item, idx) => {
      if (!item || typeof item !== 'object') throw new Error('Invalid student answer entry')
      const record = item as Record<string, any>
      const studentId = String(
        record.studentId ?? record.student_id ?? record.student_name ?? record.name ?? `student-${idx + 1}`
      )

      let responses: any[] = []
      if (Array.isArray(record.responses)) {
        responses = record.responses.map((resp: any, rIdx: number) => {
          if (!resp || typeof resp !== 'object') return { questionId: `q${rIdx + 1}`, answer: coerceAnswerValue(resp) }
          const entry = resp as Record<string, any>
          const questionId = String(entry.questionId ?? entry.question_id ?? entry.id ?? `q${rIdx + 1}`)
          const answer = coerceAnswerValue(entry.answer ?? entry.value ?? entry.response)
          const metadata = entry.metadata && typeof entry.metadata === 'object' ? entry.metadata : undefined
          return { questionId, answer, metadata }
        })
      } else if (record.answers && typeof record.answers === 'object' && !Array.isArray(record.answers)) {
        responses = Object.entries(record.answers as Record<string, any>).map(([questionId, answer]) => ({
          questionId: String(questionId),
          answer: coerceAnswerValue(answer),
        }))
      }

      if (!responses.length) throw new Error(`No responses provided for ${studentId}`)
      return { studentId, responses }
    })

    const normalized = { profileId: wizard.profileId ?? null, submissions }
    const parsed = AnswersSchema.safeParse(normalized)
    if (!parsed.success) throw new Error(parsed.error.issues[0]?.message || 'Invalid answers JSON')
    return parsed.data
  }

  throw new Error('Invalid answers JSON format')
}

const previewRows = computed(() => {
  const results: {
    student: string
    preview: string
    answerCount: number
    charCount: number
  }[] = []

  const submissions = wizard.answers?.submissions
  if (!submissions?.length) return results

  submissions.forEach((submission, idx) => {
    const student = submission?.studentId || `Student ${idx + 1}`
    const responses = Array.isArray(submission?.responses) ? submission.responses : []
    const answerCount = responses.length
    const charCount = responses.reduce((total, resp) => total + String(resp?.answer ?? '').length, 0)
    const previewParts = responses.map((resp, rIdx) => {
      const label = resp?.questionId || `Q${rIdx + 1}`
      const rawAnswer = String(resp?.answer ?? '')
      const trimmed = rawAnswer.length > 120 ? `${rawAnswer.slice(0, 117)}...` : rawAnswer
      return `${label}: ${trimmed}`
    })
    results.push({
      student,
      preview: previewParts.join(' | '),
      answerCount,
      charCount,
    })
  })

  return results
})

async function handleFile(file: File) {
  try {
    error.value = null
    const json = JSON.parse(await file.text())
    const normalized = normalizeAnswersPayload(json)

    wizard.setAnswers(normalized)
    try { wizard.saveSession({ data: normalized, title: `Answers: ${file.name}` }) } catch {}
    uploadedName.value = file.name
    refreshEditTextFromState()
  } catch (err: any) {
    error.value = err?.message ?? 'Invalid answers JSON'
  }
}

async function onPick(e: Event) {
  error.value = null
  uploadedName.value = null
  const f = (e.target as HTMLInputElement).files?.[0]; if (!f) return
  await handleFile(f)
}

function proceedNext() {
  if (wizard.answers) wizard.next()
}

function openEditor() {
  refreshEditTextFromState()
  editorOpen.value = true
}

function cancelEditor() {
  editorOpen.value = false
}

function saveEditor() {
  error.value = null
  try {
    const raw = JSON.parse(editText.value)
    const normalized = normalizeAnswersPayload(raw)
    wizard.setAnswers(normalized)
    refreshEditTextFromState()
    editorOpen.value = false
  } catch (e: any) {
    error.value = e?.message || 'Invalid JSON'
  }
}

useDropZone(dropEl, {
  onDrop(files) { if (files?.length) handleFile(files[0]) },
  onOver() { dragOver.value = true },
  onLeave() { dragOver.value = false }
})

if (wizard.answers) {
  refreshEditTextFromState()
  uploadedName.value = 'Existing answers'
}
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 4</p>
      <h2 class="text-2xl font-semibold">Upload Student Answers</h2>
      <p class="text-slate-600 dark:text-slate-300">Upload your answers file (JSON). Expected format: submissions with studentId and responses per question.</p>
      <p class="text-xs text-slate-500 dark:text-slate-400">Example: { "submissions": [{ "studentId": "s-001", "responses": [{ "questionId": "q1", "answer": "..." }] }] } &middot; Legacy array format with student_name + answers map is also supported.</p>
    </header>

    <div class="space-y-4">
      <div
        ref="dropEl"
        class="group rounded-2xl border-2 border-dashed p-8 text-center transition"
        :class="[
          dragOver ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 bg-white',
          'hover:border-brand-400 hover:shadow-subtle'
        ]"
      >
        <div class="flex flex-col items-center gap-3">
          <Icon name="lucide:upload" class="h-8 w-8 text-brand-500" />
          <p class="text-lg font-medium text-slate-900 dark:text-white">Upload Answers (JSON)</p>
          <p class="text-sm text-slate-600 dark:text-slate-400">Drag and drop your answers file here or click to browse</p>
          <label class="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <input type="file" accept="application/json" class="hidden" @change="onPick" />
            Browse files
          </label>
        </div>
      </div>

      <div v-if="uploadedName" class="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-500/40 dark:bg-green-900/20 dark:text-green-200">
        <p class="font-medium">Answers Uploaded Successfully</p>
        <p class="text-sm">{{ uploadedName }}</p>
        <div class="mt-3">
          <button type="button" class="rounded bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500" @click="proceedNext">
            Next: Run Grading
          </button>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </div>

    <!-- Answers JSON Preview + Editor -->
    <div v-if="wizard.answers" class="rounded-2xl border outline-variant-border bg-white p-5">
      <div class="mb-2 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-slate-800">
          <Icon name="lucide:braces" class="h-5 w-5 text-slate-700" />
          <h4 class="text-sm font-semibold">Answers JSON</h4>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button v-if="previewRows.length" class="rounded-lg border outline-variant-border bg-slate-50 px-3 py-1.5 text-sm hover:bg-slate-100" @click="showPreview = !showPreview">
            {{ showPreview ? 'Hide' : 'Show' }} Student Data
          </button>
          <button v-if="!editorOpen" class="rounded-lg border outline-variant-border bg-slate-50 px-3 py-1.5 text-sm hover:bg-slate-100" @click="openEditor">Edit JSON</button>
          <div v-else class="flex items-center gap-2">
            <button class="rounded bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-500" @click="saveEditor">Save</button>
            <button class="rounded-lg border outline-variant-border bg-white px-3 py-1.5 text-sm hover:bg-slate-50" @click="cancelEditor">Cancel</button>
          </div>
        </div>
      </div>
      <p class="mb-2 text-xs text-slate-500">Formatted preview of the uploaded answers. Use Edit to review and adjust JSON.</p>
      <div v-if="!editorOpen" class="max-h-72 overflow-auto rounded border outline-variant-border bg-surface-variant p-3">
        <pre class="m-0 whitespace-pre-wrap break-words font-mono text-xs text-slate-800">{{ JSON.stringify(wizard.answers, null, 2) }}</pre>
      </div>
      <div v-else>
        <textarea v-model="editText" rows="12" class="w-full rounded-lg border outline-variant-border bg-white p-3 font-mono text-sm text-slate-900 focus:border-brand-500 focus:outline-none" />
      </div>

      <div v-if="showPreview && previewRows.length" class="mt-4 rounded-2xl border outline-variant-border bg-surface-variant p-4">
        <div class="mb-3 flex items-center gap-2">
          <Icon name="lucide:users" class="h-5 w-5 text-slate-700" />
          <h5 class="text-sm font-semibold text-slate-800">Student Data Preview</h5>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead class="bg-white">
              <tr>
                <th class="px-4 py-2 font-medium text-slate-600">Student</th>
                <th class="px-4 py-2 font-medium text-slate-600">Answer Preview</th>
                <th class="px-4 py-2 font-medium text-slate-600">Character Count</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr v-for="row in previewRows" :key="row.student" class="bg-white">
                <td class="px-4 py-2 text-slate-800">{{ row.student }}</td>
                <td class="px-4 py-2 text-slate-600">{{ row.preview }}</td>
                <td class="px-4 py-2 text-slate-600">{{ row.answerCount }} answers, {{ row.charCount }} chars</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>
