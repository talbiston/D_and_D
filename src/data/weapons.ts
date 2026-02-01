import type { DamageType, WeaponProperty } from '../types'

export type WeaponCategory = 'simple' | 'martial'
export type WeaponType = 'melee' | 'ranged'

export interface WeaponData {
  name: string
  category: WeaponCategory
  type: WeaponType
  damage: string // e.g., "1d8"
  damageType: DamageType
  weight: number // in pounds
  cost: string // e.g., "15 gp"
  properties: WeaponProperty[]
  range?: { normal: number; long: number } // for ranged/thrown weapons
  versatileDamage?: string // damage when used two-handed
}

// Simple Melee Weapons
const SIMPLE_MELEE_WEAPONS: WeaponData[] = [
  {
    name: 'Club',
    category: 'simple',
    type: 'melee',
    damage: '1d4',
    damageType: 'bludgeoning',
    weight: 2,
    cost: '1 sp',
    properties: ['light'],
  },
  {
    name: 'Dagger',
    category: 'simple',
    type: 'melee',
    damage: '1d4',
    damageType: 'piercing',
    weight: 1,
    cost: '2 gp',
    properties: ['finesse', 'light', 'thrown'],
    range: { normal: 20, long: 60 },
  },
  {
    name: 'Greatclub',
    category: 'simple',
    type: 'melee',
    damage: '1d8',
    damageType: 'bludgeoning',
    weight: 10,
    cost: '2 sp',
    properties: ['two-handed'],
  },
  {
    name: 'Handaxe',
    category: 'simple',
    type: 'melee',
    damage: '1d6',
    damageType: 'slashing',
    weight: 2,
    cost: '5 gp',
    properties: ['light', 'thrown'],
    range: { normal: 20, long: 60 },
  },
  {
    name: 'Javelin',
    category: 'simple',
    type: 'melee',
    damage: '1d6',
    damageType: 'piercing',
    weight: 2,
    cost: '5 sp',
    properties: ['thrown'],
    range: { normal: 30, long: 120 },
  },
  {
    name: 'Light Hammer',
    category: 'simple',
    type: 'melee',
    damage: '1d4',
    damageType: 'bludgeoning',
    weight: 2,
    cost: '2 gp',
    properties: ['light', 'thrown'],
    range: { normal: 20, long: 60 },
  },
  {
    name: 'Mace',
    category: 'simple',
    type: 'melee',
    damage: '1d6',
    damageType: 'bludgeoning',
    weight: 4,
    cost: '5 gp',
    properties: [],
  },
  {
    name: 'Quarterstaff',
    category: 'simple',
    type: 'melee',
    damage: '1d6',
    damageType: 'bludgeoning',
    weight: 4,
    cost: '2 sp',
    properties: ['versatile'],
    versatileDamage: '1d8',
  },
  {
    name: 'Sickle',
    category: 'simple',
    type: 'melee',
    damage: '1d4',
    damageType: 'slashing',
    weight: 2,
    cost: '1 gp',
    properties: ['light'],
  },
  {
    name: 'Spear',
    category: 'simple',
    type: 'melee',
    damage: '1d6',
    damageType: 'piercing',
    weight: 3,
    cost: '1 gp',
    properties: ['thrown', 'versatile'],
    range: { normal: 20, long: 60 },
    versatileDamage: '1d8',
  },
]

// Simple Ranged Weapons
const SIMPLE_RANGED_WEAPONS: WeaponData[] = [
  {
    name: 'Light Crossbow',
    category: 'simple',
    type: 'ranged',
    damage: '1d8',
    damageType: 'piercing',
    weight: 5,
    cost: '25 gp',
    properties: ['ammunition', 'loading', 'two-handed'],
    range: { normal: 80, long: 320 },
  },
  {
    name: 'Dart',
    category: 'simple',
    type: 'ranged',
    damage: '1d4',
    damageType: 'piercing',
    weight: 0.25,
    cost: '5 cp',
    properties: ['finesse', 'thrown'],
    range: { normal: 20, long: 60 },
  },
  {
    name: 'Shortbow',
    category: 'simple',
    type: 'ranged',
    damage: '1d6',
    damageType: 'piercing',
    weight: 2,
    cost: '25 gp',
    properties: ['ammunition', 'two-handed'],
    range: { normal: 80, long: 320 },
  },
  {
    name: 'Sling',
    category: 'simple',
    type: 'ranged',
    damage: '1d4',
    damageType: 'bludgeoning',
    weight: 0,
    cost: '1 sp',
    properties: ['ammunition'],
    range: { normal: 30, long: 120 },
  },
]

// Martial Melee Weapons
const MARTIAL_MELEE_WEAPONS: WeaponData[] = [
  {
    name: 'Battleaxe',
    category: 'martial',
    type: 'melee',
    damage: '1d8',
    damageType: 'slashing',
    weight: 4,
    cost: '10 gp',
    properties: ['versatile'],
    versatileDamage: '1d10',
  },
  {
    name: 'Flail',
    category: 'martial',
    type: 'melee',
    damage: '1d8',
    damageType: 'bludgeoning',
    weight: 2,
    cost: '10 gp',
    properties: [],
  },
  {
    name: 'Glaive',
    category: 'martial',
    type: 'melee',
    damage: '1d10',
    damageType: 'slashing',
    weight: 6,
    cost: '20 gp',
    properties: ['heavy', 'reach', 'two-handed'],
  },
  {
    name: 'Greataxe',
    category: 'martial',
    type: 'melee',
    damage: '1d12',
    damageType: 'slashing',
    weight: 7,
    cost: '30 gp',
    properties: ['heavy', 'two-handed'],
  },
  {
    name: 'Greatsword',
    category: 'martial',
    type: 'melee',
    damage: '2d6',
    damageType: 'slashing',
    weight: 6,
    cost: '50 gp',
    properties: ['heavy', 'two-handed'],
  },
  {
    name: 'Halberd',
    category: 'martial',
    type: 'melee',
    damage: '1d10',
    damageType: 'slashing',
    weight: 6,
    cost: '20 gp',
    properties: ['heavy', 'reach', 'two-handed'],
  },
  {
    name: 'Lance',
    category: 'martial',
    type: 'melee',
    damage: '1d12',
    damageType: 'piercing',
    weight: 6,
    cost: '10 gp',
    properties: ['reach'],
  },
  {
    name: 'Longsword',
    category: 'martial',
    type: 'melee',
    damage: '1d8',
    damageType: 'slashing',
    weight: 3,
    cost: '15 gp',
    properties: ['versatile'],
    versatileDamage: '1d10',
  },
  {
    name: 'Maul',
    category: 'martial',
    type: 'melee',
    damage: '2d6',
    damageType: 'bludgeoning',
    weight: 10,
    cost: '10 gp',
    properties: ['heavy', 'two-handed'],
  },
  {
    name: 'Morningstar',
    category: 'martial',
    type: 'melee',
    damage: '1d8',
    damageType: 'piercing',
    weight: 4,
    cost: '15 gp',
    properties: [],
  },
  {
    name: 'Pike',
    category: 'martial',
    type: 'melee',
    damage: '1d10',
    damageType: 'piercing',
    weight: 18,
    cost: '5 gp',
    properties: ['heavy', 'reach', 'two-handed'],
  },
  {
    name: 'Rapier',
    category: 'martial',
    type: 'melee',
    damage: '1d8',
    damageType: 'piercing',
    weight: 2,
    cost: '25 gp',
    properties: ['finesse'],
  },
  {
    name: 'Scimitar',
    category: 'martial',
    type: 'melee',
    damage: '1d6',
    damageType: 'slashing',
    weight: 3,
    cost: '25 gp',
    properties: ['finesse', 'light'],
  },
  {
    name: 'Shortsword',
    category: 'martial',
    type: 'melee',
    damage: '1d6',
    damageType: 'piercing',
    weight: 2,
    cost: '10 gp',
    properties: ['finesse', 'light'],
  },
  {
    name: 'Trident',
    category: 'martial',
    type: 'melee',
    damage: '1d6',
    damageType: 'piercing',
    weight: 4,
    cost: '5 gp',
    properties: ['thrown', 'versatile'],
    range: { normal: 20, long: 60 },
    versatileDamage: '1d8',
  },
  {
    name: 'War Pick',
    category: 'martial',
    type: 'melee',
    damage: '1d8',
    damageType: 'piercing',
    weight: 2,
    cost: '5 gp',
    properties: [],
  },
  {
    name: 'Warhammer',
    category: 'martial',
    type: 'melee',
    damage: '1d8',
    damageType: 'bludgeoning',
    weight: 2,
    cost: '15 gp',
    properties: ['versatile'],
    versatileDamage: '1d10',
  },
  {
    name: 'Whip',
    category: 'martial',
    type: 'melee',
    damage: '1d4',
    damageType: 'slashing',
    weight: 3,
    cost: '2 gp',
    properties: ['finesse', 'reach'],
  },
]

// Martial Ranged Weapons
const MARTIAL_RANGED_WEAPONS: WeaponData[] = [
  {
    name: 'Blowgun',
    category: 'martial',
    type: 'ranged',
    damage: '1',
    damageType: 'piercing',
    weight: 1,
    cost: '10 gp',
    properties: ['ammunition', 'loading'],
    range: { normal: 25, long: 100 },
  },
  {
    name: 'Hand Crossbow',
    category: 'martial',
    type: 'ranged',
    damage: '1d6',
    damageType: 'piercing',
    weight: 3,
    cost: '75 gp',
    properties: ['ammunition', 'light', 'loading'],
    range: { normal: 30, long: 120 },
  },
  {
    name: 'Heavy Crossbow',
    category: 'martial',
    type: 'ranged',
    damage: '1d10',
    damageType: 'piercing',
    weight: 18,
    cost: '50 gp',
    properties: ['ammunition', 'heavy', 'loading', 'two-handed'],
    range: { normal: 100, long: 400 },
  },
  {
    name: 'Longbow',
    category: 'martial',
    type: 'ranged',
    damage: '1d8',
    damageType: 'piercing',
    weight: 2,
    cost: '50 gp',
    properties: ['ammunition', 'heavy', 'two-handed'],
    range: { normal: 150, long: 600 },
  },
  {
    name: 'Net',
    category: 'martial',
    type: 'ranged',
    damage: '0',
    damageType: 'bludgeoning',
    weight: 3,
    cost: '1 gp',
    properties: ['thrown'],
    range: { normal: 5, long: 15 },
  },
]

// Combine all weapons into one array
export const WEAPONS: WeaponData[] = [
  ...SIMPLE_MELEE_WEAPONS,
  ...SIMPLE_RANGED_WEAPONS,
  ...MARTIAL_MELEE_WEAPONS,
  ...MARTIAL_RANGED_WEAPONS,
]

/**
 * Get a weapon by name (case-insensitive)
 */
export function getWeaponByName(name: string): WeaponData | undefined {
  return WEAPONS.find((w) => w.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all weapons by category (simple or martial)
 */
export function getWeaponsByCategory(category: WeaponCategory): WeaponData[] {
  return WEAPONS.filter((w) => w.category === category)
}

/**
 * Get all weapons that have a specific property
 */
export function getWeaponsByProperty(property: WeaponProperty): WeaponData[] {
  return WEAPONS.filter((w) => w.properties.includes(property))
}

/**
 * Get all weapons by type (melee or ranged)
 */
export function getWeaponsByType(type: WeaponType): WeaponData[] {
  return WEAPONS.filter((w) => w.type === type)
}

/**
 * Get all simple weapons
 */
export function getSimpleWeapons(): WeaponData[] {
  return getWeaponsByCategory('simple')
}

/**
 * Get all martial weapons
 */
export function getMartialWeapons(): WeaponData[] {
  return getWeaponsByCategory('martial')
}
