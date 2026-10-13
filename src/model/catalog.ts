import type { PowerCategory } from './types'

/**
 * Names and default refresh costs only — no rules text. Costs flagged
 * `variable` depend on options or catches; the default is a starting point.
 * Checked against the power table in Your Story (YS160–161).
 */
export interface CatalogEntry {
  id: string
  name: string
  category: PowerCategory
  cost: number
  variable?: boolean
  /** Physical stress boxes granted (YS185-186). */
  physicalBoxes?: number
  /** Effect and upgrade names (YS160–161), so searches like "incorporeal" find the power. */
  keywords?: string[]
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
    ['breath-weapon', 'Breath Weapon', -2],
    ['claws', 'Claws', -1, true],
    ['diminutive-size', 'Diminutive Size', -1],
    ['echoes-of-the-beast', 'Echoes of the Beast', -1],
    ['hulking-size', 'Hulking Size', -2],
    ['living-dead', 'Living Dead', -1],
    ['pack-instincts', 'Pack Instincts', -1],
    ['spider-walk', 'Spider Walk', -1],
    ['supernatural-sense', 'Supernatural Sense', -1, true],
    ['wings', 'Wings', -1],
  ]),
  ...e('Faerie Magic', [
    ['glamours', 'Glamours', -2],
    ['greater-glamours', 'Greater Glamours', -4],
    ['seelie-magic', 'Seelie Magic', -4, true],
    ['unseelie-magic', 'Unseelie Magic', -4, true],
  ]),
  ...e('Minor Abilities', [
    ['cloak-of-shadows', 'Cloak of Shadows', -1],
    ['ghost-speaker', 'Ghost Speaker', -1],
    ['mana-static', 'Mana Static', -1],
    ['marked-by-power', 'Marked by Power', -1],
    ['wizards-constitution', "Wizard's Constitution", 0],
  ]),
  ...e('Nevernever Powers', [
    ['demesne', 'Demesne', -1],
    ['spirit-form', 'Spirit Form', -3, true],
    ['swift-transition', 'Swift Transition', -2, true],
    ['worldwalker', 'Worldwalker', -2],
  ]),
  ...e('Psychic Abilities', [
    ['cassandras-tears', "Cassandra's Tears", 0],
    ['domination', 'Domination', -2, true],
    ['incite-emotion', 'Incite Emotion', -1, true],
    ['psychometry', 'Psychometry', -1],
    ['the-sight', 'The Sight', -1],
    // -1, or 0 with Application of the Sight [+1] when you also have the Sight.
    ['soulgaze', 'Soulgaze', -1, true],
  ]),
  ...e('Shapeshifting', [
    ['beast-change', 'Beast Change', -1],
    ['demonic-co-pilot', 'Demonic Co-Pilot', -1],
    ['flesh-mask', 'Flesh Mask', -1],
    ['gaseous-form', 'Gaseous Form', -3],
    ['human-form', 'Human Form', 1, true],
    ['human-guise', 'Human Guise', 0],
    ['mimic-abilities', 'Mimic Abilities', -3, true],
    ['mimic-form', 'Mimic Form', -2],
    ['modular-abilities', 'Modular Abilities', -3, true],
    ['true-shapeshifting', 'True Shapeshifting', -4],
  ]),
  ...e('Spellcasting', [
    ['channeling', 'Channeling', -2],
    ['evocation', 'Evocation', -3],
    ['refinement', 'Refinement', -1],
    ['ritual', 'Ritual', -2],
    ['sponsored-magic', 'Sponsored Magic', -4, true],
    // Sponsored magic at +1 cost: -5, or -3 with both Evocation and Thaumaturgy.
    ['soulfire', 'Sponsored Magic (Soulfire)', -5, true],
    ['thaumaturgy', 'Thaumaturgy', -3],
    ['lawbreaker', 'Lawbreaker', -1, true],
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
    ['blood-drinker', 'Blood Drinker', -1],
    ['emotional-vampire', 'Emotional Vampire', -1],
    ['feeding-dependency', 'Feeding Dependency', 1],
    ['tattoos-of-st-giles', 'Tattoos of St. Giles', -2],
  ]),
  ...e('Items & Other', [
    ['item-of-power', 'Item of Power', -2, true],
    ['sword-of-the-cross', 'Sword of the Cross', -3],
  ]),
]

// Toughness powers add physical stress capacity: +2 / +4 / +6 boxes (YS185-186).
const TOUGHNESS_BOXES: Record<string, number> = { 'inhuman-toughness': 2, 'supernatural-toughness': 4, 'mythic-toughness': 6 }
for (const entry of CATALOG) if (TOUGHNESS_BOXES[entry.id]) entry.physicalBoxes = TOUGHNESS_BOXES[entry.id]

// Effect and upgrade names from the power table (YS160–161), plus a few common synonyms.
const KEYWORDS: Record<string, string[]> = {
  'addictive-saliva': ['narcotic saliva'],
  aquatic: ["can't drown", 'easy swimming', 'swim'],
  claws: ['natural weapons', 'venomous', 'teeth', 'bite'],
  'diminutive-size': ['hard to detect', 'small is big', 'wee', 'small'],
  'echoes-of-the-beast': ['beast senses', 'beast trappings', 'beast friend'],
  'hulking-size': ['easy to hit, hard to hurt', 'everything is small', 'big is scary', 'easy to detect', 'large', 'giant'],
  'living-dead': ['corpse body', 'death is a nuisance', 'undead', 'zombie'],
  'pack-instincts': ['pack communication'],
  'spider-walk': ['like a spider', 'wall crawling', 'climb'],
  'supernatural-sense': ['strange sense', 'strange senses', 'broad senses'],
  wings: ['flight', 'fly'],
  glamours: ['minor veils', 'seemings', 'illusion'],
  'greater-glamours': ['veils', 'seemings', 'true seemings', 'illusion', 'invisibility'],
  'seelie-magic': ['summer spellcasting'],
  'unseelie-magic': ['winter spellcasting'],
  'cloak-of-shadows': ['see in the dark', 'melt into the shadows'],
  'ghost-speaker': ['see the dead', 'seen by the dead', 'speak to the dead', 'seek the dead'],
  'mana-static': ['hexing'],
  'marked-by-power': ['aegis of respect'],
  'wizards-constitution': ['total recovery', 'long life'],
  demesne: ['home turf'],
  'spirit-form': ['insubstantial', 'incorporeal', 'intangible', 'variable manifestation', 'variable visage', 'poltergeist', 'ghost'],
  'swift-transition': ['everywhere is a portal', 'no mortal home'],
  worldwalker: ['rift sense', 'rift maker', 'strange worlds'],
  'cassandras-tears': ['unbelievable predictions', 'precognition'],
  domination: ['psychic domination', 'create renfield', 'master dominator', 'possession', 'mind control'],
  'incite-emotion': ['additional emotion', 'at range', 'lasting emotion', 'potent emotion'],
  psychometry: ['echoes of the past'],
  'the-sight': ['arcane senses', "wizard's touch", 'opening the third eye'],
  soulgaze: ['application of the sight'],
  'beast-change': ['beast form', 'skill shuffle'],
  'demonic-co-pilot': ["demon's agenda"],
  'flesh-mask': ['idealized appearance', 'what lies beneath'],
  'gaseous-form': ['gaseous transformation', 'mist', 'insubstantial'],
  'human-form': ['regular joe', 'regular jane', 'rare or involuntary change'],
  'human-guise': ['normal appearance'],
  'mimic-abilities': ['eat power', 'mimic stunt', 'mimic skill'],
  'mimic-form': ['take form'],
  'modular-abilities': ['function follows form'],
  'true-shapeshifting': ['multi-form', 'skill shuffle'],
  channeling: ['item slots'],
  evocation: ['you know what you know', 'specialization', 'item slots'],
  refinement: ['refined spellcraft'],
  ritual: ['item slots'],
  thaumaturgy: ['specialization', 'item slots'],
  lawbreaker: ['slippery slope', 'trouble comes in threes'],
  'inhuman-speed': ['improved initiative', 'athletic ability', 'casual movement', 'almost too fast to see'],
  'supernatural-speed': ['supreme initiative', 'superior athletic ability', 'effortless movement', 'faster than the eye'],
  'mythic-speed': ['super supreme initiative', 'extra superior athletic ability', 'instant movement', 'like the wind'],
  'inhuman-strength': ['improved lifting', 'bruising strength', 'superior strength', 'hammer blows'],
  'supernatural-strength': ['superior lifting', 'bludgeoning strength', 'superlative strength', 'lethal blows'],
  'mythic-strength': ['supreme lifting', 'unstoppable strength', 'supreme strength', 'devastating blows'],
  'inhuman-toughness': ['hard to hurt', 'hard to kill', 'armor'],
  'supernatural-toughness': ['harder to hurt', 'harder to kill', 'armor'],
  'mythic-toughness': ['nearly impossible to hurt', 'nearly impossible to kill', 'armor'],
  'physical-immunity': ['stacked catch', 'invulnerable'],
  'inhuman-recovery': ['total recovery', 'fast recovery', 'vigorous', 'shrug it off', 'regeneration'],
  'supernatural-recovery': ['total recovery', 'faster recovery', 'unfaltering', "it's nothing", 'regeneration'],
  'mythic-recovery': ['total recovery', 'really amazingly fast recovery', 'indefatigable', 'ha! you call that a hit?', 'regeneration'],
  righteousness: ['potent prayer', 'desperate hour'],
  'blood-drinker': ['drink blood', 'the taste of death', 'blood frenzy', 'red court'],
  'emotional-vampire': ['feeding touch', 'the taste of death', 'feeding frenzy', 'white court'],
  'feeding-dependency': ['hunger is stressful', 'limited reserves', 'failure recovery', 'hunger'],
  'tattoos-of-st-giles': ['a warning to others', 'biofeedback', 'deeper reserves', 'supernatural player', 'fellowship training'],
  'item-of-power': ['one-time discount', 'it is what it is', 'unbreakable', 'imparted abilities'],
  'sword-of-the-cross': ['all creatures are equal before god', 'divine purpose', 'holy', 'true aim', 'unbreakable', 'knight of the cross'],
}
for (const entry of CATALOG) if (KEYWORDS[entry.id]) entry.keywords = KEYWORDS[entry.id]

/** Catalog ids that make the Magic tab appear. */
export const SPELLCASTING_IDS = new Set([
  'channeling',
  'evocation',
  'ritual',
  'sponsored-magic',
  'soulfire',
  'thaumaturgy',
  'refinement',
  'seelie-magic',
  'unseelie-magic',
])

export function searchCatalog(query: string): CatalogEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return CATALOG
  return CATALOG.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.keywords?.some((k) => k.includes(q)),
  )
}
