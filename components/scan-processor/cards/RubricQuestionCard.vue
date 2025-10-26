<script setup lang="ts">
import BaseReviewCard from '~/components/shared/BaseReviewCard.vue'
import RubricQuestionEditor from '~/components/shared/RubricQuestionEditor.vue'
import ReviewActions from '~/components/shared/ReviewActions.vue'
import type { RubricQuestion } from '~/types/rubric'

defineProps<{ index: number; question: RubricQuestion; flagged?: boolean; accepted?: boolean }>()
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
  <BaseReviewCard :title="`Question ${index + 1}`" :subtitle="question.question_id" :flagged="flagged" :accepted="accepted" :show-glow="false" :show-confidence="false" @click="$emit('click')">
    <template #actions>
      <ReviewActions :flagged="flagged" :accepted="accepted" :show-approve="true" :show-flag="true" :show-remove="true"
                     @update:flagged="$emit('update:flagged', $event)"
                     @update:accepted="$emit('update:accepted', $event)"
                     @remove="$emit('remove-question')" />
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
