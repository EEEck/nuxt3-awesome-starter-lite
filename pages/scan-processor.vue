<script setup lang="ts">
useHead({ title: 'Scan Processor' })

const pipeline = [
  {
    title: 'Drop files or connect box',
    description: 'Supports PDF, TIFF, and mobile capture streams with checksum validation.',
  },
  {
    title: 'Auto-orient & segment',
    description: 'Smart cropping, rotation, and form detection optimized for bubble sheets and free-response combos.',
  },
  {
    title: 'Extract answers securely',
    description: 'PII scrubbing, AI/ML assisted extraction, and visual confidence overlays for QA.',
  },
  {
    title: 'Sync to grading queue',
    description: 'Push structured answers to Grading Wizard or export CSV/SIS packages instantly.',
  },
]

const qaSignals = [
  { label: 'Documents processed (24h)', value: '5,942' },
  { label: 'Confidence below threshold', value: '1.8%' },
  { label: 'Average turnaround', value: '3m 12s' },
]
import { onMounted } from 'vue'

onMounted(() => {
  navigateTo('/scan-wizard')
})
</script>

<template>
  <div />
</template>
