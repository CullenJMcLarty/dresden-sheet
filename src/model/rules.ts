import { SPELLCASTING_IDS } from './catalog'
import { CONSEQUENCE_VALUES, POWER_LEVELS, STRESS_TRACKS, ladderName } from './reference'
import type { Character, StressTrackId } from './types'

export type Section = 'refresh' | 'skills' | 'powers' | 'stress' | 'magic' | 'phases'

export interface Warning {
  section: Section
  message: string
}

export function levelFor(c: Character) {
  if (c.powerLevel === 'custom') return { id: 'custom', name: 'Custom', ...c.customLevel }
  return POWER_LEVELS.find((l) => l.id === c.powerLevel) ?? POWER_LEVELS[2]
}

export function allSkillRatings(c: Character): { name: string; rating: number }[] {
  return [
    ...Object.entries(c.skills).map(([name, rating]) => ({ name, rating })),
    ...c.customSkills.map((s) => ({ name: s.name || 'Unnamed skill', rating: s.rating })),
  ]
}

export function skillRating(c: Character, name: string): number {
  return c.skills[name] ?? 0
}

// ── Refresh ────────────────────────────────────────────────────────────────

export function refresh(c: Character) {
  const base = levelFor(c).refresh
  const spent = c.powers.reduce((sum, p) => sum + p.cost, 0)
  const adjusted = base + spent
  const warnings: Warning[] = []
  if (adjusted < 1) {
    warnings.push({
      section: 'refresh',
      message: `Adjusted refresh is ${adjusted}. Below 1, the character is no longer a playable PC.`,
    })
  }
  return { base, spent, adjusted, warnings }
}

// ── Skills ─────────────────────────────────────────────────────────────────

/** Number of skills at each rating from Average (1) to `max`. */
export function skillColumns(c: Character, max = 8): number[] {
  const counts = Array.from({ length: max + 1 }, () => 0)
  for (const { rating } of allSkillRatings(c)) if (rating > 0 && rating <= max) counts[rating]++
  return counts
}

export function skills(c: Character) {
  const level = levelFor(c)
  const ratings = allSkillRatings(c)
  const spent = ratings.reduce((sum, s) => sum + Math.max(0, s.rating), 0)
  const overCap = ratings.filter((s) => s.rating > level.skillCap).map((s) => s.name)
  const columns = skillColumns(c)
  // Column rule: no more skills at a rating than at the rating directly below.
  const columnViolations: number[] = []
  for (let r = 2; r < columns.length; r++) if (columns[r] > columns[r - 1]) columnViolations.push(r)

  const warnings: Warning[] = []
  if (spent > level.skillPoints) {
    warnings.push({ section: 'skills', message: `${spent} skill points spent of ${level.skillPoints}.` })
  }
  for (const name of overCap) {
    warnings.push({ section: 'skills', message: `${name} is above the ${ladderName(level.skillCap)} cap.` })
  }
  for (const r of columnViolations) {
    warnings.push({
      section: 'skills',
      message: `More ${ladderName(r)} skills (${columns[r]}) than ${ladderName(r - 1)} skills (${columns[r - 1]}).`,
    })
  }
  return { spent, total: level.skillPoints, cap: level.skillCap, overCap, columns, columnViolations, warnings }
}

// ── Stress & consequences ──────────────────────────────────────────────────

/** Bonus stress boxes from the linked skill's rating. */
export function stressBonusFromSkill(rating: number): { boxes: number; extraMild: boolean } {
  if (rating >= 5) return { boxes: 2, extraMild: true }
  if (rating >= 3) return { boxes: 2, extraMild: false }
  if (rating >= 1) return { boxes: 1, extraMild: false }
  return { boxes: 0, extraMild: false }
}

export interface TrackInfo {
  id: StressTrackId
  name: string
  skill: string
  boxes: number
  fromSkill: number
  extraMild: boolean
}

export function stressTracks(c: Character): TrackInfo[] {
  return STRESS_TRACKS.filter((t) => t.id !== 'hunger' || c.hungerEnabled).map((t) => {
    const fromSkill = stressBonusFromSkill(skillRating(c, t.skill))
    const boxes = Math.max(0, 2 + fromSkill.boxes + c.stress[t.id].bonus)
    return { id: t.id, name: t.name, skill: t.skill, boxes, fromSkill: fromSkill.boxes, extraMild: fromSkill.extraMild }
  })
}

export interface ConsequenceSlot {
  id: string
  severity: keyof typeof CONSEQUENCE_VALUES
  value: number
  label: string
  source: 'base' | 'skill' | 'manual'
}

export function consequenceSlots(c: Character): ConsequenceSlot[] {
  const slots: ConsequenceSlot[] = [
    { id: 'mild', severity: 'mild', value: 2, label: 'Mild', source: 'base' },
  ]
  for (const t of stressTracks(c)) {
    if (t.extraMild) {
      slots.push({ id: `mild-${t.id}`, severity: 'mild', value: 2, label: `Mild (${t.name} only)`, source: 'skill' })
    }
  }
  for (let i = 1; i <= Math.max(0, c.extraMildManual); i++) {
    slots.push({ id: `mild-extra-${i}`, severity: 'mild', value: 2, label: 'Mild (extra)', source: 'manual' })
  }
  slots.push(
    { id: 'moderate', severity: 'moderate', value: 4, label: 'Moderate', source: 'base' },
    { id: 'severe', severity: 'severe', value: 6, label: 'Severe', source: 'base' },
    { id: 'extreme', severity: 'extreme', value: 8, label: 'Extreme', source: 'base' },
  )
  return slots
}

// ── Magic ──────────────────────────────────────────────────────────────────

export function isCaster(c: Character): boolean {
  return c.magic.forceShow || c.powers.some((p) => p.catalogId && SPELLCASTING_IDS.has(p.catalogId))
}

export function magic(c: Character) {
  const conviction = skillRating(c, 'Conviction')
  const discipline = skillRating(c, 'Discipline')
  const lore = skillRating(c, 'Lore')
  const slotsUsed = c.magic.bonuses.reduce(
    (sum, b) => sum + b.offensivePower + b.offensiveControl + b.defensivePower + b.defensiveControl,
    0,
  )
  type Bonus = { offensivePower: number; offensiveControl: number; defensivePower: number; defensiveControl: number }
  const zero = (): Bonus => ({ offensivePower: 0, offensiveControl: 0, defensivePower: 0, defensiveControl: 0 })
  const add = (into: Bonus, b: Bonus) => {
    into.offensivePower += b.offensivePower
    into.offensiveControl += b.offensiveControl
    into.defensivePower += b.defensivePower
    into.defensiveControl += b.defensiveControl
  }
  // Bonuses with no element apply to every element.
  const any = zero()
  const byElement = new Map<string, Bonus>()
  for (const b of c.magic.bonuses) {
    const key = b.element.trim()
    if (!key) {
      add(any, b)
      continue
    }
    if (!byElement.has(key)) byElement.set(key, zero())
    add(byElement.get(key)!, b)
  }
  for (const bonus of byElement.values()) add(bonus, any)
  const rows: [string, Bonus][] = [...byElement.entries()]
  if (c.magic.bonuses.some((b) => !b.element.trim())) rows.push(['Any element', any])
  const elements = rows.map(([element, bonus]) => ({
    element,
    offensivePower: conviction + bonus.offensivePower,
    offensiveControl: discipline + bonus.offensiveControl,
    defensivePower: conviction + bonus.defensivePower,
    defensiveControl: discipline + bonus.defensiveControl,
  }))
  const warnings: Warning[] = []
  if (c.magic.slotsAvailable > 0 && slotsUsed > c.magic.slotsAvailable) {
    warnings.push({ section: 'magic', message: `${slotsUsed} focus/specialization bonuses used of ${c.magic.slotsAvailable} slots.` })
  }
  return { conviction, discipline, lore, slotsUsed, elements, warnings }
}

// ── Phases ─────────────────────────────────────────────────────────────────

export function aspectCount(c: Character): number {
  return (
    [c.highConcept, c.trouble, ...c.phases.map((p) => p.aspect)].filter((a) => a.trim()).length +
    c.extraAspects.filter((a) => a.text.trim()).length
  )
}

// ── Everything ─────────────────────────────────────────────────────────────

export function analyze(c: Character) {
  const r = refresh(c)
  const s = skills(c)
  const m = isCaster(c) ? magic(c) : null
  return {
    level: levelFor(c),
    refresh: r,
    skills: s,
    stress: stressTracks(c),
    consequences: consequenceSlots(c),
    magic: m,
    aspects: aspectCount(c),
    warnings: [...r.warnings, ...s.warnings, ...(m?.warnings ?? [])],
  }
}

export type Analysis = ReturnType<typeof analyze>
