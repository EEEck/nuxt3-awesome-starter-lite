<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useScanStore } from '~/stores/scan'
import ScanWizard from '~/components/scan-processor/ScanWizard.vue'
useHead({ title: 'Scan Wizard' })

const route = useRoute()
const scan = useScanStore()

onMounted(() => {
  const t = String(route.query.type || '')
  if (t === 'student' || t === 'rubric') {
    scan.setUploadType(t as any)
    scan.go('upload')
  }
})
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

