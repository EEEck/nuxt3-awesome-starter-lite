<script setup lang="ts">
useHead({ title: 'Dashboard' })

const kpis = [
  {
    label: 'Graded responses today',
    value: '1,248',
    change: '+18% vs. yesterday',
    changeTone: 'positive',
    description: 'Across Intro to Biology and Linear Algebra cohorts.',
  },
  {
    label: 'Human review queue',
    value: '32 items',
    change: '-9 since last hour',
    changeTone: 'positive',
    description: 'Most flagged for rubric drift; AI rationale attached.',
  },
  {
    label: 'Assistant adoption',
    value: '76% faculty',
    change: '+12 signed in this week',
    changeTone: 'neutral',
    description: 'High engagement on feedback drafting prompts.',
  },
]

const activity = [
  {
    title: 'Rubric calibration completed',
    timestamp: '10:24 AM',
    actor: 'Prof. Eliza Nguyen',
    description: 'Accepted AI-suggested delta for free-response weighting.',
  },
  {
    title: 'Scan pipeline processed',
    timestamp: '9:52 AM',
    actor: 'Ops Bot',
    description: 'Uploaded 580 chemistry exams with 0 extraction errors.',
  },
  {
    title: 'New policy note',
    timestamp: '9:11 AM',
    actor: 'Academic Affairs',
    description: 'Added accessibility guidance for generative feedback.',
  },
]

const reviews = [
  {
    course: 'ENGR 205 · Design Thinking',
    status: 'Ready for release',
    items: 428,
    reviewer: 'Alex T.',
  },
  {
    course: 'PSYC 101 · Foundations',
    status: 'AI review in progress',
    items: 312,
    reviewer: 'AI Copilot',
  },
  {
    course: 'MATH 221 · Linear Algebra',
    status: 'Needs rubric alignment',
    items: 78,
    reviewer: 'You',
  },
]
</script>

<template>
  <div class="space-y-10 pb-16">
    <PageHeader
      eyebrow="Mission control"
      title="Instructional intelligence, at a glance"
      description="Monitor cohort progress, triage outliers, and ship feedback to LMS platforms without breaking flow."
    >
      <template #actions>
        <NuxtLink
          to="/grading-wizard"
          class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-subtle transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 dark:bg-white dark:text-slate-900"
        >
          New grading run
        </NuxtLink>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Export report
        </button>
      </template>
    </PageHeader>

    <section class="px-6">
      <div class="grid gap-6 lg:grid-cols-3">
        <KpiCard
          v-for="item in kpis"
          :key="item.label"
          :label="item.label"
          :value="item.value"
          :change="item.change"
          :change-tone="item.changeTone"
          :description="item.description"
        />
      </div>
    </section>

    <section class="grid gap-6 px-6 lg:grid-cols-[1.1fr,0.9fr]">
      <article class="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <header class="flex items-center justify-between gap-3">
          <div>
            <h3 class="font-semibold text-slate-900 dark:text-white">Live activity</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">Chronological pulse across your grading operations.</p>
          </div>
          <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            healthy
          </span>
        </header>
        <ul class="mt-6 space-y-4">
          <li v-for="item in activity" :key="item.title" class="rounded-2xl border border-slate-200/70 bg-white/80 p-4 text-sm shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
            <div class="flex items-center justify-between gap-3">
              <p class="font-semibold text-slate-900 dark:text-white">{{ item.title }}</p>
              <span class="text-xs uppercase tracking-wide text-slate-400">{{ item.timestamp }}</span>
            </div>
            <p class="mt-1 text-slate-500 dark:text-slate-300">{{ item.description }}</p>
            <p class="mt-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-400">{{ item.actor }}</p>
          </li>
        </ul>
      </article>

      <article class="flex flex-col gap-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <header class="space-y-2">
          <h3 class="font-semibold text-slate-900 dark:text-white">Reviews in motion</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Hand off AI drafts with confidence. Each state reflects rubric parity and faculty sentiment.
          </p>
        </header>
        <ul class="space-y-3 text-sm">
          <li
            v-for="review in reviews"
            :key="review.course"
            class="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition hover:border-brand-400/60 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-brand-400/60"
          >
            <p class="font-semibold text-slate-900 dark:text-white">{{ review.course }}</p>
            <p class="mt-1 text-slate-500 dark:text-slate-300">{{ review.items }} responses · {{ review.status }}</p>
            <p class="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">Owner: {{ review.reviewer }}</p>
          </li>
        </ul>
        <NuxtLink
          to="/ai-assistant"
          class="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          Collaborate with the AI assistant
        </NuxtLink>
      </article>
    </section>
  </div>
</template>
