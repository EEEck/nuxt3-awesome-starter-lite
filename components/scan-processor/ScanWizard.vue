<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useScanStore } from '~/stores/scan'
import ModeSelection from '~/components/scan-processor/ModeSelection.vue'

const scan = useScanStore()
const { step } = storeToRefs(scan)
</script>

<template>
  <div class="space-y-6">
    <ModeSelection v-if="step === 'mode'" />

    <div v-else-if="step === 'upload'" class="rounded-xl border border-slate-700/40 bg-slate-900 p-6">
      <h3 class="text-lg font-semibold">Upload</h3>
      <p class="text-sm text-slate-400">This step will include: upload type selection, file dropzone, PDF page selection, custom instructions, and debug prompt.</p>
      <div class="mt-4 flex gap-2">
        <button class="rounded border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800" @click="scan.go('mode')">Back to Mode Selection</button>
      </div>
    </div>

    <div v-else-if="step === 'review'" class="rounded-xl border border-emerald-600/40 bg-emerald-500/10 p-6">
      <h3 class="text-lg font-semibold text-emerald-200">Session loaded</h3>
      <p class="text-sm text-emerald-300">You selected an existing session. The Review step will render here in the full port.</p>
      <div class="mt-4 flex gap-2">
        <button class="rounded border border-slate-600 px-3 py-1.5 text-sm hover:bg-slate-800" @click="scan.go('mode')">Back to Mode Selection</button>
      </div>
    </div>

    <div v-else class="rounded-xl border border-slate-700/40 bg-slate-900 p-6">
      <p>Step: {{ step }}</p>
    </div>
  </div>
</template>

<style scoped>
</style>
