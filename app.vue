<script lang="ts" setup>
const title = 'Grading Wizard'

useHead({
  title,
  titleTemplate: (chunk) => (chunk ? `${chunk} · ${title}` : `${title} · AI Teaching Ops`),
})

useSeoMeta({
  description:
    'A modern Nuxt 3 starter for AI-native grading experiences. Ship fast with enterprise-ready UX primitives and collaboration workflows.',
  ogTitle: `${title} · AI Teaching Ops`,
  ogDescription:
    'Operationalize AI grading with confidence. Responsive, accessible, and production-ready scaffolding for teaching teams.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>
