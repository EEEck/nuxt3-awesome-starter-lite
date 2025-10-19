<script setup lang="ts">
import { iconMap } from '~/lib/ui/icons'
import type { GradingProfile } from '~/stores/profiles'

const props = defineProps<{ profiles: GradingProfile[] }>()
const emit = defineEmits<{ (e: 'delete', id: string): void }>()

function onDelete(id: string) { emit('delete', id) }
</script>

<template>
  <aside class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center gap-2 text-slate-900">
      <Icon :name="iconMap.Folder" class="h-5 w-5 text-blue-500" aria-hidden="true" />
      <h2 class="text-lg font-semibold">My Profiles</h2>
    </div>
    <div v-if="profiles.length === 0" class="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
      No profiles yet. Create your first profile!
    </div>
    <ul v-else class="space-y-3 text-sm">
      <li
        v-for="profile in profiles"
        :key="profile.id"
        class="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div>
          <p class="font-medium text-slate-900">{{ profile.name }}</p>
          <p class="text-xs text-slate-500">ID: {{ profile.id }}</p>
        </div>
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="{ path: '/grading-wizard', query: { profile: profile.id } }"
            class="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Use
          </NuxtLink>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            title="Delete profile"
            @click="onDelete(profile.id)"
          >
            <Icon :name="iconMap.Trash2" class="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </button>
        </div>
      </li>
    </ul>
  </aside>
</template>

