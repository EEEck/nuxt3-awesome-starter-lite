<script setup lang="ts">
import BaseReviewCard from '~/components/shared/BaseReviewCard.vue'
import RubricQuestionEditor from '~/components/shared/RubricQuestionEditor.vue'
import type { RubricQuestion } from '~/types/rubric'

defineProps<{ 
  index: number; 
  question: RubricQuestion; 
  types?: { id: string; name: string }[] | null;
  detection?: { name: string; confidence?: number } | null;
}>()
const emit = defineEmits<{
  'update:questionId': [value: string]
  'update:maxPoints': [value: number]
  'update:questionText': [value: string]
  'update:questionType': [value: string]
  'add-criterion': []
  'remove-criterion': [index: number]
  'update-criterion': [payload: { index: number; field: 'criterion' | 'max_points'; value: any }]
  'remove-question': []
}>()
</script>

<template>
  <BaseReviewCard :title="`Question ${index + 1}`" :subtitle="question.question_id" :show-glow="false" :show-confidence="false" :clickable="false">
    <template #actions>
      <button class="drag-handle rounded border px-2 py-1 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-grab" title="Drag to reorder">
        <Icon name="lucide:grip-vertical" class="h-3 w-3" />
      </button>
      <button class="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="$emit('remove-question')">
        <Icon name="lucide:trash-2" class="h-3 w-3" /> Remove
      </button>
    </template>

    <RubricQuestionEditor
      :index="index"
      :question="question"
      :show-validation="true"
      :compact-id="true"
      @update:questionId="$emit('update:questionId', $event)"
      @update:maxPoints="$emit('update:maxPoints', $event)"
      @update:questionText="$emit('update:questionText', $event)"
      @add-criterion="$emit('add-criterion')"
      @remove-criterion="$emit('remove-criterion', $event)"
      @update-criterion="$emit('update-criterion', $event)"
    >
      <template #meta>
        <div v-if="types && types.length" class="block text-sm">
          <span class="block text-slate-300">Question Type</span>
          <select class="mt-1 w-full rounded-lg border p-2 text-slate-900 focus:outline-none dark:text-slate-200 dark:bg-slate-900"
                  :class="(detection?.confidence ?? 0) >= 0.7 ? 'border-emerald-400' : (detection?.confidence ?? 0) > 0 ? 'border-amber-400' : 'border-slate-300 dark:border-slate-700'"
                  :value="question.question_type || ''"
                  @change="$emit('update:questionType', ($event.target as HTMLSelectElement).value)">
            <option value="">—</option>
            <option v-for="t in (types || [])" :key="t.id" :value="t.id">{{ t.name }}</option>
          </select>
          <p v-if="detection" class="mt-1 text-xs" :class="(detection?.confidence ?? 0) < 0.7 ? 'text-amber-400' : 'text-emerald-400'">
            AI detected: {{ detection?.name }} ({{ Math.round(((detection?.confidence ?? 0) * 100)) }}% confidence)
          </p>
        </div>
      </template>
    </RubricQuestionEditor>
  </BaseReviewCard>
</template>

<style scoped>
</style>
