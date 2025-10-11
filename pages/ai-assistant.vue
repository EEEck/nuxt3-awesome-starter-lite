<script setup lang="ts">
useHead({ title: 'AI Assistant' })

const prompts = [
  {
    title: 'Draft personalized feedback',
    body: 'Summarize rubric wins, highlight growth areas, and suggest next steps with inclusive language.',
  },
  {
    title: 'Audit ambiguous scoring',
    body: 'Explain how the AI evaluated free-response answers and flag where rubric clarification may be needed.',
  },
  {
    title: 'Generate accreditation report',
    body: 'Assemble evidence of learning outcomes mapped to institutional standards in under a minute.',
  },
]

const conversation = [
  {
    role: 'You',
    message: 'We saw a spike in rubric overrides for Section B. Can you summarize themes?',
  },
  {
    role: 'Assistant',
    message:
      'Overrides concentrated on question 4, where students referenced a new lab protocol. Suggest updating the exemplar answer and notifying faculty in today’s standup.',
  },
  {
    role: 'You',
    message: 'Great. Draft a note for the teaching team with recommended adjustments.',
  },
  {
    role: 'Assistant',
    message:
      'Drafted message: “Highlight updated lab protocol and align rubric language. Encourage TAs to share clarifications in Slack before grading session.” Ready to copy?'
  },
]
</script>

<template>
  <div class="space-y-10 pb-16">
    <PageHeader
      eyebrow="Collaborative copilots"
      title="Coach faculty with grounded AI prompts"
      description="Spin up rubric-aware prompts, review rationales, and convert insights to shareable updates without leaving your flow."
    >
      <template #actions>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-subtle transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          Start new thread
        </button>
      </template>
    </PageHeader>

    <section class="grid gap-6 px-6 lg:grid-cols-[0.9fr,1.1fr]">
      <article class="space-y-5 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-subtle backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
        <h3 class="font-semibold text-slate-900 dark:text-white">High-signal prompt library</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Templates engineered with instructional designers. Edit copy inline or deploy to your faculty with guardrails.
        </p>
        <ul class="space-y-4 text-sm">
          <li
            v-for="prompt in prompts"
            :key="prompt.title"
            class="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm transition hover:border-brand-400/60 dark:border-slate-700/60 dark:bg-slate-900/60 dark:hover:border-brand-400/60"
          >
            <p class="font-semibold text-slate-900 dark:text-white">{{ prompt.title }}</p>
            <p class="mt-2 text-slate-500 dark:text-slate-300">{{ prompt.body }}</p>
          </li>
        </ul>
        <NuxtLink
          to="/grading-wizard"
          class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          Pair with grading workflow
        </NuxtLink>
      </article>

      <article class="flex flex-col gap-5 rounded-3xl border border-white/70 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-900/80 p-6 text-slate-100 shadow-subtle">
        <header>
          <p class="text-xs uppercase tracking-[0.3em] text-brand-200">Live preview</p>
          <h3 class="mt-2 font-display text-2xl font-semibold">Explainable collaboration</h3>
        </header>
        <ul class="space-y-4 text-sm">
          <li
            v-for="entry in conversation"
            :key="entry.message"
            class="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
          >
            <p class="text-xs uppercase tracking-[0.3em] text-brand-200/80">{{ entry.role }}</p>
            <p class="mt-2 leading-relaxed text-slate-100">{{ entry.message }}</p>
          </li>
        </ul>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-white"
        >
          Copy assistant draft
        </button>
      </article>
    </section>
  </div>
</template>
