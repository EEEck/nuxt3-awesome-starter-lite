<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import { useScanStore } from '~/stores/scan'
import DocumentViewer from '~/components/ui/DocumentViewer.vue'
import { StudentNameCard } from '~/components/cards'
import StudentAnswerCard from '~/components/cards/StudentAnswerCard.vue'
import RubricQuestionCard from '~/components/scan-processor/cards/RubricQuestionCard.vue'
import ConfidenceIndicator from '~/components/ui/ConfidenceIndicator.vue'
import { useRouter } from 'vue-router'

const scan = useScanStore()
const isStudent = computed(() => scan.uploadType === 'student')
const router = useRouter()

async function openGradingWizard() {
  const id = await scan.saveToBackend()
  const type = scan.uploadType || 'student'
  const q = new URLSearchParams({ doc: String(id || ''), type: String(type) })
  router.push(`/grading-wizard?${q.toString()}`)
}
function onExport() { scan.exportJson() }

// Resizable split logic
const leftPct = ref(55)
let dragging = false
function startDrag(e: MouseEvent) {
  dragging = true
  const onMove = (ev: MouseEvent) => {
    if (!dragging) return
    const total = (ev.view?.innerWidth || 1000)
    const x = ev.clientX
    const pct = Math.max(30, Math.min(70, Math.round((x / total) * 100)))
    leftPct.value = pct
  }
  const onUp = () => { dragging = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}
onBeforeUnmount(() => { dragging = false })
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Review Extracted Data</h3>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">Verify AI-extracted content and make corrections as needed.</p>
          <ConfidenceIndicator
            v-if="scan.processedData"
            :confidence="scan.processedData?.confidence ?? null"
            :justification="scan.processedData?.confidence_justification ?? null"
            :needs-review="scan.processedData?.needs_review ?? null"
            :upload-type="scan.uploadType"
            :name-confidence="scan.processedData?.name_confidence ?? null"
            :student-name="scan.processedData?.student_name ?? null"
          />
        </div>
        <div class="flex flex-col items-end gap-2">
          <div class="text-sm text-slate-700 dark:text-slate-300">Reviewed {{ scan.reviewProgress.done }} / {{ scan.reviewProgress.total }} ({{ scan.reviewProgress.percent }}%)</div>
          <div class="flex items-center gap-2">
            <button class="rounded border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" :disabled="!scan.canUndo" @click="scan.undo"><Icon name="lucide:undo-2" /> Undo</button>
            <button class="rounded border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" :disabled="!scan.canRedo" @click="scan.redo"><Icon name="lucide:redo-2" /> Redo</button>
            <button class="rounded border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" @click="onExport"><Icon name="lucide:download" /> Export JSON</button>
            <button class="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500" @click="openGradingWizard">Open Grading Wizard</button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex gap-4">
      <!-- Left: Document viewer (resizable) -->
      <div class="rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-subtle dark:border-slate-800/70 dark:bg-slate-900/70 overflow-hidden" :style="{ flexBasis: leftPct + '%'}">
        <DocumentViewer :pdf-url="scan.pdfPreviewUrl" :image-url="scan.imagePreviewUrl" :page-images="scan.processedData?.processed_page_images || null" :active-id="scan.activeCardId" />
      </div>

      <!-- Draggable separator -->
      <div class="w-1 cursor-col-resize rounded bg-slate-300/60 dark:bg-slate-700/60" @mousedown="startDrag" />

      <!-- Right: Cards -->
      <div class="rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-subtle dark:border-slate-800/70 dark:bg-slate-900/70 flex-1 min-w-[30%]">
        <div v-if="!scan.processedData" class="text-slate-500">No processed data yet.</div>
        <template v-else>
          <div v-if="isStudent" class="space-y-3">
            <StudentNameCard v-model="scan.processedData.student_name" :ai-name="scan.processedData.student_name" />
            <StudentAnswerCard
              v-for="(ans, qid) in scan.processedData.answers"
              :key="qid"
              :qid="qid as string"
              v-model="scan.processedData.answers[qid as string]"
              :flagged="(scan.cards[qid as string]?.flagged) || false"
              :accepted="(scan.cards[qid as string]?.accepted) || false"
              :confidence="(scan.processedData?.question_confidence?.[qid as string] ?? null) as any"
              :show-glow="false"
              :show-confidence="true"
              :clickable="true"
              @click="scan.setActiveCard(qid as string)"
              @update:flagged="() => scan.toggleFlag(qid as string)"
              @update:accepted="() => scan.toggleAccept(qid as string)"
              @remove="() => scan.removeAnswer(qid as string)"
            />
          </div>
          <div v-else class="space-y-3">
            <RubricQuestionCard
              v-for="(q, i) in (scan.processedData.questions || [])"
              :key="q.question_id || i"
              :index="i as number"
              :question="q"
              :flagged="(scan.cards[(q.question_id || `Q${i+1}`) as string]?.flagged) || false"
              :accepted="(scan.cards[(q.question_id || `Q${i+1}`) as string]?.accepted) || false"
              @click="scan.setActiveCard((q.question_id || `Q${i+1}`) as string)"
              @update:flagged="() => scan.toggleFlag((q.question_id || `Q${i+1}`) as string)"
              @update:accepted="() => scan.toggleAccept((q.question_id || `Q${i+1}`) as string)"
              @remove-question="() => scan.removeQuestion(i as number)"
              @update:questionId="val => scan.updateRubricField((q.question_id || `Q${i+1}`) as string, 'question_id', val)"
              @update:maxPoints="val => scan.updateRubricField((q.question_id || `Q${i+1}`) as string, 'max_points', val as any)"
              @update:questionText="val => scan.updateRubricField((q.question_id || `Q${i+1}`) as string, 'question_text', val)"
              @add-criterion="() => scan.addCriterionToQuestion((q.question_id || `Q${i+1}`) as string)"
              @remove-criterion="j => scan.removeCriterionFromQuestion((q.question_id || `Q${i+1}`) as string, j as number)"
              @update-criterion="p => scan.setCriterionInQuestion((q.question_id || `Q${i+1}`) as string, (p as any).index as number, (p as any).field as any, (p as any).value)"
            />
          </div>
        </template>

      </div>
    </div>
  </div>
  
 </template>

<style scoped>
.shadow-subtle { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04); }
</style>
