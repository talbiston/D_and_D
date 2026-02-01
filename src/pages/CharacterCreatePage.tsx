import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getSpeciesNames } from '../data/species'
import { getClassNames } from '../data/classes'
import type { AbilityScores, AbilityName, Skill, SkillName } from '../types'
import { DEFAULT_ABILITY_SCORES, SKILL_ABILITIES, createDefaultSkills } from '../types'
import { getAbilityModifier, formatModifier, getProficiencyBonus, getSkillBonus, getPassivePerception } from '../utils/calculations'
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
      armorClass: 10 + getAbilityModifier(abilityScores.dexterity),
      speed: speciesData?.speed ?? 30,
      size: speciesData?.size ?? 'medium',
      weapons: [],
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
