import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Character } from '../types'
import { getCharacterById, saveCharacter, exportCharacterAsJson } from '../utils/storage'
import { getAbilityModifier, getProficiencyBonus, getPassivePerception, formatModifier, getSavingThrowBonus, getSkillBonus } from '../utils/calculations'
import { getClassByName, getClassFeaturesForLevel, isSpellcaster, getSubclassFeaturesForLevel } from '../data/classes'
import { getSpeciesByName } from '../data/species'
import { getSpellSaveDC, getSpellAttackBonus, getXPForNextLevel, XP_THRESHOLDS } from '../utils/calculations'
import { getSpellsByClass } from '../data/spells'
import { FEATS, getFeatByName } from '../data/feats'
import type { FeatData } from '../data/feats'
import type { Spell } from '../types'
import type { AbilityName, SkillName, DamageType, WeaponProperty, Weapon, Alignment } from '../types'
import { SKILL_ABILITIES } from '../types'
import { useDarkModeContext } from '../context/DarkModeContext'
import DiceRoller from '../components/DiceRoller'
import LevelUpHPModal from '../components/LevelUpHPModal'
import ASIModal, { type ASIChoice } from '../components/ASIModal'
import LevelUpSummaryModal from '../components/LevelUpSummaryModal'
import { levelUp, type LevelUpResult, getFeatureDisplayName } from '../utils/calculations'

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
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

const SKILLS_BY_ABILITY: Record<AbilityName, SkillName[]> = {
  strength: ['athletics'],
  dexterity: ['acrobatics', 'sleightOfHand', 'stealth'],
  constitution: [],
  intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
  wisdom: ['animalHandling', 'insight', 'medicine', 'perception', 'survival'],
  charisma: ['deception', 'intimidation', 'performance', 'persuasion'],
}

export default function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHpModal, setShowHpModal] = useState(false)
  const [hpChangeAmount, setHpChangeAmount] = useState('')
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set())
  const [showSpellPicker, setShowSpellPicker] = useState(false)
  const [spellSearchQuery, setSpellSearchQuery] = useState('')
  const [spellLevelFilter, setSpellLevelFilter] = useState<number | 'all'>('all')
  const [showAddEquipment, setShowAddEquipment] = useState(false)
  const [newEquipmentName, setNewEquipmentName] = useState('')
  const [newEquipmentQuantity, setNewEquipmentQuantity] = useState(1)
  const [showAddWeapon, setShowAddWeapon] = useState(false)
  const [newWeaponName, setNewWeaponName] = useState('')
  const [newWeaponDamage, setNewWeaponDamage] = useState('1d6')
  const [newWeaponDamageType, setNewWeaponDamageType] = useState<DamageType>('slashing')
  const [newWeaponProperties, setNewWeaponProperties] = useState<WeaponProperty[]>([])
  const [newLanguage, setNewLanguage] = useState('')
  const [activeTab, setActiveTab] = useState<'stats' | 'combat' | 'spells' | 'equipment' | 'backstory'>('stats')
  const [showDiceRoller, setShowDiceRoller] = useState(false)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [editLevel, setEditLevel] = useState(1)
  const [editXp, setEditXp] = useState(0)
  const [showFeatPicker, setShowFeatPicker] = useState(false)
  const [featSearchQuery, setFeatSearchQuery] = useState('')
  const [showLevelUpHPModal, setShowLevelUpHPModal] = useState(false)
  const [showASIModal, setShowASIModal] = useState(false)
  const [pendingLevelUp, setPendingLevelUp] = useState<{ levelUpResult: LevelUpResult; hpGain: number } | null>(null)
  const [levelUpSummary, setLevelUpSummary] = useState<{
    newLevel: number
    previousLevel: number
    hpGain: number
    newMaxHp: number
    levelUpResult: LevelUpResult
    asiChoice?: ASIChoice
  } | null>(null)
  const { isDark, toggle: toggleDarkMode } = useDarkModeContext()

  useEffect(() => {
    if (id) {
      const loaded = getCharacterById(id)
      setCharacter(loaded)
    }
    setLoading(false)
  }, [id])

  const updateCharacter = useCallback((updates: Partial<Character>) => {
    if (!character) return
    const updated = { ...character, ...updates }
    setCharacter(updated)
    saveCharacter(updated)
  }, [character])

  const handleDamage = () => {
    if (!character) return
    const amount = parseInt(hpChangeAmount) || 0
    if (amount <= 0) return

    let remaining = amount
    let newTempHp = character.tempHp
    let newCurrentHp = character.currentHp

    // Damage temp HP first
    if (newTempHp > 0) {
      if (remaining >= newTempHp) {
        remaining -= newTempHp
        newTempHp = 0
      } else {
        newTempHp -= remaining
        remaining = 0
      }
    }

    // Then damage current HP
    newCurrentHp = Math.max(0, newCurrentHp - remaining)

    updateCharacter({ currentHp: newCurrentHp, tempHp: newTempHp })
    setHpChangeAmount('')
    setShowHpModal(false)
  }

  const handleHeal = () => {
    if (!character) return
    const amount = parseInt(hpChangeAmount) || 0
    if (amount <= 0) return

    const newCurrentHp = Math.min(character.maxHp, character.currentHp + amount)
    updateCharacter({ currentHp: newCurrentHp })
    setHpChangeAmount('')
    setShowHpModal(false)
  }

  const toggleDeathSaveSuccess = () => {
    if (!character) return
    const current = character.deathSaves.successes
    const newSuccesses = current >= 3 ? 0 : current + 1
    updateCharacter({
      deathSaves: { ...character.deathSaves, successes: newSuccesses }
    })
  }

  const toggleDeathSaveFailure = () => {
    if (!character) return
    const current = character.deathSaves.failures
    const newFailures = current >= 3 ? 0 : current + 1
    updateCharacter({
      deathSaves: { ...character.deathSaves, failures: newFailures }
    })
  }

  const resetDeathSaves = () => {
    if (!character) return
    updateCharacter({
      deathSaves: { successes: 0, failures: 0 }
    })
  }

  const toggleFeatureExpanded = (featureName: string) => {
    setExpandedFeatures((prev) => {
      const next = new Set(prev)
      if (next.has(featureName)) {
        next.delete(featureName)
      } else {
        next.add(featureName)
      }
      return next
    })
  }

  const toggleSpellSlot = (level: number) => {
    if (!character) return
    const slotKey = level as keyof typeof character.spellSlots
    const current = character.spellSlots[slotKey]
    const newExpended = current.expended >= current.total ? 0 : current.expended + 1
    updateCharacter({
      spellSlots: {
        ...character.spellSlots,
        [level]: { ...current, expended: newExpended }
      }
    })
  }

  const longRest = () => {
    if (!character) return
    const resetSlots = { ...character.spellSlots }
    for (const level of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      resetSlots[level] = { ...resetSlots[level], expended: 0 }
    }
    updateCharacter({
      spellSlots: resetSlots,
      currentHp: character.maxHp,
      hitDice: { ...character.hitDice, spent: 0 }
    })
  }

  const addSpell = (spell: Spell) => {
    if (!character) return
    // Don't add duplicate spells
    if (character.spells.some((s) => s.name === spell.name)) return
    updateCharacter({
      spells: [...character.spells, spell]
    })
    setShowSpellPicker(false)
    setSpellSearchQuery('')
    setSpellLevelFilter('all')
  }

  const removeSpell = (spellName: string) => {
    if (!character) return
    updateCharacter({
      spells: character.spells.filter((s) => s.name !== spellName)
    })
  }

  const addEquipment = () => {
    if (!character || !newEquipmentName.trim()) return
    const newItem = {
      name: newEquipmentName.trim(),
      quantity: newEquipmentQuantity || 1
    }
    updateCharacter({
      equipment: [...character.equipment, newItem]
    })
    setNewEquipmentName('')
    setNewEquipmentQuantity(1)
    setShowAddEquipment(false)
  }

  const removeEquipment = (index: number) => {
    if (!character) return
    const newEquipment = [...character.equipment]
    newEquipment.splice(index, 1)
    updateCharacter({ equipment: newEquipment })
  }

  const updateEquipmentQuantity = (index: number, quantity: number) => {
    if (!character) return
    const newEquipment = [...character.equipment]
    newEquipment[index] = { ...newEquipment[index], quantity }
    updateCharacter({ equipment: newEquipment })
  }

  const updateCurrency = (type: 'cp' | 'sp' | 'ep' | 'gp' | 'pp', value: number) => {
    if (!character) return
    updateCharacter({
      currency: { ...character.currency, [type]: value }
    })
  }

  const getWeaponAttackBonus = (weapon: Weapon) => {
    if (!character) return 0
    const profBonus = getProficiencyBonus(character.level)
    const strMod = getAbilityModifier(character.abilityScores.strength)
    const dexMod = getAbilityModifier(character.abilityScores.dexterity)

    // Use DEX for finesse, ranged, or ammunition weapons, otherwise STR
    const usesDex = weapon.properties.some(p =>
      p === 'finesse' || p === 'ammunition' || p === 'range'
    )
    const abilityMod = usesDex ? Math.max(strMod, dexMod) : strMod

    return profBonus + abilityMod + (weapon.attackBonus || 0)
  }

  const getWeaponDamageBonus = (weapon: Weapon) => {
    if (!character) return 0
    const strMod = getAbilityModifier(character.abilityScores.strength)
    const dexMod = getAbilityModifier(character.abilityScores.dexterity)

    const usesDex = weapon.properties.some(p =>
      p === 'finesse' || p === 'ammunition' || p === 'range'
    )
    return usesDex ? Math.max(strMod, dexMod) : strMod
  }

  const addWeapon = () => {
    if (!character || !newWeaponName.trim()) return
    const newWeapon: Weapon = {
      name: newWeaponName.trim(),
      damage: newWeaponDamage,
      damageType: newWeaponDamageType,
      properties: newWeaponProperties
    }
    updateCharacter({
      weapons: [...character.weapons, newWeapon]
    })
    setNewWeaponName('')
    setNewWeaponDamage('1d6')
    setNewWeaponDamageType('slashing')
    setNewWeaponProperties([])
    setShowAddWeapon(false)
  }

  const removeWeapon = (index: number) => {
    if (!character) return
    const newWeapons = [...character.weapons]
    newWeapons.splice(index, 1)
    updateCharacter({ weapons: newWeapons })
  }

  const toggleWeaponProperty = (prop: WeaponProperty) => {
    if (newWeaponProperties.includes(prop)) {
      setNewWeaponProperties(newWeaponProperties.filter(p => p !== prop))
    } else {
      setNewWeaponProperties([...newWeaponProperties, prop])
    }
  }

  const updateBackstory = (field: keyof typeof character.backstory, value: string | Alignment | string[]) => {
    if (!character) return
    updateCharacter({
      backstory: { ...character.backstory, [field]: value }
    })
  }

  const addLanguage = () => {
    if (!character || !newLanguage.trim()) return
    if (character.backstory.languages.includes(newLanguage.trim())) return
    updateCharacter({
      backstory: {
        ...character.backstory,
        languages: [...character.backstory.languages, newLanguage.trim()]
      }
    })
    setNewLanguage('')
  }

  const removeLanguage = (lang: string) => {
    if (!character) return
    updateCharacter({
      backstory: {
        ...character.backstory,
        languages: character.backstory.languages.filter(l => l !== lang)
      }
    })
  }

  const openLevelModal = () => {
    if (!character) return
    setEditLevel(character.level)
    setEditXp(character.xp)
    setShowLevelModal(true)
  }

  const saveLevelChanges = (useAverage: boolean = true) => {
    if (!character) return

    const oldLevel = character.level
    const newLevel = editLevel
    let newMaxHp = character.maxHp

    // Calculate HP change if level changed
    if (newLevel !== oldLevel && newLevel > oldLevel) {
      const classData = getClassByName(character.class)
      if (classData) {
        const hitDie = classData.hitDie
        const conMod = getAbilityModifier(character.abilityScores.constitution)
        const levelsGained = newLevel - oldLevel

        for (let i = 0; i < levelsGained; i++) {
          if (useAverage) {
            // Average HP per level: (hitDie / 2) + 1 + CON mod
            newMaxHp += Math.floor(hitDie / 2) + 1 + conMod
          } else {
            // Roll for HP: random 1-hitDie + CON mod (minimum 1)
            const roll = Math.floor(Math.random() * hitDie) + 1
            newMaxHp += Math.max(1, roll + conMod)
          }
        }
      }
    } else if (newLevel < oldLevel) {
      // Recalculate HP from scratch when reducing level
      const classData = getClassByName(character.class)
      if (classData) {
        const hitDie = classData.hitDie
        const conMod = getAbilityModifier(character.abilityScores.constitution)
        // Level 1: max hit die + CON mod
        newMaxHp = hitDie + conMod
        // Levels 2+: average
        for (let i = 2; i <= newLevel; i++) {
          newMaxHp += Math.floor(hitDie / 2) + 1 + conMod
        }
      }
    }

    updateCharacter({
      level: newLevel,
      xp: editXp,
      maxHp: newMaxHp,
      currentHp: Math.min(character.currentHp, newMaxHp),
      hitDice: { ...character.hitDice, total: newLevel }
    })
    setShowLevelModal(false)
  }

  const startLevelUp = () => {
    if (!character || character.level >= 20) return
    setShowLevelUpHPModal(true)
  }

  const handleLevelUpHPConfirm = (hpGain: number) => {
    if (!character) return
    setShowLevelUpHPModal(false)

    // Use the levelUp utility to get updated character with features and spell slots
    const levelUpResult = levelUp(character)

    // Check if this level grants an ASI
    if (levelUpResult.choices.needsASI) {
      // Store pending level up data and show ASI modal
      setPendingLevelUp({ levelUpResult, hpGain })
      setShowASIModal(true)
    } else {
      // No ASI at this level, complete level-up directly
      const newMaxHp = character.maxHp + hpGain
      updateCharacter({
        ...levelUpResult.character,
        maxHp: newMaxHp,
        currentHp: Math.min(character.currentHp + hpGain, newMaxHp)
      })
      // Show level-up summary
      setLevelUpSummary({
        newLevel: levelUpResult.character.level,
        previousLevel: character.level,
        hpGain,
        newMaxHp,
        levelUpResult,
      })
    }
  }

  const handleASIConfirm = (choice: ASIChoice) => {
    if (!character || !pendingLevelUp) return
    const { levelUpResult, hpGain } = pendingLevelUp
    const newMaxHp = character.maxHp + hpGain

    if (choice.type === 'asi') {
      // Apply ability score increases
      const newAbilityScores = { ...levelUpResult.character.abilityScores }
      for (const increase of choice.increases) {
        newAbilityScores[increase.ability] = Math.min(20, newAbilityScores[increase.ability] + increase.amount)
      }
      updateCharacter({
        ...levelUpResult.character,
        maxHp: newMaxHp,
        currentHp: Math.min(character.currentHp + hpGain, newMaxHp),
        abilityScores: newAbilityScores
      })
    } else {
      // Apply feat
      const newFeats = [...levelUpResult.character.feats, {
        name: choice.feat.name,
        description: choice.feat.description,
        prerequisite: choice.feat.prerequisite
      }]
      updateCharacter({
        ...levelUpResult.character,
        maxHp: newMaxHp,
        currentHp: Math.min(character.currentHp + hpGain, newMaxHp),
        feats: newFeats
      })
    }

    setShowASIModal(false)
    setPendingLevelUp(null)

    // Show level-up summary with ASI/feat choice
    setLevelUpSummary({
      newLevel: levelUpResult.character.level,
      previousLevel: character.level,
      hpGain,
      newMaxHp,
      levelUpResult,
      asiChoice: choice,
    })
  }

  const handleASICancel = () => {
    // Cancel ASI modal - also cancels the level up
    setShowASIModal(false)
    setPendingLevelUp(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Character Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The character you're looking for doesn't exist or has been deleted.
          </p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Back to Characters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back link */}
        <Link
          to="/"
          className="text-indigo-600 dark:text-indigo-400 hover:underline mb-4 inline-block no-print"
        >
          &larr; Back to Characters
        </Link>

        {/* Character Header */}
        <header className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {character.name}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                <button
                  onClick={openLevelModal}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                  title="Click to edit level and XP"
                >
                  Level {character.level}
                </button>
                {character.level < 20 && (
                  <button
                    onClick={startLevelUp}
                    className="ml-2 px-2 py-0.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors no-print"
                    title="Level up your character"
                  >
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      Level Up
                    </span>
                  </button>
                )}
                {' '}{character.species} {character.class}
                {character.subclass && ` (${character.subclass})`}
              </p>
              {character.background && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {character.background} Background
                </p>
              )}
            </div>
            <div className="flex gap-2 no-print">
              <button
                onClick={() => setShowDiceRoller(true)}
                className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                title="Roll dice"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </button>
              <button
                onClick={() => window.print()}
                className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                title="Print character sheet"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              </button>
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
              <button
                onClick={() => exportCharacterAsJson(character)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6 overflow-x-auto no-print">
          <nav className="flex">
            {[
              { id: 'stats', label: 'Stats' },
              { id: 'combat', label: 'Combat' },
              ...(isSpellcaster(character.class) ? [{ id: 'spells', label: 'Spells' }] : []),
              { id: 'equipment', label: 'Equipment' },
              { id: 'backstory', label: 'Backstory' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 min-w-[100px] px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-b-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <>
            {/* Ability Scores */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ability Scores
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {(() => {
                  const classData = getClassByName(character.class)
                  const savingThrowProficiencies = classData?.savingThrows ?? []
                  const profBonus = getProficiencyBonus(character.level)

                  return ABILITY_ORDER.map((ability) => {
                    const score = character.abilityScores[ability]
                    const modifier = getAbilityModifier(score)
                    const isProficient = savingThrowProficiencies.includes(ability)
                    const saveBonus = getSavingThrowBonus(modifier, profBonus, isProficient)

                    return (
                      <div
                        key={ability}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center"
                      >
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                          {ABILITY_LABELS[ability]}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {score}
                        </p>
                        <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatModifier(modifier)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Save</p>
                          <p className={`text-sm font-semibold ${isProficient ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {isProficient && <span className="mr-1">&#9679;</span>}
                            {formatModifier(saveBonus)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(() => {
                  const profBonus = getProficiencyBonus(character.level)

                  return ABILITY_ORDER.filter((ability) => SKILLS_BY_ABILITY[ability].length > 0).map((ability) => (
                    <div key={ability}>
                      <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                        {ABILITY_LABELS[ability]}
                      </h3>
                      <div className="space-y-1">
                        {SKILLS_BY_ABILITY[ability].map((skillName) => {
                          const skill = character.skills.find((s) => s.name === skillName)
                          const abilityMod = getAbilityModifier(character.abilityScores[SKILL_ABILITIES[skillName]])
                          const bonus = getSkillBonus(
                            abilityMod,
                            profBonus,
                            skill?.proficient ?? false,
                            skill?.expertise ?? false
                          )
                          const isProficient = skill?.proficient ?? false
                          const hasExpertise = skill?.expertise ?? false

                          return (
                            <div
                              key={skillName}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded px-3 py-2"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-xs ${
                                    hasExpertise
                                      ? 'bg-indigo-600 border-indigo-600 text-white'
                                      : isProficient
                                      ? 'bg-indigo-600 border-indigo-600'
                                      : 'border-gray-400 dark:border-gray-500'
                                  }`}
                                >
                                  {hasExpertise && 'E'}
                                </span>
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {SKILL_LABELS[skillName]}
                                </span>
                              </div>
                              <span
                                className={`font-semibold ${
                                  isProficient
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {formatModifier(bonus)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </>
        )}

        {/* Combat Tab */}
        {activeTab === 'combat' && (
          <>
        {/* Combat Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {/* Armor Class */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Armor Class
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {character.armorClass}
            </p>
          </div>

          {/* Initiative */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Initiative
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatModifier(getAbilityModifier(character.abilityScores.dexterity))}
            </p>
          </div>

          {/* Speed */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Speed
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {character.speed} ft
            </p>
          </div>

          {/* Passive Perception */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Passive Perception
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {(() => {
                const percSkill = character.skills.find((s) => s.name === 'perception')
                const wisdomMod = getAbilityModifier(character.abilityScores.wisdom)
                const profBonus = getProficiencyBonus(character.level)
                return getPassivePerception(wisdomMod, profBonus, percSkill?.proficient ?? false, percSkill?.expertise ?? false)
              })()}
            </p>
          </div>

          {/* Size */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Size
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {character.size}
            </p>
          </div>
        </div>

        {/* HP, Hit Dice, Death Saves Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Hit Points */}
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all"
            onClick={() => setShowHpModal(true)}
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Hit Points <span className="text-indigo-500">(click to adjust)</span>
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className={`text-4xl font-bold ${character.currentHp <= character.maxHp / 4 ? 'text-red-600 dark:text-red-400' : character.currentHp <= character.maxHp / 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {character.currentHp}
                </p>
                <p className="text-sm text-gray-500">Current</p>
              </div>
              <p className="text-2xl text-gray-400">/</p>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  {character.maxHp}
                </p>
                <p className="text-sm text-gray-500">Max</p>
              </div>
              {character.tempHp > 0 && (
                <>
                  <p className="text-2xl text-gray-400">+</p>
                  <div className="text-center">
                    <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                      {character.tempHp}
                    </p>
                    <p className="text-sm text-gray-500">Temp</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Hit Dice */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Hit Dice
            </p>
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {character.hitDice.total - character.hitDice.spent}
                </p>
                <p className="text-sm text-gray-500">Remaining</p>
              </div>
              <p className="text-2xl text-gray-400">/</p>
              <div className="text-center">
                <p className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
                  {character.hitDice.total}
                </p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>

          {/* Death Saves */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
              Death Saves
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Successes</p>
                <button
                  onClick={toggleDeathSaveSuccess}
                  className="flex gap-1 hover:opacity-80 transition-opacity"
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`success-${i}`}
                      className={`w-5 h-5 rounded-full border-2 transition-colors ${
                        i < character.deathSaves.successes
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-400 dark:border-gray-500 hover:border-green-400'
                      }`}
                    />
                  ))}
                </button>
                {character.deathSaves.successes >= 3 && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-semibold">Stabilized!</p>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-1">Failures</p>
                <button
                  onClick={toggleDeathSaveFailure}
                  className="flex gap-1 hover:opacity-80 transition-opacity"
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`failure-${i}`}
                      className={`w-5 h-5 rounded-full border-2 transition-colors ${
                        i < character.deathSaves.failures
                          ? 'bg-red-500 border-red-500'
                          : 'border-gray-400 dark:border-gray-500 hover:border-red-400'
                      }`}
                    />
                  ))}
                </button>
                {character.deathSaves.failures >= 3 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">Dead</p>
                )}
              </div>
            </div>
            {(character.deathSaves.successes > 0 || character.deathSaves.failures > 0) && (
              <button
                onClick={resetDeathSaves}
                className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Reset Death Saves
              </button>
            )}
          </div>
        </div>

        {/* Class Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Class Features {character.subclass && <span className="text-sm font-normal text-gray-500">({character.subclass})</span>}
          </h2>
          {(() => {
            const classFeatures = getClassFeaturesForLevel(character.class, character.level)
            const subclassFeatures = character.subclass
              ? getSubclassFeaturesForLevel(character.class, character.subclass, character.level)
              : []
            const features = [...classFeatures, ...subclassFeatures].sort((a, b) => a.level - b.level)
            if (features.length === 0) {
              return (
                <p className="text-gray-500 dark:text-gray-400">
                  No class features available.
                </p>
              )
            }
            return (
              <div className="space-y-2">
                {features.map((feature) => {
                  const isExpanded = expandedFeatures.has(feature.name)
                  const displayName = getFeatureDisplayName(feature.name, character.class, character.level)
                  return (
                    <div
                      key={feature.name}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFeatureExpanded(feature.name)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {displayName}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            Level {feature.level}
                          </span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-300">
                          {feature.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>

        {/* Species Traits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Species Traits
          </h2>
          {(() => {
            const speciesData = getSpeciesByName(character.species)
            const traits = speciesData?.traits ?? character.speciesTraits
            if (!traits || traits.length === 0) {
              return (
                <p className="text-gray-500 dark:text-gray-400">
                  No species traits available.
                </p>
              )
            }
            return (
              <div className="space-y-2">
                {traits.map((trait) => {
                  const isExpanded = expandedFeatures.has(`trait-${trait.name}`)
                  return (
                    <div
                      key={trait.name}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFeatureExpanded(`trait-${trait.name}`)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {trait.name}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-300">
                          {trait.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>

        {/* Feats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Feats
            </h2>
            <button
              onClick={() => setShowFeatPicker(true)}
              className="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
            >
              Add Feat
            </button>
          </div>
          {character.feats.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No feats yet. Click "Add Feat" to add one.
            </p>
          ) : (
            <div className="space-y-2">
              {character.feats.map((feat) => {
                const isExpanded = expandedFeatures.has(`feat-${feat.name}`)
                const featData = getFeatByName(feat.name)
                return (
                  <div
                    key={feat.name}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleFeatureExpanded(`feat-${feat.name}`)}
                        className="flex-1 px-4 py-3 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <span className="font-medium text-gray-900 dark:text-white">
                          {feat.name}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          updateCharacter({
                            feats: character.feats.filter((f) => f.name !== feat.name)
                          })
                        }}
                        className="px-3 py-3 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Remove feat"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-3 text-sm text-gray-600 dark:text-gray-300">
                        {featData?.prerequisite && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                            Prerequisite: {featData.prerequisite}
                          </p>
                        )}
                        {feat.description}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
          </>
        )}

        {/* Spells Tab */}
        {activeTab === 'spells' && isSpellcaster(character.class) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Spellcasting
              </h2>
              <button
                onClick={longRest}
                className="text-sm px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
              >
                Long Rest
              </button>
            </div>

            {/* Spellcasting Stats */}
            {(() => {
              const classData = getClassByName(character.class)
              const spellAbility = classData?.spellcastingAbility
              if (!spellAbility) return null

              const abilityMod = getAbilityModifier(character.abilityScores[spellAbility])
              const profBonus = getProficiencyBonus(character.level)
              const spellSaveDC = getSpellSaveDC(profBonus, abilityMod)
              const spellAttack = getSpellAttackBonus(profBonus, abilityMod)

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Ability</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{spellAbility}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Modifier</p>
                    <p className="font-semibold text-indigo-600 dark:text-indigo-400">{formatModifier(abilityMod)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Spell Save DC</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{spellSaveDC}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Spell Attack</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatModifier(spellAttack)}</p>
                  </div>
                </div>
              )
            })()}

            {/* Spell Slots */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Spell Slots</h3>
              <div className="flex flex-wrap gap-4">
                {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((level) => {
                  const slot = character.spellSlots[level]
                  if (slot.total === 0) return null
                  return (
                    <div key={level} className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Level {level}</p>
                      <button
                        onClick={() => toggleSpellSlot(level)}
                        className="flex gap-1"
                      >
                        {Array.from({ length: slot.total }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-4 h-4 rounded-full border-2 transition-colors ${
                              i < slot.total - slot.expended
                                ? 'bg-indigo-500 border-indigo-500'
                                : 'border-gray-400 dark:border-gray-500'
                            }`}
                          />
                        ))}
                      </button>
                    </div>
                  )
                })}
                {([1, 2, 3, 4, 5, 6, 7, 8, 9] as const).every((level) => character.spellSlots[level].total === 0) && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No spell slots at this level</p>
                )}
              </div>
            </div>

            {/* Known Spells */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Known Spells</h3>
                <button
                  onClick={() => setShowSpellPicker(true)}
                  className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
                >
                  Add Spell
                </button>
              </div>
              {character.spells.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No spells known yet.</p>
              ) : (
                <div className="space-y-2">
                  {character.spells.map((spell) => {
                    const isExpanded = expandedFeatures.has(`spell-${spell.name}`)
                    return (
                      <div
                        key={spell.name}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                      >
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleFeatureExpanded(`spell-${spell.name}`)}
                            className="flex-1 px-4 py-2 flex items-center justify-between text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                                {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">{spell.name}</span>
                              <span className="text-xs text-gray-500">
                                {spell.concentration && 'C'}
                                {spell.ritual && 'R'}
                              </span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeSpell(spell.name)}
                            className="px-3 py-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove spell"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-3 text-sm">
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                              <span>Casting: {spell.castingTime}</span>
                              <span>Range: {spell.range}</span>
                              <span>Duration: {spell.duration}</span>
                              <span>School: {spell.school}</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300">{spell.description}</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <>
        {/* Equipment Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipment
            </h2>
            <button
              onClick={() => setShowAddEquipment(true)}
              className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              Add Item
            </button>
          </div>

          {character.equipment.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No equipment yet.</p>
          ) : (
            <div className="space-y-2">
              {character.equipment.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-2"
                >
                  <span className="text-gray-900 dark:text-white">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateEquipmentQuantity(index, parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeEquipment(index)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove item"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weapons Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Weapons
            </h2>
            <button
              onClick={() => setShowAddWeapon(true)}
              className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              Add Weapon
            </button>
          </div>

          {character.weapons.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No weapons yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Attack</th>
                    <th className="pb-2">Damage</th>
                    <th className="pb-2 hidden sm:table-cell">Properties</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {character.weapons.map((weapon, index) => {
                    const attackBonus = getWeaponAttackBonus(weapon)
                    const damageBonus = getWeaponDamageBonus(weapon)
                    return (
                      <tr key={index} className="text-gray-900 dark:text-white">
                        <td className="py-2 font-medium">{weapon.name}</td>
                        <td className="py-2 text-indigo-600 dark:text-indigo-400">
                          {formatModifier(attackBonus)}
                        </td>
                        <td className="py-2">
                          {weapon.damage}{damageBonus !== 0 && formatModifier(damageBonus)} {weapon.damageType}
                        </td>
                        <td className="py-2 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                          {weapon.properties.length > 0 ? weapon.properties.join(', ') : '—'}
                        </td>
                        <td className="py-2">
                          <button
                            onClick={() => removeWeapon(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove weapon"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Currency Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Currency
          </h2>
          <div className="grid grid-cols-5 gap-4">
            {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((type) => (
              <div key={type} className="text-center">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                  {type}
                </label>
                <input
                  type="number"
                  min="0"
                  value={character.currency[type]}
                  onChange={(e) => updateCurrency(type, parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold"
                />
              </div>
            ))}
          </div>
        </div>
          </>
        )}

        {/* Backstory Tab */}
        {activeTab === 'backstory' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Backstory & Personality
          </h2>

          <div className="space-y-6">
            {/* Alignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Alignment
              </label>
              <select
                value={character.backstory.alignment}
                onChange={(e) => updateBackstory('alignment', e.target.value as Alignment)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="lawful-good">Lawful Good</option>
                <option value="neutral-good">Neutral Good</option>
                <option value="chaotic-good">Chaotic Good</option>
                <option value="lawful-neutral">Lawful Neutral</option>
                <option value="true-neutral">True Neutral</option>
                <option value="chaotic-neutral">Chaotic Neutral</option>
                <option value="lawful-evil">Lawful Evil</option>
                <option value="neutral-evil">Neutral Evil</option>
                <option value="chaotic-evil">Chaotic Evil</option>
                <option value="unaligned">Unaligned</option>
              </select>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Languages
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {character.backstory.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm"
                  >
                    {lang}
                    <button
                      onClick={() => removeLanguage(lang)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {character.backstory.languages.length === 0 && (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No languages</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
                  placeholder="Add language..."
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={addLanguage}
                  disabled={!newLanguage.trim()}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Appearance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Appearance
              </label>
              <textarea
                value={character.backstory.appearance}
                onChange={(e) => updateBackstory('appearance', e.target.value)}
                rows={2}
                placeholder="Describe your character's physical appearance..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Personality Traits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Personality Traits
              </label>
              <textarea
                value={character.backstory.personality}
                onChange={(e) => updateBackstory('personality', e.target.value)}
                rows={2}
                placeholder="What defines your character's personality?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Ideals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ideals
              </label>
              <textarea
                value={character.backstory.ideals}
                onChange={(e) => updateBackstory('ideals', e.target.value)}
                rows={2}
                placeholder="What ideals or beliefs guide your character?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Bonds */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bonds
              </label>
              <textarea
                value={character.backstory.bonds}
                onChange={(e) => updateBackstory('bonds', e.target.value)}
                rows={2}
                placeholder="What people, places, or things are important to your character?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Flaws */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Flaws
              </label>
              <textarea
                value={character.backstory.flaws}
                onChange={(e) => updateBackstory('flaws', e.target.value)}
                rows={2}
                placeholder="What weaknesses or vices does your character have?"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Backstory */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Backstory
              </label>
              <textarea
                value={character.backstory.backstory}
                onChange={(e) => updateBackstory('backstory', e.target.value)}
                rows={6}
                placeholder="Tell the story of your character's past..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
              />
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Spell Picker Modal */}
      {showSpellPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Spell
              </h3>
              <button
                onClick={() => {
                  setShowSpellPicker(false)
                  setSpellSearchQuery('')
                  setSpellLevelFilter('all')
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={spellSearchQuery}
                onChange={(e) => setSpellSearchQuery(e.target.value)}
                placeholder="Search spells..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <select
                value={spellLevelFilter}
                onChange={(e) => setSpellLevelFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="0">Cantrips</option>
                <option value="1">Level 1</option>
                <option value="2">Level 2</option>
                <option value="3">Level 3</option>
                <option value="4">Level 4</option>
                <option value="5">Level 5</option>
                <option value="6">Level 6</option>
                <option value="7">Level 7</option>
                <option value="8">Level 8</option>
                <option value="9">Level 9</option>
              </select>
            </div>

            {/* Spell List */}
            <div className="overflow-y-auto flex-1 space-y-1">
              {(() => {
                const availableSpells = getSpellsByClass(character.class)
                  .filter((spell) => {
                    // Filter by level
                    if (spellLevelFilter !== 'all' && spell.level !== spellLevelFilter) return false
                    // Filter by search query
                    if (spellSearchQuery && !spell.name.toLowerCase().includes(spellSearchQuery.toLowerCase())) return false
                    // Filter out already known spells
                    if (character.spells.some((s) => s.name === spell.name)) return false
                    return true
                  })
                  .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))

                if (availableSpells.length === 0) {
                  return (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No spells available matching your criteria.
                    </p>
                  )
                }

                return availableSpells.map((spell) => (
                  <button
                    key={spell.name}
                    onClick={() => addSpell(spell)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded">
                          {spell.level === 0 ? 'Cantrip' : `Lvl ${spell.level}`}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{spell.name}</span>
                        {spell.concentration && <span className="text-xs text-gray-500">(C)</span>}
                        {spell.ritual && <span className="text-xs text-gray-500">(R)</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {spell.school} • {spell.castingTime}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))
              })()}
            </div>
          </div>
        </div>
      )}

      {/* HP Adjustment Modal */}
      {showHpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Adjust Hit Points
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Current: {character.currentHp} / {character.maxHp}
              {character.tempHp > 0 && ` (+${character.tempHp} temp)`}
            </p>
            <input
              type="number"
              value={hpChangeAmount}
              onChange={(e) => setHpChangeAmount(e.target.value)}
              placeholder="Amount"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleDamage}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Damage
              </button>
              <button
                onClick={handleHeal}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Heal
              </button>
            </div>
            <button
              onClick={() => {
                setShowHpModal(false)
                setHpChangeAmount('')
              }}
              className="w-full mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddEquipment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Equipment
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newEquipmentName}
                  onChange={(e) => setNewEquipmentName(e.target.value)}
                  placeholder="e.g., Longsword"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={newEquipmentQuantity}
                  onChange={(e) => setNewEquipmentQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddEquipment(false)
                  setNewEquipmentName('')
                  setNewEquipmentQuantity(1)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addEquipment}
                disabled={!newEquipmentName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Weapon Modal */}
      {showAddWeapon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Weapon
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weapon Name
                </label>
                <input
                  type="text"
                  value={newWeaponName}
                  onChange={(e) => setNewWeaponName(e.target.value)}
                  placeholder="e.g., Longsword"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Damage
                  </label>
                  <input
                    type="text"
                    value={newWeaponDamage}
                    onChange={(e) => setNewWeaponDamage(e.target.value)}
                    placeholder="e.g., 1d8"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Damage Type
                  </label>
                  <select
                    value={newWeaponDamageType}
                    onChange={(e) => setNewWeaponDamageType(e.target.value as DamageType)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="bludgeoning">Bludgeoning</option>
                    <option value="piercing">Piercing</option>
                    <option value="slashing">Slashing</option>
                    <option value="acid">Acid</option>
                    <option value="cold">Cold</option>
                    <option value="fire">Fire</option>
                    <option value="force">Force</option>
                    <option value="lightning">Lightning</option>
                    <option value="necrotic">Necrotic</option>
                    <option value="poison">Poison</option>
                    <option value="psychic">Psychic</option>
                    <option value="radiant">Radiant</option>
                    <option value="thunder">Thunder</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Properties
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['ammunition', 'finesse', 'heavy', 'light', 'loading', 'range', 'reach', 'thrown', 'two-handed', 'versatile'] as const).map((prop) => (
                    <button
                      key={prop}
                      type="button"
                      onClick={() => toggleWeaponProperty(prop)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        newWeaponProperties.includes(prop)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {prop}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddWeapon(false)
                  setNewWeaponName('')
                  setNewWeaponDamage('1d6')
                  setNewWeaponDamageType('slashing')
                  setNewWeaponProperties([])
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addWeapon}
                disabled={!newWeaponName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dice Roller */}
      <DiceRoller isOpen={showDiceRoller} onClose={() => setShowDiceRoller(false)} />

      {/* Level/XP Modal */}
      {showLevelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Level & XP
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Level (1-20)
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editLevel}
                  onChange={(e) => setEditLevel(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Experience Points
                </label>
                <input
                  type="number"
                  min="0"
                  value={editXp}
                  onChange={(e) => setEditXp(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  XP for level {editLevel + 1}: {editLevel < 20 ? XP_THRESHOLDS[editLevel + 1].toLocaleString() : 'Max level'}
                  {editLevel < 20 && ` (${(XP_THRESHOLDS[editLevel + 1] - editXp).toLocaleString()} needed)`}
                </p>
              </div>
              {editLevel !== character?.level && editLevel > (character?.level || 1) && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
                    Leveling up! Choose HP method:
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveLevelChanges(true)}
                      className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Use Average
                    </button>
                    <button
                      onClick={() => saveLevelChanges(false)}
                      className="flex-1 px-3 py-2 bg-indigo-100 dark:bg-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm rounded-lg transition-colors"
                    >
                      Roll HP
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowLevelModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              {(editLevel === character?.level || editLevel < (character?.level || 1)) && (
                <button
                  onClick={() => saveLevelChanges(true)}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feat Picker Modal */}
      {showFeatPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Feat
              </h3>
              <button
                onClick={() => {
                  setShowFeatPicker(false)
                  setFeatSearchQuery('')
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              placeholder="Search feats..."
              value={featSearchQuery}
              onChange={(e) => setFeatSearchQuery(e.target.value)}
              className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="flex-1 overflow-y-auto space-y-2">
              {FEATS
                .filter((feat) => {
                  // Filter out already-known feats
                  if (character?.feats.some((f) => f.name === feat.name)) return false
                  // Filter by search query
                  if (featSearchQuery) {
                    const query = featSearchQuery.toLowerCase()
                    return feat.name.toLowerCase().includes(query) ||
                           feat.description.toLowerCase().includes(query)
                  }
                  return true
                })
                .map((feat) => (
                  <button
                    key={feat.name}
                    onClick={() => {
                      if (!character) return
                      updateCharacter({
                        feats: [...character.feats, { name: feat.name, description: feat.description }]
                      })
                      setShowFeatPicker(false)
                      setFeatSearchQuery('')
                    }}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {feat.name}
                      {feat.category && (
                        <span className="ml-2 text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                          {feat.category}
                        </span>
                      )}
                    </div>
                    {feat.prerequisite && (
                      <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        Prerequisite: {feat.prerequisite}
                      </div>
                    )}
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {feat.description}
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Level Up HP Modal */}
      {showLevelUpHPModal && character && (
        <LevelUpHPModal
          hitDie={getClassByName(character.class)?.hitDie || 8}
          conModifier={getAbilityModifier(character.abilityScores.constitution)}
          currentMaxHp={character.maxHp}
          newLevel={character.level + 1}
          onConfirm={handleLevelUpHPConfirm}
          onCancel={() => setShowLevelUpHPModal(false)}
        />
      )}

      {/* ASI/Feat Modal */}
      {showASIModal && character && pendingLevelUp && (
        <ASIModal
          currentAbilityScores={character.abilityScores}
          currentFeats={character.feats}
          newLevel={pendingLevelUp.levelUpResult.character.level}
          onConfirm={handleASIConfirm}
          onCancel={handleASICancel}
        />
      )}

      {/* Level Up Summary Modal */}
      {levelUpSummary && character && (
        <LevelUpSummaryModal
          newLevel={levelUpSummary.newLevel}
          previousLevel={levelUpSummary.previousLevel}
          className={character.class}
          hpGain={levelUpSummary.hpGain}
          newMaxHp={levelUpSummary.newMaxHp}
          newClassFeatures={levelUpSummary.levelUpResult.newClassFeatures}
          newSubclassFeatures={levelUpSummary.levelUpResult.newSubclassFeatures}
          oldSpellSlots={character.spellSlots}
          newSpellSlots={levelUpSummary.levelUpResult.character.spellSlots}
          asiChoice={levelUpSummary.asiChoice}
          onClose={() => setLevelUpSummary(null)}
        />
      )}
    </div>
  )
}
