<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '~/stores/wizard'

const wizard = useWizardStore()

const steps = computed(() => [
  { key: 'profile', label: 'Profile' },
  { key: 'rubric-upload', label: 'Upload' },
  { key: 'rubric-edit', label: 'Edit' },
  { key: 'answers-upload', label: 'Answers' },
  { key: 'grade', label: 'Grading' },
])

function goTo(i: number) {
  // Optional: allow backwards navigation only
  if (i <= wizard.stepIndex) {
    wizard.go(steps.value[i].key as any)
  }
}
</script>

<template>
  <div class="flex items-center justify-center gap-6 rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4">
    <button
      v-for="(s, i) in steps"
      :key="s.key"
      type="button"
      class="flex min-w-[90px] flex-col items-center gap-1 rounded-xl px-3 py-2 transition"
      :class="{
        'bg-blue-500/20 ring-2 ring-blue-400/50': wizard.stepIndex === i,
        'bg-emerald-500/10 ring-1 ring-emerald-400/40': wizard.stepIndex > i,
        'hover:bg-slate-800': wizard.stepIndex < i,
      }"
      @click="goTo(i)"
    >
      <span
        class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
        :class="wizard.stepIndex === i ? 'bg-blue-500' : wizard.stepIndex > i ? 'bg-emerald-500' : 'bg-slate-600'"
      >
        {{ i + 1 }}
      </span>
      <span class="text-xs font-medium" :class="wizard.stepIndex === i ? 'text-blue-300' : wizard.stepIndex > i ? 'text-emerald-300' : 'text-slate-300'">
        {{ s.label }}
      </span>
    </button>
  </div>
</template>

<style scoped>
</style>

