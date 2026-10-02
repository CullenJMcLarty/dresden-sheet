export const SCHEMA_VERSION = 1

export type PowerLevelId = 'feet' | 'waist' | 'chest' | 'submerged' | 'custom'

export type PowerCategory =
  | 'Mortal Stunt'
  | 'Creature Features'
  | 'Faerie Magic'
  | 'Minor Abilities'
  | 'Nevernever Powers'
  | 'Psychic Abilities'
  | 'Shapeshifting'
  | 'Spellcasting'
  | 'Speed'
  | 'Strength'
  | 'Toughness'
  | 'Recovery'
  | 'True Faith'
  | 'Vampire & Hunger'
  | 'Items & Other'

export interface Phase {
  id: string
  title: string
  question: string
  events: string
  aspect: string
  /** For guest star phases: whose story this character appeared in. */
  guestOf?: string
}

export interface Aspect {
  id: string
  text: string
}

export interface CustomSkill {
  id: string
  name: string
  rating: number
}

export interface PowerEntry {
  id: string
  name: string
  category: PowerCategory
  /** Refresh cost as printed: negative costs refresh, positive refunds it. */
  cost: number
  notes: string
  catalogId?: string
}

export type StressTrackId = 'physical' | 'mental' | 'social' | 'hunger'

export interface StressTrack {
  checked: boolean[]
  bonus: number
}

/** A focus item or specialization: each bonus is +N to that casting mode. */
export interface CastingBonus {
  id: string
  name: string
  element: string
  offensivePower: number
  offensiveControl: number
  defensivePower: number
  defensiveControl: number
  kind: 'focus' | 'specialization'
  /** Enchanted item / potion slots, for thaumaturgy focus items. */
  notes: string
}

export interface Rote {
  id: string
  name: string
  kind: 'Evocation' | 'Thaumaturgy' | 'Other'
  element: string
  power: number
  notes: string
}

export interface GearItem {
  id: string
  name: string
  kind: 'weapon' | 'armor' | 'item'
  rating: number
  notes: string
}

export interface Character {
  schema: number
  id: string
  createdAt: string
  updatedAt: string

  name: string
  player: string
  template: string
  templateMusts: string
  portraitUrl: string

  highConcept: string
  trouble: string
  phases: Phase[]
  extraAspects: Aspect[]

  powerLevel: PowerLevelId
  customLevel: { refresh: number; skillPoints: number; skillCap: number }

  skills: Record<string, number>
  customSkills: CustomSkill[]

  powers: PowerEntry[]

  stress: Record<StressTrackId, StressTrack>
  hungerEnabled: boolean
  /** Consequence text keyed by slot id (see rules.consequenceSlots). */
  consequences: Record<string, string>
  /** Which kind of harm each consequence absorbed. Slots are shared across all tracks. */
  consequenceTypes: Record<string, StressTrackId>
  extraMildManual: number

  magic: {
    forceShow: boolean
    slotsAvailable: number
    bonuses: CastingBonus[]
    rotes: Rote[]
  }

  fatePoints: number
  gear: GearItem[]
  notes: string
}
