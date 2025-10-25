<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  index?: number
  question: any
  showValidation?: boolean
}>()
const emit = defineEmits<{
  'update:questionId': [value: string]
  'update:maxPoints': [value: number]
  'update:questionText': [value: string]
  'add-criterion': []
  'remove-criterion': [index: number]
  'update-criterion': [payload: { index: number; field: 'criterion' | 'max_points'; value: any }]
}>()

function onId(e: Event) { emit('update:questionId', (e.target as HTMLInputElement).value) }
function onMax(e: Event) { emit('update:maxPoints', Number((e.target as HTMLInputElement).value || 0)) }
function onText(e: Event) { emit('update:questionText', (e.target as HTMLTextAreaElement).value) }

const criteria = computed(() => Array.isArray(props.question?.criteria) ? props.question.criteria : [])
const criteriaSum = computed(() => criteria.value.reduce((s: number, c: any) => s + (Number(c?.max_points) || 0), 0))
const maxPoints = computed(() => Number(props.question?.max_points) || 0)
const hasMismatch = computed(() => (criteria.value.length > 0) && (criteriaSum.value !== maxPoints.value))
const hasNegative = computed(() => maxPoints.value < 0 || criteria.value.some((c: any) => Number(c?.max_points) < 0))
</script>

<template>
  <div class="space-y-3">
    <div class="grid gap-3 md:grid-cols-2">
      <label class="block text-sm">
        <span class="text-slate-300">Question ID</span>
        <input class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" :value="question.question_id" @input="onId" />
      </label>
      <label class="block text-sm">
        <span class="text-slate-300">Max Points</span>
        <div class="mt-1 flex items-center gap-2">
          <input class="w-24 rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" :value="question.max_points" type="number" min="0" @input="onMax" />
          <span class="text-xs text-slate-500">pts</span>
        </div>
      </label>
    </div>

    <div>
      <label class="block text-sm text-slate-300">Question Text</label>
      <textarea class="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200" rows="3" :value="question.question_text" @input="onText" />
    </div>

    <div>
      <div class="mb-1 flex items-center justify-between">
        <div class="text-sm font-medium text-slate-300">Criteria</div>
        <button class="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="$emit('add-criterion')">
          <Icon name="lucide:plus" class="h-3 w-3" /> Add Criterion
        </button>
      </div>
      <div class="space-y-2">
        <div v-for="(c, i) in (question.criteria || [])" :key="i" class="rounded border border-slate-300 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <div class="grid gap-2 md:grid-cols-[1fr,100px,auto] md:items-center">
            <input class="rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                   :value="c.criterion"
                   placeholder="Criterion"
                   @input="$emit('update-criterion', { index: i, field: 'criterion', value: ($event.target as HTMLInputElement).value })" />
            <div class="flex items-center gap-2">
              <input type="number" min="0"
                     class="w-20 rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                     :value="c.max_points"
                     @input="$emit('update-criterion', { index: i, field: 'max_points', value: Number(($event.target as HTMLInputElement).value || 0) })" />
              <span class="text-xs text-slate-500">pts</span>
            </div>
            <button class="justify-self-end rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="$emit('remove-criterion', i)">
              <Icon name="lucide:x" class="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showValidation !== false" class="flex flex-wrap items-center gap-2 text-xs">
      <span class="inline-flex items-center gap-1 rounded-full border border-slate-300/60 bg-slate-700/10 px-2 py-0.5 text-slate-300">
        <Icon name="lucide:calculator" class="h-3 w-3" /> Criteria sum: {{ criteriaSum }} pts
      </span>
      <span v-if="hasMismatch" class="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-red-300">
        <Icon name="lucide:alert-triangle" class="h-3 w-3" /> Max points ({{ maxPoints }}) differ from sum
      </span>
      <span v-if="hasNegative" class="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-red-300">
        <Icon name="lucide:minus-circle" class="h-3 w-3" /> Negative point value detected
      </span>
    </div>
  </div>
</template>

<style scoped>
</style>
