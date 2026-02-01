import { createContext, useContext, ReactNode } from 'react'
import { useDarkMode } from '../utils/useDarkMode'

interface DarkModeContextValue {
  isDark: boolean
  toggle: () => void
}

const DarkModeContext = createContext<DarkModeContextValue | null>(null)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const darkMode = useDarkMode()

  return (
    <DarkModeContext.Provider value={darkMode}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkModeContext() {
  const context = useContext(DarkModeContext)
  if (!context) {
    throw new Error('useDarkModeContext must be used within DarkModeProvider')
  }
  return context
}
