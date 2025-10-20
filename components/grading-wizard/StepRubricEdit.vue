<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useWizard } from '~/stores/wizard'
import { useProfilesStore } from '~/stores/profiles'
import { useRubricEditStore } from '~/stores/rubricEdit'
import Draggable from 'vuedraggable'
import { useMagicKeys } from '@vueuse/core'
import { toast } from 'vue-sonner'

const wiz = useWizard()
const profiles = useProfilesStore()
const edit = useRubricEditStore()

onMounted(() => {
  edit.initFromWizard()
})

// Re-init if rubric arrives after mount (race-safe)
watch(() => wiz.rubric, (v) => {
  if (v && !edit.present) edit.initFromWizard()
})

const questionTypes = computed(() => {
  const p = wiz.profileId ? profiles.byId(wiz.profileId) : null
  return p?.questionTypes?.length
    ? p.questionTypes.map(t => ({ id: t.id, name: t.name }))
    : [
        { id: 'multiple_choice', name: 'Multiple Choice' },
        { id: 'short_answer', name: 'Short Answer' },
        { id: 'essay', name: 'Essay' },
        { id: 'math_problem', name: 'Math Problem' },
        { id: 'true_false', name: 'True/False' },
      ]
})

function detectTypes() {
  edit.detectQuestionTypes(); toast('Detecting question types…')
}

function continueNext() {
  wiz.go('answers-upload')
}

// Keyboard shortcuts (Ctrl+Z / Ctrl+Shift+Z)
const keys = useMagicKeys()
watch(keys['Ctrl+Z'], (v) => { if (v) edit.undo() })
watch(keys['Ctrl+Shift+Z'], (v) => { if (v) edit.redo() })

function criteriaSum(q: any) { return (q.criteria || []).reduce((s: number,c: any)=> s + (Number(c.max_points)||0), 0) }
</script>

<template>
  <section class="space-y-6">
    <header class="space-y-1">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
      <h2 class="text-2xl font-semibold">Review & Edit Rubric</h2>
      <p class="text-slate-600">Review and fine-tune your rubric with AI assistance.</p>
    </header>

    <div v-if="edit.present" class="space-y-6">
      <!-- Toolbar / Current Rubric header -->
      <div class="sticky top-20 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur">
        <h3 class="text-lg font-semibold text-slate-900">Current Rubric</h3>
        <div class="flex items-center gap-2">
          <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50" @click="edit.addQuestion">
            <Icon name="lucide:plus" class="h-4 w-4" /> Add Question
          </button>
          <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50" :disabled="!edit.canUndo" @click="edit.undo">
            <Icon name="lucide:undo-2" class="h-4 w-4" /> Undo
          </button>
          <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50" :disabled="!edit.canRedo" @click="edit.redo">
            <Icon name="lucide:redo-2" class="h-4 w-4" /> Redo
          </button>
          <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50" @click="edit.download">
            <Icon name="lucide:download" class="h-4 w-4" /> Download
          </button>
        </div>
      </div>

      <!-- Exam information -->
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="grid gap-4 md:grid-cols-3">
          <label class="block">
            <span class="text-sm text-slate-700">Exam name</span>
            <input class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                   :value="edit.present.exam_name ?? ''"
                   @input="edit.setExamName(($event.target as HTMLInputElement).value)" />
          </label>
          <label class="block">
            <span class="text-sm text-slate-700">Total Questions</span>
            <input type="number" min="1" class="mt-1 w-28 rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                   :value="edit.questions.length"
                   @input="edit.setTotalQuestions(Number(($event.target as HTMLInputElement).value || 1))" />
          </label>
          <label class="block">
            <span class="text-sm text-slate-700">Total Points</span>
            <input class="mt-1 w-28 cursor-default rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-700" :value="edit.totalPoints" readonly />
          </label>
        </div>

        <label class="mt-4 block">
          <span class="text-sm text-slate-700">General Instructions</span>
          <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                    :value="edit.present.general_instructions ?? ''"
                    @input="edit.setGeneralInstructions(($event.target as HTMLTextAreaElement).value)"/>
        </label>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50" @click="detectTypes">
            <Icon name="lucide:scan-line" class="h-4 w-4" /> Detect question types
          </button>
        </div>
      </div>

      <!-- Questions -->
      <div class="space-y-5">
        <Draggable :model-value="edit.questions" item-key="question_id" handle=".drag-handle" @update:modelValue="edit.setQuestions($event)">
          <template #item="{ element: q, index: i }">
            <div
             class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
             :class="{
               'ring-1 ring-amber-300': (edit.detection[i]?.confidence ?? 0) > 0 && (edit.detection[i]?.confidence ?? 0) < 0.7,
               'ring-1 ring-emerald-300': (edit.detection[i]?.confidence ?? 0) >= 0.7
             }">
              <div class="mb-3 flex items-center justify-between">
                <h4 class="font-medium text-slate-900"><span class="mr-2 cursor-grab drag-handle">⋮⋮</span> Question {{ i + 1 }}</h4>
                <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs hover:bg-slate-50" @click="edit.removeQuestion(i)">
                  <Icon name="lucide:trash-2" class="h-3.5 w-3.5" /> Remove Question
                </button>
              </div>

              <div class="grid gap-3 md:grid-cols-3">
            <label class="block">
              <span class="text-sm text-slate-700">Question ID</span>
              <input class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                     :value="q.question_id"
                     @input="edit.setQuestionField(i, 'question_id', ($event.target as HTMLInputElement).value)" />
            </label>
            <label class="block">
              <span class="text-sm text-slate-700">Max points</span>
              <div class="mt-1 flex items-center gap-2">
                <input type="number" min="0" class="w-24 rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                       :value="q.max_points"
                       @input="edit.setQuestionField(i, 'max_points', ($event.target as HTMLInputElement).value)" />
                <span class="text-xs text-slate-500">pts</span>
              </div>
            </label>
            <label class="block">
              <span class="text-sm text-slate-700">Question type</span>
              <select class="mt-1 w-full rounded-lg border p-2 text-slate-900 focus:outline-none"
                      :class="(edit.detection[i]?.confidence ?? 0) >= 0.7 ? 'border-emerald-400' : (edit.detection[i]?.confidence ?? 0) > 0 ? 'border-amber-400' : 'border-slate-300'"
                      :value="q.question_type || ''"
                      @change="edit.setQuestionField(i, 'question_type', ($event.target as HTMLSelectElement).value)">
                <option value="">—</option>
                <option v-for="t in questionTypes" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
              <p v-if="edit.detection[i]" class="mt-1 text-xs" :class="(edit.detection[i]!.confidence ?? 0) < 0.7 ? 'text-amber-700' : 'text-emerald-700'">
                AI detected: {{ edit.detection[i]!.name }} ({{ Math.round((edit.detection[i]!.confidence ?? 0) * 100) }}% confidence)
              </p>
            </label>
              </div>

              <label class="mt-3 block">
            <span class="text-sm text-slate-700">Question text</span>
            <textarea rows="3" class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                      :value="q.question_text"
                      @input="edit.setQuestionField(i, 'question_text', ($event.target as HTMLTextAreaElement).value)" />
              </label>

              <div class="mt-4">
                <div class="mb-2 flex items-center justify-between">
                  <h5 class="text-sm font-semibold text-slate-900">Criteria</h5>
                  <div class="flex items-center gap-2 text-xs text-slate-600">
                    <span>Sum: {{ criteriaSum(q) }} / {{ q.max_points }} pts</span>
                    <button v-if="criteriaSum(q) !== q.max_points" class="rounded border border-slate-300 bg-white px-2 py-0.5 hover:bg-slate-50" @click="edit.redistributeCriteriaEvenly(i)">Redistribute</button>
                  </div>
                </div>
                <Draggable :model-value="q.criteria" :item-key="(_,j)=>j" handle=".drag-handle" @update:modelValue="edit.setCriteria(i, $event)">
                  <template #item="{ element: c, index: j }">
                    <div class="grid grid-cols-12 items-center gap-2 py-1">
                      <input class="col-span-8 rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none" :value="c.criterion"
                             @input="edit.setCriterion(i, j, 'criterion', ($event.target as HTMLInputElement).value)" />
                      <div class="col-span-3 flex items-center gap-2">
                        <input class="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none" type="number" min="0" :value="c.max_points"
                               @input="edit.setCriterion(i, j, 'max_points', ($event.target as HTMLInputElement).value)" />
                        <span class="text-xs text-slate-500">pts</span>
                      </div>
                      <button class="col-span-1 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50" @click="edit.removeCriterion(i, j)">
                        <Icon name="lucide:x" class="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </template>
                </Draggable>
                <div v-if="!q.criteria?.length" class="text-xs text-slate-500">No criteria yet.</div>
              </div>
            </div>
          </template>
        </Draggable>
      </div>

      <div class="flex justify-end">
        <button class="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-500" @click="continueNext">
          Continue
        </button>
      </div>
    </div>

    <div v-else class="text-sm text-slate-600">
      No rubric loaded. Go back to upload.
    </div>
  </section>
</template>
