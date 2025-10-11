<script lang="ts" setup>
const title = 'Grading Wizard MVP'

useHead({
  title,
  titleTemplate: (chunk) => (chunk ? `${chunk} · ${title}` : title),
})
</script>

<template>
  <NuxtLayout>
    <NuxtLoadingIndicator />
    <NuxtPage />
  </NuxtLayout>
</template>
