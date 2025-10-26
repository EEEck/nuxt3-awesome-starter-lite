<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseReviewCard from '~/components/shared/BaseReviewCard.vue'
import ReviewActions from '~/components/shared/ReviewActions.vue'

const props = withDefaults(defineProps<{ 
  qid: string; 
  modelValue: string; 
  flagged?: boolean; 
  accepted?: boolean;
  confidence?: number | null;
  showGlow?: boolean;
  showConfidence?: boolean;
  clickable?: boolean;
}>(), {
  showGlow: false,
  showConfidence: false,
  clickable: false,
})
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:flagged': [value: boolean]
  'update:accepted': [value: boolean]
  remove: []
  click: []
}>()

const text = ref(props.modelValue)
watch(() => props.modelValue, v => { text.value = v })

function onInput() { emit('update:modelValue', text.value) }
function onClick() { if (props.clickable) emit('click') }

// Fallback confidence for previews
const confidence = computed(() => {
  if (typeof props.confidence === 'number') return Math.max(0, Math.min(1, props.confidence))
  const len = (props.modelValue || '').trim().length
  if (!len) return 0.45
  const raw = 0.55 + Math.min(0.4, Math.log10(len + 1) / 10)
  return Math.max(0, Math.min(0.95, raw))
})
</script>

<template>
  <BaseReviewCard :title="qid" subtitle="Student Answer" :flagged="flagged" :accepted="accepted" :confidence="confidence"
                  :show-glow="showGlow" :show-confidence="showConfidence" :clickable="clickable" @click="onClick">
    <template #actions>
      <ReviewActions :flagged="flagged" :accepted="accepted" :show-approve="true" :show-flag="true" :show-remove="true"
                     @update:flagged="$emit('update:flagged', $event)"
                     @update:accepted="$emit('update:accepted', $event)"
                     @remove="$emit('remove')" />
    </template>
    <label class="block text-sm text-slate-300">Answer</label>
    <textarea v-model="text" rows="3" class="mt-1 w-full rounded-lg border bg-white/90 p-2 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200" @input="onInput" />
  </BaseReviewCard>
</template>

<style scoped>
</style>
