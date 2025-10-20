<script setup lang="ts">
import ScanWizard from '~/components/scan-processor/ScanWizard.vue'
useHead({ title: 'Scan Processor – Wizard' })
</script>

<template>
  <div class="space-y-8 pb-16">
    <PageHeader
      eyebrow="Document intelligence"
      title="Document Processing Wizard"
      description="Start a new upload or load an existing session to review."
    />

    <section class="px-6">
      <ScanWizard />
    </section>
  </div>
</template>

<style scoped>
</style>
