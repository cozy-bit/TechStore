import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types'

type AuthState = {
  token: string | null
  email: string | null
  role: UserRole | null
  login: (email: string, token: string, role: UserRole) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      role: null,
      login: (email, token, role) => set({ email, token, role }),
      logout: () => set({ email: null, token: null, role: null }),
    }),
    { name: 'tech-store-auth' }
  )
)
