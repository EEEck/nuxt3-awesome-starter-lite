import { defineStore } from 'pinia'

export interface QuestionType {
  id: string
  name: string
  description?: string
  instructions?: string
}

export interface GradingProfile {
  id: string
  name: string
  subjectArea?: string
  gradeLevel?: string
  schoolType?: string
  generalInstructions?: string
  questionTypes: QuestionType[]
  createdAt: string
}

interface ProfilesState {
  profiles: GradingProfile[]
}

function loadFromStorage(): GradingProfile[] {
  try {
    const raw = localStorage.getItem('profiles.v1')
    return raw ? (JSON.parse(raw) as GradingProfile[]) : []
  } catch {
    return []
  }
}

function saveToStorage(profiles: GradingProfile[]) {
  try { localStorage.setItem('profiles.v1', JSON.stringify(profiles)) } catch {}
}

export const useProfilesStore = defineStore('profiles', {
  state: (): ProfilesState => ({
    profiles: typeof window !== 'undefined' ? loadFromStorage() : [],
  }),
  getters: {
    byId: (s) => (id: string) => s.profiles.find(p => p.id === id),
  },
  actions: {
    add(profile: Omit<GradingProfile, 'createdAt'>) {
      const next: GradingProfile = { ...profile, createdAt: new Date().toISOString() }
      this.profiles.unshift(next)
      saveToStorage(this.profiles)
      return next
    },
    remove(id: string) {
      this.profiles = this.profiles.filter(p => p.id !== id)
      saveToStorage(this.profiles)
    },
    upsert(profile: GradingProfile) {
      const i = this.profiles.findIndex(p => p.id === profile.id)
      if (i >= 0) this.profiles[i] = profile
      else this.profiles.unshift(profile)
      saveToStorage(this.profiles)
    },
    clearAll() {
      this.profiles = []
      saveToStorage(this.profiles)
    },
  },
})

