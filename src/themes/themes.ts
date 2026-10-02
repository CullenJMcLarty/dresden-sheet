export type ThemeId =
  | 'steel'
  | 'casefile'
  | 'modern'
  | 'fey-spring'
  | 'fey-summer'
  | 'fey-fall'
  | 'fey-winter'
  | 'illuminated'
  | 'ghost'

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
  family: 'steel' | 'casefile' | 'modern' | 'fey' | 'holy' | 'ghost'
  variant?: FeyCourt
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
  intakeKicker: 'Do not leave on the desk',
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

export type FeyCourt = 'spring' | 'summer' | 'fall' | 'winter'

const COURT_LIGHT: Record<FeyCourt, string> = {
  spring: 'Dawn remaining',
  summer: 'Light remaining',
  fall: 'Harvest remaining',
  winter: 'Moonlight remaining',
}

const fey = (court: 'Spring' | 'Summer' | 'Autumn' | 'Winter', key: FeyCourt): ThemeCopy => ({
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
  refreshLabel: COURT_LIGHT[key],
})

const illuminated: ThemeCopy = {
  eyebrow: 'Liber Vitae',
  unnamed: 'A Soul Unrecorded',
  intakeTitle: 'The Record',
  intakeKicker: 'Here begins the book of',
  conceptTitle: 'The Calling',
  conceptKicker: 'What were you set upon this earth to do?',
  aspectsKicker: 'Virtues & vices, set down in ink',
  skillsKicker: 'Talents entrusted',
  stressKicker: 'Let the light hold',
  consequencesKicker: 'Wounds borne',
  stamp: 'Borne',
  magicTitle: 'The Mysteries',
  magicKicker: 'Power is a trust',
  fociKicker: 'Relics & instruments',
  rotesKicker: 'Orisons by heart',
  gearTitle: 'Arms & Relics',
  gearKicker: 'What you carry into the dark',
  gearEmpty: 'Nothing but faith.',
  notesTitle: 'Marginalia',
  notesKicker: 'Names to pray for, debts to settle',
  warningLead: 'Nota bene:',
  drawerTitle: 'The Book of Names',
  refreshLabel: 'Candles lit',
}

const ghost: ThemeCopy = {
  eyebrow: 'Beyond the Veil',
  unnamed: 'The Unremembered',
  intakeTitle: 'Who Calls',
  intakeKicker: 'Speak your name into the dark',
  conceptTitle: 'The Haunting',
  conceptKicker: 'What binds you to this world?',
  aspectsKicker: 'What lingers',
  skillsKicker: 'What you could do in life',
  stressKicker: 'How thin the veil wears',
  consequencesKicker: 'Marks that will not fade',
  stamp: 'Lingers',
  magicTitle: 'The Art',
  magicKicker: 'Ectoplasm & intent',
  fociKicker: 'Talismans',
  rotesKicker: 'Words that echo',
  gearTitle: 'Earthly Possessions',
  gearKicker: 'Some things are buried with you',
  gearEmpty: 'You cannot take it with you.',
  notesTitle: 'Whispers',
  notesKicker: 'Who still remembers you',
  warningLead: 'The spirits object:',
  drawerTitle: 'The Departed',
  refreshLabel: 'The board answers',
}

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
    id: 'fey-spring',
    family: 'fey',
    variant: 'spring',
    name: 'Fey · Spring Court',
    tagline: 'Blossom and dawn, promises newly made',
    swatch: ['#16302a', '#ffd6e4', '#b8f0a0'],
    sampleFont: "'Cinzel Decorative'",
    copy: fey('Spring', 'spring'),
  },
  {
    id: 'fey-summer',
    family: 'fey',
    variant: 'summer',
    name: 'Fey · Summer Court',
    tagline: 'Rose-gold dusk, fireflies, a bargain in bloom',
    swatch: ['#2a1238', '#f2b880', '#ff8fb1'],
    sampleFont: "'Cinzel Decorative'",
    copy: fey('Summer', 'summer'),
  },
  {
    id: 'fey-fall',
    family: 'fey',
    variant: 'fall',
    name: 'Fey · Autumn Court',
    tagline: 'Harvest moon, falling leaves, debts come due',
    swatch: ['#2a140a', '#ffb347', '#d2452b'],
    sampleFont: "'Cinzel Decorative'",
    copy: fey('Autumn', 'fall'),
  },
  {
    id: 'fey-winter',
    family: 'fey',
    variant: 'winter',
    name: 'Fey · Winter Court',
    tagline: 'Moonlit frost, silver thorns, cold mercy',
    swatch: ['#0b1430', '#cfe6ff', '#8fb7ff'],
    sampleFont: "'Cinzel Decorative'",
    copy: fey('Winter', 'winter'),
  },
  {
    id: 'illuminated',
    family: 'holy',
    name: 'Illuminated',
    tagline: 'Vellum, gold leaf and stained glass',
    swatch: ['#f1e6cc', '#a4161a', '#c9a227'],
    sampleFont: "'UnifrakturMaguntia'",
    copy: illuminated,
  },
  {
    id: 'ghost',
    family: 'ghost',
    name: 'The Veil',
    tagline: 'A séance by candlelight, fog and ectoplasm',
    swatch: ['#0c1012', '#9ff5d6', '#c9b79c'],
    sampleFont: "'IM Fell English SC'",
    copy: ghost,
  },
]

export const themeById = (id: string): Theme => THEMES.find((t) => t.id === id) ?? THEMES[0]
