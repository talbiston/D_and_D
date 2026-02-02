import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSpeciesNames } from '../data/species'
import { getClassNames } from '../data/classes'
import type { AbilityScores, AbilityName, Skill, SkillName, Weapon, InventoryItem, Currency } from '../types'
import { DEFAULT_ABILITY_SCORES, SKILL_ABILITIES, createDefaultSkills } from '../types'
import { getAbilityModifier, formatModifier, getProficiencyBonus, getSkillBonus, getPassivePerception, getPactMagicSlots } from '../utils/calculations'
import { createCharacter } from '../utils/api'
import { getClassByName, getClassFeaturesForLevel, getSubclassNames } from '../data/classes'
import type { StartingEquipmentChoice } from '../data/classes'
import { getBackgroundNames, getBackgroundByName } from '../data/backgrounds'
import { getSpeciesByName } from '../data/species'
import {
  DEFAULT_SPELL_SLOTS,
  DEFAULT_CURRENCY,
  DEFAULT_DEATH_SAVES,
  DEFAULT_BACKSTORY,
} from '../types'
import { useDarkModeContext } from '../context/DarkModeContext'
import { getWeaponByName, getSimpleWeapons, getMartialWeapons } from '../data/weapons'
import type { WeaponData } from '../data/weapons'
import { getArmorByName, getLightArmor, getMediumArmor, getHeavyArmor } from '../data/armor'
import type { ArmorData } from '../data/armor'
import { calculateAC } from '../utils/calculations'
import type { CharacterArmor } from '../types'
import { EQUIPMENT_PACKS, getPackByName } from '../data/equipmentPacks'
import type { EquipmentPack } from '../data/equipmentPacks'
import { getGearByName } from '../data/gear'
import ClassIcon from '../components/ClassIcon'
import CharacterImageInput from '../components/CharacterImageInput'

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

const ABILITY_ORDER: AbilityName[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma',
]

const SKILL_LABELS: Record<SkillName, string> = {
  athletics: 'Athletics',
  acrobatics: 'Acrobatics',
  sleightOfHand: 'Sleight of Hand',
  stealth: 'Stealth',
  arcana: 'Arcana',
  history: 'History',
  investigation: 'Investigation',
  nature: 'Nature',
  religion: 'Religion',
  animalHandling: 'Animal Handling',
  insight: 'Insight',
  medicine: 'Medicine',
  perception: 'Perception',
  survival: 'Survival',
  deception: 'Deception',
  intimidation: 'Intimidation',
  performance: 'Performance',
  persuasion: 'Persuasion',
}

// Group skills by ability
const SKILLS_BY_ABILITY: Record<AbilityName, SkillName[]> = {
  strength: ['athletics'],
  dexterity: ['acrobatics', 'sleightOfHand', 'stealth'],
  constitution: [],
  intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
  wisdom: ['animalHandling', 'insight', 'medicine', 'perception', 'survival'],
  charisma: ['deception', 'intimidation', 'performance', 'persuasion'],
}

// Ability score increase mode type
type AbilityIncreaseMode = 'standard' | 'balanced'

export default function CharacterCreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [species, setSpecies] = useState('')
  const [speciesAncestry, setSpeciesAncestry] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [subclass, setSubclass] = useState('')
  const [classOrder, setClassOrder] = useState('')
  const [background, setBackground] = useState('')
  const [level] = useState(1)
  const [abilityScores, setAbilityScores] = useState<AbilityScores>({ ...DEFAULT_ABILITY_SCORES })
  const [skills, setSkills] = useState<Skill[]>(createDefaultSkills())
  const { isDark, toggle: toggleDarkMode } = useDarkModeContext()

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Background ability score increase state
  const [abilityIncreaseMode, setAbilityIncreaseMode] = useState<AbilityIncreaseMode>('standard')
  const [primaryAbility, setPrimaryAbility] = useState<AbilityName | ''>('')
  const [secondaryAbility, setSecondaryAbility] = useState<AbilityName | ''>('')
  const [balancedAbilities, setBalancedAbilities] = useState<AbilityName[]>([])

  // Starting equipment weapon selections - track which weapon is selected for each choice index
  const [weaponSelections, setWeaponSelections] = useState<Record<number, string>>({})

  // Starting equipment armor selections - track which armor is selected for each choice index
  const [armorSelections, setArmorSelections] = useState<Record<number, string>>({})

  // Equipment pack or starting gold choice
  const [equipmentMode, setEquipmentMode] = useState<'pack' | 'gold'>('pack')
  const [selectedPack, setSelectedPack] = useState<string>('')
  const [rolledGold, setRolledGold] = useState<number | null>(null)
  const [goldRollDetails, setGoldRollDetails] = useState<{ rolls: number[], multiplier: number } | null>(null)

  const backgroundOptions = getBackgroundNames()
  const backgroundData = background ? getBackgroundByName(background) : undefined

  const subclassOptions = characterClass ? getSubclassNames(characterClass) : []

  // Reset ability selections when background changes
  const handleBackgroundChange = (newBackground: string) => {
    setBackground(newBackground)
    setPrimaryAbility('')
    setSecondaryAbility('')
    setBalancedAbilities([])
  }

  // Reset ancestry selection when species changes
  const handleSpeciesChange = (newSpecies: string) => {
    setSpecies(newSpecies)
    setSpeciesAncestry('')
  }

  // Get the current species data and ancestry options
  const speciesData = species ? getSpeciesByName(species) : undefined
  const ancestryOptions = speciesData?.ancestry?.options ?? []
  const selectedAncestryOption = speciesAncestry
    ? ancestryOptions.find((opt) => opt.name === speciesAncestry)
    : undefined

  // Toggle balanced ability selection
  const toggleBalancedAbility = (ability: AbilityName) => {
    setBalancedAbilities((prev) => {
      if (prev.includes(ability)) {
        return prev.filter((a) => a !== ability)
      }
      if (prev.length < 3) {
        return [...prev, ability]
      }
      return prev
    })
  }

  // Calculate ability score bonuses from background
  const getAbilityBonus = (ability: AbilityName): number => {
    if (!backgroundData) return 0
    if (abilityIncreaseMode === 'standard') {
      if (primaryAbility === ability) return 2
      if (secondaryAbility === ability) return 1
    } else {
      if (balancedAbilities.includes(ability)) return 1
    }
    return 0
  }

  // Get final ability score with background bonus
  const getFinalAbilityScore = (ability: AbilityName): number => {
    return abilityScores[ability] + getAbilityBonus(ability)
  }

  const speciesOptions = getSpeciesNames()
  const classOptions = getClassNames()
  const proficiencyBonus = getProficiencyBonus(level)

  // Calculate passive perception (using final score with bonuses)
  const perceptionSkill = skills.find((s) => s.name === 'perception')
  const wisdomMod = getAbilityModifier(getFinalAbilityScore('wisdom'))
  const passivePerception = getPassivePerception(
    wisdomMod,
    proficiencyBonus,
    perceptionSkill?.proficient ?? false,
    perceptionSkill?.expertise ?? false
  )

  // Check if ancestry is required (species has ancestry options) and if it's selected
  const ancestryRequired = speciesData?.ancestry !== undefined
  const ancestryValid = !ancestryRequired || speciesAncestry !== ''

  // Get class data and class order options
  const classData = characterClass ? getClassByName(characterClass) : undefined
  const classOrderOptions = classData?.classOrders ?? []
  const selectedClassOrder = classOrder
    ? classOrderOptions.find((opt) => opt.name === classOrder)
    : undefined

  // Check if class order is required and if it's selected
  const classOrderRequired = classOrderOptions.length > 0
  const classOrderValid = !classOrderRequired || classOrder !== ''
  const isValid = name.trim() !== '' && species !== '' && characterClass !== '' && ancestryValid && classOrderValid

  const updateAbilityScore = (ability: AbilityName, value: number) => {
    const clampedValue = Math.max(1, Math.min(30, value))
    setAbilityScores((prev) => ({ ...prev, [ability]: clampedValue }))
  }

  const toggleSkillProficiency = (skillName: SkillName) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.name === skillName
          ? { ...skill, proficient: !skill.proficient }
          : skill
      )
    )
  }

  // Get weapon choices from a starting equipment choice option
  const getWeaponOptionsForChoice = (choiceOption: string): WeaponData[] => {
    const lowerChoice = choiceOption.toLowerCase()

    // Handle "any martial melee weapon" patterns
    if (lowerChoice.includes('any martial melee')) {
      return getMartialWeapons().filter(w => w.type === 'melee')
    }
    if (lowerChoice.includes('any martial weapon')) {
      return getMartialWeapons()
    }
    if (lowerChoice.includes('any simple melee')) {
      return getSimpleWeapons().filter(w => w.type === 'melee')
    }
    if (lowerChoice.includes('any simple weapon')) {
      return getSimpleWeapons()
    }

    // Handle specific weapon by name
    const weapon = getWeaponByName(choiceOption)
    if (weapon) {
      return [weapon]
    }

    // Handle compound options like "Two Handaxes"
    const twoMatch = choiceOption.match(/^Two\s+(.+)s?$/i)
    if (twoMatch) {
      const weaponName = twoMatch[1].replace(/s$/, '') // Remove trailing 's'
      const weapon = getWeaponByName(weaponName)
      if (weapon) return [weapon]
    }

    return []
  }

  // Check if a starting equipment choice is a weapon choice
  const isWeaponChoice = (choice: StartingEquipmentChoice): boolean => {
    if (choice.choice) {
      return choice.choice.some(opt => {
        const lower = opt.toLowerCase()
        // Check if it's a weapon-related option
        if (lower.includes('martial') && lower.includes('weapon')) return true
        if (lower.includes('simple') && lower.includes('weapon')) return true
        if (getWeaponByName(opt)) return true
        if (opt.match(/^Two\s+\w+/i)) {
          const match = opt.match(/^Two\s+(.+)s?$/i)
          if (match) {
            const weaponName = match[1].replace(/s$/, '')
            if (getWeaponByName(weaponName)) return true
          }
        }
        return false
      })
    }
    if (choice.items) {
      return choice.items.some(item => getWeaponByName(item.item) !== undefined)
    }
    return false
  }

  // Get weapon choices from class starting equipment
  const getClassWeaponChoices = (): { index: number; choice: StartingEquipmentChoice }[] => {
    const classData = getClassByName(characterClass)
    if (!classData?.startingEquipment) return []

    return classData.startingEquipment
      .map((choice, index) => ({ index, choice }))
      .filter(({ choice }) => isWeaponChoice(choice))
  }

  // Get armor options for a choice string
  const getArmorOptionsForChoice = (choiceOption: string): ArmorData[] => {
    const lowerChoice = choiceOption.toLowerCase()

    // Handle specific armor by name
    const armor = getArmorByName(choiceOption)
    if (armor) {
      return [armor]
    }

    // Handle "if proficient" clauses - extract armor name
    const proficientMatch = choiceOption.match(/^(.+?)\s*\(if proficient\)$/i)
    if (proficientMatch) {
      const armorName = proficientMatch[1].trim()
      const armor = getArmorByName(armorName)
      if (armor) return [armor]
    }

    // Handle compound options like "Leather Armor, Longbow, and 20 Arrows"
    // Extract armor name if it's a combo
    if (lowerChoice.includes('leather armor')) {
      return getLightArmor().filter(a => a.name === 'Leather')
    }
    if (lowerChoice.includes('scale mail')) {
      return getMediumArmor().filter(a => a.name === 'Scale Mail')
    }
    if (lowerChoice.includes('chain mail')) {
      return getHeavyArmor().filter(a => a.name === 'Chain Mail')
    }

    return []
  }

  // Check if character is proficient with an armor category
  const isArmorProficient = (armorCategory: string): boolean => {
    const classData = getClassByName(characterClass)
    if (!classData) return false

    // Map armor categories to proficiency strings
    const categoryToProf: Record<string, string> = {
      'light': 'Light',
      'medium': 'Medium',
      'heavy': 'Heavy',
      'shield': 'Shields',
    }

    const profName = categoryToProf[armorCategory]
    return profName ? classData.armorProficiencies.includes(profName) : false
  }

  // Check if a starting equipment choice is an armor choice
  const isArmorChoice = (choice: StartingEquipmentChoice): boolean => {
    if (choice.choice) {
      return choice.choice.some(opt => {
        // Check for armor-related options
        if (getArmorByName(opt)) return true
        if (opt.toLowerCase().includes('leather armor')) return true
        if (opt.toLowerCase().includes('scale mail')) return true
        if (opt.toLowerCase().includes('chain mail')) return true
        // Check for "if proficient" armor options
        const profMatch = opt.match(/^(.+?)\s*\(if proficient\)$/i)
        if (profMatch && getArmorByName(profMatch[1].trim())) return true
        return false
      })
    }
    if (choice.items) {
      return choice.items.some(item => {
        const armor = getArmorByName(item.item)
        return armor !== undefined && armor.category !== 'shield'
      })
    }
    return false
  }

  // Get armor choices from class starting equipment
  const getClassArmorChoices = (): { index: number; choice: StartingEquipmentChoice }[] => {
    const classData = getClassByName(characterClass)
    if (!classData?.startingEquipment) return []

    return classData.startingEquipment
      .map((choice, index) => ({ index, choice }))
      .filter(({ choice }) => isArmorChoice(choice))
  }

  // Update armor selection for a choice
  const handleArmorSelection = (choiceIndex: number, armorName: string) => {
    setArmorSelections(prev => ({ ...prev, [choiceIndex]: armorName }))
  }

  // Calculate preview AC based on armor selection
  const getACPreview = (armorName: string | null): number => {
    const dexMod = getAbilityModifier(abilityScores.dexterity)
    const conMod = getAbilityModifier(abilityScores.constitution)
    const wisMod = getAbilityModifier(abilityScores.wisdom)

    // Check if we have a shield from fixed equipment
    const classData = getClassByName(characterClass)
    let hasShield = false
    if (classData?.startingEquipment) {
      hasShield = classData.startingEquipment.some(choice =>
        choice.items?.some(item => item.item === 'Shield')
      )
    }

    return calculateAC(armorName, hasShield, dexMod, conMod, wisMod, characterClass)
  }

  // Build starting armor array from selections and fixed items
  const buildStartingArmor = (): CharacterArmor[] => {
    const armor: CharacterArmor[] = []
    const classData = getClassByName(characterClass)
    if (!classData?.startingEquipment) return armor

    classData.startingEquipment.forEach((choice, index) => {
      // Handle choices - use the selected armor
      if (choice.choice && isArmorChoice(choice)) {
        const selectedName = armorSelections[index]
        if (selectedName) {
          const armorData = getArmorByName(selectedName)
          if (armorData && armorData.category !== 'shield') {
            armor.push({
              name: armorData.name,
              isEquipped: true,
              isShield: false,
            })
          }
        }
      }

      // Handle fixed armor items
      if (choice.items) {
        choice.items.forEach(item => {
          const armorData = getArmorByName(item.item)
          if (armorData) {
            armor.push({
              name: armorData.name,
              isEquipped: true,
              isShield: armorData.category === 'shield',
            })
          }
        })
      }
    })

    return armor
  }

  // Update weapon selection for a choice
  const handleWeaponSelection = (choiceIndex: number, weaponName: string) => {
    setWeaponSelections(prev => ({ ...prev, [choiceIndex]: weaponName }))
  }

  // Reset weapon, armor, and class order selections when class changes
  const handleClassChange = (newClass: string) => {
    setCharacterClass(newClass)
    setSubclass('')
    setClassOrder('')
    setWeaponSelections({})
    setArmorSelections({})
    setSelectedPack('')
    setRolledGold(null)
    setGoldRollDetails(null)
  }

  // Get available equipment packs for the selected class
  const getClassPackChoices = (): EquipmentPack[] => {
    const classData = getClassByName(characterClass)
    if (!classData?.startingEquipment) return []

    const packNames = new Set<string>()

    classData.startingEquipment.forEach(choice => {
      if (choice.choice) {
        choice.choice.forEach(opt => {
          // Check if option is a pack name
          const pack = getPackByName(opt)
          if (pack) {
            packNames.add(pack.name)
          }
        })
      }
      if (choice.items) {
        choice.items.forEach(item => {
          const pack = getPackByName(item.item)
          if (pack) {
            packNames.add(pack.name)
          }
        })
      }
    })

    return Array.from(packNames).map(name => getPackByName(name)!).filter(Boolean)
  }

  // Parse starting gold formula (e.g., "5d4 x 10" -> { dice: 5, sides: 4, multiplier: 10 })
  const parseGoldFormula = (formula: string): { dice: number, sides: number, multiplier: number } | null => {
    // Match patterns like "5d4 x 10", "5d4", "2d4 x 10"
    const match = formula.match(/^(\d+)d(\d+)(?:\s*[xX×]\s*(\d+))?$/)
    if (!match) return null

    return {
      dice: parseInt(match[1]),
      sides: parseInt(match[2]),
      multiplier: match[3] ? parseInt(match[3]) : 1,
    }
  }

  // Roll starting gold
  const rollStartingGold = () => {
    const classData = getClassByName(characterClass)
    if (!classData?.startingGold) return

    const parsed = parseGoldFormula(classData.startingGold)
    if (!parsed) return

    const rolls: number[] = []
    for (let i = 0; i < parsed.dice; i++) {
      rolls.push(Math.floor(Math.random() * parsed.sides) + 1)
    }

    const total = rolls.reduce((sum, r) => sum + r, 0) * parsed.multiplier
    setRolledGold(total)
    setGoldRollDetails({ rolls, multiplier: parsed.multiplier })
  }

  // Build starting inventory from selected pack
  const buildStartingInventory = (): InventoryItem[] => {
    if (equipmentMode !== 'pack' || !selectedPack) return []

    const pack = getPackByName(selectedPack)
    if (!pack) return []

    return pack.contents.map(item => {
      const gearData = getGearByName(item.item)
      return {
        name: item.item,
        quantity: item.quantity,
        weight: gearData?.weight ?? 0,
        category: gearData?.category ?? 'adventuring gear',
      }
    })
  }

  // Build starting currency
  const buildStartingCurrency = (): Currency => {
    if (equipmentMode === 'gold' && rolledGold !== null) {
      return {
        cp: 0,
        sp: 0,
        ep: 0,
        gp: rolledGold,
        pp: 0,
      }
    }
    return { ...DEFAULT_CURRENCY }
  }

  // Build weapons array from selections and fixed items
  const buildStartingWeapons = (): Weapon[] => {
    const weapons: Weapon[] = []
    const classData = getClassByName(characterClass)
    if (!classData?.startingEquipment) return weapons

    classData.startingEquipment.forEach((choice, index) => {
      // Handle choices - use the selected weapon
      if (choice.choice) {
        const selectedName = weaponSelections[index]
        if (selectedName) {
          const weaponData = getWeaponByName(selectedName)
          if (weaponData) {
            weapons.push({
              name: weaponData.name,
              damage: weaponData.damage,
              damageType: weaponData.damageType,
              properties: [...weaponData.properties],
              isEquipped: true,
              isTwoHanding: false,
            })
          }
        }
      }

      // Handle fixed items - add all weapons automatically
      if (choice.items) {
        choice.items.forEach(item => {
          const weaponData = getWeaponByName(item.item)
          if (weaponData) {
            const quantity = item.quantity ?? 1
            for (let i = 0; i < quantity; i++) {
              weapons.push({
                name: weaponData.name,
                damage: weaponData.damage,
                damageType: weaponData.damageType,
                properties: [...weaponData.properties],
                isEquipped: true,
                isTwoHanding: false,
              })
            }
          }
        })
      }
    })

    return weapons
  }

  const handleCreateCharacter = async () => {
    if (!isValid || isSaving) return

    setIsSaving(true)
    setSaveError(null)

    const classData = getClassByName(characterClass)
    const speciesData = getSpeciesByName(species)
    const bgData = getBackgroundByName(background)

    // Apply background ability score bonuses to final scores
    const finalAbilityScores: AbilityScores = {
      strength: getFinalAbilityScore('strength'),
      dexterity: getFinalAbilityScore('dexterity'),
      constitution: getFinalAbilityScore('constitution'),
      intelligence: getFinalAbilityScore('intelligence'),
      wisdom: getFinalAbilityScore('wisdom'),
      charisma: getFinalAbilityScore('charisma'),
    }

    // Calculate max HP: hit die max + CON modifier (using final scores)
    const conMod = getAbilityModifier(finalAbilityScores.constitution)
    const hitDie = classData?.hitDie ?? 8
    const maxHp = hitDie + conMod

    // Build feats array with origin feat if background selected
    const feats = bgData ? [bgData.originFeat] : []

    // Determine class order skill proficiency
    // Cleric Thaumaturge grants Religion, Druid Magician grants Arcana
    const classOrderSkill: string | null =
      (characterClass === 'Cleric' && classOrder === 'Thaumaturge') ? 'religion'
      : (characterClass === 'Druid' && classOrder === 'Magician') ? 'arcana'
      : null

    // Apply background and class order skill proficiencies
    const finalSkills = skills.map((skill) => {
      const hasBackgroundProficiency = bgData?.skillProficiencies.includes(skill.name)
      const hasClassOrderProficiency = classOrderSkill === skill.name
      return {
        ...skill,
        proficient: skill.proficient || hasBackgroundProficiency || hasClassOrderProficiency || false,
      }
    })

    // Build starting weapons from selections and fixed items
    const startingWeapons = buildStartingWeapons()

    // Build starting armor from selections and fixed items
    const startingArmor = buildStartingArmor()

    // Build starting inventory from equipment pack
    const startingInventory = buildStartingInventory()

    // Build starting currency
    const startingCurrency = buildStartingCurrency()

    // Calculate initial AC based on equipped armor
    const equippedBodyArmor = startingArmor.find(a => !a.isShield && a.isEquipped)
    const hasShield = startingArmor.some(a => a.isShield && a.isEquipped)
    const dexMod = getAbilityModifier(abilityScores.dexterity)
    const wisMod = getAbilityModifier(abilityScores.wisdom)
    const calculatedAC = calculateAC(
      equippedBodyArmor?.name ?? null,
      hasShield,
      dexMod,
      conMod,
      wisMod,
      characterClass
    )

    // Apply ancestry mechanics - extract resistances and breath weapon data
    const selectedAncestryData = speciesData?.ancestry && speciesAncestry
      ? speciesData.ancestry.options.find(opt => opt.name === speciesAncestry)
      : undefined

    // Build damage resistances array from ancestry
    const damageResistances: string[] = []
    if (selectedAncestryData?.damageResistance) {
      damageResistances.push(selectedAncestryData.damageResistance)
      // Special case: Goliath Storm ancestry grants both lightning AND thunder resistance
      if (species === 'Goliath' && speciesAncestry === 'Storm') {
        damageResistances.push('thunder')
      }
    }

    // Build breath weapon data for Dragonborn
    const breathWeapon = selectedAncestryData?.damageType && selectedAncestryData?.breathWeaponShape
      ? { damageType: selectedAncestryData.damageType, shape: selectedAncestryData.breathWeaponShape }
      : undefined

    // Build character data object (without id - server generates it)
    const characterData = {
      name: name.trim(),
      imageUrl,
      species,
      class: characterClass,
      subclass,
      background,
      level,
      xp: 0,
      abilityScores: finalAbilityScores,
      skills: finalSkills,
      maxHp,
      currentHp: maxHp,
      tempHp: 0,
      armorClass: calculatedAC,
      speed: speciesData?.speed ?? 30,
      size: speciesData?.size ?? 'medium',
      weapons: startingWeapons,
      equipment: startingInventory,
      spells: [],
      spellSlots: { ...DEFAULT_SPELL_SLOTS },
      pactMagic: characterClass === 'Warlock' ? { ...getPactMagicSlots(level), expended: 0 } : undefined,
      eldritchInvocations: characterClass === 'Warlock' ? [] : undefined,
      battleMasterManeuvers: characterClass === 'Fighter' && subclass === 'Battle Master' ? [] : undefined,
      metamagicOptions: characterClass === 'Sorcerer' ? [] : undefined,
      spellcastingAbility: classData?.spellcastingAbility,
      classFeatures: getClassFeaturesForLevel(characterClass, level),
      feats,
      speciesTraits: speciesData?.traits ?? [],
      speciesAncestry: speciesData?.ancestry && speciesAncestry
        ? { choiceName: speciesData.ancestry.choiceName, selectedOption: speciesAncestry }
        : undefined,
      damageResistances: damageResistances.length > 0 ? damageResistances : undefined,
      breathWeapon,
      classOrder: selectedClassOrder
        ? { name: selectedClassOrder.name, description: selectedClassOrder.description }
        : undefined,
      currency: startingCurrency,
      deathSaves: { ...DEFAULT_DEATH_SAVES },
      hitDice: { total: level, spent: 0 },
      backstory: { ...DEFAULT_BACKSTORY },
      proficiencies: {
        armor: (() => {
          const baseArmor = classData?.armorProficiencies ?? []
          // Cleric Protector grants Heavy armor training
          if (characterClass === 'Cleric' && classOrder === 'Protector' && !baseArmor.includes('Heavy')) {
            return [...baseArmor, 'Heavy']
          }
          return baseArmor
        })(),
        weapons: (() => {
          const baseWeapons = classData?.weaponProficiencies ?? []
          // Cleric Protector and Druid Warden grant Martial weapon proficiency
          if ((characterClass === 'Cleric' && classOrder === 'Protector') ||
              (characterClass === 'Druid' && classOrder === 'Warden')) {
            if (!baseWeapons.includes('Martial')) {
              return [...baseWeapons, 'Martial']
            }
          }
          return baseWeapons
        })(),
        tools: bgData ? [bgData.toolProficiency] : [],
      },
      pendingASI: 0,
      armor: startingArmor,
      inventory: startingInventory,
      toolProficiencies: [],
    }

    try {
      // Save to API and get the server-generated ID
      const savedCharacter = await createCharacter(characterData)
      navigate(`/character/${savedCharacter.id}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save character'
      setSaveError(message)
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-start">
            <Link
              to="/"
              className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block"
            >
              &larr; Back to Characters
            </Link>
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Character
          </h1>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
          {/* Character Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Character Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter character name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Character Portrait */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Character Portrait
            </label>
            <CharacterImageInput
              value={imageUrl}
              onChange={setImageUrl}
              size="medium"
            />
          </div>

          {/* Species and Class row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Species */}
            <div>
              <label
                htmlFor="species"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Species *
              </label>
              <select
                id="species"
                value={species}
                onChange={(e) => handleSpeciesChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a species</option>
                {speciesOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Species Ancestry Selection */}
            {speciesData?.ancestry && (
              <div>
                <label
                  htmlFor="speciesAncestry"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {speciesData.ancestry.choiceName} *
                </label>
                <select
                  id="speciesAncestry"
                  value={speciesAncestry}
                  onChange={(e) => setSpeciesAncestry(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select {speciesData.ancestry.choiceName.toLowerCase()}</option>
                  {ancestryOptions.map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {selectedAncestryOption && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedAncestryOption.description}
                  </p>
                )}
              </div>
            )}

            {/* Class */}
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Class *
              </label>
              <div className="flex items-center gap-3">
                <select
                  id="class"
                  value={characterClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a class</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {characterClass && <ClassIcon className={characterClass} size={32} />}
              </div>
            </div>

            {/* Subclass */}
            {subclassOptions.length > 0 && (
              <div>
                <label
                  htmlFor="subclass"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {getClassByName(characterClass)?.subclassName || 'Subclass'}
                </label>
                <select
                  id="subclass"
                  value={subclass}
                  onChange={(e) => setSubclass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select a subclass (optional)</option>
                  {subclassOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Class Order (Divine Order, Primal Order, etc.) */}
            {classOrderOptions.length > 0 && (
              <div>
                <label
                  htmlFor="classOrder"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  {classData?.classOrderName || 'Class Order'} *
                </label>
                <select
                  id="classOrder"
                  value={classOrder}
                  onChange={(e) => setClassOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select {(classData?.classOrderName || 'class order').toLowerCase()}</option>
                  {classOrderOptions.map((order) => (
                    <option key={order.name} value={order.name}>
                      {order.name}
                    </option>
                  ))}
                </select>
                {selectedClassOrder && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedClassOrder.description}
                  </p>
                )}
              </div>
            )}

            {/* Background */}
            <div>
              <label
                htmlFor="background"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Background
              </label>
              <select
                id="background"
                value={background}
                onChange={(e) => handleBackgroundChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a background (optional)</option>
                {backgroundOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {backgroundData && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  <p><span className="font-medium">Origin Feat:</span> {backgroundData.originFeat.name}</p>
                  <p><span className="font-medium">Skills:</span> {backgroundData.skillProficiencies.map(s => SKILL_LABELS[s]).join(', ')}</p>
                  <p><span className="font-medium">Tool:</span> {backgroundData.toolProficiency}</p>
                </div>
              )}
            </div>
          </div>

          {/* Background Ability Score Increases */}
          {backgroundData && (
            <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Background Ability Score Increases
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your background grants ability score increases. Choose how to distribute them:
              </p>

              {/* Mode selection */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="abilityMode"
                    checked={abilityIncreaseMode === 'standard'}
                    onChange={() => {
                      setAbilityIncreaseMode('standard')
                      setBalancedAbilities([])
                    }}
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">+2 / +1</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="abilityMode"
                    checked={abilityIncreaseMode === 'balanced'}
                    onChange={() => {
                      setAbilityIncreaseMode('balanced')
                      setPrimaryAbility('')
                      setSecondaryAbility('')
                    }}
                    className="text-indigo-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">+1 / +1 / +1</span>
                </label>
              </div>

              {/* Standard mode: +2 and +1 dropdowns */}
              {abilityIncreaseMode === 'standard' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      +2 Bonus
                    </label>
                    <select
                      value={primaryAbility}
                      onChange={(e) => {
                        setPrimaryAbility(e.target.value as AbilityName)
                        if (e.target.value === secondaryAbility) {
                          setSecondaryAbility('')
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Select ability</option>
                      {backgroundData.abilityScoreOptions.map((ability) => (
                        <option key={ability} value={ability}>
                          {ABILITY_LABELS[ability as AbilityName]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      +1 Bonus
                    </label>
                    <select
                      value={secondaryAbility}
                      onChange={(e) => setSecondaryAbility(e.target.value as AbilityName)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="">Select ability</option>
                      {backgroundData.abilityScoreOptions
                        .filter((a) => a !== primaryAbility)
                        .map((ability) => (
                          <option key={ability} value={ability}>
                            {ABILITY_LABELS[ability as AbilityName]}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Balanced mode: select 3 abilities for +1 each */}
              {abilityIncreaseMode === 'balanced' && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Select 3 abilities ({balancedAbilities.length}/3 selected):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {backgroundData.abilityScoreOptions.map((ability) => {
                      const isSelected = balancedAbilities.includes(ability as AbilityName)
                      return (
                        <button
                          key={ability}
                          type="button"
                          onClick={() => toggleBalancedAbility(ability as AbilityName)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                          }`}
                        >
                          {ABILITY_LABELS[ability as AbilityName]} +1
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Proficiency Bonus display */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Level {level} &bull; Proficiency Bonus: <span className="font-bold text-indigo-600 dark:text-indigo-400">{formatModifier(proficiencyBonus)}</span>
            </p>
          </div>

          {/* Starting Equipment - Weapon Selection */}
          {characterClass && getClassWeaponChoices().length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Starting Equipment
              </h2>
              <div className="space-y-4">
                {getClassWeaponChoices().map(({ index, choice }) => {
                  // Handle choices (pick one)
                  if (choice.choice) {
                    // Collect all available weapons for this choice
                    const allWeaponOptions: WeaponData[] = []
                    const optionLabels: { label: string; weapons: WeaponData[] }[] = []

                    choice.choice.forEach(opt => {
                      const weapons = getWeaponOptionsForChoice(opt)
                      if (weapons.length > 0) {
                        optionLabels.push({ label: opt, weapons })
                        weapons.forEach(w => {
                          if (!allWeaponOptions.find(existing => existing.name === w.name)) {
                            allWeaponOptions.push(w)
                          }
                        })
                      }
                    })

                    if (allWeaponOptions.length === 0) return null

                    const selectedWeaponName = weaponSelections[index] || ''
                    const selectedWeapon = selectedWeaponName ? getWeaponByName(selectedWeaponName) : null

                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Choose a weapon:
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {choice.choice.join(' or ')}
                        </p>
                        <select
                          value={selectedWeaponName}
                          onChange={(e) => handleWeaponSelection(index, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select a weapon</option>
                          {allWeaponOptions.map((weapon) => (
                            <option key={weapon.name} value={weapon.name}>
                              {weapon.name}
                            </option>
                          ))}
                        </select>

                        {/* Display selected weapon stats */}
                        {selectedWeapon && (
                          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {selectedWeapon.name}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  ({selectedWeapon.category} {selectedWeapon.type})
                                </span>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedWeapon.weight} lb
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                              <span className="font-medium">{selectedWeapon.damage}</span>
                              <span className="text-gray-500 dark:text-gray-400"> {selectedWeapon.damageType}</span>
                              {selectedWeapon.versatileDamage && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  {' '}(versatile: {selectedWeapon.versatileDamage})
                                </span>
                              )}
                            </div>
                            {selectedWeapon.properties.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {selectedWeapon.properties.map((prop) => (
                                  <span
                                    key={prop}
                                    className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded"
                                  >
                                    {prop}
                                  </span>
                                ))}
                              </div>
                            )}
                            {selectedWeapon.range && (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Range: {selectedWeapon.range.normal}/{selectedWeapon.range.long} ft
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  }

                  // Handle fixed items (weapons the character automatically gets)
                  if (choice.items) {
                    const weaponItems = choice.items.filter(item => getWeaponByName(item.item))
                    if (weaponItems.length === 0) return null

                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          You will receive:
                        </p>
                        {weaponItems.map((item) => {
                          const weapon = getWeaponByName(item.item)!
                          return (
                            <div key={item.item} className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}{weapon.name}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    ({weapon.category} {weapon.type})
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {weapon.weight} lb
                                </span>
                              </div>
                              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                <span className="font-medium">{weapon.damage}</span>
                                <span className="text-gray-500 dark:text-gray-400"> {weapon.damageType}</span>
                              </div>
                              {weapon.properties.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {weapon.properties.map((prop) => (
                                    <span
                                      key={prop}
                                      className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded"
                                    >
                                      {prop}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          )}

          {/* Starting Equipment - Armor Selection */}
          {characterClass && getClassArmorChoices().length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Starting Armor
              </h2>
              <div className="space-y-4">
                {getClassArmorChoices().map(({ index, choice }) => {
                  // Handle choices (pick one)
                  if (choice.choice) {
                    // Collect all available armor options for this choice
                    const allArmorOptions: ArmorData[] = []

                    choice.choice.forEach(opt => {
                      // Check for "if proficient" options
                      const profMatch = opt.match(/^(.+?)\s*\(if proficient\)$/i)
                      if (profMatch) {
                        const armorName = profMatch[1].trim()
                        const armor = getArmorByName(armorName)
                        if (armor && isArmorProficient(armor.category)) {
                          if (!allArmorOptions.find(a => a.name === armor.name)) {
                            allArmorOptions.push(armor)
                          }
                        }
                        return
                      }

                      const armors = getArmorOptionsForChoice(opt)
                      armors.forEach(armor => {
                        if (!allArmorOptions.find(a => a.name === armor.name)) {
                          allArmorOptions.push(armor)
                        }
                      })
                    })

                    if (allArmorOptions.length === 0) return null

                    const selectedArmorName = armorSelections[index] || ''
                    const selectedArmor = selectedArmorName ? getArmorByName(selectedArmorName) : null

                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Choose armor:
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {choice.choice.join(' or ')}
                        </p>
                        <select
                          value={selectedArmorName}
                          onChange={(e) => handleArmorSelection(index, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select armor</option>
                          {allArmorOptions.map((armor) => (
                            <option key={armor.name} value={armor.name}>
                              {armor.name}
                            </option>
                          ))}
                        </select>

                        {/* Display selected armor stats */}
                        {selectedArmor && (
                          <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {selectedArmor.name}
                                </span>
                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                  ({selectedArmor.category} armor)
                                </span>
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedArmor.weight} lb
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="px-2 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                Base AC: {selectedArmor.baseAC}
                              </span>
                              {selectedArmor.dexBonus === true && (
                                <span className="px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                  + Dex modifier
                                </span>
                              )}
                              {selectedArmor.dexBonus === 'max2' && (
                                <span className="px-2 py-1 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
                                  + Dex (max 2)
                                </span>
                              )}
                              {selectedArmor.dexBonus === false && selectedArmor.category !== 'shield' && (
                                <span className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                  No Dex bonus
                                </span>
                              )}
                              {selectedArmor.stealthDisadvantage && (
                                <span className="px-2 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                                  Stealth disadvantage
                                </span>
                              )}
                              {selectedArmor.minStrength > 0 && (
                                <span className="px-2 py-1 text-sm bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded">
                                  Requires Str {selectedArmor.minStrength}
                                </span>
                              )}
                            </div>
                            {/* AC Preview */}
                            <div className="mt-3 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded border border-indigo-200 dark:border-indigo-700">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-indigo-700 dark:text-indigo-300">
                                  Calculated AC:
                                </span>
                                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                                  {getACPreview(selectedArmor.name)}
                                </span>
                              </div>
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                Based on your current Dex modifier ({formatModifier(getAbilityModifier(abilityScores.dexterity))})
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }

                  // Handle fixed armor items (armor the character automatically gets)
                  if (choice.items) {
                    const armorItems = choice.items.filter(item => {
                      const armor = getArmorByName(item.item)
                      return armor !== undefined && armor.category !== 'shield'
                    })
                    if (armorItems.length === 0) return null

                    return (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          You will receive:
                        </p>
                        {armorItems.map((item) => {
                          const armor = getArmorByName(item.item)!
                          return (
                            <div key={item.item} className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-semibold text-gray-900 dark:text-white">
                                    {armor.name}
                                  </span>
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                    ({armor.category} armor)
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {armor.weight} lb
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                  Base AC: {armor.baseAC}
                                </span>
                                {armor.dexBonus === true && (
                                  <span className="px-2 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                    + Dex modifier
                                  </span>
                                )}
                                {armor.dexBonus === 'max2' && (
                                  <span className="px-2 py-1 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
                                    + Dex (max 2)
                                  </span>
                                )}
                                {armor.stealthDisadvantage && (
                                  <span className="px-2 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                                    Stealth disadvantage
                                  </span>
                                )}
                              </div>
                              {/* AC Preview for fixed armor */}
                              <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-700">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-green-700 dark:text-green-300">
                                    Calculated AC:
                                  </span>
                                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {getACPreview(armor.name)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          )}

          {/* Equipment Pack or Starting Gold */}
          {characterClass && getClassByName(characterClass)?.startingGold && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Equipment Pack or Starting Gold
              </h2>

              {/* Toggle between pack and gold */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="equipmentMode"
                    value="pack"
                    checked={equipmentMode === 'pack'}
                    onChange={() => {
                      setEquipmentMode('pack')
                      setRolledGold(null)
                      setGoldRollDetails(null)
                    }}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">Equipment Pack</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="equipmentMode"
                    value="gold"
                    checked={equipmentMode === 'gold'}
                    onChange={() => {
                      setEquipmentMode('gold')
                      setSelectedPack('')
                    }}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-gray-900 dark:text-white font-medium">Starting Gold</span>
                </label>
              </div>

              {/* Pack selection */}
              {equipmentMode === 'pack' && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select an equipment pack:
                  </label>
                  {getClassPackChoices().length > 0 ? (
                    <>
                      <select
                        value={selectedPack}
                        onChange={(e) => setSelectedPack(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select a pack</option>
                        {getClassPackChoices().map((pack) => (
                          <option key={pack.name} value={pack.name}>
                            {pack.name} ({pack.cost})
                          </option>
                        ))}
                      </select>

                      {/* Display pack contents */}
                      {selectedPack && getPackByName(selectedPack) && (
                        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {selectedPack} Contents:
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {getPackByName(selectedPack)!.contents.map((item, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>{item.item}</span>
                                <span className="text-gray-500 dark:text-gray-400">×{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Select from available packs or choose any pack:
                    </p>
                  )}

                  {/* Show all packs if class doesn't have specific pack choices */}
                  {getClassPackChoices().length === 0 && (
                    <>
                      <select
                        value={selectedPack}
                        onChange={(e) => setSelectedPack(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-2"
                      >
                        <option value="">Select a pack</option>
                        {EQUIPMENT_PACKS.map((pack) => (
                          <option key={pack.name} value={pack.name}>
                            {pack.name} ({pack.cost})
                          </option>
                        ))}
                      </select>

                      {/* Display pack contents */}
                      {selectedPack && getPackByName(selectedPack) && (
                        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {selectedPack} Contents:
                          </h4>
                          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {getPackByName(selectedPack)!.contents.map((item, idx) => (
                              <li key={idx} className="flex justify-between">
                                <span>{item.item}</span>
                                <span className="text-gray-500 dark:text-gray-400">×{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Starting gold */}
              {equipmentMode === 'gold' && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Starting Gold Formula:
                      </p>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {getClassByName(characterClass)?.startingGold} gp
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={rollStartingGold}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Roll Gold
                    </button>
                  </div>

                  {/* Display roll result */}
                  {rolledGold !== null && goldRollDetails && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Rolled: [{goldRollDetails.rolls.join(', ')}]{goldRollDetails.multiplier > 1 && ` × ${goldRollDetails.multiplier}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                            {rolledGold} gp
                          </p>
                          <p className="text-xs text-yellow-600 dark:text-yellow-400">
                            Starting Gold
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {rolledGold === null && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click "Roll Gold" to determine your starting gold. You can purchase equipment later.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ability Scores */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ability Scores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ABILITY_ORDER.map((ability) => {
                const baseScore = abilityScores[ability]
                const bonus = getAbilityBonus(ability)
                const finalScore = getFinalAbilityScore(ability)
                const modifier = getAbilityModifier(finalScore)
                return (
                  <div
                    key={ability}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                  >
                    <label
                      htmlFor={ability}
                      className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2"
                    >
                      {ABILITY_LABELS[ability]}
                    </label>
                    <div className="flex items-center justify-center gap-1">
                      <input
                        type="number"
                        id={ability}
                        value={baseScore}
                        onChange={(e) => updateAbilityScore(ability, parseInt(e.target.value) || 10)}
                        min={1}
                        max={30}
                        className="w-16 px-2 py-1 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                      {bonus > 0 && (
                        <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                          +{bonus}
                        </span>
                      )}
                    </div>
                    {bonus > 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        = {finalScore}
                      </p>
                    )}
                    <p className="mt-2 text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {formatModifier(modifier)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Skills
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Passive Perception: <span className="font-bold">{passivePerception}</span>
              </p>
            </div>
            <div className="space-y-4">
              {ABILITY_ORDER.filter((ability) => SKILLS_BY_ABILITY[ability].length > 0).map((ability) => (
                <div key={ability}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    {ABILITY_LABELS[ability]}
                  </h3>
                  <div className="space-y-1">
                    {SKILLS_BY_ABILITY[ability].map((skillName) => {
                      const skill = skills.find((s) => s.name === skillName)!
                      const skillAbility = SKILL_ABILITIES[skillName]
                      const abilityMod = getAbilityModifier(getFinalAbilityScore(skillAbility))
                      const hasBackgroundProficiency = backgroundData?.skillProficiencies.includes(skillName) ?? false
                      const isProficient = skill.proficient || hasBackgroundProficiency
                      const bonus = getSkillBonus(abilityMod, proficiencyBonus, isProficient, skill.expertise)
                      return (
                        <div
                          key={skillName}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleSkillProficiency(skillName)}
                              disabled={hasBackgroundProficiency}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isProficient
                                  ? hasBackgroundProficiency
                                    ? 'bg-green-600 border-green-600 text-white cursor-not-allowed'
                                    : 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'border-gray-400 dark:border-gray-500'
                              }`}
                              title={hasBackgroundProficiency ? 'Granted by background' : undefined}
                            >
                              {isProficient && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </button>
                            <span className="text-gray-900 dark:text-white">
                              {SKILL_LABELS[skillName]}
                              {hasBackgroundProficiency && (
                                <span className="ml-1 text-xs text-green-600 dark:text-green-400">(BG)</span>
                              )}
                            </span>
                          </div>
                          <span className={`font-semibold ${isProficient ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {formatModifier(bonus)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error message */}
          {saveError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-red-700 dark:text-red-300 font-medium">Failed to save character</p>
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{saveError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              disabled={!isValid || isSaving}
              onClick={handleCreateCharacter}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                isValid && !isSaving
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving && (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {isSaving ? 'Saving...' : saveError ? 'Retry' : 'Create Character'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
