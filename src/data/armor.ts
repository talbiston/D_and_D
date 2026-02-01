export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield'

// DexBonus can be:
// - true: full Dex modifier added
// - false: no Dex modifier (heavy armor)
// - 'max2': Dex modifier added, max +2 (medium armor)
export type DexBonus = boolean | 'max2'

export interface ArmorData {
  name: string
  category: ArmorCategory
  baseAC: number
  dexBonus: DexBonus
  minStrength: number // 0 means no minimum strength
  stealthDisadvantage: boolean
  weight: number // in pounds
  cost: string // e.g., "10 gp"
}

// Light Armor
const LIGHT_ARMOR: ArmorData[] = [
  {
    name: 'Padded',
    category: 'light',
    baseAC: 11,
    dexBonus: true,
    minStrength: 0,
    stealthDisadvantage: true,
    weight: 8,
    cost: '5 gp',
  },
  {
    name: 'Leather',
    category: 'light',
    baseAC: 11,
    dexBonus: true,
    minStrength: 0,
    stealthDisadvantage: false,
    weight: 10,
    cost: '10 gp',
  },
  {
    name: 'Studded Leather',
    category: 'light',
    baseAC: 12,
    dexBonus: true,
    minStrength: 0,
    stealthDisadvantage: false,
    weight: 13,
    cost: '45 gp',
  },
]

// Medium Armor
const MEDIUM_ARMOR: ArmorData[] = [
  {
    name: 'Hide',
    category: 'medium',
    baseAC: 12,
    dexBonus: 'max2',
    minStrength: 0,
    stealthDisadvantage: false,
    weight: 12,
    cost: '10 gp',
  },
  {
    name: 'Chain Shirt',
    category: 'medium',
    baseAC: 13,
    dexBonus: 'max2',
    minStrength: 0,
    stealthDisadvantage: false,
    weight: 20,
    cost: '50 gp',
  },
  {
    name: 'Scale Mail',
    category: 'medium',
    baseAC: 14,
    dexBonus: 'max2',
    minStrength: 0,
    stealthDisadvantage: true,
    weight: 45,
    cost: '50 gp',
  },
  {
    name: 'Breastplate',
    category: 'medium',
    baseAC: 14,
    dexBonus: 'max2',
    minStrength: 0,
    stealthDisadvantage: false,
    weight: 20,
    cost: '400 gp',
  },
  {
    name: 'Half Plate',
    category: 'medium',
    baseAC: 15,
    dexBonus: 'max2',
    minStrength: 0,
    stealthDisadvantage: true,
    weight: 40,
    cost: '750 gp',
  },
]

// Heavy Armor
const HEAVY_ARMOR: ArmorData[] = [
  {
    name: 'Ring Mail',
    category: 'heavy',
    baseAC: 14,
    dexBonus: false,
    minStrength: 0,
    stealthDisadvantage: true,
    weight: 40,
    cost: '30 gp',
  },
  {
    name: 'Chain Mail',
    category: 'heavy',
    baseAC: 16,
    dexBonus: false,
    minStrength: 13,
    stealthDisadvantage: true,
    weight: 55,
    cost: '75 gp',
  },
  {
    name: 'Splint',
    category: 'heavy',
    baseAC: 17,
    dexBonus: false,
    minStrength: 15,
    stealthDisadvantage: true,
    weight: 60,
    cost: '200 gp',
  },
  {
    name: 'Plate',
    category: 'heavy',
    baseAC: 18,
    dexBonus: false,
    minStrength: 15,
    stealthDisadvantage: true,
    weight: 65,
    cost: '1,500 gp',
  },
]

// Shields
const SHIELDS: ArmorData[] = [
  {
    name: 'Shield',
    category: 'shield',
    baseAC: 2, // +2 AC bonus
    dexBonus: false, // Not applicable to shields
    minStrength: 0,
    stealthDisadvantage: false,
    weight: 6,
    cost: '10 gp',
  },
]

// Combine all armor into one array
export const ARMOR: ArmorData[] = [
  ...LIGHT_ARMOR,
  ...MEDIUM_ARMOR,
  ...HEAVY_ARMOR,
  ...SHIELDS,
]

/**
 * Get armor by name (case-insensitive)
 */
export function getArmorByName(name: string): ArmorData | undefined {
  return ARMOR.find((a) => a.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all armor by category (light, medium, heavy, or shield)
 */
export function getArmorByCategory(category: ArmorCategory): ArmorData[] {
  return ARMOR.filter((a) => a.category === category)
}

/**
 * Get all light armor
 */
export function getLightArmor(): ArmorData[] {
  return getArmorByCategory('light')
}

/**
 * Get all medium armor
 */
export function getMediumArmor(): ArmorData[] {
  return getArmorByCategory('medium')
}

/**
 * Get all heavy armor
 */
export function getHeavyArmor(): ArmorData[] {
  return getArmorByCategory('heavy')
}

/**
 * Get all shields
 */
export function getShields(): ArmorData[] {
  return getArmorByCategory('shield')
}

/**
 * Get all body armor (excludes shields)
 */
export function getBodyArmor(): ArmorData[] {
  return ARMOR.filter((a) => a.category !== 'shield')
}
