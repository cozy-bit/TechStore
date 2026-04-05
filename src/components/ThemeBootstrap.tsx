import { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

export function ThemeBootstrap() {
  const dark = useThemeStore((s) => s.dark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return null
}
