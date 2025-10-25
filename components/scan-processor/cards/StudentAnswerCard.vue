<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import BaseReviewCard from '~/components/shared/BaseReviewCard.vue'

const props = defineProps<{ 
  qid: string; 
  modelValue: string; 
  flagged?: boolean; 
  accepted?: boolean;
  confidence?: number | null;
}>()
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
function toggleFlag(e?: Event) { e?.stopPropagation?.(); emit('update:flagged', !props.flagged) }
function toggleAccept(e?: Event) { e?.stopPropagation?.(); emit('update:accepted', !props.accepted) }
function remove(e?: Event) { e?.stopPropagation?.(); emit('remove') }

const confidence = computed(() => {
  if (typeof props.confidence === 'number') return Math.max(0, Math.min(1, props.confidence))
  const len = (props.modelValue || '').trim().length
  if (!len) return 0.45
  const raw = 0.55 + Math.min(0.4, Math.log10(len + 1) / 10)
  return Math.max(0, Math.min(0.95, raw))
})
</script>

<template>
  <BaseReviewCard :title="qid" subtitle="Student Answer" :flagged="flagged" :accepted="accepted" :confidence="confidence" :show-glow="true" :show-confidence="true" @click="$emit('click')">
    <template #actions>
      <button class="rounded border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800" @click="remove">
        <Icon name="lucide:trash-2" class="h-3 w-3" /> Remove
      </button>
    </template>
    <label class="block text-sm text-slate-300">Answer</label>
    <textarea v-model="text" rows="3" class="mt-1 w-full rounded-lg border bg-white/90 p-2 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200" @input="onInput" />
    <div class="mt-3 flex flex-wrap gap-2">
      <button class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
              :class="accepted ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-300 text-slate-300 dark:border-slate-700'"
              @click="toggleAccept">
        <Icon :name="accepted ? 'lucide:check-circle' : 'lucide:check'" class="h-3 w-3" />
        {{ accepted ? 'Approved' : 'Approve' }}
      </button>
      <button class="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs"
              :class="flagged ? 'border-red-500 bg-red-500/10 text-red-300' : 'border-slate-300 text-slate-300 dark:border-slate-700'"
              @click="toggleFlag">
        <Icon name="lucide:flag" class="h-3 w-3" />
        {{ flagged ? 'Flagged' : 'Flag for Review' }}
      </button>
    </div>
  </BaseReviewCard>
</template>

<style scoped>
</style>

