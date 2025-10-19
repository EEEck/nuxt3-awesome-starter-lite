<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useProfilesStore, type QuestionType } from '~/stores/profiles'
import AiProfilesList from '~/components/ai-assistant/AiProfilesList.vue'
import AiTemplatesGrid from '~/components/ai-assistant/AiTemplatesGrid.vue'
import AiStepper from '~/components/ai-assistant/AiStepper.vue'
import AiQuestionTypesPicker from '~/components/ai-assistant/AiQuestionTypesPicker.vue'
import { iconMap, type IconKey } from '~/lib/ui/icons'
import { templates as sharedTemplates, presetQuestionTypes as sharedPresetQuestionTypes, type PresetQuestionType } from '~/lib/ai-assistant/constants'

useHead({ title: 'AI Assistant • Profiles' })

// using shared iconMap from lib/ui/icons

interface PresetQuestionType extends QuestionType { icon: IconKey }
interface SelectedQuestionType extends QuestionType { icon: IconKey; isCustom?: boolean; instructions?: string }

const profilesStore = useProfilesStore()
const step = ref<1 | 2 | 3>(1)
const validationError = ref('')
const customTypeSuccess = ref('')

const form = reactive({
  id: '',
  name: '',
  subjectArea: '',
  gradeLevel: '',
  schoolType: 'public',
  generalInstructions: '',
})

// templates centralized in lib\r\n
// presetQuestionTypes centralized in lib\r\n
const selectedTypes = ref<SelectedQuestionType[]>([])
const selectedTypeCount = computed(() => selectedTypes.value.length)
const canContinueStep1 = computed(() => !!form.name && !!form.subjectArea && !!form.gradeLevel)
const canSaveProfile = computed(() => selectedTypes.value.length > 0)

function applyTemplate(t: typeof sharedTemplates[number]) {
  if (t.id === 'blank') return
  form.name = t.name
  form.subjectArea = (t as any).subjectArea || ''
  form.gradeLevel = (t as any).gradeLevel || ''
  form.schoolType = (t as any).schoolType || 'public'
  form.generalInstructions = (t as any).generalInstructions || ''
  selectedTypes.value = t.questionTypes
    .map(id => sharedPresetQuestionTypes.find(pt => pt.id === id))
    .filter(Boolean)
    .map(pt => ({ ...(pt as PresetQuestionType) }))
  // Auto-advance to step 2 so the question types are visible
  step.value = 2
}

function togglePreset(pt: PresetQuestionType) {
  const i = selectedTypes.value.findIndex(x => x.id === pt.id)
  if (i >= 0) selectedTypes.value.splice(i, 1)
  else selectedTypes.value.push({ ...pt })
}

const customType = reactive({ name: '', instructions: '' })
function addCustomType(name?: string, instructions?: string) {
  const n = (name ?? customType.name).trim()
  const instr = (instructions ?? customType.instructions).trim()
  if (!n) { validationError.value = 'Provide a type name.'; return }
  selectedTypes.value.push({ id: `custom_${Math.random().toString(36).slice(2,8)}`, name: n, description: 'Custom type', icon: 'Plus', isCustom: true, instructions: instr })
  if (name === undefined) { customType.name = ''; customType.instructions = '' }
  validationError.value = ''
  customTypeSuccess.value = 'Custom question type added.'
}

function removeType(id: string) {
  selectedTypes.value = selectedTypes.value.filter(t => t.id !== id)
}

function goToStep(n: 1|2|3) { step.value = n }

function saveProfile() {
  if (!canSaveProfile.value) { validationError.value = 'Please add at least one question type before saving your profile.'; return }
  const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
  const id = (form.id && form.id.trim()) || slug || `profile-${Date.now()}`
  profilesStore.add({
    id,
    name: form.name.trim(),
    subjectArea: form.subjectArea || undefined,
    gradeLevel: form.gradeLevel || undefined,
    schoolType: form.schoolType || undefined,
    generalInstructions: form.generalInstructions || undefined,
    // keep optional instructions on custom types
    questionTypes: selectedTypes.value.map(({ icon, isCustom, ...rest }) => rest),
  })
  step.value = 3
}

function resetWizard() {
  step.value = 1
  form.id = ''
  form.name = ''
  form.subjectArea = ''
  form.gradeLevel = ''
  form.schoolType = 'public'
  form.generalInstructions = ''
  selectedTypes.value = []
}

function onDeleteProfile(id: string) {
  const ok = window.confirm('Delete this profile? This cannot be undone.')
  if (!ok) return
  try {
    profilesStore.remove(id)
  } catch (e) {
    // no-op; store handles state
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">AI Assistant</h1>
      <p class="text-slate-600">Create intelligent grading profiles with question-type specific instructions for consistent, efficient assessment.</p>
    </div>

    <section class="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Profiles list -->
      <AiProfilesList :profiles="profilesStore.profiles" @delete="onDeleteProfile" />

      <!-- Creator -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Quick start -->
        <AiTemplatesGrid :templates="sharedTemplates" @select="applyTemplate" />

        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <!-- Stepper -->
          <AiStepper :step="step" />

          <!-- Alerts -->
          <div v-if="validationError" class="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <Icon :name="iconMap.AlertCircle" class="mt-0.5 h-5 w-5" aria-hidden="true" />
            <p>{{ validationError }}</p>
          </div>
          <div v-if="customTypeSuccess" class="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <Icon :name="iconMap.CheckCircle" class="mt-0.5 h-5 w-5" aria-hidden="true" />
            <p>{{ customTypeSuccess }}</p>
          </div>

          <!-- Step 1 -->
          <div v-if="step === 1" class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label class="block text-sm font-medium text-slate-700">Profile ID</label>
                <input v-model="form.id" type="text" placeholder="eg. spring-2025-bio101" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700">Name</label>
                <input v-model="form.name" type="text" placeholder="High School Biology" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700">Subject</label>
                <input v-model="form.subjectArea" type="text" placeholder="biology" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700">Grade Level</label>
                <input v-model="form.gradeLevel" type="text" placeholder="9-12" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">General Instructions</label>
              <textarea v-model="form.generalInstructions" rows="2" placeholder="Notes about this profile" class="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"></textarea>
            </div>
            <div class="flex justify-end">
              <button type="button" class="rounded bg-slate-900 px-4 py-2 font-semibold text-white disabled:opacity-50" :disabled="!canContinueStep1" @click="goToStep(2)">Continue</button>
            </div>
          </div>

          <!-- Step 2 -->
          <div v-else-if="step === 2" class="space-y-6">
            <AiQuestionTypesPicker
              :presets="sharedPresetQuestionTypes"
              :selected="selectedTypes"
              @toggle="togglePreset"
              @add-custom="({ name, instructions }) => addCustomType(name, instructions)"
              @remove="removeType"
            />
          
            <div class="flex items-center justify-between">
              <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600" @click="goToStep(1)">
                <Icon :name="iconMap.ArrowLeft" class="h-4 w-4" aria-hidden="true" />
                Back to Profile Info
              </button>
              <button type="button" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50" :disabled="!canSaveProfile" @click="saveProfile">
                <Icon :name="iconMap.Save" class="h-4 w-4" aria-hidden="true" />
                Save Profile
              </button>
            </div>
          </div>

          <!-- Success -->
          <div v-else class="py-12 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">?</div>
            <h3 class="text-xl font-semibold text-slate-900">Profile Created Successfully!</h3>
            <p class="mt-2 text-slate-600">Your grading profile is ready to use with rubrics.</p>
            <div class="mt-6 flex justify-center gap-3">
              <button type="button" class="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600" @click="resetWizard">
                <Icon :name="iconMap.Plus" class="h-4 w-4" aria-hidden="true" />
                Create Another
              </button>
              <NuxtLink to="/grading-wizard" class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">Use in Wizard</NuxtLink>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

