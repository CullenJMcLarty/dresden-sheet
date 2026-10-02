import type { PowerLevelId } from './types'

export const LADDER: Record<number, string> = {
  [-1]: 'Poor',
  0: 'Mediocre',
  1: 'Average',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Superb',
  6: 'Fantastic',
  7: 'Epic',
  8: 'Legendary',
}

export function ladderName(rating: number): string {
  return LADDER[rating] ?? (rating > 8 ? 'Legendary+' : 'Terrible')
}

export function signed(n: number): string {
  return n > 0 ? `+${n}` : `${n}`
}

export interface PowerLevel {
  id: PowerLevelId
  name: string
  refresh: number
  skillPoints: number
  skillCap: number
}

export const POWER_LEVELS: PowerLevel[] = [
  { id: 'feet', name: 'Feet in the Water', refresh: 6, skillPoints: 20, skillCap: 3 },
  { id: 'waist', name: 'Up to Your Waist', refresh: 7, skillPoints: 25, skillCap: 4 },
  { id: 'chest', name: 'Chest-Deep', refresh: 8, skillPoints: 30, skillCap: 4 },
  { id: 'submerged', name: 'Submerged', refresh: 10, skillPoints: 35, skillCap: 5 },
]

export const SKILLS = [
  'Alertness',
  'Athletics',
  'Burglary',
  'Contacts',
  'Conviction',
  'Craftsmanship',
  'Deceit',
  'Discipline',
  'Driving',
  'Empathy',
  'Endurance',
  'Fists',
  'Guns',
  'Intimidation',
  'Investigation',
  'Lore',
  'Might',
  'Performance',
  'Presence',
  'Rapport',
  'Resources',
  'Scholarship',
  'Stealth',
  'Survival',
  'Weapons',
] as const

export const TEMPLATES = [
  'Champion of God',
  'Changeling',
  'Emissary of Power',
  'Focused Practitioner',
  'Knight of a Faerie Court',
  'Lycanthrope',
  'Minor Talent',
  'Pure Mortal',
  'Red Court Infected',
  'Sorcerer',
  'True Believer',
  'Were-Form',
  'White Court Vampire',
  'White Court Virgin',
  'Wizard',
]

export const PHASE_DEFS = [
  { id: 'background', title: 'Background', question: 'Where did you come from?' },
  { id: 'rising', title: 'Rising Conflict', question: 'What shaped you?' },
  { id: 'story', title: 'The Story', question: 'What was your first adventure?' },
  { id: 'guest1', title: 'Guest Star', question: 'Whose path did you cross?' },
  { id: 'guest2', title: 'Guest Star Redux', question: 'Whose path did you cross next?' },
] as const

export const STRESS_TRACKS = [
  { id: 'physical', name: 'Physical', skill: 'Endurance' },
  { id: 'mental', name: 'Mental', skill: 'Conviction' },
  { id: 'social', name: 'Social', skill: 'Presence' },
  { id: 'hunger', name: 'Hunger', skill: 'Discipline' },
] as const

export const CONSEQUENCE_VALUES = { mild: 2, moderate: 4, severe: 6, extreme: 8 } as const
