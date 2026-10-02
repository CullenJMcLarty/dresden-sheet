import type { PowerCategory } from './types'

/**
 * Names and default refresh costs only — no rules text. Costs flagged
 * `variable` depend on options or catches; the default is a starting point.
 */
export interface CatalogEntry {
  id: string
  name: string
  category: PowerCategory
  cost: number
  variable?: boolean
}

const e = (
  category: PowerCategory,
  entries: [id: string, name: string, cost: number, variable?: boolean][],
): CatalogEntry[] => entries.map(([id, name, cost, variable]) => ({ id, name, category, cost, variable }))

export const CATALOG: CatalogEntry[] = [
  ...e('Mortal Stunt', [['mortal-stunt', 'Mortal Stunt', -1]]),
  ...e('Creature Features', [
    ['addictive-saliva', 'Addictive Saliva', -1],
    ['aquatic', 'Aquatic', -1],
    ['breath-weapon', 'Breath Weapon', -2, true],
    ['claws', 'Claws', -1],
    ['diminutive-size', 'Diminutive Size', -1],
    ['echoes-of-the-beast', 'Echoes of the Beast', -1],
    ['hulking-size', 'Hulking Size', -2],
    ['pack-instincts', 'Pack Instincts', -1],
    ['wings', 'Wings', -1],
  ]),
  ...e('Faerie Magic', [
    ['glamours', 'Glamours', -2, true],
    ['greater-glamours', 'Greater Glamours', -4, true],
    ['seelie-magic', 'Seelie Magic', -3, true],
    ['unseelie-magic', 'Unseelie Magic', -3, true],
    ['wild-magic', 'Wild Magic', -3, true],
  ]),
  ...e('Minor Abilities', [
    ['cloak-of-shadows', 'Cloak of Shadows', -1],
    ['demonic-co-pilot', 'Demonic Co-Pilot', -1],
    ['ghost-speaker', 'Ghost Speaker', -1],
    ['marked-by-power', 'Marked by Power', -1],
  ]),
  ...e('Nevernever Powers', [
    ['spirit-form', 'Spirit Form', -3, true],
    ['swift-transition', 'Swift Transition', -2, true],
    ['worldwalker', 'Worldwalker', -2, true],
  ]),
  ...e('Psychic Abilities', [
    ['cassandras-tears', "Cassandra's Tears", -1],
    ['domination', 'Domination', -2, true],
    ['incite-emotion', 'Incite Emotion', -1, true],
    ['psychometry', 'Psychometry', -1],
  ]),
  ...e('Shapeshifting', [
    ['beast-change', 'Beast Change', -1],
    ['human-form', 'Human Form', 1],
    ['modular-abilities', 'Modular Abilities', -3, true],
    ['shapeshifting', 'Shapeshifting', -2],
    ['true-shapeshifting', 'True Shapeshifting', -4],
  ]),
  ...e('Spellcasting', [
    ['channeling', 'Channeling', -2],
    ['evocation', 'Evocation', -3],
    ['refinement', 'Refinement', -1],
    ['ritual', 'Ritual', -2],
    ['sponsored-magic', 'Sponsored Magic', -4, true],
    ['soulfire', 'Soulfire', -2],
    ['thaumaturgy', 'Thaumaturgy', -3],
    ['lawbreaker', 'Lawbreaker', -1, true],
    ['the-sight', 'The Sight', -1],
    ['soulgaze', 'Soulgaze', 0],
    ['wizards-constitution', "Wizard's Constitution", 0],
  ]),
  ...e('Speed', [
    ['inhuman-speed', 'Inhuman Speed', -2],
    ['supernatural-speed', 'Supernatural Speed', -4],
    ['mythic-speed', 'Mythic Speed', -6],
  ]),
  ...e('Strength', [
    ['inhuman-strength', 'Inhuman Strength', -2],
    ['supernatural-strength', 'Supernatural Strength', -4],
    ['mythic-strength', 'Mythic Strength', -6],
  ]),
  ...e('Toughness', [
    ['inhuman-toughness', 'Inhuman Toughness', -2],
    ['supernatural-toughness', 'Supernatural Toughness', -4],
    ['mythic-toughness', 'Mythic Toughness', -6],
    ['physical-immunity', 'Physical Immunity', -8, true],
    ['the-catch', 'The Catch', 1, true],
  ]),
  ...e('Recovery', [
    ['inhuman-recovery', 'Inhuman Recovery', -2],
    ['supernatural-recovery', 'Supernatural Recovery', -4],
    ['mythic-recovery', 'Mythic Recovery', -6],
  ]),
  ...e('True Faith', [
    ['bless-this-house', 'Bless This House', -1],
    ['guide-my-hand', 'Guide My Hand', -1],
    ['holy-touch', 'Holy Touch', -1],
    ['righteousness', 'Righteousness', -2],
  ]),
  ...e('Vampire & Hunger', [
    ['feeding-dependency', 'Feeding Dependency', 1],
    ['emotional-vampire', 'Emotional Vampire', -1],
  ]),
  ...e('Items & Other', [['item-of-power', 'Item of Power', -2, true]]),
]

/** Catalog ids that make the Magic tab appear. */
export const SPELLCASTING_IDS = new Set([
  'channeling',
  'evocation',
  'ritual',
  'sponsored-magic',
  'thaumaturgy',
  'refinement',
  'seelie-magic',
  'unseelie-magic',
  'wild-magic',
])

export function searchCatalog(query: string): CatalogEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return CATALOG
  return CATALOG.filter(
    (c) => c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q),
  )
}
