<script setup lang="ts">
const links = [
  { to: '/', label: 'Overview' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/grading-wizard', label: 'Grading Wizard' },
  { to: '/scan-processor', label: 'Scan Processor' },
  { to: '/ai-assistant', label: 'AI Assistant' },
]
</script>

<template>
  <AppShell :links="links" beta-label="Private Beta">
    <slot />
  </AppShell>
</template>
