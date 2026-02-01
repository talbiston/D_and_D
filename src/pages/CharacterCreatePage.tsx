import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSpeciesNames } from '../data/species'
import { getClassNames } from '../data/classes'
import type { AbilityScores, AbilityName, Skill, SkillName, Weapon } from '../types'
import { DEFAULT_ABILITY_SCORES, SKILL_ABILITIES, createDefaultSkills } from '../types'
import { getAbilityModifier, formatModifier, getProficiencyBonus, getSkillBonus, getPassivePerception } from '../utils/calculations'
import { saveCharacter } from '../utils/storage'
import { getClassByName, getClassFeaturesForLevel, getSubclassNames } from '../data/classes'
import type { StartingEquipmentChoice } from '../data/classes'
import { getBackgroundNames, getBackgroundByName } from '../data/backgrounds'
import { getSpeciesByName } from '../data/species'
import type { Character } from '../types'
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

export default function CharacterCreatePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [species, setSpecies] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [subclass, setSubclass] = useState('')
  const [background, setBackground] = useState('')
  const [level] = useState(1)
  const [abilityScores, setAbilityScores] = useState<AbilityScores>({ ...DEFAULT_ABILITY_SCORES })
  const [skills, setSkills] = useState<Skill[]>(createDefaultSkills())
  const { isDark, toggle: toggleDarkMode } = useDarkModeContext()

  // Starting equipment weapon selections - track which weapon is selected for each choice index
  const [weaponSelections, setWeaponSelections] = useState<Record<number, string>>({})

  // Starting equipment armor selections - track which armor is selected for each choice index
  const [armorSelections, setArmorSelections] = useState<Record<number, string>>({})

  const backgroundOptions = getBackgroundNames()

  const subclassOptions = characterClass ? getSubclassNames(characterClass) : []

  const speciesOptions = getSpeciesNames()
  const classOptions = getClassNames()
  const proficiencyBonus = getProficiencyBonus(level)

  // Calculate passive perception
  const perceptionSkill = skills.find((s) => s.name === 'perception')
  const wisdomMod = getAbilityModifier(abilityScores.wisdom)
  const passivePerception = getPassivePerception(
    wisdomMod,
    proficiencyBonus,
    perceptionSkill?.proficient ?? false,
    perceptionSkill?.expertise ?? false
  )

  const isValid = name.trim() !== '' && species !== '' && characterClass !== ''

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

  // Reset weapon and armor selections when class changes
  const handleClassChange = (newClass: string) => {
    setCharacterClass(newClass)
    setSubclass('')
    setWeaponSelections({})
    setArmorSelections({})
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

  const handleCreateCharacter = () => {
    if (!isValid) return

    const classData = getClassByName(characterClass)
    const speciesData = getSpeciesByName(species)
    const backgroundData = getBackgroundByName(background)

    // Calculate max HP: hit die max + CON modifier
    const conMod = getAbilityModifier(abilityScores.constitution)
    const hitDie = classData?.hitDie ?? 8
    const maxHp = hitDie + conMod

    // Build feats array with origin feat if background selected
    const feats = backgroundData ? [backgroundData.originFeat] : []

    // Build starting weapons from selections and fixed items
    const startingWeapons = buildStartingWeapons()

    // Build starting armor from selections and fixed items
    const startingArmor = buildStartingArmor()

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

    // Build character object
    const character: Character = {
      id: crypto.randomUUID(),
      name: name.trim(),
      species,
      class: characterClass,
      subclass,
      background,
      level,
      xp: 0,
      abilityScores,
      skills,
      maxHp,
      currentHp: maxHp,
      tempHp: 0,
      armorClass: calculatedAC,
      speed: speciesData?.speed ?? 30,
      size: speciesData?.size ?? 'medium',
      weapons: startingWeapons,
      equipment: [],
      spells: [],
      spellSlots: { ...DEFAULT_SPELL_SLOTS },
      spellcastingAbility: classData?.spellcastingAbility,
      classFeatures: getClassFeaturesForLevel(characterClass, level),
      feats,
      speciesTraits: speciesData?.traits ?? [],
      currency: { ...DEFAULT_CURRENCY },
      deathSaves: { ...DEFAULT_DEATH_SAVES },
      hitDice: { total: level, spent: 0 },
      backstory: { ...DEFAULT_BACKSTORY },
      proficiencies: {
        armor: classData?.armorProficiencies ?? [],
        weapons: classData?.weaponProficiencies ?? [],
        tools: [],
      },
      armor: startingArmor,
      inventory: [],
      toolProficiencies: [],
    }

    // Save and navigate
    saveCharacter(character)
    navigate(`/character/${character.id}`)
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
                onChange={(e) => setSpecies(e.target.value)}
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

            {/* Class */}
            <div>
              <label
                htmlFor="class"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Class *
              </label>
              <select
                id="class"
                value={characterClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a class</option>
                {classOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
                onChange={(e) => setBackground(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a background (optional)</option>
                {backgroundOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {background && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Origin Feat: {getBackgroundByName(background)?.originFeat.name}
                </p>
              )}
            </div>
          </div>

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

          {/* Ability Scores */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ability Scores
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {ABILITY_ORDER.map((ability) => {
                const score = abilityScores[ability]
                const modifier = getAbilityModifier(score)
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
                    <input
                      type="number"
                      id={ability}
                      value={score}
                      onChange={(e) => updateAbilityScore(ability, parseInt(e.target.value) || 10)}
                      min={1}
                      max={30}
                      className="w-20 px-2 py-1 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
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
                      const abilityMod = getAbilityModifier(abilityScores[SKILL_ABILITIES[skillName]])
                      const bonus = getSkillBonus(abilityMod, proficiencyBonus, skill.proficient, skill.expertise)
                      return (
                        <div
                          key={skillName}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-3 py-2"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleSkillProficiency(skillName)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                skill.proficient
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : 'border-gray-400 dark:border-gray-500'
                              }`}
                            >
                              {skill.proficient && (
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
                            </span>
                          </div>
                          <span className={`font-semibold ${skill.proficient ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
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

          {/* Navigation */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              disabled={!isValid}
              onClick={handleCreateCharacter}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                isValid
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Create Character
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
