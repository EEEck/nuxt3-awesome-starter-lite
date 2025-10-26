<script setup lang="ts">
import { onMounted } from 'vue'
import { navigateTo, useHead } from '#app'

useHead({ title: 'Redirecting…' })
onMounted(() => { navigateTo('/scan-processor/wizard', { replace: true }) })
</script>

<template>
  <div class="p-6 text-sm text-slate-600">Redirecting to Scan Processor…</div>
  
</template>

