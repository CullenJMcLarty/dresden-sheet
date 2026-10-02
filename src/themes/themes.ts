export type ThemeId = 'steel' | 'casefile' | 'modern' | 'fey-summer' | 'fey-winter'

/** Flavor text that changes with the theme. Game terms (Aspects, Skills…) stay fixed. */
export interface ThemeCopy {
  eyebrow: string
  unnamed: string
  intakeTitle: string
  intakeKicker: string
  conceptTitle: string
  conceptKicker: string
  aspectsKicker: string
  skillsKicker: string
  stressKicker: string
  consequencesKicker: string
  stamp: string
  magicTitle: string
  magicKicker: string
  fociKicker: string
  rotesKicker: string
  gearTitle: string
  gearKicker: string
  gearEmpty: string
  notesTitle: string
  notesKicker: string
  warningLead: string
  drawerTitle: string
  refreshLabel: string
}

export interface Theme {
  id: ThemeId
  /** The CSS family, set as html[data-theme]. Fey courts share one family. */
  family: 'steel' | 'casefile' | 'modern' | 'fey'
  variant?: 'summer' | 'winter'
  name: string
  tagline: string
  /** Swatches for the picker preview. */
  swatch: [string, string, string]
  sampleFont: string
  copy: ThemeCopy
}

const steel: ThemeCopy = {
  eyebrow: 'Steel City Casefile',
  unnamed: 'Unnamed Practitioner',
  intakeTitle: 'Intake',
  intakeKicker: 'Reconstruction Authority · Registered Practitioner',
  conceptTitle: 'The Concept',
  conceptKicker: 'Form 7-A · Who are you?',
  aspectsKicker: 'Painted on the plate',
  skillsKicker: 'Column rule in force',
  stressKicker: 'Pressure on the line',
  consequencesKicker: 'Injury log',
  stamp: 'Logged',
  magicTitle: 'The Art',
  magicKicker: 'Copper wards · verdigris',
  fociKicker: 'Tooled for the work',
  rotesKicker: 'Spells worn smooth',
  gearTitle: 'Gear',
  gearKicker: 'Salvage manifest',
  gearEmpty: 'Nothing salvaged yet.',
  notesTitle: 'Field Notes',
  notesKicker: 'Contacts, debts, secrets',
  warningLead: '',
  drawerTitle: 'Casefiles',
  refreshLabel: 'Adjusted refresh',
}

const casefile: ThemeCopy = {
  eyebrow: 'Open Case',
  unnamed: 'John or Jane Doe',
  intakeTitle: 'Client Intake',
  intakeKicker: 'Confidential · do not leave on the desk',
  conceptTitle: 'Who Walked In',
  conceptKicker: 'First impressions, written down fast',
  aspectsKicker: 'Scribbled in the margins',
  skillsKicker: 'Known capabilities',
  stressKicker: 'How much more they can take',
  consequencesKicker: 'Evidence of damage',
  stamp: 'Filed',
  magicTitle: 'The Art',
  magicKicker: 'Keep it away from the electronics',
  fociKicker: 'Tools of the trade',
  rotesKicker: 'Tried and true',
  gearTitle: 'Evidence Locker',
  gearKicker: 'Tagged & bagged',
  gearEmpty: 'Locker is empty.',
  notesTitle: 'Field Notes',
  notesKicker: 'Leads, debts, people who owe you',
  warningLead: 'Fix before filing:',
  drawerTitle: 'Filing Cabinet',
  refreshLabel: 'Refresh',
}

const modern: ThemeCopy = {
  eyebrow: 'Character',
  unnamed: 'New character',
  intakeTitle: 'Profile',
  intakeKicker: 'Identity & build',
  conceptTitle: 'Core Concept',
  conceptKicker: 'The two aspects everything hangs on',
  aspectsKicker: "What's true about you",
  skillsKicker: 'Ratings & budget',
  stressKicker: 'Tracks',
  consequencesKicker: 'Lasting effects',
  stamp: 'Active',
  magicTitle: 'Spellcasting',
  magicKicker: 'Power & control',
  fociKicker: 'Bonuses by element',
  rotesKicker: 'Saved spells',
  gearTitle: 'Inventory',
  gearKicker: 'Weapons, armor, items',
  gearEmpty: 'No items yet.',
  notesTitle: 'Notes',
  notesKicker: 'Anything else',
  warningLead: 'Needs attention',
  drawerTitle: 'Characters',
  refreshLabel: 'Refresh',
}

const fey = (court: 'Summer' | 'Winter'): ThemeCopy => ({
  eyebrow: `By leave of the ${court} Court`,
  unnamed: 'One Without a Name',
  intakeTitle: 'The Name Given',
  intakeKicker: 'Never the true one',
  conceptTitle: 'Who Comes to the Revel',
  conceptKicker: 'Speak it, and it is so',
  aspectsKicker: 'Truths spoken thrice',
  skillsKicker: 'Gifts & graces',
  stressKicker: 'What the night takes',
  consequencesKicker: 'Debts the body owes',
  stamp: 'Bound',
  magicTitle: 'The Art',
  magicKicker: 'Glamour, ward & working',
  fociKicker: 'Wands, rings & keepsakes',
  rotesKicker: 'Words that remember',
  gearTitle: 'Tokens & Trinkets',
  gearKicker: 'Gifts carry obligations',
  gearEmpty: 'Nothing given, nothing owed.',
  notesTitle: 'Whispers',
  notesKicker: 'Names, debts, favors owed',
  warningLead: 'The bargain frays:',
  drawerTitle: 'Names Known',
  refreshLabel: court === 'Summer' ? 'Light remaining' : 'Moon remaining',
})

export const THEMES: Theme[] = [
  {
    id: 'steel',
    family: 'steel',
    name: 'Steel City',
    tagline: 'Pittsburgh, rebuilt after the Fall',
    swatch: ['#171513', '#ffb612', '#4fc2a8'],
    sampleFont: "'Saira Stencil One'",
    copy: steel,
  },
  {
    id: 'casefile',
    family: 'casefile',
    name: 'Case File',
    tagline: "A wizard PI's desk, after midnight",
    swatch: ['#3b2a1e', '#efe4c8', '#b3261e'],
    sampleFont: "'Special Elite'",
    copy: casefile,
  },
  {
    id: 'modern',
    family: 'modern',
    name: 'Modern',
    tagline: 'Clean field kit · follows your light/dark setting',
    swatch: ['#f5f5f2', '#121212', '#4b3df5'],
    sampleFont: "'Inter Variable'",
    copy: modern,
  },
  {
    id: 'fey-summer',
    family: 'fey',
    variant: 'summer',
    name: 'Fey · Summer Court',
    tagline: 'Rose-gold dusk, fireflies, a bargain in bloom',
    swatch: ['#2a1238', '#f2b880', '#ff8fb1'],
    sampleFont: "'Cinzel Decorative'",
    copy: fey('Summer'),
  },
  {
    id: 'fey-winter',
    family: 'fey',
    variant: 'winter',
    name: 'Fey · Winter Court',
    tagline: 'Moonlit frost, silver thorns, cold mercy',
    swatch: ['#0b1430', '#cfe6ff', '#8fb7ff'],
    sampleFont: "'Cinzel Decorative'",
    copy: fey('Winter'),
  },
]

export const themeById = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0]
