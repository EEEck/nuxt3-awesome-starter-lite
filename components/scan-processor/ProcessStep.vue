<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useScanStore } from '~/stores/scan'

const scan = useScanStore()

const icon = computed(() => {
  switch (scan.processingStatus) {
    case 'success': return 'lucide:check-circle'
    case 'error': return 'lucide:alert-triangle'
    case 'retry': return 'lucide:refresh-cw'
    default: return 'lucide:brain'
  }
})

const barClass = computed(() => {
  switch (scan.processingStatus) {
    case 'success': return 'bg-emerald-500'
    case 'error': return 'bg-red-500'
    case 'retry': return 'bg-amber-500'
    default: return 'bg-brand-500'
  }
})

onMounted(() => {
  // If user navigated here directly, kick processing if possible
  if (scan.file && scan.uploadType && scan.processingStatus === 'idle') {
    scan.processDocument()
  }
})
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Processing Document</h3>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">This may take up to a couple minutes for multi-page PDFs.</p>
    </div>

    <div class="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-subtle dark:border-slate-800/70 dark:bg-slate-900/70">
      <div class="flex items-start gap-3">
        <Icon :name="icon" class="mt-1 h-6 w-6 text-slate-700 dark:text-slate-200" />
        <div class="flex-1">
          <h4 class="text-base font-semibold text-slate-900 dark:text-white">{{ scan.processingTitle }}</h4>
          <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{{ scan.processingMessage }}</p>
          <div class="mt-4 grid gap-2 sm:grid-cols-3">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Icon name="lucide:eye" class="h-4 w-4" /> Computer Vision Analysis
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Icon name="lucide:zap" class="h-4 w-4" /> Neural Text Recognition
            </div>
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <Icon name="lucide:cpu" class="h-4 w-4" /> Contextual Understanding
            </div>
          </div>
          <div class="mt-4 h-2 w-full rounded-full bg-slate-200/70 dark:bg-slate-800/70">
            <div class="h-2 rounded-full transition-all" :class="barClass" :style="{ width: scan.processingProgress + '%' }" />
          </div>
        </div>
      </div>

      <div class="mt-4 flex items-center justify-end gap-2">
        <button type="button" class="rounded border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800" @click="scan.go('upload')">Back</button>
        <button v-if="scan.processingStatus==='success'" type="button" class="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-500" @click="scan.go('review')">Review Results</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-subtle { box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04); }
</style>
