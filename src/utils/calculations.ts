/**
 * D&D 5e calculation utilities
 */

import { getArmorByName, type ArmorData } from '../data/armor'
import { getWeaponByName, type WeaponData } from '../data/weapons'
import type { Weapon, DamageType } from '../types'

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

/**
 * Calculate Armor Class (AC) based on equipped armor, modifiers, and class features
 *
 * @param equippedArmorName - The name of equipped body armor (null if none)
 * @param hasShield - Whether a shield is equipped
 * @param dexMod - Dexterity modifier
 * @param conMod - Constitution modifier (for Barbarian unarmored defense)
 * @param wisMod - Wisdom modifier (for Monk unarmored defense)
 * @param characterClass - The character's class name (for unarmored defense calculations)
 * @param manualOverride - Optional manual AC override
 * @returns The calculated AC
 */
export function calculateAC(
  equippedArmorName: string | null,
  hasShield: boolean,
  dexMod: number,
  conMod: number,
  wisMod: number,
  characterClass: string,
  manualOverride?: number
): number {
  // If manual override is set, use it
  if (manualOverride !== undefined) {
    return manualOverride
  }

  let baseAC: number

  if (equippedArmorName) {
    // Wearing armor
    const armor: ArmorData | undefined = getArmorByName(equippedArmorName)

    if (armor) {
      baseAC = armor.baseAC

      // Apply Dex modifier based on armor type
      if (armor.dexBonus === true) {
        // Light armor: full Dex bonus
        baseAC += dexMod
      } else if (armor.dexBonus === 'max2') {
        // Medium armor: Dex bonus capped at +2
        baseAC += Math.min(dexMod, 2)
      }
      // Heavy armor (dexBonus === false): no Dex bonus added
    } else {
      // Armor not found in database, fall back to unarmored
      baseAC = 10 + dexMod
    }
  } else {
    // No armor equipped - check for unarmored defense class features
    const className = characterClass.toLowerCase()

    if (className === 'barbarian') {
      // Barbarian Unarmored Defense: 10 + Dex + Con
      baseAC = 10 + dexMod + conMod
    } else if (className === 'monk') {
      // Monk Unarmored Defense: 10 + Dex + Wis
      baseAC = 10 + dexMod + wisMod
    } else {
      // Standard unarmored: 10 + Dex
      baseAC = 10 + dexMod
    }
  }

  // Add shield bonus if equipped
  if (hasShield) {
    baseAC += 2
  }

  return baseAC
}

/**
 * Calculate weapon attack bonus based on weapon type, ability modifiers, and proficiency
 *
 * @param weapon - The weapon being used
 * @param strMod - Strength modifier
 * @param dexMod - Dexterity modifier
 * @param proficiencyBonus - The character's proficiency bonus
 * @param isProficient - Whether the character is proficient with the weapon
 * @returns The total attack bonus
 */
export function calculateAttackBonus(
  weapon: Weapon,
  strMod: number,
  dexMod: number,
  proficiencyBonus: number,
  isProficient: boolean
): number {
  let abilityMod: number

  // Determine which ability modifier to use
  const isFinesse = weapon.properties.includes('finesse')
  const isRanged = weapon.properties.includes('ammunition') ||
    (weapon.properties.includes('thrown') && !weapon.properties.some(p =>
      p !== 'thrown' && p !== 'light' && p !== 'finesse'
    ))

  if (isFinesse) {
    // Finesse: use higher of Str or Dex
    abilityMod = Math.max(strMod, dexMod)
  } else if (isRanged || weapon.properties.includes('ammunition')) {
    // Ranged weapons use Dex
    abilityMod = dexMod
  } else {
    // Melee weapons use Str by default
    abilityMod = strMod
  }

  // Calculate total bonus
  let attackBonus = abilityMod

  // Add proficiency bonus if proficient
  if (isProficient) {
    attackBonus += proficiencyBonus
  }

  // Add weapon's attack bonus (magic weapons)
  if (weapon.attackBonus) {
    attackBonus += weapon.attackBonus
  }

  return attackBonus
}

/**
 * Calculate weapon damage bonus based on weapon type and ability modifiers
 *
 * @param weapon - The weapon being used
 * @param strMod - Strength modifier
 * @param dexMod - Dexterity modifier
 * @param isOffhand - Whether this is an off-hand attack (two-weapon fighting)
 * @returns The damage bonus to add to damage rolls
 */
export function calculateDamageBonus(
  weapon: Weapon,
  strMod: number,
  dexMod: number,
  isOffhand: boolean = false
): number {
  // Off-hand attacks don't add ability modifier (unless feature grants it)
  if (isOffhand) {
    return 0
  }

  // Determine which ability modifier to use
  const isFinesse = weapon.properties.includes('finesse')
  const isRanged = weapon.properties.includes('ammunition') ||
    (weapon.properties.includes('thrown') && !weapon.properties.some(p =>
      p !== 'thrown' && p !== 'light' && p !== 'finesse'
    ))

  if (isFinesse) {
    // Finesse: use higher of Str or Dex
    return Math.max(strMod, dexMod)
  } else if (isRanged || weapon.properties.includes('ammunition')) {
    // Ranged weapons use Dex
    return dexMod
  } else {
    // Melee weapons use Str by default
    return strMod
  }
}

/**
 * Format weapon damage as a display string (e.g., "1d8+3 slashing")
 *
 * @param weapon - The weapon being used
 * @param strMod - Strength modifier
 * @param dexMod - Dexterity modifier
 * @param isOffhand - Whether this is an off-hand attack
 * @returns Formatted damage string, or versatile format for versatile weapons
 */
export function formatWeaponDamage(
  weapon: Weapon,
  strMod: number,
  dexMod: number,
  isOffhand: boolean = false
): string {
  const damageBonus = calculateDamageBonus(weapon, strMod, dexMod, isOffhand)
  const damageType = weapon.damageType

  // Check if weapon is versatile and get two-handed damage from weapon data
  const isVersatile = weapon.properties.includes('versatile')
  let versatileDamage: string | undefined

  if (isVersatile) {
    // Look up the weapon in the WEAPONS data to get versatileDamage
    const weaponData: WeaponData | undefined = getWeaponByName(weapon.name)
    versatileDamage = weaponData?.versatileDamage
  }

  // Format the damage bonus string
  const formatBonus = (bonus: number): string => {
    if (bonus === 0) return ''
    return bonus > 0 ? `+${bonus}` : `${bonus}`
  }

  // Format a single damage string
  const formatDamage = (baseDamage: string, damageType: DamageType): string => {
    const bonusStr = formatBonus(damageBonus)
    return `${baseDamage}${bonusStr} ${damageType}`
  }

  // If versatile weapon, show both 1h and 2h damage
  if (isVersatile && versatileDamage) {
    const oneHandedDamage = formatDamage(weapon.damage, damageType)
    const twoHandedDamage = formatDamage(versatileDamage, damageType)
    return `${oneHandedDamage} / ${twoHandedDamage}`
  }

  return formatDamage(weapon.damage, damageType)
}
