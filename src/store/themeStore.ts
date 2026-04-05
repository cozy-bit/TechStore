import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type ThemeState = {
  dark: boolean
  toggle: () => void
  setDark: (v: boolean) => void
}

function applyClass(dark: boolean) {
  const root = document.documentElement
  if (dark) root.classList.add('dark')
  else root.classList.remove('dark')
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      dark: false,
      toggle: () => {
        const next = !get().dark
        applyClass(next)
        set({ dark: next })
      },
      setDark: (v) => {
        applyClass(v)
        set({ dark: v })
      },
    }),
    {
      name: 'tech-store-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyClass(state.dark)
      },
    }
  )
)
