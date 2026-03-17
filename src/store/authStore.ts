import { create } from 'zustand'
import type { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  initialized: boolean
  setUser: (user: User) => void
  clearUser: () => void
  setInitialized: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initialized: false,
  setUser: (user) => set({ user, initialized: true }),
  clearUser: () => set({ user: null, initialized: true }),
  setInitialized: () => set({ initialized: true }),
}))
