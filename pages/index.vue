<script setup lang="ts">
useHead({ title: 'Overview' })

const heroHighlights = [
  {
    title: 'Minutes to configure',
    value: '12',
    description: 'Launch grading pilots without weeks of front-end work.',
  },
  {
    title: 'Security controls',
    value: 'Enterprise ready',
    description: 'Composable layouts with clear audit trails and PII safe defaults.',
  },
  {
    title: 'AI copilots',
    value: 'Human in the loop',
    description: 'Coach faculty with adaptive prompts and rubric-aware guidance.',
  },
]

const featureSets = [
  {
    title: 'Operational dashboards',
    description:
      'Track rubric coverage, run completion, and response health in real-time so academic teams can intervene before students are impacted.',
  },
  {
    title: 'Workflow primitives',
    description:
      'Composable steps for uploading rosters, calibrating rubrics, reviewing AI scoring, and exporting CSVs to SIS systems.',
  },
  {
    title: 'Secure collaboration',
    description:
      'Role-based navigation, session awareness, and guardrails for FERPA-compliant collaboration with AI suggestions.',
  },
]

const roadmap = [
  {
    title: 'Realtime rubric tuning',
    description: 'Collaborative editing with AI draft suggestions and policy checks.',
    eta: 'July',
  },
  {
    title: 'Observability kit',
    description: 'Drill into model rationales, escalate edge-cases, and export QA reports.',
    eta: 'August',
  },
  {
    title: 'Institutional integrations',
    description: 'Canvas, Blackboard, and Brightspace connectors with secure secrets management.',
    eta: 'September',
  },
]
</script>

<template>
  <div class="relative overflow-hidden">
    <section class="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-20 sm:pt-28">
      <div class="absolute inset-x-0 -top-24 z-[-1] flex justify-center">
        <div class="h-72 w-[40rem] rounded-full bg-brand-500/20 blur-3xl dark:bg-brand-400/10"></div>
      </div>
      <div class="max-w-3xl space-y-8">
        <span class="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-700 shadow-sm dark:border-brand-400/20 dark:bg-brand-500/10 dark:text-brand-200">
          Built for AI-first teaching teams
        </span>
        <h1 class="font-display text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Ship an AI grading experience your faculty actually trust.
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-300">
          Grading Wizard delivers a Nuxt 3 starter engineered for velocity: resilient UI primitives, accessible theming, and
          data-ready layouts so you can move from prototype to pilot without rebuilding the front-end every sprint.
        </p>
        <div class="flex flex-col gap-3 sm:flex-row">
          <NuxtLink
            to="/grading-wizard"
            class="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-subtle transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Launch grading flow
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
          >
            Preview dashboards
          </NuxtLink>
        </div>
      </div>
      <div class="grid gap-6 sm:grid-cols-3">
        <article
          v-for="item in heroHighlights"
          :key="item.title"
          class="rounded-3xl border border-white/60 bg-white/80 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/60"
        >
          <p class="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{{ item.title }}</p>
          <p class="mt-4 font-display text-3xl font-semibold text-slate-900 dark:text-white">{{ item.value }}</p>
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="mx-auto w-full max-w-6xl px-6 pb-20">
      <div class="grid gap-10 lg:grid-cols-[1.4fr,1fr]">
        <div class="space-y-6">
          <h2 class="font-display text-3xl font-semibold text-slate-900 dark:text-white">
            A modular system for the entire grading lifecycle.
          </h2>
          <p class="text-base text-slate-600 dark:text-slate-300">
            From importing student rosters to reconciling AI output, every screen is wired for clarity and speed. Extend with
            TanStack Query, Pinia stores, and server-driven UX patterns in minutes.
          </p>
          <div class="grid gap-6 sm:grid-cols-2">
            <div v-for="feature in featureSets" :key="feature.title" class="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
              <h3 class="font-semibold text-slate-900 dark:text-white">{{ feature.title }}</h3>
              <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ feature.description }}</p>
            </div>
          </div>
        </div>
        <aside class="flex flex-col gap-4 rounded-3xl border border-dashed border-brand-400/40 bg-brand-50/70 p-6 shadow-subtle dark:border-brand-400/20 dark:bg-brand-500/10">
          <h3 class="font-display text-2xl font-semibold text-brand-700 dark:text-brand-200">Roadmap signals</h3>
          <p class="text-sm text-brand-700/80 dark:text-brand-200/80">
            Sequence the features your instructional designers and accreditation leads have been asking for.
          </p>
          <ul class="space-y-4 text-sm">
            <li v-for="item in roadmap" :key="item.title" class="rounded-2xl border border-brand-400/30 bg-white/80 p-4 text-slate-700 shadow-sm dark:border-brand-400/30 dark:bg-slate-950/60 dark:text-slate-200">
              <div class="flex items-start justify-between gap-3">
                <p class="font-semibold">{{ item.title }}</p>
                <span class="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-brand-600 dark:bg-brand-400/10 dark:text-brand-200">{{ item.eta }}</span>
              </div>
              <p class="mt-2 text-slate-500 dark:text-slate-300">{{ item.description }}</p>
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="mx-auto w-full max-w-6xl px-6 pb-24">
      <div class="rounded-3xl border border-white/60 bg-white/70 p-10 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
        <div class="grid gap-8 lg:grid-cols-2">
          <div class="space-y-6">
            <h2 class="font-display text-3xl font-semibold text-slate-900 dark:text-white">Accelerate your pilot launch.</h2>
            <p class="text-base text-slate-600 dark:text-slate-300">
              The starter ships with guardrails for authentication, theming, loading states, and data fetching. Plug in your API,
              fine-tune the copy, and ship a confident experience to your first cohort.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row">
              <NuxtLink
                to="/scan-processor"
                class="inline-flex items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
              >
                Explore scanning pipeline
              </NuxtLink>
              <NuxtLink
                to="/ai-assistant"
                class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Meet the AI assistant
              </NuxtLink>
            </div>
          </div>
          <div class="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <p class="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-900/60">
              “We need to show provosts progress fast. This starter lets us focus on pedagogy instead of scaffolding.” — Director of
              Digital Learning, Bay Area university
            </p>
            <p class="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-900/60">
              “The theming and navigation feel production-ready. Our engineers swapped in API calls and shipped a usable demo in a
              weekend.” — Founding PM, AI EdTech startup
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
