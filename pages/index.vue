<script setup lang="ts">
</script>

<template>
  <section class="mx-auto max-w-3xl space-y-6 px-6 py-12">
    <header class="space-y-2">
      <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Welcome</p>
      <h1 class="text-3xl font-bold">AI Grading Workspace</h1>
      <p class="text-slate-600 dark:text-slate-300">
        Start the guided grading wizard to upload a rubric, provide student answers, and review results.
      </p>
    </header>
    <div class="flex gap-3">
      <NuxtLink
        to="/grading-wizard"
        class="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 font-semibold text-white shadow-subtle transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
      >
        Launch Grading Wizard
      </NuxtLink>
      <NuxtLink
        to="/dashboard"
        class="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
      >
        Go to Dashboard
      </NuxtLink>
    </div>
  </section>
</template>

