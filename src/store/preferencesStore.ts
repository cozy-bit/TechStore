import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CurrencyCode, LanguageCode } from '@/types'

type PreferencesState = {
  currency: CurrencyCode
  language: LanguageCode
  ratesFromRub: Record<CurrencyCode, number>
  setCurrency: (v: CurrencyCode) => void
  setLanguage: (v: LanguageCode) => void
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: 'RUB',
      language: 'ru',
      ratesFromRub: {
        RUB: 1,
        USD: 0.011,
        TJS: 0.12,
      },
      setCurrency: (v) => set({ currency: v }),
      setLanguage: (v) => set({ language: v }),
    }),
    { name: 'tech-store-preferences' }
  )
)

