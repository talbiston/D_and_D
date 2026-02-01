import type { AbilityName } from '../types'

export type ToolCategory =
  | "artisan's tools"
  | 'gaming set'
  | 'musical instrument'
  | 'other'

export interface ToolData {
  name: string
  category: ToolCategory
  weight: number // in pounds
  cost: string // e.g., "15 gp"
  abilityUsed: AbilityName // default ability for checks
}

// Artisan's Tools (17 types)
const ARTISANS_TOOLS: ToolData[] = [
  {
    name: "Alchemist's Supplies",
    category: "artisan's tools",
    weight: 8,
    cost: '50 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Brewer's Supplies",
    category: "artisan's tools",
    weight: 9,
    cost: '20 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Calligrapher's Supplies",
    category: "artisan's tools",
    weight: 5,
    cost: '10 gp',
    abilityUsed: 'dexterity',
  },
  {
    name: "Carpenter's Tools",
    category: "artisan's tools",
    weight: 6,
    cost: '8 gp',
    abilityUsed: 'strength',
  },
  {
    name: "Cartographer's Tools",
    category: "artisan's tools",
    weight: 6,
    cost: '15 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Cobbler's Tools",
    category: "artisan's tools",
    weight: 5,
    cost: '5 gp',
    abilityUsed: 'dexterity',
  },
  {
    name: "Cook's Utensils",
    category: "artisan's tools",
    weight: 8,
    cost: '1 gp',
    abilityUsed: 'wisdom',
  },
  {
    name: "Glassblower's Tools",
    category: "artisan's tools",
    weight: 5,
    cost: '30 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Jeweler's Tools",
    category: "artisan's tools",
    weight: 2,
    cost: '25 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Leatherworker's Tools",
    category: "artisan's tools",
    weight: 5,
    cost: '5 gp',
    abilityUsed: 'dexterity',
  },
  {
    name: "Mason's Tools",
    category: "artisan's tools",
    weight: 8,
    cost: '10 gp',
    abilityUsed: 'strength',
  },
  {
    name: "Painter's Supplies",
    category: "artisan's tools",
    weight: 5,
    cost: '10 gp',
    abilityUsed: 'dexterity',
  },
  {
    name: "Potter's Tools",
    category: "artisan's tools",
    weight: 3,
    cost: '10 gp',
    abilityUsed: 'dexterity',
  },
  {
    name: "Smith's Tools",
    category: "artisan's tools",
    weight: 8,
    cost: '20 gp',
    abilityUsed: 'strength',
  },
  {
    name: "Tinker's Tools",
    category: "artisan's tools",
    weight: 10,
    cost: '50 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Weaver's Tools",
    category: "artisan's tools",
    weight: 5,
    cost: '1 gp',
    abilityUsed: 'dexterity',
  },
  {
    name: "Woodcarver's Tools",
    category: "artisan's tools",
    weight: 5,
    cost: '1 gp',
    abilityUsed: 'dexterity',
  },
]

// Gaming Sets (4 types)
const GAMING_SETS: ToolData[] = [
  {
    name: 'Dice Set',
    category: 'gaming set',
    weight: 0,
    cost: '1 sp',
    abilityUsed: 'wisdom',
  },
  {
    name: 'Dragonchess Set',
    category: 'gaming set',
    weight: 0.5,
    cost: '1 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: 'Playing Card Set',
    category: 'gaming set',
    weight: 0,
    cost: '5 sp',
    abilityUsed: 'wisdom',
  },
  {
    name: 'Three-Dragon Ante Set',
    category: 'gaming set',
    weight: 0,
    cost: '1 gp',
    abilityUsed: 'wisdom',
  },
]

// Musical Instruments (10 types)
const MUSICAL_INSTRUMENTS: ToolData[] = [
  {
    name: 'Bagpipes',
    category: 'musical instrument',
    weight: 6,
    cost: '30 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Drum',
    category: 'musical instrument',
    weight: 3,
    cost: '6 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Dulcimer',
    category: 'musical instrument',
    weight: 10,
    cost: '25 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Flute',
    category: 'musical instrument',
    weight: 1,
    cost: '2 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Lute',
    category: 'musical instrument',
    weight: 2,
    cost: '35 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Lyre',
    category: 'musical instrument',
    weight: 2,
    cost: '30 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Horn',
    category: 'musical instrument',
    weight: 2,
    cost: '3 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Pan Flute',
    category: 'musical instrument',
    weight: 2,
    cost: '12 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Shawm',
    category: 'musical instrument',
    weight: 1,
    cost: '2 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Viol',
    category: 'musical instrument',
    weight: 1,
    cost: '30 gp',
    abilityUsed: 'charisma',
  },
]

// Other Tools (6 types)
const OTHER_TOOLS: ToolData[] = [
  {
    name: 'Disguise Kit',
    category: 'other',
    weight: 3,
    cost: '25 gp',
    abilityUsed: 'charisma',
  },
  {
    name: 'Forgery Kit',
    category: 'other',
    weight: 5,
    cost: '15 gp',
    abilityUsed: 'dexterity',
  },
  {
    name: 'Herbalism Kit',
    category: 'other',
    weight: 3,
    cost: '5 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Navigator's Tools",
    category: 'other',
    weight: 2,
    cost: '25 gp',
    abilityUsed: 'wisdom',
  },
  {
    name: "Poisoner's Kit",
    category: 'other',
    weight: 2,
    cost: '50 gp',
    abilityUsed: 'intelligence',
  },
  {
    name: "Thieves' Tools",
    category: 'other',
    weight: 1,
    cost: '25 gp',
    abilityUsed: 'dexterity',
  },
]

// Combine all tools into one array
export const TOOLS: ToolData[] = [
  ...ARTISANS_TOOLS,
  ...GAMING_SETS,
  ...MUSICAL_INSTRUMENTS,
  ...OTHER_TOOLS,
]

/**
 * Get a tool by name (case-insensitive)
 */
export function getToolByName(name: string): ToolData | undefined {
  return TOOLS.find((t) => t.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all tools by category
 */
export function getToolsByCategory(category: ToolCategory): ToolData[] {
  return TOOLS.filter((t) => t.category === category)
}

/**
 * Get all artisan's tools
 */
export function getArtisansTools(): ToolData[] {
  return getToolsByCategory("artisan's tools")
}

/**
 * Get all gaming sets
 */
export function getGamingSets(): ToolData[] {
  return getToolsByCategory('gaming set')
}

/**
 * Get all musical instruments
 */
export function getMusicalInstruments(): ToolData[] {
  return getToolsByCategory('musical instrument')
}

/**
 * Get all other tools (disguise kit, forgery kit, etc.)
 */
export function getOtherTools(): ToolData[] {
  return getToolsByCategory('other')
}
