import { ImportError, normalizeCharacter, uid } from '../model/character'
import type { Character } from '../model/types'

const KEY = 'steel-city-casefile:v1'

export interface Roster {
  activeId: string | null
  characters: Character[]
}

export function loadRoster(): Roster {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { activeId: null, characters: [] }
    const parsed = JSON.parse(raw) as { activeId?: unknown; characters?: unknown }
    const characters: Character[] = []
    for (const c of Array.isArray(parsed.characters) ? parsed.characters : []) {
      try {
        characters.push(normalizeCharacter(c))
      } catch {
        // Skip a corrupt entry rather than losing the whole roster.
      }
    }
    const activeId = typeof parsed.activeId === 'string' ? parsed.activeId : null
    return { activeId, characters }
  } catch {
    return { activeId: null, characters: [] }
  }
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
