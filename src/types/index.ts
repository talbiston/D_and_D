// Ability names (the six core D&D abilities)
export type AbilityName =
  | 'strength'
  | 'dexterity'
  | 'constitution'
  | 'intelligence'
  | 'wisdom'
  | 'charisma'

// All 18 D&D skills
export type SkillName =
  // Strength
  | 'athletics'
  // Dexterity
  | 'acrobatics'
  | 'sleightOfHand'
  | 'stealth'
  // Intelligence
  | 'arcana'
  | 'history'
  | 'investigation'
  | 'nature'
  | 'religion'
  // Wisdom
  | 'animalHandling'
  | 'insight'
  | 'medicine'
  | 'perception'
  | 'survival'
  // Charisma
  | 'deception'
  | 'intimidation'
  | 'performance'
  | 'persuasion'

// Mapping of skill to its governing ability
export const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  athletics: 'strength',
  acrobatics: 'dexterity',
  sleightOfHand: 'dexterity',
  stealth: 'dexterity',
  arcana: 'intelligence',
  history: 'intelligence',
  investigation: 'intelligence',
  nature: 'intelligence',
  religion: 'intelligence',
  animalHandling: 'wisdom',
  insight: 'wisdom',
  medicine: 'wisdom',
  perception: 'wisdom',
  survival: 'wisdom',
  deception: 'charisma',
  intimidation: 'charisma',
  performance: 'charisma',
  persuasion: 'charisma',
}

// Ability scores type
export type AbilityScores = Record<AbilityName, number>

// Skill proficiency info
export interface Skill {
  name: SkillName
  ability: AbilityName
  proficient: boolean
  expertise: boolean
}

// Character sizes
export type Size = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan'

// Species ancestry option (e.g., Gold Dragon for Dragonborn)
export interface SpeciesAncestryOption {
  name: string
  description: string
  damageResistance?: string
  damageType?: string
  breathWeaponShape?: string
  spells?: string[]
  abilities?: string[]
}

// Species ancestry data (the choice and its options)
export interface SpeciesAncestryData {
  choiceName: string
  options: SpeciesAncestryOption[]
}

// Main Character interface
export interface Character {
  id: string
  name: string
  imageUrl?: string // URL or base64 data URL for character portrait
  species: string
  class: string
  subclass: string
  background: string
  level: number
  xp: number
  abilityScores: AbilityScores
  skills: Skill[]
  maxHp: number
  currentHp: number
  tempHp: number
  armorClass: number
  manualACOverride?: number // Optional manual AC override
  speed: number
  size: Size
  // Combat & equipment
  weapons: Weapon[]
  armor: CharacterArmor[]
  equipment: Equipment[]
  inventory: InventoryItem[]
  // Spells
  spells: Spell[]
  spellSlots: SpellSlots
  pactMagic?: PactMagic // Warlock Pact Magic slots (optional, only for Warlocks)
  eldritchInvocations?: string[] // Names of Eldritch Invocations known (Warlocks only)
  battleMasterManeuvers?: string[] // Names of Battle Master Maneuvers known (Battle Master Fighters only)
  metamagicOptions?: string[] // Names of Metamagic options known (Sorcerers only)
  spellcastingAbility?: AbilityName
  // Features & traits
  classFeatures: ClassFeature[]
  feats: Feat[]
  speciesTraits: SpeciesTrait[]
  // Resources
  currency: Currency
  deathSaves: DeathSaves
  hitDice: HitDice
  // Backstory & proficiencies
  backstory: Backstory
  proficiencies: Proficiencies
  // Level-up tracking
  pendingASI: number // Number of unclaimed Ability Score Improvements
  // Equipment tracking
  toolProficiencies: string[]
  // Species ancestry (e.g., Dragonborn draconic ancestry)
  speciesAncestry?: { choiceName: string; selectedOption: string }
  // Damage resistances from ancestry or other sources
  damageResistances?: string[]
  // Dragonborn breath weapon data
  breathWeapon?: {
    damageType: string
    shape: string
  }
  // Class order choice (e.g., Divine Order for Cleric, Primal Order for Druid)
  classOrder?: { name: string; description: string }
}

// Damage types
export type DamageType =
  | 'bludgeoning'
  | 'piercing'
  | 'slashing'
  | 'acid'
  | 'cold'
  | 'fire'
  | 'force'
  | 'lightning'
  | 'necrotic'
  | 'poison'
  | 'psychic'
  | 'radiant'
  | 'thunder'

// Weapon properties
export type WeaponProperty =
  | 'ammunition'
  | 'finesse'
  | 'heavy'
  | 'light'
  | 'loading'
  | 'range'
  | 'reach'
  | 'thrown'
  | 'two-handed'
  | 'versatile'

// Weapon type
export interface Weapon {
  name: string
  damage: string // e.g., "1d8"
  damageType: DamageType
  properties: WeaponProperty[]
  attackBonus?: number
  notes?: string
  isEquipped: boolean
  isTwoHanding: boolean // For versatile weapons being used two-handed
}

// Character armor type (for equipped/owned armor)
export interface CharacterArmor {
  name: string
  isEquipped: boolean
  isShield: boolean
}

// Inventory item type
export interface InventoryItem {
  name: string
  quantity: number
  weight: number
  category: string
  notes?: string
}

// Spell schools
export type SpellSchool =
  | 'abjuration'
  | 'conjuration'
  | 'divination'
  | 'enchantment'
  | 'evocation'
  | 'illusion'
  | 'necromancy'
  | 'transmutation'

// Spell components
export interface SpellComponents {
  verbal: boolean
  somatic: boolean
  material: boolean
  materialDescription?: string
}

// Spell type
export interface Spell {
  name: string
  level: number // 0 for cantrips
  school: SpellSchool
  castingTime: string
  range: string
  components: SpellComponents
  duration: string
  concentration: boolean
  ritual: boolean
  description: string
  classes: string[] // Class names that can cast this spell
}

// Equipment type
export interface Equipment {
  name: string
  quantity: number
  weight?: number
  description?: string
}

// Class feature type
export interface ClassFeature {
  name: string
  level: number
  description: string
}

// Feat type
export interface Feat {
  name: string
  description: string
  prerequisite?: string
}

// Species trait type
export interface SpeciesTrait {
  name: string
  description: string
}

// Spell slot tracking
export interface SpellSlotLevel {
  total: number
  expended: number
}

// Warlock Pact Magic tracking
export interface PactMagic {
  slotCount: number // Number of pact magic slots
  slotLevel: number // The spell level of pact magic slots (1-5)
  expended: number // Number of slots expended
}

export type SpellSlots = {
  1: SpellSlotLevel
  2: SpellSlotLevel
  3: SpellSlotLevel
  4: SpellSlotLevel
  5: SpellSlotLevel
  6: SpellSlotLevel
  7: SpellSlotLevel
  8: SpellSlotLevel
  9: SpellSlotLevel
}

// Currency tracking
export interface Currency {
  cp: number // copper pieces
  sp: number // silver pieces
  ep: number // electrum pieces
  gp: number // gold pieces
  pp: number // platinum pieces
}

// Death saves tracking
export interface DeathSaves {
  successes: number // 0-3
  failures: number // 0-3
}

// Hit dice tracking
export interface HitDice {
  total: number
  spent: number
}

// Alignment options
export type Alignment =
  | 'lawful-good'
  | 'neutral-good'
  | 'chaotic-good'
  | 'lawful-neutral'
  | 'true-neutral'
  | 'chaotic-neutral'
  | 'lawful-evil'
  | 'neutral-evil'
  | 'chaotic-evil'
  | 'unaligned'

// Character backstory and personality
export interface Backstory {
  appearance: string
  personality: string
  ideals: string
  bonds: string
  flaws: string
  backstory: string
  alignment: Alignment
  languages: string[]
}

// Proficiency categories
export interface Proficiencies {
  armor: string[]
  weapons: string[]
  tools: string[]
}

// Default ability scores (all 10s)
export const DEFAULT_ABILITY_SCORES: AbilityScores = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
}

// Create default skills array
export function createDefaultSkills(): Skill[] {
  return (Object.keys(SKILL_ABILITIES) as SkillName[]).map((name) => ({
    name,
    ability: SKILL_ABILITIES[name],
    proficient: false,
    expertise: false,
  }))
}

// Default spell slots (all empty)
export const DEFAULT_SPELL_SLOTS: SpellSlots = {
  1: { total: 0, expended: 0 },
  2: { total: 0, expended: 0 },
  3: { total: 0, expended: 0 },
  4: { total: 0, expended: 0 },
  5: { total: 0, expended: 0 },
  6: { total: 0, expended: 0 },
  7: { total: 0, expended: 0 },
  8: { total: 0, expended: 0 },
  9: { total: 0, expended: 0 },
}

// Default Pact Magic for Warlock level 1
export const DEFAULT_PACT_MAGIC: PactMagic = {
  slotCount: 1,
  slotLevel: 1,
  expended: 0,
}

// Default currency (all zeros)
export const DEFAULT_CURRENCY: Currency = {
  cp: 0,
  sp: 0,
  ep: 0,
  gp: 0,
  pp: 0,
}

// Default death saves
export const DEFAULT_DEATH_SAVES: DeathSaves = {
  successes: 0,
  failures: 0,
}

// Default backstory
export const DEFAULT_BACKSTORY: Backstory = {
  appearance: '',
  personality: '',
  ideals: '',
  bonds: '',
  flaws: '',
  backstory: '',
  alignment: 'true-neutral',
  languages: ['Common'],
}

// Default proficiencies
export const DEFAULT_PROFICIENCIES: Proficiencies = {
  armor: [],
  weapons: [],
  tools: [],
}

// Default armor (empty array)
export const DEFAULT_ARMOR: CharacterArmor[] = []

// Default inventory (empty array)
export const DEFAULT_INVENTORY: InventoryItem[] = []

// Default tool proficiencies (empty array)
export const DEFAULT_TOOL_PROFICIENCIES: string[] = []
