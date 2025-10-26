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

/**
 * Profiles store
 * Manages grading profiles and their available question types.
 * Data is persisted to localStorage to survive reloads.
 */
export const useProfilesStore = defineStore('profiles', {
  state: (): ProfilesState => ({
    profiles: typeof window !== 'undefined' ? loadFromStorage() : [],
  }),
  getters: {
    /** Lookup a grading profile by ID */
    byId: (s) => (id: string) => s.profiles.find(p => p.id === id),
  },
  actions: {
    /** Add a new grading profile and persist */
    add(profile: Omit<GradingProfile, 'createdAt'>) {
      const next: GradingProfile = { ...profile, createdAt: new Date().toISOString() }
      this.profiles.unshift(next)
      saveToStorage(this.profiles)
      return next
    },
    /** Remove a profile by ID and persist */
    remove(id: string) {
      this.profiles = this.profiles.filter(p => p.id !== id)
      saveToStorage(this.profiles)
    },
    /** Insert or update a profile by ID and persist */
    upsert(profile: GradingProfile) {
      const i = this.profiles.findIndex(p => p.id === profile.id)
      if (i >= 0) this.profiles[i] = profile
      else this.profiles.unshift(profile)
      saveToStorage(this.profiles)
    },
    /** Clear all profiles from local storage */
    clearAll() {
      this.profiles = []
      saveToStorage(this.profiles)
    },
  },
})

