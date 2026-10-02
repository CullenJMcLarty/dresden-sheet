import { ImportError, normalizeCharacter, uid } from '../model/character'
import type { Character } from '../model/types'

const KEY = 'steel-city-casefile:v1'

export interface Roster {
  activeId: string | null
  characters: Character[]
}

export interface LoadResult {
  roster: Roster
  /** How many stored characters couldn't be read; -1 if the whole store was unreadable. */
  unreadable: number
  /** localStorage key holding a raw copy of the store, when one was made. */
  backupKey: string | null
}

export const STORAGE_KEY = KEY

/** Keep an untouched copy of the raw store before anything can overwrite it. */
function backup(raw: string): string | null {
  try {
    // Reloading while the problem persists shouldn't pile up identical copies.
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k?.startsWith(`${KEY}:backup:`) && localStorage.getItem(k) === raw) return k
    }
    const key = `${KEY}:backup:${new Date().toISOString()}`
    localStorage.setItem(key, raw)
    return key
  } catch {
    return null
  }
}

export function loadRoster(): LoadResult {
  const empty: Roster = { activeId: null, characters: [] }
  let raw: string | null
  try {
    raw = localStorage.getItem(KEY)
  } catch {
    return { roster: empty, unreadable: 0, backupKey: null }
  }
  if (!raw) return { roster: empty, unreadable: 0, backupKey: null }

  let parsed: { activeId?: unknown; characters?: unknown }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { roster: empty, unreadable: -1, backupKey: backup(raw) }
  }
  if (!Array.isArray(parsed?.characters)) return { roster: empty, unreadable: -1, backupKey: backup(raw) }
  const stored: unknown[] = parsed.characters
  const characters: Character[] = []
  for (const c of stored) {
    try {
      characters.push(normalizeCharacter(c))
    } catch {
      // Counted below; the caller pauses autosave so it isn't overwritten.
    }
  }
  const unreadable = stored.length - characters.length
  const activeId = typeof parsed?.activeId === 'string' ? parsed.activeId : null
  return { roster: { activeId, characters }, unreadable, backupKey: unreadable ? backup(raw) : null }
}

/** Returns false if the browser refused the write (quota, private mode). */
export function saveRoster(roster: Roster): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(roster))
    return true
  } catch {
    return false
  }
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'character'
}

function download(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function exportCharacter(c: Character) {
  download(`${slug(c.name)}.dfrpg.json`, { format: 'steel-city-casefile', characters: [c] })
}

export function exportAll(characters: Character[]) {
  download(`casefiles-${new Date().toISOString().slice(0, 10)}.dfrpg.json`, {
    format: 'steel-city-casefile',
    characters,
  })
}

/**
 * Parse an exported file. Accepts our wrapper format, a bare array, or a bare
 * character. Imported characters get fresh ids so they never overwrite.
 */
export async function importFile(file: File): Promise<Character[]> {
  let data: unknown
  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new ImportError(`${file.name} isn't valid JSON.`)
  }
  const list =
    data && typeof data === 'object' && 'characters' in data && Array.isArray(data.characters)
      ? data.characters
      : Array.isArray(data)
        ? data
        : [data]
  if (list.length === 0) throw new ImportError(`${file.name} has no characters in it.`)
  return list.map((raw: unknown) => ({ ...normalizeCharacter(raw), id: uid() }))
}
