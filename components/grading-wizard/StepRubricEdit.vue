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
      <!-- Validation Summary -->
      <div v-if="edit.hasValidationIssues" class="rounded-2xl border border-red-200 bg-red-50 p-4">
        <div class="flex items-start gap-2">
          <Icon name="lucide:alert-triangle" class="mt-0.5 h-5 w-5 text-red-600" />
          <div class="flex-1">
            <h4 class="mb-1 text-sm font-semibold text-red-700">Rubric validation issues</h4>
            <ul class="text-xs text-red-700 space-y-1">
              <li v-for="e in edit.validationIssues.slice(0,5)" :key="e.index + e.code">• {{ e.message }}</li>
              <li v-if="edit.validationIssues.length > 5" class="text-red-600">• ... and {{ edit.validationIssues.length - 5 }} more</li>
            </ul>
          </div>
        </div>
      </div>
      <!-- Toolbar / Current Rubric header -->
      <div class="sticky top-20 z-20 flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur">
        <h3 class="text-lg font-semibold text-slate-900">Current Rubric</h3>
        <div class="flex items-center gap-2">
          <button class="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100" @click="edit.addQuestion">
            <Icon name="lucide:plus" class="h-4 w-4 text-blue-700" /> Add Question
          </button>
          <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50" :disabled="!edit.canUndo" @click="edit.undo">
            <Icon name="lucide:undo-2" class="h-4 w-4" /> Undo
          </button>
          <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-50" :disabled="!edit.canRedo" @click="edit.redo">
            <Icon name="lucide:redo-2" class="h-4 w-4" /> Redo
          </button>
          <button class="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700 hover:bg-emerald-100" @click="edit.download">
            <Icon name="lucide:download" class="h-4 w-4 text-emerald-700" /> Download
          </button>
        </div>
      </div>

      <!-- Exam information -->
      <div class="rounded-2xl border outline-variant-border bg-gradient-to-b from-surface-variant to-white p-0 shadow-sm">
        <!-- Accent bar + title -->
        <div class="h-1.5 rounded-t-2xl primary-bg" />
        <div class="flex items-center justify-between p-5 pb-3">
          <h3 class="text-lg font-semibold text-slate-900">Exam Information</h3>
        </div>
        <div class="divider mx-5" />
        <div class="grid gap-4 md:grid-cols-3 p-5 pt-4">
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
          <label class="md:col-span-3 block">
            <span class="text-sm text-slate-700">General Instructions</span>
            <textarea rows="3" class="mt-1 w-full rounded-lg border outline-variant-border bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none"
                      :value="edit.present.general_instructions ?? ''"
                      @input="edit.setGeneralInstructions(($event.target as HTMLTextAreaElement).value)"/>
          </label>
        </div>

        <div class="flex items-center justify-end gap-2 px-5 pb-5">
          <button class="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100" @click="detectTypes">
            <Icon name="lucide:scan-line" class="h-4 w-4 text-blue-700" /> Detect question types
          </button>
        </div>
      </div>

      <!-- Questions -->
      <div class="space-y-5">
        <Draggable :model-value="edit.questions" item-key="question_id" handle=".drag-handle" @update:modelValue="edit.setQuestions($event)">
          <template #item="{ element: q, index: i }">
            <div
             class="rounded-2xl border outline-variant-border bg-gradient-to-b from-white to-surface-variant p-0 shadow-sm hover:shadow-md hover:border-slate-300 transition"
             :class="{
               'ring-1 ring-amber-300': (edit.detection[i]?.confidence ?? 0) > 0 && (edit.detection[i]?.confidence ?? 0) < 0.7,
               'ring-1 ring-emerald-300': (edit.detection[i]?.confidence ?? 0) >= 0.7
             }">
              <!-- Accent bar -->
              <div class="h-1.5 rounded-t-2xl" :class="(edit.detection[i]?.confidence ?? 0) >= 0.7 ? 'bg-emerald-300' : (edit.detection[i]?.confidence ?? 0) > 0 ? 'bg-amber-300' : 'primary-bg'" />
              <div class="p-5">
              <div class="mb-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="mr-1 cursor-grab select-none drag-handle text-slate-400">⋮⋮</span>
                  <h4 class="font-medium text-slate-900">Question {{ i + 1 }}</h4>
                  <span class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
                    Max {{ q.max_points }} pts
                  </span>
                  <span v-if="q.question_type" class="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                    <Icon name="lucide:tag" class="h-3 w-3" /> {{ q.question_type }}
                  </span>
                </div>
                <button class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs hover:bg-slate-50" @click="edit.removeQuestion(i)">
                  <Icon name="lucide:trash-2" class="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <div class="divider my-2" />

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
                  <div class="flex items-center gap-3 text-xs text-slate-600">
                    <span :class="criteriaSum(q) !== q.max_points ? 'text-amber-700' : ''">Sum: {{ criteriaSum(q) }} / {{ q.max_points }} pts</span>
                    <span v-if="criteriaSum(q) !== q.max_points" class="text-amber-700">
                      <template v-if="(q.max_points - criteriaSum(q)) > 0">Add {{ q.max_points - criteriaSum(q) }} pts to criteria</template>
                      <template v-else>Subtract {{ Math.abs(q.max_points - criteriaSum(q)) }} pts from criteria</template>
                    </span>
                    <button v-if="criteriaSum(q) !== q.max_points" class="rounded border border-slate-300 bg-white px-2 py-0.5 hover:bg-slate-50" @click="edit.redistributeCriteriaEvenly(i)">Redistribute</button>
                  </div>
                </div>
                <Draggable :model-value="q.criteria" :item-key="(_,j)=>j" handle=".drag-handle" @update:modelValue="edit.setCriteria(i, $event)">
                  <template #item="{ element: c, index: j }">
                    <div class="grid grid-cols-12 items-center gap-2 rounded-lg border border-transparent py-1 hover:border-slate-200">
                      <input class="col-span-8 rounded-lg border outline-variant-border bg-white p-2 text-slate-900 focus:border-brand-500 focus:outline-none" :value="c.criterion"
                             @input="edit.setCriterion(i, j, 'criterion', ($event.target as HTMLInputElement).value)" />
                      <div class="col-span-3 flex items-center gap-2">
                        <button class="rounded border outline-variant-border bg-white px-2 py-1 text-xs hover:bg-slate-50" @click="edit.setCriterion(i, j, 'max_points', Math.max(0, Number(c.max_points||0)-1))">−</button>
                        <input class="w-full rounded-lg border outline-variant-border bg-white p-2 text-slate-900 text-center focus:border-brand-500 focus:outline-none" type="number" min="0" :value="c.max_points"
                               @input="edit.setCriterion(i, j, 'max_points', ($event.target as HTMLInputElement).value)" />
                        <button class="rounded border outline-variant-border bg-white px-2 py-1 text-xs hover:bg-slate-50" @click="edit.setCriterion(i, j, 'max_points', Number(c.max_points||0)+1)">+</button>
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
