<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  flagged?: boolean
  accepted?: boolean
  confidence?: number | null
  clickable?: boolean
  showGlow?: boolean
  showConfidence?: boolean
}>()

const emit = defineEmits<{ click: [] }>()

const confidencePct = computed(() => props.confidence != null ? Math.max(0, Math.min(100, Math.round(props.confidence * 100))) : null)
const confColor = computed(() => {
  const v = props.confidence ?? 0
  return v >= 0.8 ? 'text-emerald-400' : v >= 0.6 ? 'text-amber-400' : 'text-red-400'
})
const confBg = computed(() => {
  const v = props.confidence ?? 0
  return v >= 0.8 ? 'bg-emerald-500/10 border-emerald-500/30' : v >= 0.6 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30'
})

const containerClasses = computed(() => {
  if (props.showGlow === false) return 'border-slate-300/60 dark:border-slate-700/60'
  if (props.accepted) return 'border-slate-300/60 dark:border-slate-700/60 border-l-4 border-emerald-500 ring-1 ring-emerald-400/40 bg-emerald-500/5'
  if (props.flagged) return 'border-slate-300/60 dark:border-slate-700/60 border-l-4 border-red-500 ring-1 ring-red-400/40 bg-red-500/5'
  return 'border-slate-300/60 dark:border-slate-700/60 border-l-4 border-slate-700/40'
})

function onClick() { if (props.clickable !== false) emit('click') }
</script>

<template>
  <div class="rounded-xl border p-4 transition" :class="[containerClasses, clickable !== false ? 'cursor-pointer' : '']" @click="onClick">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h4 class="truncate text-base font-semibold text-white">{{ title }}</h4>
        <p v-if="subtitle" class="text-xs text-slate-400">{{ subtitle }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div v-if="(showConfidence ?? true) && confidencePct !== null" class="rounded-full border px-2 py-0.5 text-xs" :class="confBg">
          <span :class="confColor">{{ confidencePct }}%</span>
        </div>
        <slot name="actions" />
      </div>
    </div>
    <div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>

