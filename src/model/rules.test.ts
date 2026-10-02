import { describe, expect, it } from 'vitest'
import { CATALOG } from './catalog'
import { ImportError, newCharacter, normalizeCharacter } from './character'
import { analyze, consequenceSlots, isCaster, magic, refresh, skills, stressBonusFromSkill, stressTracks } from './rules'

const power = (cost: number, catalogId = '') => ({
  id: Math.random().toString(),
  name: 'p',
  category: 'Spellcasting' as const,
  cost,
  notes: '',
  catalogId,
  physicalBoxes: 0,
})

describe('refresh', () => {
  it('subtracts power costs from the power level base', () => {
    const c = newCharacter() // Chest-Deep: 8
    c.powers = [power(-3), power(-3), power(-1), power(1)]
    expect(refresh(c)).toMatchObject({ base: 8, spent: -6, adjusted: 2, warnings: [] })
  })

  it('warns when adjusted refresh drops below 1', () => {
    const c = newCharacter()
    c.powerLevel = 'feet'
    c.powers = [power(-6)]
    expect(refresh(c).adjusted).toBe(0)
    expect(refresh(c).warnings).toHaveLength(1)
  })

  it('uses custom levels', () => {
    const c = newCharacter()
    c.powerLevel = 'custom'
    c.customLevel = { refresh: 12, skillPoints: 40, skillCap: 6 }
    expect(refresh(c).base).toBe(12)
  })
})

describe('skills', () => {
  it('counts points and checks the cap', () => {
    const c = newCharacter() // cap Great (4), 30 points
    c.skills.Lore = 5
    c.skills.Conviction = 4
    expect(skills(c).spent).toBe(9)
    expect(skills(c).overCap).toEqual(['Lore'])
  })

  it('warns when over the point total', () => {
    const c = newCharacter()
    c.powerLevel = 'feet'
    for (const s of ['Alertness', 'Athletics', 'Burglary', 'Contacts', 'Conviction', 'Craftsmanship', 'Deceit']) c.skills[s] = 3
    expect(skills(c).spent).toBe(21)
    expect(skills(c).warnings.some((w) => w.message.includes('21 skill points'))).toBe(true)
  })

  it('enforces the column rule', () => {
    const c = newCharacter()
    c.skills.Lore = 3
    c.skills.Conviction = 3
    c.skills.Discipline = 2
    expect(skills(c).columnViolations).toEqual([2, 3])

    c.skills.Alertness = 2
    c.skills.Athletics = 1
    c.skills.Burglary = 1
    expect(skills(c).columnViolations).toEqual([])
  })

  it('includes custom skills', () => {
    const c = newCharacter()
    c.customSkills = [{ id: 'x', name: 'Piloting', rating: 2 }]
    expect(skills(c).spent).toBe(2)
    expect(skills(c).columnViolations).toEqual([2])
  })
})

describe('stress', () => {
  it('maps skill ratings to bonus boxes', () => {
    expect(stressBonusFromSkill(0)).toEqual({ boxes: 0, extraMild: 0 })
    expect(stressBonusFromSkill(1)).toEqual({ boxes: 1, extraMild: 0 })
    expect(stressBonusFromSkill(2)).toEqual({ boxes: 1, extraMild: 0 })
    expect(stressBonusFromSkill(3)).toEqual({ boxes: 2, extraMild: 0 })
    expect(stressBonusFromSkill(4)).toEqual({ boxes: 2, extraMild: 0 })
    expect(stressBonusFromSkill(5)).toEqual({ boxes: 2, extraMild: 1 })
    expect(stressBonusFromSkill(6)).toEqual({ boxes: 2, extraMild: 1 })
    expect(stressBonusFromSkill(7)).toEqual({ boxes: 2, extraMild: 2 })
  })

  it('builds tracks from linked skills plus manual bonus', () => {
    const c = newCharacter()
    c.skills.Endurance = 3
    c.stress.physical.bonus = 1
    c.skills.Conviction = 1
    const tracks = stressTracks(c)
    expect(tracks.map((t) => [t.id, t.boxes])).toEqual([
      ['physical', 5],
      ['mental', 3],
      ['social', 2],
    ])
  })

  it('only shows hunger when enabled', () => {
    const c = newCharacter()
    c.hungerEnabled = true
    c.skills.Discipline = 4
    expect(stressTracks(c).find((t) => t.id === 'hunger')?.boxes).toBe(4)
  })

  it('adds one extra mild slot per two full levels above Good', () => {
    const c = newCharacter()
    c.powerLevel = 'custom'
    c.customLevel = { refresh: 10, skillPoints: 50, skillCap: 8 }
    c.skills.Endurance = 7
    expect(consequenceSlots(c).filter((s) => s.id.startsWith('mild-physical')).map((s) => s.id)).toEqual(['mild-physical', 'mild-physical-2'])
  })

  it('adds extra mild consequence slots from Superb skills and manual extras', () => {
    const c = newCharacter()
    c.skills.Conviction = 5
    c.extraMildManual = 1
    expect(consequenceSlots(c).map((s) => s.id)).toEqual([
      'mild',
      'mild-mental',
      'mild-extra-1',
      'moderate',
      'severe',
      'extreme',
    ])
  })
})

describe('toughness powers', () => {
  it('add physical stress boxes on top of Endurance and the manual bonus', () => {
    const c = newCharacter()
    c.skills.Endurance = 3 // +2
    c.stress.physical.bonus = 1
    c.powers = [{ ...power(-2, 'inhuman-toughness'), name: 'Inhuman Toughness', physicalBoxes: 2 }]
    const physical = stressTracks(c).find((t) => t.id === 'physical')!
    expect(physical.boxes).toBe(2 + 2 + 1 + 2)
    expect(physical.fromPowers).toEqual([{ name: 'Inhuman Toughness', boxes: 2 }])
    expect(stressTracks(c).find((t) => t.id === 'mental')!.boxes).toBe(2)
  })

  it('takes default boxes from the catalog (YS185-186)', () => {
    const boxes = (id: string) => CATALOG.find((e) => e.id === id)?.physicalBoxes
    expect([boxes('inhuman-toughness'), boxes('supernatural-toughness'), boxes('mythic-toughness')]).toEqual([2, 4, 6])
  })

  it('gives older saved toughness powers their catalog boxes when loaded', () => {
    const c = normalizeCharacter({ powers: [{ id: 'p', name: 'Supernatural Toughness', category: 'Toughness', cost: -4, catalogId: 'supernatural-toughness' }] })
    expect(c.powers[0].physicalBoxes).toBe(4)
    const edited = normalizeCharacter({ powers: [{ id: 'p', catalogId: 'supernatural-toughness', physicalBoxes: 1 }] })
    expect(edited.powers[0].physicalBoxes).toBe(1)
  })
})

describe('magic', () => {
  it('detects casters from catalog powers', () => {
    const c = newCharacter()
    expect(isCaster(c)).toBe(false)
    c.powers = [power(-3, 'evocation')]
    expect(isCaster(c)).toBe(true)
  })

  it('totals power and control per element', () => {
    const c = newCharacter()
    c.skills.Conviction = 4
    c.skills.Discipline = 3
    c.magic.slotsAvailable = 2
    const bonus = { name: '', notes: '', kind: 'focus' as const, offensivePower: 0, offensiveControl: 0, defensivePower: 0, defensiveControl: 0 }
    c.magic.bonuses = [
      { ...bonus, id: 'a', element: 'Fire', offensivePower: 1 },
      { ...bonus, id: 'b', element: 'Fire', offensiveControl: 1, defensiveControl: 1 },
    ]
    const m = magic(c)
    expect(m.elements).toEqual([
      { element: 'Fire', offensivePower: 5, offensiveControl: 4, defensivePower: 4, defensiveControl: 4 },
    ])
    expect(m.slotsUsed).toBe(3)
    expect(m.warnings).toHaveLength(1)
  })
})

describe('magic: any-element bonuses', () => {
  it('folds bonuses with no element into every element row', () => {
    const c = newCharacter()
    c.skills.Conviction = 4
    c.skills.Discipline = 3
    const bonus = { name: '', notes: '', kind: 'focus' as const, offensivePower: 0, offensiveControl: 0, defensivePower: 0, defensiveControl: 0 }
    c.magic.bonuses = [
      { ...bonus, id: 'rod', element: '', offensivePower: 1 },
      { ...bonus, id: 'fire', element: 'Fire', offensiveControl: 1 },
    ]
    expect(magic(c).elements).toEqual([
      { element: 'Fire', offensivePower: 5, offensiveControl: 4, defensivePower: 4, defensiveControl: 3 },
      { element: 'Any element', offensivePower: 5, offensiveControl: 3, defensivePower: 4, defensiveControl: 3 },
    ])
  })
})

describe('analyze', () => {
  it('collects warnings from every section', () => {
    const c = newCharacter()
    c.powerLevel = 'feet'
    c.powers = [power(-8)]
    c.skills.Lore = 5
    expect(analyze(c).warnings.length).toBeGreaterThanOrEqual(2)
  })
})

describe('normalizeCharacter', () => {
  it('round-trips a character', () => {
    const c = newCharacter()
    c.name = 'Harry'
    c.phases[0].aspect = 'Wizard for hire'
    c.powers = [power(-3, 'evocation')]
    expect(normalizeCharacter(JSON.parse(JSON.stringify(c)))).toEqual(c)
  })

  it('fills missing fields and drops junk', () => {
    const c = normalizeCharacter({ name: 'Molly', skills: { Lore: 3, Bogus: 'x' }, powers: [null, { name: 'Veil' }], stress: { physical: { bonus: 'lots' } } })
    expect(c.name).toBe('Molly')
    expect(c.skills.Lore).toBe(3)
    expect(c.skills.Bogus).toBeUndefined()
    expect(c.powers).toHaveLength(1)
    expect(c.powers[0].id).toBeTruthy()
    expect(c.stress.physical.bonus).toBe(0)
    expect(c.phases).toHaveLength(5)
  })

  it('rejects non-objects and newer schemas', () => {
    expect(() => normalizeCharacter('nope')).toThrow(ImportError)
    expect(() => normalizeCharacter({ schema: 999 })).toThrow(ImportError)
  })
})
