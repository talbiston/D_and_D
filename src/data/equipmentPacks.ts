export interface PackItem {
  item: string
  quantity: number
}

export interface EquipmentPack {
  name: string
  cost: string // e.g., "12 gp"
  contents: PackItem[]
}

// Burglar's Pack (16 gp)
const BURGLARS_PACK: EquipmentPack = {
  name: "Burglar's Pack",
  cost: '16 gp',
  contents: [
    { item: 'Backpack', quantity: 1 },
    { item: 'Ball Bearings (bag of 1,000)', quantity: 1 },
    { item: 'Bell', quantity: 1 },
    { item: 'Candle', quantity: 5 },
    { item: 'Crowbar', quantity: 1 },
    { item: 'Hammer', quantity: 1 },
    { item: 'Piton', quantity: 10 },
    { item: 'Lantern, Hooded', quantity: 1 },
    { item: 'Oil (flask)', quantity: 2 },
    { item: 'Rations (1 day)', quantity: 5 },
    { item: 'Tinderbox', quantity: 1 },
    { item: 'Waterskin', quantity: 1 },
    { item: 'Rope, Hempen (50 feet)', quantity: 1 },
  ],
}

// Diplomat's Pack (39 gp)
const DIPLOMATS_PACK: EquipmentPack = {
  name: "Diplomat's Pack",
  cost: '39 gp',
  contents: [
    { item: 'Chest', quantity: 1 },
    { item: 'Case, map or scroll', quantity: 2 },
    { item: 'Clothes, Fine', quantity: 1 },
    { item: 'Ink (1 ounce bottle)', quantity: 1 },
    { item: 'Ink Pen', quantity: 1 },
    { item: 'Lamp', quantity: 1 },
    { item: 'Oil (flask)', quantity: 2 },
    { item: 'Paper (one sheet)', quantity: 5 },
    { item: 'Perfume (vial)', quantity: 1 },
    { item: 'Sealing Wax', quantity: 1 },
    { item: 'Soap', quantity: 1 },
  ],
}

// Dungeoneer's Pack (12 gp)
const DUNGEONEERS_PACK: EquipmentPack = {
  name: "Dungeoneer's Pack",
  cost: '12 gp',
  contents: [
    { item: 'Backpack', quantity: 1 },
    { item: 'Crowbar', quantity: 1 },
    { item: 'Hammer', quantity: 1 },
    { item: 'Piton', quantity: 10 },
    { item: 'Torch', quantity: 10 },
    { item: 'Tinderbox', quantity: 1 },
    { item: 'Rations (1 day)', quantity: 10 },
    { item: 'Waterskin', quantity: 1 },
    { item: 'Rope, Hempen (50 feet)', quantity: 1 },
  ],
}

// Entertainer's Pack (40 gp)
const ENTERTAINERS_PACK: EquipmentPack = {
  name: "Entertainer's Pack",
  cost: '40 gp',
  contents: [
    { item: 'Backpack', quantity: 1 },
    { item: 'Bedroll', quantity: 1 },
    { item: 'Clothes, Costume', quantity: 2 },
    { item: 'Candle', quantity: 5 },
    { item: 'Rations (1 day)', quantity: 5 },
    { item: 'Waterskin', quantity: 1 },
    { item: 'Disguise Kit', quantity: 1 },
  ],
}

// Explorer's Pack (10 gp)
const EXPLORERS_PACK: EquipmentPack = {
  name: "Explorer's Pack",
  cost: '10 gp',
  contents: [
    { item: 'Backpack', quantity: 1 },
    { item: 'Bedroll', quantity: 1 },
    { item: 'Mess Kit', quantity: 1 },
    { item: 'Tinderbox', quantity: 1 },
    { item: 'Torch', quantity: 10 },
    { item: 'Rations (1 day)', quantity: 10 },
    { item: 'Waterskin', quantity: 1 },
    { item: 'Rope, Hempen (50 feet)', quantity: 1 },
  ],
}

// Priest's Pack (19 gp)
const PRIESTS_PACK: EquipmentPack = {
  name: "Priest's Pack",
  cost: '19 gp',
  contents: [
    { item: 'Backpack', quantity: 1 },
    { item: 'Blanket', quantity: 1 },
    { item: 'Candle', quantity: 10 },
    { item: 'Tinderbox', quantity: 1 },
    { item: 'Alms Box', quantity: 1 },
    { item: 'Block of Incense', quantity: 2 },
    { item: 'Censer', quantity: 1 },
    { item: 'Vestments', quantity: 1 },
    { item: 'Rations (1 day)', quantity: 2 },
    { item: 'Waterskin', quantity: 1 },
  ],
}

// Scholar's Pack (40 gp)
const SCHOLARS_PACK: EquipmentPack = {
  name: "Scholar's Pack",
  cost: '40 gp',
  contents: [
    { item: 'Backpack', quantity: 1 },
    { item: 'Book', quantity: 1 },
    { item: 'Ink (1 ounce bottle)', quantity: 1 },
    { item: 'Ink Pen', quantity: 1 },
    { item: 'Parchment (one sheet)', quantity: 10 },
    { item: 'Little Bag of Sand', quantity: 1 },
    { item: 'Small Knife', quantity: 1 },
  ],
}

// Combined array of all equipment packs
export const EQUIPMENT_PACKS: EquipmentPack[] = [
  BURGLARS_PACK,
  DIPLOMATS_PACK,
  DUNGEONEERS_PACK,
  ENTERTAINERS_PACK,
  EXPLORERS_PACK,
  PRIESTS_PACK,
  SCHOLARS_PACK,
]

/**
 * Get equipment pack by name (case-insensitive)
 */
export function getPackByName(name: string): EquipmentPack | undefined {
  return EQUIPMENT_PACKS.find(
    (pack) => pack.name.toLowerCase() === name.toLowerCase()
  )
}
