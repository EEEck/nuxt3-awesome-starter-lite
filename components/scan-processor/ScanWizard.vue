<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useScanStore } from '~/stores/scan'
import ModeSelection from '~/components/scan-processor/ModeSelection.vue'
import UploadStep from '~/components/scan-processor/UploadStep.vue'
import ProcessStep from '~/components/scan-processor/ProcessStep.vue'
import ReviewStep from '~/components/scan-processor/ReviewStep.vue'

const scan = useScanStore()
const { step } = storeToRefs(scan)
</script>

<template>
  <div class="space-y-6">
    <ModeSelection v-if="step === 'mode'" />

    <UploadStep v-else-if="step === 'upload'" />
    <ProcessStep v-else-if="step === 'process'" />
    <ReviewStep v-else-if="step === 'review'" />
    <div v-else class="rounded-xl border border-slate-700/40 bg-slate-900 p-6">Unknown step</div>
  </div>
</template>

<style scoped>
</style>
