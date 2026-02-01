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
