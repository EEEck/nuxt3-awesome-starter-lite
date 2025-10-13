<script setup lang="ts">
import { ref } from 'vue'
import { useWizard } from '~/stores/wizard'
import LegacyPdfPicker from './LegacyPdfPicker.vue'

const wiz = useWizard()
const err = ref<string | null>(null)

function onPick(e: Event) {
  err.value = null
  const f = (e.target as HTMLInputElement).files?.[0]
  if (!f) return
  if (!/\.pdf$/i.test(f.name)) { err.value = 'Please choose a PDF'; return }
  wiz.setPdf(f)
}

function proceed() {
  if (!wiz.selectedPageIndices?.length) { err.value = 'Select at least one page'; return }
  // Go to your next step (e.g., extract or review → your choice)
  wiz.go('extract')
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-xl font-semibold">Upload PDF & Select Pages</h2>
    <input type="file" accept="application/pdf" @change="onPick" />
    <p v-if="err" class="text-sm text-red-600">{{ err }}</p>

    <LegacyPdfPicker v-if="wiz.pdfFile" />

    <div class="mt-3 flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Selected pages:
        <span v-if="(wiz.selectedPageIndices?.length || 0) === 0">none</span>
        <span v-else class="inline-flex flex-wrap gap-1">
          <span v-for="i in wiz.selectedPageIndices" :key="i"
                class="px-2 py-0.5 rounded-full border text-xs">#{{ i+1 }}</span>
        </span>
      </div>
      <div class="flex gap-2">
        <button class="btn" @click="wiz.setSelectedPages([])">Clear</button>
        <button class="btn" @click="proceed">Continue</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn { @apply rounded border px-3 py-1 text-sm hover:bg-gray-50; }
</style>
