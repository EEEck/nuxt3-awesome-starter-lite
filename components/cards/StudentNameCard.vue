<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  aiName?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const needsReview = computed(() => {
  const v = (props.modelValue || '').trim()
  return !v || v === 'Unknown Student'
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="rounded-xl border p-4" :class="needsReview ? 'border-amber-400/60 bg-amber-500/5' : 'border-slate-300/60 dark:border-slate-700/60'">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="rounded-full bg-blue-500/10 p-2"><Icon name="lucide:user" class="h-5 w-5 text-blue-400" /></div>
        <div>
          <h4 class="text-base font-semibold text-white">Student Information</h4>
          <p class="text-xs text-slate-400">Primary identification for this worksheet</p>
        </div>
      </div>
      <div v-if="needsReview" class="flex items-center gap-2 rounded-full border border-amber-400/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300">
        <Icon name="lucide:alert-triangle" class="h-3 w-3" /> Verify Name
      </div>
    </div>

    <label class="block text-sm text-slate-300">Student Name *</label>
    <input :value="props.modelValue" type="text" class="mt-1 w-full rounded-lg border bg-white/90 p-2 text-slate-900 focus:border-brand-500 focus:outline-none dark:bg-slate-900 dark:text-slate-200" :class="needsReview ? 'border-amber-400/60' : 'border-slate-300 dark:border-slate-700'" placeholder="Enter student name" @input="onInput" />

    <div class="mt-2 text-xs text-slate-500">AI extracted: "{{ (props.aiName ?? props.modelValue) || 'Name not found' }}"</div>
  </div>
</template>

<style scoped>
</style>
