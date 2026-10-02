import { useCallback, useEffect, useRef, useState, type SetStateAction } from 'react'
import { newCharacter } from '../model/character'
import type { Character } from '../model/types'
import { STORAGE_KEY, loadRoster, saveRoster, type LoadResult, type Roster } from './storage'

export type Updater = (recipe: (draft: Character) => void) => void

export interface LoadProblem {
  unreadable: number
  backupKey: string | null
}

/** Never show an empty roster, and keep `preferId` active if it still exists. */
function withActive(r: Roster, preferId?: string | null): Roster {
  if (r.characters.length === 0) {
    const c = newCharacter()
    return { activeId: c.id, characters: [c] }
  }
  const ids = new Set(r.characters.map((c) => c.id))
  const activeId = preferId && ids.has(preferId) ? preferId : r.activeId && ids.has(r.activeId) ? r.activeId : r.characters[0].id
  return { ...r, activeId }
}

const problemOf = (l: LoadResult): LoadProblem | null =>
  l.unreadable === 0 ? null : { unreadable: l.unreadable, backupKey: l.backupKey }

export function useRoster() {
  const [initial] = useState(loadRoster)
  const [roster, setRoster] = useState<Roster>(() => withActive(initial.roster))
  const [saveFailed, setSaveFailed] = useState(false)
  // While stored data couldn't be read, autosave stays off so it isn't overwritten.
  const [loadProblem, setLoadProblem] = useState<LoadProblem | null>(() => problemOf(initial))
  // Only write after a local edit; otherwise an idle tab would overwrite newer data from another tab.
  const dirty = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  const commit = useCallback((action: SetStateAction<Roster>) => {
    dirty.current = true
    setRoster(action)
  }, [])

  useEffect(() => {
    if (!dirty.current || loadProblem) return
    const flush = () => {
      if (!dirty.current) return
      dirty.current = false
      setSaveFailed(!saveRoster(roster))
    }
    timer.current = window.setTimeout(flush, 300)
    window.addEventListener('beforeunload', flush)
    return () => {
      window.clearTimeout(timer.current)
      window.removeEventListener('beforeunload', flush)
    }
  }, [roster, loadProblem])

  // Another tab saved: adopt its roster, keeping this tab's active character.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.storageArea !== localStorage) return
      const loaded = loadRoster()
      const problem = problemOf(loaded)
      if (problem) {
        setLoadProblem(problem)
        return
      }
      dirty.current = false
      setRoster((r) => withActive(loaded.roster, r.activeId))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const active = roster.characters.find((c) => c.id === roster.activeId) ?? roster.characters[0]

  /** Mutate a structured clone of the active character, then commit it. */
  const update: Updater = useCallback(
    (recipe) => {
      commit((r) => ({
        ...r,
        characters: r.characters.map((c) => {
          if (c.id !== r.activeId) return c
          const draft = structuredClone(c)
          recipe(draft)
          draft.updatedAt = new Date().toISOString()
          return draft
        }),
      }))
    },
    [commit],
  )

  const select = useCallback((id: string) => commit((r) => ({ ...r, activeId: id })), [commit])

  const add = useCallback(
    (chars: Character[] = [newCharacter()]) => {
      commit((r) => ({ activeId: chars[0].id, characters: [...r.characters, ...chars] }))
    },
    [commit],
  )

  const duplicate = useCallback(
    (id: string) => {
      commit((r) => {
        const src = r.characters.find((c) => c.id === id)
        if (!src) return r
        const copy = { ...structuredClone(src), id: newCharacter().id, name: `${src.name || 'Unnamed'} (copy)` }
        return { activeId: copy.id, characters: [...r.characters, copy] }
      })
    },
    [commit],
  )

  const remove = useCallback(
    (id: string) => {
      commit((r) => withActive({ ...r, characters: r.characters.filter((c) => c.id !== id) }, r.activeId === id ? null : r.activeId))
    },
    [commit],
  )

  /** The player chose to save over the unreadable data (a raw backup was kept if possible). */
  const resumeSaving = useCallback(() => {
    dirty.current = true
    setLoadProblem(null)
  }, [])

  return { roster, active, update, select, add, duplicate, remove, saveFailed, loadProblem, resumeSaving }
}
