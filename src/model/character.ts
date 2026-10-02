import { PHASE_DEFS, SKILLS } from './reference'
import { SCHEMA_VERSION, type Character, type StressTrack } from './types'

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

const emptyTrack = (): StressTrack => ({ checked: [], bonus: 0 })

export function newCharacter(): Character {
  const now = new Date().toISOString()
  return {
    schema: SCHEMA_VERSION,
    id: uid(),
    createdAt: now,
    updatedAt: now,
    name: '',
    player: '',
    template: '',
    templateMusts: '',
    portraitUrl: '',
    highConcept: '',
    trouble: '',
    phases: PHASE_DEFS.map((p) => ({ ...p, events: '', aspect: '', guestOf: '' })),
    extraAspects: [],
    powerLevel: 'chest',
    customLevel: { refresh: 8, skillPoints: 30, skillCap: 4 },
    skills: Object.fromEntries(SKILLS.map((s) => [s, 0])),
    customSkills: [],
    powers: [],
    stress: {
      physical: emptyTrack(),
      mental: emptyTrack(),
      social: emptyTrack(),
      hunger: emptyTrack(),
    },
    hungerEnabled: false,
    consequences: {},
    extraMildManual: 0,
    magic: { forceShow: false, slotsAvailable: 0, bonuses: [], rotes: [] },
    fatePoints: 0,
    gear: [],
    notes: '',
  }
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Recursively fill `raw` onto `base`, keeping base's types. Unknown keys are
 * dropped; arrays are taken from raw only if raw has an array there.
 */
function fill<T>(base: T, raw: unknown): T {
  if (raw === undefined || raw === null) return base
  if (Array.isArray(base)) return (Array.isArray(raw) ? raw : base) as T
  if (isObj(base)) {
    if (!isObj(raw)) return base
    const out: Record<string, unknown> = { ...base }
    for (const key of Object.keys(base)) out[key] = fill((base as Record<string, unknown>)[key], raw[key])
    return out as T
  }
  if (typeof base === 'number') return (typeof raw === 'number' && Number.isFinite(raw) ? raw : base) as T
  return (typeof raw === typeof base ? raw : base) as T
}

export class ImportError extends Error {}

/** Turn untrusted JSON (localStorage or an imported file) into a valid Character. */
export function normalizeCharacter(raw: unknown): Character {
  if (!isObj(raw)) throw new ImportError('Not a character file.')
  if (typeof raw.schema === 'number' && raw.schema > SCHEMA_VERSION) {
    throw new ImportError('This file was made by a newer version of the sheet.')
  }
  const base = newCharacter()
  const c = fill(base, raw)

  // Records with open-ended keys: keep only well-typed entries.
  c.skills = { ...base.skills }
  if (isObj(raw.skills)) {
    for (const [k, v] of Object.entries(raw.skills)) if (typeof v === 'number') c.skills[k] = v
  }
  c.consequences = {}
  if (isObj(raw.consequences)) {
    for (const [k, v] of Object.entries(raw.consequences)) if (typeof v === 'string') c.consequences[k] = v
  }

  // Phases: always the five defined phases, in order, with saved text merged in.
  const rawPhases = Array.isArray(raw.phases) ? raw.phases : []
  c.phases = base.phases.map((p) => {
    const saved = rawPhases.find((r) => isObj(r) && r.id === p.id)
    return { ...fill(p, saved), id: p.id, title: p.title, question: p.question }
  })

  // Array items: drop anything that isn't an object and give each an id.
  const items = <T extends { id: string }>(arr: unknown[], make: () => T): T[] =>
    arr.filter(isObj).map((r) => {
      const item = fill(make(), r)
      return item.id ? item : { ...item, id: uid() }
    })
  c.extraAspects = items(c.extraAspects, () => ({ id: '', text: '' }))
  c.customSkills = items(c.customSkills, () => ({ id: '', name: '', rating: 0 }))
  c.powers = items(c.powers, () => ({
    id: '',
    name: '',
    category: 'Items & Other' as const,
    cost: 0,
    notes: '',
    catalogId: '',
  }))
  c.magic.bonuses = items(c.magic.bonuses, () => ({
    id: '',
    name: '',
    element: '',
    offensivePower: 0,
    offensiveControl: 0,
    defensivePower: 0,
    defensiveControl: 0,
    kind: 'focus' as const,
    notes: '',
  }))
  c.magic.rotes = items(c.magic.rotes, () => ({
    id: '',
    name: '',
    kind: 'Evocation' as const,
    element: '',
    power: 0,
    notes: '',
  }))
  c.gear = items(c.gear, () => ({ id: '', name: '', kind: 'item' as const, rating: 0, notes: '' }))
  for (const t of Object.values(c.stress)) t.checked = t.checked.map(Boolean)

  if (!c.id) c.id = uid()
  c.schema = SCHEMA_VERSION
  return c
}
