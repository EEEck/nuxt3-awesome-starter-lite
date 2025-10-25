<script setup lang="ts">
import BaseReviewCard from '~/components/shared/BaseReviewCard.vue'
import RubricQuestionEditor from '~/components/shared/RubricQuestionEditor.vue'

defineProps<{ index: number; question: any; flagged?: boolean; accepted?: boolean }>()
const emit = defineEmits<{
  'update:questionId': [value: string]
  'update:maxPoints': [value: number]
  'update:questionText': [value: string]
  'add-criterion': []
  'remove-criterion': [index: number]
  'update-criterion': [payload: { index: number; field: 'criterion' | 'max_points'; value: any }]
  'remove-question': []
  'update:flagged': [value: boolean]
  'update:accepted': [value: boolean]
  click: []
}>()
</script>

<template>
  <BaseReviewCard :title="`Question ${index + 1}`" :subtitle="question.question_id" :flagged="flagged" :accepted="accepted" :show-glow="true" :show-confidence="false" @click="$emit('click')">
    <template #actions>
      <button class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
              :class="accepted ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-300 text-slate-300 dark:border-slate-700'"
              @click.stop="$emit('update:accepted', !accepted)">
        <Icon :name="accepted ? 'lucide:check-circle' : 'lucide:check'" class="h-3 w-3" />
        {{ accepted ? 'Approved' : 'Approve' }}
      </button>
      <button class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
              :class="flagged ? 'border-red-500 bg-red-500/10 text-red-300' : 'border-slate-300 text-slate-300 dark:border-slate-700'"
              @click.stop="$emit('update:flagged', !flagged)">
        <Icon name="lucide:flag" class="h-3 w-3" />
        {{ flagged ? 'Flagged' : 'Flag for Review' }}
      </button>
      <button class="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click.stop="$emit('remove-question')">
        <Icon name="lucide:trash-2" class="h-3 w-3" /> Remove
      </button>
    </template>

    <RubricQuestionEditor
      :index="index"
      :question="question"
      :show-validation="true"
      @update:questionId="$emit('update:questionId', $event)"
      @update:maxPoints="$emit('update:maxPoints', $event)"
      @update:questionText="$emit('update:questionText', $event)"
      @add-criterion="$emit('add-criterion')"
      @remove-criterion="$emit('remove-criterion', $event)"
      @update-criterion="$emit('update-criterion', $event)"
    />
  </BaseReviewCard>
</template>

<style scoped>
</style>
