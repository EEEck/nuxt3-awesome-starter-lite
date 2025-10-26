<script setup lang="ts">
import { onMounted } from 'vue'
import { navigateTo } from '#app'
onMounted(() => { navigateTo('/scan-processor/wizard', { replace: true }) })
</script>

<template>
  <div class="p-6 text-sm text-slate-600">Loading Scan Processor…</div>
</template>

