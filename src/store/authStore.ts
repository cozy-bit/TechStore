import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AuthState = {
  token: string | null
  email: string | null
  login: (email: string, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      email: null,
      login: (email, token) => set({ email, token }),
      logout: () => set({ email: null, token: null }),
    }),
    { name: 'tech-store-auth' }
  )
)
