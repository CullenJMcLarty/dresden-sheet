import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { THEMES, themeById, type Theme, type ThemeId } from './themes'

const THEME_KEY = 'steel-city-casefile:theme'
const AMBIENT_KEY = 'steel-city-casefile:ambient'

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage unavailable: preference lasts for this visit only */
  }
}

interface ThemeState {
  theme: Theme
  setTheme: (id: ThemeId) => void
  /** Background motion (spinning wards, drifting motes). Off is kinder to slow machines. */
  ambient: boolean
  setAmbient: (on: boolean) => void
}

const Ctx = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => themeById(read(THEME_KEY) ?? THEMES[0].id))
  const [ambient, setAmbientState] = useState(() => read(AMBIENT_KEY) !== 'off')

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = theme.family
    if (theme.variant) root.dataset.variant = theme.variant
    else delete root.dataset.variant
    write(THEME_KEY, theme.id)
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.ambient = ambient ? 'on' : 'off'
    write(AMBIENT_KEY, ambient ? 'on' : 'off')
  }, [ambient])

  return (
    <Ctx.Provider value={{ theme, setTheme: (id) => setThemeState(themeById(id)), ambient, setAmbient: setAmbientState }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTheme(): ThemeState {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTheme outside ThemeProvider')
  return v
}

export const useCopy = () => useTheme().theme.copy
