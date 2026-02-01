export type GearCategory =
  | 'adventuring gear'
  | 'container'
  | 'ammunition'
  | 'arcane focus'
  | 'druidic focus'
  | 'holy symbol'

export interface GearData {
  name: string
  category: GearCategory
  weight: number // in pounds
  cost: string // e.g., "2 gp"
  description: string
}

// Containers (with capacity info in description)
const CONTAINERS: GearData[] = [
  {
    name: 'Backpack',
    category: 'container',
    weight: 5,
    cost: '2 gp',
    description: 'Capacity: 1 cubic foot/30 pounds of gear.',
  },
  {
    name: 'Barrel',
    category: 'container',
    weight: 70,
    cost: '2 gp',
    description: 'Capacity: 40 gallons liquid, 4 cubic feet solid.',
  },
  {
    name: 'Basket',
    category: 'container',
    weight: 2,
    cost: '4 sp',
    description: 'Capacity: 2 cubic feet/40 pounds of gear.',
  },
  {
    name: 'Bottle, glass',
    category: 'container',
    weight: 2,
    cost: '2 gp',
    description: 'Capacity: 1½ pints liquid.',
  },
  {
    name: 'Bucket',
    category: 'container',
    weight: 2,
    cost: '5 cp',
    description: 'Capacity: 3 gallons liquid, ½ cubic foot solid.',
  },
  {
    name: 'Case, crossbow bolt',
    category: 'container',
    weight: 1,
    cost: '1 gp',
    description: 'Capacity: 20 crossbow bolts.',
  },
  {
    name: 'Case, map or scroll',
    category: 'container',
    weight: 1,
    cost: '1 gp',
    description:
      'Capacity: 10 rolled-up sheets of paper or 5 rolled-up sheets of parchment.',
  },
  {
    name: 'Chest',
    category: 'container',
    weight: 25,
    cost: '5 gp',
    description: 'Capacity: 12 cubic feet/300 pounds of gear.',
  },
  {
    name: 'Flask',
    category: 'container',
    weight: 1,
    cost: '2 cp',
    description: 'Capacity: 1 pint liquid.',
  },
  {
    name: 'Jug',
    category: 'container',
    weight: 4,
    cost: '2 cp',
    description: 'Capacity: 1 gallon liquid.',
  },
  {
    name: 'Pot, iron',
    category: 'container',
    weight: 10,
    cost: '2 gp',
    description: 'Capacity: 1 gallon liquid.',
  },
  {
    name: 'Pouch',
    category: 'container',
    weight: 1,
    cost: '5 sp',
    description: 'Capacity: ⅕ cubic foot/6 pounds of gear.',
  },
  {
    name: 'Quiver',
    category: 'container',
    weight: 1,
    cost: '1 gp',
    description: 'Capacity: 20 arrows.',
  },
  {
    name: 'Sack',
    category: 'container',
    weight: 0.5,
    cost: '1 cp',
    description: 'Capacity: 1 cubic foot/30 pounds of gear.',
  },
  {
    name: 'Tankard',
    category: 'container',
    weight: 1,
    cost: '2 cp',
    description: 'Capacity: 1 pint liquid.',
  },
  {
    name: 'Vial',
    category: 'container',
    weight: 0,
    cost: '1 gp',
    description: 'Capacity: 4 ounces liquid.',
  },
  {
    name: 'Waterskin',
    category: 'container',
    weight: 5, // 5 lbs full
    cost: '2 sp',
    description: 'Capacity: 4 pints liquid.',
  },
]

// Ammunition
const AMMUNITION: GearData[] = [
  {
    name: 'Arrows (20)',
    category: 'ammunition',
    weight: 1,
    cost: '1 gp',
    description: 'Ammunition for bows.',
  },
  {
    name: 'Blowgun Needles (50)',
    category: 'ammunition',
    weight: 1,
    cost: '1 gp',
    description: 'Ammunition for blowguns.',
  },
  {
    name: 'Crossbow Bolts (20)',
    category: 'ammunition',
    weight: 1.5,
    cost: '1 gp',
    description: 'Ammunition for crossbows.',
  },
  {
    name: 'Sling Bullets (20)',
    category: 'ammunition',
    weight: 1.5,
    cost: '4 cp',
    description: 'Ammunition for slings.',
  },
]

// Arcane Focuses
const ARCANE_FOCUSES: GearData[] = [
  {
    name: 'Crystal',
    category: 'arcane focus',
    weight: 1,
    cost: '10 gp',
    description: 'An arcane focus for casting spells.',
  },
  {
    name: 'Orb',
    category: 'arcane focus',
    weight: 3,
    cost: '20 gp',
    description: 'An arcane focus for casting spells.',
  },
  {
    name: 'Rod',
    category: 'arcane focus',
    weight: 2,
    cost: '10 gp',
    description: 'An arcane focus for casting spells.',
  },
  {
    name: 'Staff',
    category: 'arcane focus',
    weight: 4,
    cost: '5 gp',
    description:
      'An arcane focus for casting spells. Can be used as a quarterstaff.',
  },
  {
    name: 'Wand',
    category: 'arcane focus',
    weight: 1,
    cost: '10 gp',
    description: 'An arcane focus for casting spells.',
  },
]

// Druidic Focuses
const DRUIDIC_FOCUSES: GearData[] = [
  {
    name: 'Sprig of Mistletoe',
    category: 'druidic focus',
    weight: 0,
    cost: '1 gp',
    description: 'A druidic focus for casting spells.',
  },
  {
    name: 'Totem',
    category: 'druidic focus',
    weight: 0,
    cost: '1 gp',
    description: 'A druidic focus for casting spells.',
  },
  {
    name: 'Wooden Staff',
    category: 'druidic focus',
    weight: 4,
    cost: '5 gp',
    description:
      'A druidic focus for casting spells. Can be used as a quarterstaff.',
  },
  {
    name: 'Yew Wand',
    category: 'druidic focus',
    weight: 1,
    cost: '10 gp',
    description: 'A druidic focus for casting spells.',
  },
]

// Holy Symbols
const HOLY_SYMBOLS: GearData[] = [
  {
    name: 'Amulet',
    category: 'holy symbol',
    weight: 1,
    cost: '5 gp',
    description: 'A holy symbol for casting divine spells.',
  },
  {
    name: 'Emblem',
    category: 'holy symbol',
    weight: 0,
    cost: '5 gp',
    description: 'A holy symbol emblazoned on a shield or worn on a surcoat.',
  },
  {
    name: 'Reliquary',
    category: 'holy symbol',
    weight: 2,
    cost: '5 gp',
    description:
      'A holy symbol in the form of a tiny box holding a sacred relic.',
  },
]

// Common Adventuring Gear
const ADVENTURING_GEAR: GearData[] = [
  {
    name: 'Abacus',
    category: 'adventuring gear',
    weight: 2,
    cost: '2 gp',
    description: 'A calculating tool.',
  },
  {
    name: 'Acid (vial)',
    category: 'adventuring gear',
    weight: 1,
    cost: '25 gp',
    description:
      'As an action, splash contents onto a creature within 5 feet or throw up to 20 feet. On hit, target takes 2d6 acid damage.',
  },
  {
    name: "Alchemist's Fire (flask)",
    category: 'adventuring gear',
    weight: 1,
    cost: '50 gp',
    description:
      'As an action, throw up to 20 feet. On hit, target takes 1d4 fire damage at the start of each of its turns. Creature can end damage with DC 10 Dex check.',
  },
  {
    name: 'Antitoxin (vial)',
    category: 'adventuring gear',
    weight: 0,
    cost: '50 gp',
    description: 'Advantage on saving throws against poison for 1 hour.',
  },
  {
    name: 'Ball Bearings (bag of 1,000)',
    category: 'adventuring gear',
    weight: 2,
    cost: '1 gp',
    description:
      'Cover 10-foot square. Creatures moving through must succeed DC 10 Dex save or fall prone.',
  },
  {
    name: 'Bedroll',
    category: 'adventuring gear',
    weight: 7,
    cost: '1 gp',
    description: 'A portable sleeping bag.',
  },
  {
    name: 'Bell',
    category: 'adventuring gear',
    weight: 0,
    cost: '1 gp',
    description: 'A small bell that can be rung.',
  },
  {
    name: 'Blanket',
    category: 'adventuring gear',
    weight: 3,
    cost: '5 sp',
    description: 'A thick woolen blanket.',
  },
  {
    name: 'Block and Tackle',
    category: 'adventuring gear',
    weight: 5,
    cost: '1 gp',
    description: 'A set of pulleys with a cable. Allows hoisting up to 4x weight.',
  },
  {
    name: 'Book',
    category: 'adventuring gear',
    weight: 5,
    cost: '25 gp',
    description: 'A blank book with 80 pages.',
  },
  {
    name: 'Caltrops (bag of 20)',
    category: 'adventuring gear',
    weight: 2,
    cost: '1 gp',
    description:
      'Cover 5-foot square. Creature that enters takes 1 piercing damage and stops moving. DC 15 Dex save negates.',
  },
  {
    name: 'Candle',
    category: 'adventuring gear',
    weight: 0,
    cost: '1 cp',
    description: 'Sheds bright light in 5-foot radius and dim light for 5 feet beyond. Burns for 1 hour.',
  },
  {
    name: 'Chain (10 feet)',
    category: 'adventuring gear',
    weight: 10,
    cost: '5 gp',
    description: 'Has 10 HP. DC 20 Strength check to break.',
  },
  {
    name: 'Chalk (1 piece)',
    category: 'adventuring gear',
    weight: 0,
    cost: '1 cp',
    description: 'For marking surfaces.',
  },
  {
    name: 'Climber\'s Kit',
    category: 'adventuring gear',
    weight: 12,
    cost: '25 gp',
    description:
      'Includes pitons, boot tips, gloves, and harness. Anchor to prevent falling more than 25 feet.',
  },
  {
    name: 'Clothes, Common',
    category: 'adventuring gear',
    weight: 3,
    cost: '5 sp',
    description: 'Common everyday clothing.',
  },
  {
    name: 'Clothes, Costume',
    category: 'adventuring gear',
    weight: 4,
    cost: '5 gp',
    description: 'A costume for performances or disguises.',
  },
  {
    name: 'Clothes, Fine',
    category: 'adventuring gear',
    weight: 6,
    cost: '15 gp',
    description: 'Fine clothing suitable for noble courts.',
  },
  {
    name: 'Clothes, Traveler\'s',
    category: 'adventuring gear',
    weight: 4,
    cost: '2 gp',
    description: 'Durable clothing for travel.',
  },
  {
    name: 'Component Pouch',
    category: 'adventuring gear',
    weight: 2,
    cost: '25 gp',
    description:
      'A small, watertight leather belt pouch with compartments for spell components.',
  },
  {
    name: 'Crowbar',
    category: 'adventuring gear',
    weight: 5,
    cost: '2 gp',
    description: 'Grants advantage on Strength checks where leverage can be applied.',
  },
  {
    name: 'Fishing Tackle',
    category: 'adventuring gear',
    weight: 4,
    cost: '1 gp',
    description: 'Includes fishing rod, silk line, hooks, floats, sinkers, and lures.',
  },
  {
    name: 'Grappling Hook',
    category: 'adventuring gear',
    weight: 4,
    cost: '2 gp',
    description: 'An iron hook for climbing.',
  },
  {
    name: 'Hammer',
    category: 'adventuring gear',
    weight: 3,
    cost: '1 gp',
    description: 'A standard hammer.',
  },
  {
    name: 'Hammer, Sledge',
    category: 'adventuring gear',
    weight: 10,
    cost: '2 gp',
    description: 'A two-handed sledgehammer.',
  },
  {
    name: 'Healer\'s Kit',
    category: 'adventuring gear',
    weight: 3,
    cost: '5 gp',
    description:
      'Has 10 uses. Stabilize a creature at 0 HP without a Wisdom (Medicine) check.',
  },
  {
    name: 'Holy Water (flask)',
    category: 'adventuring gear',
    weight: 1,
    cost: '25 gp',
    description:
      'As an action, splash contents on creature within 5 feet or throw up to 20 feet. Fiends and undead take 2d6 radiant damage.',
  },
  {
    name: 'Hourglass',
    category: 'adventuring gear',
    weight: 1,
    cost: '25 gp',
    description: 'Measures 1 hour of time.',
  },
  {
    name: 'Hunting Trap',
    category: 'adventuring gear',
    weight: 25,
    cost: '5 gp',
    description:
      'Creature stepping on trap takes 1d4 piercing damage and must make DC 13 Str save or stop moving.',
  },
  {
    name: 'Ink (1 ounce bottle)',
    category: 'adventuring gear',
    weight: 0,
    cost: '10 gp',
    description: 'Black ink for writing.',
  },
  {
    name: 'Ink Pen',
    category: 'adventuring gear',
    weight: 0,
    cost: '2 cp',
    description: 'A pen for writing with ink.',
  },
  {
    name: 'Ladder (10-foot)',
    category: 'adventuring gear',
    weight: 25,
    cost: '1 sp',
    description: 'A 10-foot wooden ladder.',
  },
  {
    name: 'Lamp',
    category: 'adventuring gear',
    weight: 1,
    cost: '5 sp',
    description:
      'Sheds bright light in 15-foot radius and dim light for 15 feet beyond. Burns for 6 hours on 1 pint of oil.',
  },
  {
    name: 'Lantern, Bullseye',
    category: 'adventuring gear',
    weight: 2,
    cost: '10 gp',
    description:
      'Sheds bright light in 60-foot cone and dim light for 60 feet beyond. Burns for 6 hours on 1 pint of oil.',
  },
  {
    name: 'Lantern, Hooded',
    category: 'adventuring gear',
    weight: 2,
    cost: '5 gp',
    description:
      'Sheds bright light in 30-foot radius and dim light for 30 feet beyond. Burns for 6 hours on 1 pint of oil. Can be dimmed to 5 feet.',
  },
  {
    name: 'Lock',
    category: 'adventuring gear',
    weight: 1,
    cost: '10 gp',
    description: 'A basic lock with a key. DC 15 to pick with thieves\' tools.',
  },
  {
    name: 'Magnifying Glass',
    category: 'adventuring gear',
    weight: 0,
    cost: '100 gp',
    description:
      'Grants advantage on ability checks to appraise or inspect small items. Can start fires with sunlight.',
  },
  {
    name: 'Manacles',
    category: 'adventuring gear',
    weight: 6,
    cost: '2 gp',
    description: 'DC 20 to escape or break. Lock can be picked with DC 15 thieves\' tools check.',
  },
  {
    name: 'Mess Kit',
    category: 'adventuring gear',
    weight: 1,
    cost: '2 sp',
    description: 'A tin box containing cup, utensils, and cookware.',
  },
  {
    name: 'Mirror, Steel',
    category: 'adventuring gear',
    weight: 0.5,
    cost: '5 gp',
    description: 'A small, handheld steel mirror.',
  },
  {
    name: 'Oil (flask)',
    category: 'adventuring gear',
    weight: 1,
    cost: '1 sp',
    description:
      'Splashed on creature and ignited deals 5 fire damage. Burns for 2 rounds. Covers 5-foot square if poured.',
  },
  {
    name: 'Paper (one sheet)',
    category: 'adventuring gear',
    weight: 0,
    cost: '2 sp',
    description: 'A sheet of paper.',
  },
  {
    name: 'Parchment (one sheet)',
    category: 'adventuring gear',
    weight: 0,
    cost: '1 sp',
    description: 'A sheet of parchment.',
  },
  {
    name: 'Perfume (vial)',
    category: 'adventuring gear',
    weight: 0,
    cost: '5 gp',
    description: 'A vial of perfume.',
  },
  {
    name: 'Pick, Miner\'s',
    category: 'adventuring gear',
    weight: 10,
    cost: '2 gp',
    description: 'A miner\'s pickaxe.',
  },
  {
    name: 'Piton',
    category: 'adventuring gear',
    weight: 0.25,
    cost: '5 cp',
    description: 'A metal spike for climbing.',
  },
  {
    name: 'Poison, Basic (vial)',
    category: 'adventuring gear',
    weight: 0,
    cost: '100 gp',
    description:
      'Apply to one weapon or three pieces of ammunition. Target takes 1d4 poison damage. Dries after 1 minute.',
  },
  {
    name: 'Pole (10-foot)',
    category: 'adventuring gear',
    weight: 7,
    cost: '5 cp',
    description: 'A 10-foot wooden pole.',
  },
  {
    name: 'Rations (1 day)',
    category: 'adventuring gear',
    weight: 2,
    cost: '5 sp',
    description: 'Dry foods suitable for extended travel: jerky, dried fruit, hardtack.',
  },
  {
    name: 'Robes',
    category: 'adventuring gear',
    weight: 4,
    cost: '1 gp',
    description: 'A set of robes.',
  },
  {
    name: 'Rope, Hempen (50 feet)',
    category: 'adventuring gear',
    weight: 10,
    cost: '1 gp',
    description: 'Has 2 HP. DC 17 Strength check to burst.',
  },
  {
    name: 'Rope, Silk (50 feet)',
    category: 'adventuring gear',
    weight: 5,
    cost: '10 gp',
    description: 'Has 2 HP. DC 17 Strength check to burst.',
  },
  {
    name: 'Scale, Merchant\'s',
    category: 'adventuring gear',
    weight: 3,
    cost: '5 gp',
    description:
      'A small balance with pans and weights. Measures precise weight of small objects.',
  },
  {
    name: 'Sealing Wax',
    category: 'adventuring gear',
    weight: 0,
    cost: '5 sp',
    description: 'Wax for sealing letters and documents.',
  },
  {
    name: 'Shovel',
    category: 'adventuring gear',
    weight: 5,
    cost: '2 gp',
    description: 'A standard shovel.',
  },
  {
    name: 'Signal Whistle',
    category: 'adventuring gear',
    weight: 0,
    cost: '5 cp',
    description: 'A whistle that can be heard from 600 feet away.',
  },
  {
    name: 'Signet Ring',
    category: 'adventuring gear',
    weight: 0,
    cost: '5 gp',
    description: 'A ring bearing a personal seal.',
  },
  {
    name: 'Soap',
    category: 'adventuring gear',
    weight: 0,
    cost: '2 cp',
    description: 'A bar of soap.',
  },
  {
    name: 'Spellbook',
    category: 'adventuring gear',
    weight: 3,
    cost: '50 gp',
    description: 'A leather-bound book with 100 blank vellum pages for recording spells.',
  },
  {
    name: 'Spikes, Iron (10)',
    category: 'adventuring gear',
    weight: 5,
    cost: '1 gp',
    description: 'Iron spikes for wedging doors, climbing, or other uses.',
  },
  {
    name: 'Spyglass',
    category: 'adventuring gear',
    weight: 1,
    cost: '1,000 gp',
    description: 'Objects viewed through the spyglass are magnified to twice their size.',
  },
  {
    name: 'Tent, Two-Person',
    category: 'adventuring gear',
    weight: 20,
    cost: '2 gp',
    description: 'A simple canvas tent that sleeps two.',
  },
  {
    name: 'Tinderbox',
    category: 'adventuring gear',
    weight: 1,
    cost: '5 sp',
    description:
      'Contains flint, fire steel, and tinder. Light a torch or anything with exposed fuel as an action.',
  },
  {
    name: 'Torch',
    category: 'adventuring gear',
    weight: 1,
    cost: '1 cp',
    description:
      'Sheds bright light in 20-foot radius and dim light for 20 feet beyond. Burns for 1 hour. Deals 1 fire damage as improvised weapon.',
  },
  {
    name: 'Whetstone',
    category: 'adventuring gear',
    weight: 1,
    cost: '1 cp',
    description: 'A stone for sharpening blades.',
  },
]

// Combine all gear into one array
export const GEAR: GearData[] = [
  ...CONTAINERS,
  ...AMMUNITION,
  ...ARCANE_FOCUSES,
  ...DRUIDIC_FOCUSES,
  ...HOLY_SYMBOLS,
  ...ADVENTURING_GEAR,
]

/**
 * Get gear by name (case-insensitive)
 */
export function getGearByName(name: string): GearData | undefined {
  return GEAR.find((g) => g.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all gear by category
 */
export function getGearByCategory(category: GearCategory): GearData[] {
  return GEAR.filter((g) => g.category === category)
}

/**
 * Get all containers
 */
export function getContainers(): GearData[] {
  return getGearByCategory('container')
}

/**
 * Get all ammunition
 */
export function getAmmunition(): GearData[] {
  return getGearByCategory('ammunition')
}

/**
 * Get all arcane focuses
 */
export function getArcaneFocuses(): GearData[] {
  return getGearByCategory('arcane focus')
}

/**
 * Get all druidic focuses
 */
export function getDruidicFocuses(): GearData[] {
  return getGearByCategory('druidic focus')
}

/**
 * Get all holy symbols
 */
export function getHolySymbols(): GearData[] {
  return getGearByCategory('holy symbol')
}

/**
 * Get all adventuring gear (excludes containers, ammunition, and focuses)
 */
export function getAdventuringGear(): GearData[] {
  return getGearByCategory('adventuring gear')
}

/**
 * Get all spellcasting focuses (arcane, druidic, and holy symbols)
 */
export function getSpellcastingFocuses(): GearData[] {
  return GEAR.filter((g) =>
    ['arcane focus', 'druidic focus', 'holy symbol'].includes(g.category)
  )
}
