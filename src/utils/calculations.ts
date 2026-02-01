/**
 * D&D 5e calculation utilities
 */

/**
 * Calculate ability modifier from ability score
 * Formula: floor((score - 10) / 2)
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

/**
 * Calculate proficiency bonus from character level
 * Formula: floor((level - 1) / 4) + 2
 */
export function getProficiencyBonus(level: number): number {
  return Math.floor((level - 1) / 4) + 2
}

/**
 * Calculate skill bonus
 * @param abilityMod - The ability modifier for this skill
 * @param profBonus - The character's proficiency bonus
 * @param proficient - Whether the character is proficient in this skill
 * @param expertise - Whether the character has expertise in this skill
 */
export function getSkillBonus(
  abilityMod: number,
  profBonus: number,
  proficient: boolean,
  expertise: boolean
): number {
  let bonus = abilityMod
  if (proficient) {
    bonus += profBonus
  }
  if (expertise) {
    bonus += profBonus // Expertise doubles proficiency bonus
  }
  return bonus
}

/**
 * Calculate passive perception
 * Formula: 10 + Perception skill bonus
 */
export function getPassivePerception(
  wisdomMod: number,
  profBonus: number,
  proficient: boolean,
  expertise: boolean
): number {
  return 10 + getSkillBonus(wisdomMod, profBonus, proficient, expertise)
}

/**
 * Calculate spell save DC
 * Formula: 8 + proficiency bonus + spellcasting ability modifier
 */
export function getSpellSaveDC(profBonus: number, abilityMod: number): number {
  return 8 + profBonus + abilityMod
}

/**
 * Calculate spell attack bonus
 * Formula: proficiency bonus + spellcasting ability modifier
 */
export function getSpellAttackBonus(profBonus: number, abilityMod: number): number {
  return profBonus + abilityMod
}

/**
 * Calculate initiative modifier
 * Typically just the DEX modifier (can be enhanced by feats)
 */
export function getInitiative(dexMod: number, bonus: number = 0): number {
  return dexMod + bonus
}

/**
 * Calculate saving throw bonus
 * @param abilityMod - The ability modifier
 * @param profBonus - The character's proficiency bonus
 * @param proficient - Whether the character is proficient in this save
 */
export function getSavingThrowBonus(
  abilityMod: number,
  profBonus: number,
  proficient: boolean
): number {
  return abilityMod + (proficient ? profBonus : 0)
}

/**
 * Format a modifier as a string with + or - sign
 */
export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`
}

/**
 * XP thresholds for each level (cumulative XP needed to reach that level)
 */
export const XP_THRESHOLDS: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000,
}

/**
 * Get the level for a given XP amount
 */
export function getLevelFromXP(xp: number): number {
  for (let level = 20; level >= 1; level--) {
    if (xp >= XP_THRESHOLDS[level]) {
      return level
    }
  }
  return 1
}

/**
 * Get the XP needed for the next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  if (currentLevel >= 20) return XP_THRESHOLDS[20]
  return XP_THRESHOLDS[currentLevel + 1]
}

// =============================================================================
// SPELL SLOT PROGRESSION
// =============================================================================

/**
 * Spell slot totals type (just the totals, not expended)
 */
export type SpellSlotTotals = [number, number, number, number, number, number, number, number, number]

/**
 * Full caster spell slots by level (Bard, Cleric, Druid, Sorcerer, Wizard)
 * Index is character level (1-20), value is [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
 */
export const FULL_CASTER_SLOTS: Record<number, SpellSlotTotals> = {
  1:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  4:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  6:  [4, 3, 3, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 3, 1, 0, 0, 0, 0, 0],
  8:  [4, 3, 3, 2, 0, 0, 0, 0, 0],
  9:  [4, 3, 3, 3, 1, 0, 0, 0, 0],
  10: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  11: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  12: [4, 3, 3, 3, 2, 1, 0, 0, 0],
  13: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  14: [4, 3, 3, 3, 2, 1, 1, 0, 0],
  15: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  16: [4, 3, 3, 3, 2, 1, 1, 1, 0],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1],
}

/**
 * Half caster spell slots by level (Paladin, Ranger)
 * Spellcasting begins at level 2
 * Index is character level (1-20), value is [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th]
 */
export const HALF_CASTER_SLOTS: Record<number, SpellSlotTotals> = {
  1:  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  2:  [2, 0, 0, 0, 0, 0, 0, 0, 0],
  3:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  4:  [3, 0, 0, 0, 0, 0, 0, 0, 0],
  5:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  6:  [4, 2, 0, 0, 0, 0, 0, 0, 0],
  7:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  8:  [4, 3, 0, 0, 0, 0, 0, 0, 0],
  9:  [4, 3, 2, 0, 0, 0, 0, 0, 0],
  10: [4, 3, 2, 0, 0, 0, 0, 0, 0],
  11: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  12: [4, 3, 3, 0, 0, 0, 0, 0, 0],
  13: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  14: [4, 3, 3, 1, 0, 0, 0, 0, 0],
  15: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  16: [4, 3, 3, 2, 0, 0, 0, 0, 0],
  17: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  18: [4, 3, 3, 3, 1, 0, 0, 0, 0],
  19: [4, 3, 3, 3, 2, 0, 0, 0, 0],
  20: [4, 3, 3, 3, 2, 0, 0, 0, 0],
}

/**
 * Warlock Pact Magic slots by level
 * slotCount: number of pact magic slots
 * slotLevel: the spell level of pact magic slots
 */
export interface PactMagicSlots {
  slotCount: number
  slotLevel: number
}

export const PACT_MAGIC_SLOTS: Record<number, PactMagicSlots> = {
  1:  { slotCount: 1, slotLevel: 1 },
  2:  { slotCount: 2, slotLevel: 1 },
  3:  { slotCount: 2, slotLevel: 2 },
  4:  { slotCount: 2, slotLevel: 2 },
  5:  { slotCount: 2, slotLevel: 3 },
  6:  { slotCount: 2, slotLevel: 3 },
  7:  { slotCount: 2, slotLevel: 4 },
  8:  { slotCount: 2, slotLevel: 4 },
  9:  { slotCount: 2, slotLevel: 5 },
  10: { slotCount: 2, slotLevel: 5 },
  11: { slotCount: 3, slotLevel: 5 },
  12: { slotCount: 3, slotLevel: 5 },
  13: { slotCount: 3, slotLevel: 5 },
  14: { slotCount: 3, slotLevel: 5 },
  15: { slotCount: 3, slotLevel: 5 },
  16: { slotCount: 3, slotLevel: 5 },
  17: { slotCount: 4, slotLevel: 5 },
  18: { slotCount: 4, slotLevel: 5 },
  19: { slotCount: 4, slotLevel: 5 },
  20: { slotCount: 4, slotLevel: 5 },
}

/**
 * Full caster class names
 */
export const FULL_CASTER_CLASSES = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'] as const

/**
 * Half caster class names
 */
export const HALF_CASTER_CLASSES = ['Paladin', 'Ranger'] as const

/**
 * Import SpellSlots type from types
 */
import type { SpellSlots } from '../types'

/**
 * Get spell slots for a given class at a given level
 * Returns a SpellSlots object with total slots (expended set to 0)
 *
 * @param className - The class name (e.g., "Bard", "Warlock")
 * @param level - The character level (1-20)
 * @returns SpellSlots object for regular casters, or null for Warlock (use getPactMagicSlots instead)
 */
export function getSpellSlotsForLevel(className: string, level: number): SpellSlots {
  // Clamp level to valid range
  const clampedLevel = Math.max(1, Math.min(20, level))

  // Determine which slot table to use
  let slots: SpellSlotTotals

  if (FULL_CASTER_CLASSES.includes(className as typeof FULL_CASTER_CLASSES[number])) {
    slots = FULL_CASTER_SLOTS[clampedLevel]
  } else if (HALF_CASTER_CLASSES.includes(className as typeof HALF_CASTER_CLASSES[number])) {
    slots = HALF_CASTER_SLOTS[clampedLevel]
  } else if (className === 'Warlock') {
    // Warlock uses Pact Magic - return empty regular slots
    // The caller should use getPactMagicSlots() for Warlock pact slots
    slots = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  } else {
    // Non-caster class (Barbarian, Fighter, Monk, Rogue)
    slots = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  }

  return {
    1: { total: slots[0], expended: 0 },
    2: { total: slots[1], expended: 0 },
    3: { total: slots[2], expended: 0 },
    4: { total: slots[3], expended: 0 },
    5: { total: slots[4], expended: 0 },
    6: { total: slots[5], expended: 0 },
    7: { total: slots[6], expended: 0 },
    8: { total: slots[7], expended: 0 },
    9: { total: slots[8], expended: 0 },
  }
}

/**
 * Get Warlock Pact Magic slots for a given level
 *
 * @param level - The Warlock level (1-20)
 * @returns PactMagicSlots object with slotCount and slotLevel
 */
export function getPactMagicSlots(level: number): PactMagicSlots {
  const clampedLevel = Math.max(1, Math.min(20, level))
  return PACT_MAGIC_SLOTS[clampedLevel]
}

// =============================================================================
// SCALING FEATURE CALCULATIONS
// =============================================================================

/**
 * Get the number of Sneak Attack dice for a Rogue
 * Rogues get 1d6 at level 1, and +1d6 at every odd level
 * Formula: ceil(level / 2)
 *
 * @param rogueLevel - The Rogue level (1-20)
 * @returns The number of d6s for Sneak Attack
 */
export function getSneakAttackDice(rogueLevel: number): number {
  const clampedLevel = Math.max(1, Math.min(20, rogueLevel))
  return Math.ceil(clampedLevel / 2)
}

/**
 * Get the Bardic Inspiration die size for a Bard
 * d6 at levels 1-4, d8 at levels 5-9, d10 at levels 10-14, d12 at levels 15-20
 *
 * @param bardLevel - The Bard level (1-20)
 * @returns The die type as a string ('d6', 'd8', 'd10', or 'd12')
 */
export function getBardicInspirationDie(bardLevel: number): 'd6' | 'd8' | 'd10' | 'd12' {
  const clampedLevel = Math.max(1, Math.min(20, bardLevel))
  if (clampedLevel >= 15) return 'd12'
  if (clampedLevel >= 10) return 'd10'
  if (clampedLevel >= 5) return 'd8'
  return 'd6'
}

/**
 * Get the Martial Arts die size for a Monk
 * d6 at levels 1-4, d8 at levels 5-10, d10 at levels 11-16, d12 at levels 17-20
 *
 * @param monkLevel - The Monk level (1-20)
 * @returns The die type as a string ('d6', 'd8', 'd10', or 'd12')
 */
export function getMartialArtsDie(monkLevel: number): 'd6' | 'd8' | 'd10' | 'd12' {
  const clampedLevel = Math.max(1, Math.min(20, monkLevel))
  if (clampedLevel >= 17) return 'd12'
  if (clampedLevel >= 11) return 'd10'
  if (clampedLevel >= 5) return 'd8'
  return 'd6'
}

/**
 * Get the Rage damage bonus for a Barbarian
 * +2 at levels 1-8, +3 at levels 9-15, +4 at levels 16-20
 *
 * @param barbarianLevel - The Barbarian level (1-20)
 * @returns The bonus damage while raging (2, 3, or 4)
 */
export function getRageDamage(barbarianLevel: number): 2 | 3 | 4 {
  const clampedLevel = Math.max(1, Math.min(20, barbarianLevel))
  if (clampedLevel >= 16) return 4
  if (clampedLevel >= 9) return 3
  return 2
}

/**
 * Get the number of Rage uses for a Barbarian
 * 2 at levels 1-2, 3 at levels 3-5, 4 at levels 6-11, 5 at levels 12-16, 6 at levels 17-19, unlimited at level 20
 *
 * @param barbarianLevel - The Barbarian level (1-20)
 * @returns The number of rages per long rest, or 'unlimited' at level 20
 */
export function getRageCount(barbarianLevel: number): number | 'unlimited' {
  const clampedLevel = Math.max(1, Math.min(20, barbarianLevel))
  if (clampedLevel >= 20) return 'unlimited'
  if (clampedLevel >= 17) return 6
  if (clampedLevel >= 12) return 5
  if (clampedLevel >= 6) return 4
  if (clampedLevel >= 3) return 3
  return 2
}

/**
 * Get the number of Focus Points for a Monk
 * Equal to Monk level (renamed from Ki Points in D&D 2024)
 *
 * @param monkLevel - The Monk level (1-20)
 * @returns The number of Focus Points
 */
export function getFocusPoints(monkLevel: number): number {
  return Math.max(1, Math.min(20, monkLevel))
}

/**
 * Get the number of Sorcery Points for a Sorcerer
 * Equal to Sorcerer level (gained at level 2+)
 *
 * @param sorcererLevel - The Sorcerer level (1-20)
 * @returns The number of Sorcery Points (0 at level 1, level thereafter)
 */
export function getSorceryPoints(sorcererLevel: number): number {
  const clampedLevel = Math.max(1, Math.min(20, sorcererLevel))
  // Sorcery Points start at level 2
  if (clampedLevel < 2) return 0
  return clampedLevel
}

/**
 * Get the number of Channel Divinity uses for a Cleric
 * 1 at levels 1-5, 2 at levels 6-17, 3 at levels 18-20
 *
 * @param clericLevel - The Cleric level (1-20)
 * @returns The number of Channel Divinity uses per short/long rest
 */
export function getChannelDivinityUses(clericLevel: number): 1 | 2 | 3 {
  const clampedLevel = Math.max(1, Math.min(20, clericLevel))
  if (clampedLevel >= 18) return 3
  if (clampedLevel >= 6) return 2
  return 1
}

/**
 * Get the Lay on Hands healing pool for a Paladin
 * Equal to 5 times Paladin level
 *
 * @param paladinLevel - The Paladin level (1-20)
 * @returns The total healing pool
 */
export function getLayOnHandsPool(paladinLevel: number): number {
  const clampedLevel = Math.max(1, Math.min(20, paladinLevel))
  return 5 * clampedLevel
}

/**
 * Classes that get Extra Attack at level 5
 */
export const EXTRA_ATTACK_CLASSES = ['Barbarian', 'Fighter', 'Monk', 'Paladin', 'Ranger'] as const

/**
 * Get the number of attacks per Attack action for a character
 * Returns 1 for non-martial classes, 2 at level 5 for most martial classes
 * Fighter gets 3 attacks at level 11 and 4 attacks at level 20
 *
 * @param className - The class name
 * @param level - The character level (1-20)
 * @returns The number of attacks per Attack action (1, 2, 3, or 4)
 */
export function getExtraAttackCount(className: string, level: number): 1 | 2 | 3 | 4 {
  const clampedLevel = Math.max(1, Math.min(20, level))

  // Fighter has unique progression: 2 at level 5, 3 at level 11, 4 at level 20
  if (className === 'Fighter') {
    if (clampedLevel >= 20) return 4
    if (clampedLevel >= 11) return 3
    if (clampedLevel >= 5) return 2
    return 1
  }

  // Other martial classes get 2 attacks at level 5
  if (EXTRA_ATTACK_CLASSES.includes(className as typeof EXTRA_ATTACK_CLASSES[number])) {
    if (clampedLevel >= 5) return 2
    return 1
  }

  // Non-martial classes get 1 attack
  return 1
}

// =============================================================================
// ASI (ABILITY SCORE IMPROVEMENT) TRACKING
// =============================================================================

/**
 * ASI levels for each class
 * Standard classes get ASIs at levels 4, 8, 12, 16, 19
 * Fighter gets extra ASIs at levels 6 and 14 (7 total)
 * Rogue gets an extra ASI at level 10 (6 total)
 */
export const ASI_LEVELS: Record<string, readonly number[]> = {
  // Standard ASI schedule (5 ASIs)
  Barbarian: [4, 8, 12, 16, 19],
  Bard: [4, 8, 12, 16, 19],
  Cleric: [4, 8, 12, 16, 19],
  Druid: [4, 8, 12, 16, 19],
  Monk: [4, 8, 12, 16, 19],
  Paladin: [4, 8, 12, 16, 19],
  Ranger: [4, 8, 12, 16, 19],
  Sorcerer: [4, 8, 12, 16, 19],
  Warlock: [4, 8, 12, 16, 19],
  Wizard: [4, 8, 12, 16, 19],
  // Fighter gets 7 ASIs (extra at levels 6 and 14)
  Fighter: [4, 6, 8, 12, 14, 16, 19],
  // Rogue gets 6 ASIs (extra at level 10)
  Rogue: [4, 8, 10, 12, 16, 19],
} as const

/**
 * Default ASI levels for unknown classes
 */
const DEFAULT_ASI_LEVELS: readonly number[] = [4, 8, 12, 16, 19]

/**
 * Check if a given level is an ASI level for a class
 *
 * @param className - The class name
 * @param level - The character level to check
 * @returns True if the level grants an ASI
 */
export function isASILevel(className: string, level: number): boolean {
  const asiLevels = ASI_LEVELS[className] ?? DEFAULT_ASI_LEVELS
  return asiLevels.includes(level)
}

/**
 * Get the total number of ASIs earned by a character at a given level
 *
 * @param className - The class name
 * @param level - The character level
 * @returns The number of ASIs earned (cumulative)
 */
export function getASICount(className: string, level: number): number {
  const clampedLevel = Math.max(1, Math.min(20, level))
  const asiLevels = ASI_LEVELS[className] ?? DEFAULT_ASI_LEVELS
  return asiLevels.filter((asiLevel) => asiLevel <= clampedLevel).length
}

// =============================================================================
// LEVEL-UP LOGIC
// =============================================================================

import type { Character, ClassFeature } from '../types'
import { getClassFeaturesForLevel, getSubclassFeaturesForLevel } from '../data/classes'

/**
 * Choices needed during level-up
 */
export interface LevelUpChoices {
  needsHP: boolean
  needsASI: boolean
}

/**
 * Result of a level-up operation
 */
export interface LevelUpResult {
  /** The updated character (not saved) */
  character: Character
  /** Choices that need to be made by the player */
  choices: LevelUpChoices
  /** New features gained at this level */
  newClassFeatures: ClassFeature[]
  /** New subclass features gained at this level */
  newSubclassFeatures: ClassFeature[]
}

/**
 * Perform level-up on a character
 *
 * This function:
 * - Increments character.level by 1
 * - Updates character.classFeatures with new features for the new level
 * - Updates character.spellSlots using getSpellSlotsForLevel()
 * - Updates hit dice total to match new level
 * - Returns list of choices needed (HP, ASI if applicable)
 *
 * Note: Does NOT save the character - the caller must handle saving after all choices are made
 * Note: Does NOT update HP - that requires player choice (roll or average)
 *
 * @param character - The character to level up
 * @returns The level-up result with updated character and required choices
 */
export function levelUp(character: Character): LevelUpResult {
  // Cannot level up beyond 20
  if (character.level >= 20) {
    return {
      character,
      choices: { needsHP: false, needsASI: false },
      newClassFeatures: [],
      newSubclassFeatures: []
    }
  }

  const newLevel = character.level + 1
  const className = character.class
  const subclassName = character.subclass

  // Get new class features for this level
  const allClassFeatures = getClassFeaturesForLevel(className, newLevel)
  const previousClassFeatures = getClassFeaturesForLevel(className, character.level)
  const newClassFeatures = allClassFeatures.filter(
    f => !previousClassFeatures.some(pf => pf.name === f.name && pf.level === f.level)
  )

  // Get new subclass features for this level (if subclass is selected)
  let newSubclassFeatures: ClassFeature[] = []
  if (subclassName) {
    const allSubclassFeatures = getSubclassFeaturesForLevel(className, subclassName, newLevel)
    const previousSubclassFeatures = getSubclassFeaturesForLevel(className, subclassName, character.level)
    newSubclassFeatures = allSubclassFeatures.filter(
      f => !previousSubclassFeatures.some(pf => pf.name === f.name && pf.level === f.level)
    )
  }

  // Get new spell slots for this level
  const newSpellSlots = getSpellSlotsForLevel(className, newLevel)

  // Build the updated character
  const updatedCharacter: Character = {
    ...character,
    level: newLevel,
    // Update class features to include all features up to new level
    classFeatures: [
      ...allClassFeatures,
      ...newSubclassFeatures,
      // Keep any manually added features that aren't from the class/subclass
      ...character.classFeatures.filter(cf =>
        !allClassFeatures.some(f => f.name === cf.name && f.level === cf.level) &&
        !(subclassName && getSubclassFeaturesForLevel(className, subclassName, newLevel).some(
          f => f.name === cf.name && f.level === cf.level
        ))
      )
    ],
    // Update spell slots (preserve expended count if total is same or greater)
    spellSlots: {
      1: { total: newSpellSlots[1].total, expended: Math.min(character.spellSlots[1].expended, newSpellSlots[1].total) },
      2: { total: newSpellSlots[2].total, expended: Math.min(character.spellSlots[2].expended, newSpellSlots[2].total) },
      3: { total: newSpellSlots[3].total, expended: Math.min(character.spellSlots[3].expended, newSpellSlots[3].total) },
      4: { total: newSpellSlots[4].total, expended: Math.min(character.spellSlots[4].expended, newSpellSlots[4].total) },
      5: { total: newSpellSlots[5].total, expended: Math.min(character.spellSlots[5].expended, newSpellSlots[5].total) },
      6: { total: newSpellSlots[6].total, expended: Math.min(character.spellSlots[6].expended, newSpellSlots[6].total) },
      7: { total: newSpellSlots[7].total, expended: Math.min(character.spellSlots[7].expended, newSpellSlots[7].total) },
      8: { total: newSpellSlots[8].total, expended: Math.min(character.spellSlots[8].expended, newSpellSlots[8].total) },
      9: { total: newSpellSlots[9].total, expended: Math.min(character.spellSlots[9].expended, newSpellSlots[9].total) },
    },
    // Update hit dice total to match new level
    hitDice: {
      ...character.hitDice,
      total: newLevel
    }
  }

  // Determine what choices the player needs to make
  const choices: LevelUpChoices = {
    needsHP: true, // Always need to choose HP increase (roll or average)
    needsASI: isASILevel(className, newLevel)
  }

  return {
    character: updatedCharacter,
    choices,
    newClassFeatures,
    newSubclassFeatures
  }
}

// =============================================================================
// CANTRIPS KNOWN
// =============================================================================

/**
 * Cantrips known per level for each spellcasting class
 * Index is character level (1-20), value is number of cantrips known
 * Non-caster classes and classes that don't learn cantrips (Paladin, Ranger) are not included
 */
export const CANTRIPS_KNOWN: Record<string, Record<number, number>> = {
  // Full casters with cantrips
  Bard: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  Cleric: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
  },
  Druid: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  Sorcerer: {
    1: 4, 2: 4, 3: 4, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5, 9: 5, 10: 6,
    11: 6, 12: 6, 13: 6, 14: 6, 15: 6, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6
  },
  Warlock: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
    11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4
  },
  Wizard: {
    1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
    11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5, 18: 5, 19: 5, 20: 5
  }
} as const

/**
 * Get the number of cantrips known for a spellcasting class at a given level
 *
 * @param className - The class name
 * @param level - The character level (1-20)
 * @returns The number of cantrips known, or 0 if the class doesn't have cantrips
 */
export function getCantripsKnown(className: string, level: number): number {
  const clampedLevel = Math.max(1, Math.min(20, level))
  const classCantrips = CANTRIPS_KNOWN[className]
  if (!classCantrips) {
    return 0
  }
  return classCantrips[clampedLevel] ?? 0
}

// =============================================================================
// FEATURE DISPLAY WITH SCALING VALUES
// =============================================================================

/**
 * Feature names that have scaling values and should display current values
 */
const SCALING_FEATURE_NAMES = {
  // Rogue
  'Sneak Attack': 'sneakAttack',
  // Bard
  'Bardic Inspiration': 'bardicInspiration',
  // Monk
  'Martial Arts': 'martialArts',
  'Focus Points': 'focusPoints',
  // Barbarian
  'Rage': 'rage',
  // Sorcerer
  'Sorcery Points': 'sorceryPoints',
  'Font of Magic': 'sorceryPoints', // Sorcery Points are granted by Font of Magic at level 2
  // Cleric
  'Channel Divinity': 'channelDivinity',
  // Paladin
  'Lay on Hands': 'layOnHands',
  // Martial classes - Extra Attack
  'Extra Attack': 'extraAttack',
  'Two Extra Attacks': 'extraAttack',
  'Three Extra Attacks': 'extraAttack',
} as const

/**
 * Get the display name for a feature with its current scaling value
 *
 * @param featureName - The base feature name
 * @param className - The character's class
 * @param level - The character's current level
 * @returns The feature name with scaling value appended, or just the feature name if no scaling
 */
export function getFeatureDisplayName(featureName: string, className: string, level: number): string {
  const scalingType = SCALING_FEATURE_NAMES[featureName as keyof typeof SCALING_FEATURE_NAMES]

  if (!scalingType) {
    return featureName
  }

  switch (scalingType) {
    case 'sneakAttack':
      if (className === 'Rogue') {
        const dice = getSneakAttackDice(level)
        return `Sneak Attack (${dice}d6)`
      }
      break
    case 'bardicInspiration':
      if (className === 'Bard') {
        const die = getBardicInspirationDie(level)
        return `Bardic Inspiration (${die})`
      }
      break
    case 'martialArts':
      if (className === 'Monk') {
        const die = getMartialArtsDie(level)
        return `Martial Arts (${die})`
      }
      break
    case 'focusPoints':
      if (className === 'Monk') {
        const points = getFocusPoints(level)
        return `Focus Points (${points})`
      }
      break
    case 'rage':
      if (className === 'Barbarian') {
        const damage = getRageDamage(level)
        const count = getRageCount(level)
        const countStr = count === 'unlimited' ? '∞' : count
        return `Rage (+${damage} damage, ${countStr}/day)`
      }
      break
    case 'sorceryPoints':
      if (className === 'Sorcerer') {
        const points = getSorceryPoints(level)
        // Only show points if character has them (level 2+)
        if (points > 0) {
          return featureName === 'Font of Magic'
            ? `Font of Magic (${points} points)`
            : `Sorcery Points (${points})`
        }
      }
      break
    case 'channelDivinity':
      if (className === 'Cleric') {
        const uses = getChannelDivinityUses(level)
        return `Channel Divinity (${uses}/rest)`
      }
      break
    case 'layOnHands':
      if (className === 'Paladin') {
        const pool = getLayOnHandsPool(level)
        return `Lay on Hands (${pool} HP)`
      }
      break
    case 'extraAttack':
      // Handle Extra Attack for martial classes
      if (EXTRA_ATTACK_CLASSES.includes(className as typeof EXTRA_ATTACK_CLASSES[number])) {
        const attackCount = getExtraAttackCount(className, level)
        // Return feature name with attack count
        return `${featureName} (${attackCount} attacks)`
      }
      break
  }

  return featureName
}
