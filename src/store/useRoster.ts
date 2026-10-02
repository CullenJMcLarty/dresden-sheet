import { useCallback, useEffect, useRef, useState } from 'react'
import { newCharacter } from '../model/character'
import type { Character } from '../model/types'
import { loadRoster, saveRoster, type Roster } from './storage'

export type Updater = (recipe: (draft: Character) => void) => void

function initialRoster(): Roster {
  const r = loadRoster()
  if (r.characters.length === 0) {
    const c = newCharacter()
    return { activeId: c.id, characters: [c] }
  }
  if (!r.characters.some((c) => c.id === r.activeId)) r.activeId = r.characters[0].id
  return r
}

export function useRoster() {
  const [roster, setRoster] = useState<Roster>(initialRoster)
  const [saveFailed, setSaveFailed] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  // Debounced autosave; flush on tab close.
  useEffect(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setSaveFailed(!saveRoster(roster)), 300)
    const flush = () => saveRoster(roster)
    window.addEventListener('beforeunload', flush)
    return () => window.removeEventListener('beforeunload', flush)
  }, [roster])

  const active = roster.characters.find((c) => c.id === roster.activeId) ?? roster.characters[0]

  /** Mutate a structured clone of the active character, then commit it. */
  const update: Updater = useCallback((recipe) => {
    setRoster((r) => ({
      ...r,
      characters: r.characters.map((c) => {
        if (c.id !== r.activeId) return c
        const draft = structuredClone(c)
        recipe(draft)
        draft.updatedAt = new Date().toISOString()
        return draft
      }),
    }))
  }, [])

  const select = useCallback((id: string) => setRoster((r) => ({ ...r, activeId: id })), [])

  const add = useCallback((chars: Character[] = [newCharacter()]) => {
    setRoster((r) => ({ activeId: chars[0].id, characters: [...r.characters, ...chars] }))
  }, [])

  const duplicate = useCallback((id: string) => {
    setRoster((r) => {
      const src = r.characters.find((c) => c.id === id)
      if (!src) return r
      const copy = { ...structuredClone(src), id: newCharacter().id, name: `${src.name || 'Unnamed'} (copy)` }
      return { activeId: copy.id, characters: [...r.characters, copy] }
    })
  }, [])

  const remove = useCallback((id: string) => {
    setRoster((r) => {
      const rest = r.characters.filter((c) => c.id !== id)
      if (rest.length === 0) {
        const c = newCharacter()
        return { activeId: c.id, characters: [c] }
      }
      return { activeId: r.activeId === id ? rest[0].id : r.activeId, characters: rest }
    })
  }, [])

  return { roster, active, update, select, add, duplicate, remove, saveFailed }
}
