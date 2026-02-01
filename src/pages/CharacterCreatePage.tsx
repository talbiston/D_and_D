import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSpeciesNames } from '../data/species'
import { getClassNames } from '../data/classes'
import type { AbilityScores, AbilityName, Skill, SkillName } from '../types'
import { DEFAULT_ABILITY_SCORES, SKILL_ABILITIES, createDefaultSkills } from '../types'
import { getAbilityModifier, formatModifier, getProficiencyBonus, getSkillBonus, getPassivePerception, getPactMagicSlots } from '../utils/calculations'
import { saveCharacter } from '../utils/storage'
import { getClassByName, getClassFeaturesForLevel, getSubclassNames } from '../data/classes'
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
  const [species, setSpecies] = useState('')
  const [characterClass, setCharacterClass] = useState('')
  const [subclass, setSubclass] = useState('')
  const [background, setBackground] = useState('')
  const [level] = useState(1)
  const [abilityScores, setAbilityScores] = useState<AbilityScores>({ ...DEFAULT_ABILITY_SCORES })
  const [skills, setSkills] = useState<Skill[]>(createDefaultSkills())
  const { isDark, toggle: toggleDarkMode } = useDarkModeContext()

  // Background ability score increase state
  const [abilityIncreaseMode, setAbilityIncreaseMode] = useState<AbilityIncreaseMode>('standard')
  const [primaryAbility, setPrimaryAbility] = useState<AbilityName | ''>('')
  const [secondaryAbility, setSecondaryAbility] = useState<AbilityName | ''>('')
  const [balancedAbilities, setBalancedAbilities] = useState<AbilityName[]>([])

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

  const handleCreateCharacter = () => {
    if (!isValid) return

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

    // Apply background skill proficiencies
    const finalSkills = skills.map((skill) => {
      const hasBackgroundProficiency = bgData?.skillProficiencies.includes(skill.name)
      return {
        ...skill,
        proficient: skill.proficient || hasBackgroundProficiency || false,
      }
    })

    // Build equipment from background
    const equipment = bgData?.equipment.map((item) => ({
      name: item,
      quantity: 1,
    })) ?? []

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
      abilityScores: finalAbilityScores,
      skills: finalSkills,
      maxHp,
      currentHp: maxHp,
      tempHp: 0,
      armorClass: 10 + getAbilityModifier(finalAbilityScores.dexterity),
      speed: speciesData?.speed ?? 30,
      size: speciesData?.size ?? 'medium',
      weapons: [],
      equipment,
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
      currency: { ...DEFAULT_CURRENCY },
      deathSaves: { ...DEFAULT_DEATH_SAVES },
      hitDice: { total: level, spent: 0 },
      backstory: { ...DEFAULT_BACKSTORY },
      proficiencies: {
        armor: classData?.armorProficiencies ?? [],
        weapons: classData?.weaponProficiencies ?? [],
        tools: bgData ? [bgData.toolProficiency] : [],
      },
      pendingASI: 0,
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
                onChange={(e) => {
                  setCharacterClass(e.target.value)
                  setSubclass('')
                }}
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
