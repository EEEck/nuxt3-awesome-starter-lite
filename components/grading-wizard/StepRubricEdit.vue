<script setup lang="ts">
import { computed, onMounted, watch, ref } from 'vue'
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

// Feedback input
const clarification = ref('')
async function getFeedback() {
  await edit.requestFeedback(clarification.value)
}

// Probabilities preview: mock top-3 types per question (uses detection if present)
function probabilityPreview(i: number) {
  const types = questionTypes.value
  const hint = edit.detection[i]
  if (!types.length) return [] as { label: string; value: number }[]
  // default distribution
  let dist = [0.6, 0.25, 0.15]
  if (hint && hint.confidence) {
    const top = Math.max(0.4, Math.min(0.95, Number(hint.confidence)))
    const rem = 1 - top
    dist = [top, rem * 0.6, rem * 0.4]
  }
  const labels = [types[0]?.name || 'Type A', types[1]?.name || 'Type B', types[2]?.name || 'Type C']
  return labels.map((label, idx) => ({ label, value: dist[idx] ?? 0 }))
}
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
      <!-- Sticky tools bar (no title) -->
      <div class="sticky top-20 z-20 flex items-center justify-end rounded-2xl border border-slate-200 bg-white/80 p-3 backdrop-blur">
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

      <!-- AI Feedback (moved above Exam Information) -->
      <div class="rounded-2xl border outline-variant-border bg-gradient-to-b from-white to-surface-variant p-0">
        <div class="h-1.5 rounded-t-2xl accent-neutral" />
        <div class="p-5 pb-3">
          <div class="flex items-center gap-2">
            <Icon name="lucide:cpu" class="h-6 w-6 text-slate-700" />
            <h3 class="text-lg font-semibold text-slate-900">AI Feedback</h3>
          </div>
          <p class="text-sm text-slate-600">Refine rubric clarity, coverage, and fairness. Provide brief guidance and get targeted suggestions.</p>
        </div>
        <div class="divider mx-5" />
        <div class="p-5 pt-4">
          <div class="flex items-stretch gap-2">
            <textarea v-model="clarification" rows="4" placeholder="Tell AI what to focus on (e.g., ‘Make it more focused on critical thinking; add examples; simplify language.’)" class="w-[48rem] max-w-full rounded-lg border outline-variant-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            <button class="flex w-36 items-center justify-center gap-2 rounded-lg border outline-variant-border bg-slate-50 px-3 text-sm text-slate-700 hover:bg-slate-100" :disabled="edit.aiFeedbackLoading" @click="getFeedback">
              <Icon name="lucide:message-square-text" class="h-5 w-5 text-slate-700" />
              {{ edit.aiFeedbackLoading ? 'Getting…' : 'Get Feedback' }}
            </button>
          </div>
          <div v-if="clarification || edit.aiFeedback" class="mt-3 space-y-3">
            <div v-if="clarification" class="rounded-xl border outline-variant-border bg-white p-3">
              <div class="mb-1 text-xs font-semibold text-slate-500">You</div>
              <p class="text-sm text-slate-900 whitespace-pre-wrap">{{ clarification }}</p>
            </div>
            <div v-if="edit.aiFeedback" class="rounded-xl border outline-variant-border bg-white p-3">
              <div class="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Icon name="lucide:cpu" class="h-4 w-4 text-slate-600" /> AI
              </div>
              <p class="text-sm text-slate-900 whitespace-pre-wrap">{{ edit.aiFeedback }}</p>
              <div class="mt-2 flex justify-end">
                <button class="rounded-lg border outline-variant-border bg-white px-3 py-1.5 text-xs hover:bg-slate-50" @click="edit.dismissFeedback">Dismiss</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exam information -->
      <div class="rounded-2xl border outline-variant-border bg-gradient-to-b from-surface-variant to-white p-0 shadow-sm">
        <!-- Accent bar + title -->
        <div class="h-1.5 rounded-t-2xl accent-neutral" />
        <div class="p-5 pb-3">
          <h3 class="text-lg font-semibold text-slate-900">Exam Information</h3>
          <p class="text-sm text-slate-600">Name this exam and set totals and general instructions.</p>
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
          <button class="inline-flex items-center gap-2 rounded-lg border outline-variant-border bg-slate-50 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100" @click="detectTypes">
            <Icon name="lucide:scan-line" class="h-4 w-4 text-slate-700" /> Detect question types
          </button>
        </div>
      </div>

      <!-- AI Feedback Panel (legacy position, disabled) -->
      <div v-if="false" class="rounded-2xl border outline-variant-border bg-gradient-to-b from-white to-surface-variant p-0">
        <div class="h-1.5 rounded-t-2xl primary-bg" />
        <div class="p-5">
        <div class="mb-3 flex items-center gap-2">
          <div class="flex items-center gap-2">
            <Icon name="lucide:cpu" class="h-5 w-5 text-slate-700" />
            <h4 class="text-base font-semibold text-slate-900">Get AI Feedback on Rubric</h4>
          </div>
          <div class="flex items-center gap-2">
            <textarea v-model="clarification" rows="4" placeholder="Tell AI what to focus on (e.g., ‘Make it more focused on critical thinking; add examples; simplify language.’)" class="w-[48rem] max-w-full rounded-lg border outline-variant-border bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
            <button class="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100" :disabled="edit.aiFeedbackLoading" @click="getFeedback">
              <Icon name="lucide:sparkles" class="h-4 w-4 text-blue-700" />
              {{ edit.aiFeedbackLoading ? 'Getting…' : 'Get Feedback' }}
            </button>
          </div>
        </div>
        <!-- Mini chat-like thread: last user prompt + AI reply -->
        <div v-if="clarification || edit.aiFeedback" class="space-y-3">
          <div v-if="clarification" class="rounded-xl border outline-variant-border bg-white p-3">
            <div class="mb-1 text-xs font-semibold text-slate-500">You</div>
            <p class="text-sm text-slate-900 whitespace-pre-wrap">{{ clarification }}</p>
          </div>
          <div v-if="edit.aiFeedback" class="rounded-xl border outline-variant-border bg-white p-3">
            <div class="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Icon name="lucide:sparkles" class="h-4 w-4 text-slate-700" /> AI
            </div>
            <p class="text-sm text-slate-900 whitespace-pre-wrap">{{ edit.aiFeedback }}</p>
            <div class="mt-2 flex justify-end">
              <button class="rounded-lg border outline-variant-border bg-white px-3 py-1.5 text-xs hover:bg-slate-50" @click="edit.dismissFeedback">Dismiss</button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- AI Question Type Suggestions (summary) -->
      <div class="rounded-2xl border outline-variant-border bg-white p-5">
        <div class="mb-3 flex items-center gap-2 text-slate-800">
          <Icon name="lucide:zap" class="h-5 w-5 text-slate-700" />
          <h4 class="text-sm font-semibold">AI Question Type Suggestions</h4>
        </div>
        <div class="space-y-2">
          <div v-for="(hint, idx) in Object.values(edit.detection)" :key="idx" v-if="hint" class="rounded-lg border outline-variant-border bg-surface-variant p-3 flex items-center gap-2">
            <div class="text-sm text-slate-800">Q{{ idx + 1 }}: {{ hint.name }}</div>
            <div class="text-xs text-slate-600">{{ Math.round((hint.confidence ?? 0) * 100) }}% match</div>
          </div>
        </div>
        <!-- Probability preview -->
        <div class="mt-3 space-y-2">
          <div v-for="(q, i) in edit.questions" :key="'prob-'+i" class="rounded-lg border outline-variant-border bg-white p-3">
            <div class="mb-1 text-xs font-semibold text-slate-600">Q{{ i+1 }} Type Confidence (preview)</div>
            <div class="space-y-1">
              <div v-for="b in probabilityPreview(i)" :key="b.label" class="flex items-center gap-2">
                <div class="w-28 text-xs text-slate-600">{{ b.label }}</div>
                <div class="h-2 flex-1 rounded bg-slate-200">
                  <div class="h-2 rounded primary-bg" :style="{ width: Math.round(b.value*100) + '%' }"></div>
                </div>
                <div class="w-10 text-right text-xs text-slate-600">{{ Math.round(b.value*100) }}%</div>
              </div>
            </div>
          </div>
        </div>
        <p class="mt-2 text-xs text-slate-500">Preview only — final values will populate from the AI backend.</p>
      </div>

      <div class="mt-2"><h3 class="text-lg font-semibold text-slate-900">Questions</h3><p class="text-sm text-slate-600">Edit question text, types, and criteria. Reorder or tweak points as needed.</p></div>
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
              <div class="mb-3 flex items-center gap-2">
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
                <div class="mb-2 flex items-center gap-2">
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







