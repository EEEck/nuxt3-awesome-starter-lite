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
</script>

<template>
  <div class="space-y-10 pb-16">
    <PageHeader
      eyebrow="Document intelligence"
      title="Convert scans into structured answers with guardrails"
      description="Drag-and-drop ingestion, pre-flight QA, and automatic syncing to grading workflows keep your operations teams focused on insight instead of manual clean-up."
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Configure intake
        </button>
      </template>
    </PageHeader>

    <section class="grid gap-6 px-6 lg:grid-cols-[1.2fr,0.8fr]">
      <article class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <h3 class="font-semibold text-slate-900 dark:text-white">Pipeline blueprint</h3>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Each stage exposes hooks for uploading to S3, monitoring latency, and injecting human verification when needed.
        </p>
        <ol class="mt-6 space-y-4 text-sm">
          <li
            v-for="step in pipeline"
            :key="step.title"
            class="flex gap-4 rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
          >
            <span class="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-500/10 font-semibold text-brand-600 dark:bg-brand-500/10 dark:text-brand-200">
              {{ pipeline.indexOf(step) + 1 }}
            </span>
            <div>
              <p class="font-semibold text-slate-900 dark:text-white">{{ step.title }}</p>
              <p class="mt-1 text-slate-500 dark:text-slate-300">{{ step.description }}</p>
            </div>
          </li>
        </ol>
      </article>

      <article class="flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <header>
          <h3 class="font-semibold text-slate-900 dark:text-white">QA signal board</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Real-time telemetry keeps ingestion resilient and auditable.</p>
        </header>
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="signal in qaSignals"
            :key="signal.label"
            class="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4 text-sm shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60"
          >
            <p class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{{ signal.label }}</p>
            <p class="mt-2 font-display text-2xl font-semibold text-slate-900 dark:text-white">{{ signal.value }}</p>
          </div>
        </div>
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          Send to dashboard
        </NuxtLink>
      </article>
    </section>
  </div>
</template>
