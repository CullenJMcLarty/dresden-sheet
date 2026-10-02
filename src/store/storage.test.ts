import { beforeEach, describe, expect, it } from 'vitest'
import { newCharacter } from '../model/character'
import { STORAGE_KEY, loadRoster, saveRoster } from './storage'

class MemoryStorage {
  private m = new Map<string, string>()
  get length() {
    return this.m.size
  }
  key(i: number) {
    return [...this.m.keys()][i] ?? null
  }
  getItem(k: string) {
    return this.m.get(k) ?? null
  }
  setItem(k: string, v: string) {
    this.m.set(k, v)
  }
  removeItem(k: string) {
    this.m.delete(k)
  }
  clear() {
    this.m.clear()
  }
}

const backups = () => Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i)!).filter((k) => k.includes(':backup:'))

beforeEach(() => {
  ;(globalThis as { localStorage: unknown }).localStorage = new MemoryStorage()
})

describe('loadRoster', () => {
  it('loads a saved roster with no problems', () => {
    const c = newCharacter()
    saveRoster({ activeId: c.id, characters: [c] })
    const r = loadRoster()
    expect(r.unreadable).toBe(0)
    expect(r.backupKey).toBeNull()
    expect(r.roster.characters).toEqual([c])
  })

  it('reports unreadable characters and backs up the raw store once', () => {
    const c = newCharacter()
    const raw = JSON.stringify({ activeId: c.id, characters: [c, { schema: 999 }, 'junk'] })
    localStorage.setItem(STORAGE_KEY, raw)

    const first = loadRoster()
    expect(first.unreadable).toBe(2)
    expect(first.roster.characters).toHaveLength(1)
    expect(localStorage.getItem(first.backupKey!)).toBe(raw)

    const second = loadRoster()
    expect(second.backupKey).toBe(first.backupKey)
    expect(backups()).toHaveLength(1)
  })

  it('flags a store that is not valid JSON or has no character list', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadRoster()).toMatchObject({ unreadable: -1 })
    localStorage.setItem(STORAGE_KEY, '{"something":"else"}')
    expect(loadRoster()).toMatchObject({ unreadable: -1 })
  })
})
