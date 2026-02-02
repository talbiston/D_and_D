import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Character } from '../types'
import { exportCharacterAsJson } from '../utils/storage'
import { getCharacter, updateCharacter as updateCharacterApi, ApiError } from '../utils/api'
import { getAbilityModifier, getProficiencyBonus, getPassivePerception, formatModifier, getSavingThrowBonus, getSkillBonus, calculateAttackBonus, calculateDamageBonus, calculateAC, calculateCarryingCapacity, calculateCurrentWeight, getEncumbranceStatus, getEncumbrancePenalties, calculateToolCheckBonus } from '../utils/calculations'
import { getWeaponByName } from '../data/weapons'
import { getArmorByName } from '../data/armor'
import { GEAR, type GearData, type GearCategory } from '../data/gear'
import { TOOLS, getToolByName, type ToolCategory } from '../data/tools'
import { getClassByName, getClassFeaturesForLevel, isSpellcaster, getSubclassFeaturesForLevel } from '../data/classes'
import { getSpeciesByName } from '../data/species'
import { getSpellSaveDC, getSpellAttackBonus, XP_THRESHOLDS } from '../utils/calculations'
import { getSpellsByClass } from '../data/spells'
import { FEATS, getFeatByName } from '../data/feats'
import type { Spell, InventoryItem } from '../types'
import type { AbilityName, SkillName, DamageType, WeaponProperty, Weapon, Alignment, Backstory } from '../types'
import { SKILL_ABILITIES } from '../types'
import { useDarkModeContext } from '../context/DarkModeContext'
import DiceRoller from '../components/DiceRoller'
import LevelUpHPModal from '../components/LevelUpHPModal'
import ASIModal, { type ASIChoice } from '../components/ASIModal'
import LevelUpSummaryModal from '../components/LevelUpSummaryModal'
import InvocationPickerModal from '../components/InvocationPickerModal'
import ManeuverPickerModal from '../components/ManeuverPickerModal'
import { levelUp, type LevelUpResult, getFeatureDisplayName, getCantripsKnown, getSpellSlotsForLevel, getPactMagicSlots } from '../utils/calculations'
import { INVOCATIONS, getInvocationsKnown } from '../data/invocations'
import { MANEUVERS, getManeuversKnown, getSuperiorityDice } from '../data/maneuvers'
import { METAMAGIC_OPTIONS, getMetamagicKnown } from '../data/metamagic'
import MetamagicPickerModal from '../components/MetamagicPickerModal'
import LevelUpSpellPickerModal from '../components/LevelUpSpellPickerModal'
import { getSorceryPoints, isKnownCaster } from '../utils/calculations'
import WeaponPickerModal from '../components/WeaponPickerModal'
import ArmorPickerModal from '../components/ArmorPickerModal'
import ClassIcon from '../components/ClassIcon'
import SpeciesIcon from '../components/SpeciesIcon'
import CharacterImageInput from '../components/CharacterImageInput'

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

// Helper to get ordinal suffix for spell slot levels
function getOrdinalLevel(level: number): string {
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
  return ordinals[level] || `${level}th`
}

export default function CharacterSheetPage() {
  const { id } = useParams<{ id: string }>()
  const [character, setCharacter] = useState<Character | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
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
  const [showWeaponPicker, setShowWeaponPicker] = useState(false)
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
  // Level-up state
  const [showLevelUpHPModal, setShowLevelUpHPModal] = useState(false)
  const [showASIModal, setShowASIModal] = useState(false)
  const [showInvocationPicker, setShowInvocationPicker] = useState(false)
  const [showManeuverPicker, setShowManeuverPicker] = useState(false)
  const [showMetamagicPicker, setShowMetamagicPicker] = useState(false)
  const [showLevelUpSpellPicker, setShowLevelUpSpellPicker] = useState(false)
  const [pendingLevelUp, setPendingLevelUp] = useState<{ levelUpResult: LevelUpResult; hpGain: number; asiChoice?: ASIChoice } | null>(null)
  const [levelUpSummary, setLevelUpSummary] = useState<{
    newLevel: number
    previousLevel: number
    hpGain: number
    newMaxHp: number
    levelUpResult: LevelUpResult
    asiChoice?: ASIChoice
  } | null>(null)
  // Equipment state
  const [showACOverride, setShowACOverride] = useState(false)
  const [acOverrideValue, setAcOverrideValue] = useState('')
  const [showACBreakdown, setShowACBreakdown] = useState(false)
  // Inventory management state
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [inventorySearchQuery, setInventorySearchQuery] = useState('')
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState<GearCategory | 'all'>('all')
  const [showCustomItemForm, setShowCustomItemForm] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemWeight, setNewItemWeight] = useState(0)
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [newItemCategory, setNewItemCategory] = useState('adventuring gear')
  const [newItemNotes, setNewItemNotes] = useState('')
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  // Tool proficiency state
  const [showToolPicker, setShowToolPicker] = useState(false)
  const [toolSearchQuery, setToolSearchQuery] = useState('')
  const [toolCategoryFilter, setToolCategoryFilter] = useState<ToolCategory | 'all'>('all')
  const [toolRollResult, setToolRollResult] = useState<{ toolName: string; roll: number; bonus: number; total: number } | null>(null)
  // Armor picker state
  const [showArmorPicker, setShowArmorPicker] = useState(false)
  // Currency management state
  const [showQuickAddCurrency, setShowQuickAddCurrency] = useState(false)
  const [quickAddAmount, setQuickAddAmount] = useState('')
  const [quickAddType, setQuickAddType] = useState<'cp' | 'sp' | 'ep' | 'gp' | 'pp'>('gp')
  const { isDark, toggle: toggleDarkMode } = useDarkModeContext()
  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingCharacterRef = useRef<Character | null>(null)
  // Share link state
  const [showLinkCopied, setShowLinkCopied] = useState(false)
  const linkCopiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Character image edit modal state
  const [showImageEdit, setShowImageEdit] = useState(false)

  useEffect(() => {
    async function loadCharacter() {
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setNotFound(false)
      setLoadError(null)

      try {
        const loaded = await getCharacter(id)
        setCharacter(loaded)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          setNotFound(true)
        } else {
          setLoadError(error instanceof Error ? error.message : 'Failed to load character')
        }
      } finally {
        setLoading(false)
      }
    }

    loadCharacter()
  }, [id])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current)
      }
      if (linkCopiedTimeoutRef.current) {
        clearTimeout(linkCopiedTimeoutRef.current)
      }
    }
  }, [])

  // Perform the actual save to API
  const saveToApi = useCallback(async (characterToSave: Character) => {
    if (!characterToSave.id) return

    setSaveStatus('saving')
    setSaveError(null)

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...dataWithoutId } = characterToSave
      await updateCharacterApi(characterToSave.id, dataWithoutId)

      setSaveStatus('saved')
      // Clear "Saved" indicator after 2 seconds
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current)
      }
      savedTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 2000)
    } catch (error) {
      setSaveStatus('error')
      setSaveError(error instanceof Error ? error.message : 'Failed to save')
    }
  }, [])

  // Manual retry function
  const retrySave = useCallback(() => {
    if (pendingCharacterRef.current) {
      saveToApi(pendingCharacterRef.current)
    }
  }, [saveToApi])

  const copyShareLink = useCallback(() => {
    const url = `${window.location.origin}/character/${id}`
    navigator.clipboard.writeText(url).then(() => {
      // Clear any existing timeout
      if (linkCopiedTimeoutRef.current) {
        clearTimeout(linkCopiedTimeoutRef.current)
      }
      setShowLinkCopied(true)
      // Hide after 2 seconds
      linkCopiedTimeoutRef.current = setTimeout(() => {
        setShowLinkCopied(false)
      }, 2000)
    })
  }, [id])

  const updateCharacter = useCallback((updates: Partial<Character>) => {
    if (!character) return
    const updated = { ...character, ...updates }
    setCharacter(updated)
    pendingCharacterRef.current = updated

    // Clear any existing debounce timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce: wait 500ms after last change before saving
    saveTimeoutRef.current = setTimeout(() => {
      saveToApi(updated)
    }, 500)
  }, [character, saveToApi])

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

  const togglePactMagicSlot = () => {
    if (!character || !character.pactMagic) return
    const { slotCount, slotLevel, expended } = character.pactMagic
    const newExpended = expended >= slotCount ? 0 : expended + 1
    updateCharacter({
      pactMagic: { slotCount, slotLevel, expended: newExpended }
    })
  }

  const shortRest = () => {
    if (!character) return
    // Short rest resets Pact Magic slots for Warlocks
    if (character.pactMagic) {
      updateCharacter({
        pactMagic: { ...character.pactMagic, expended: 0 }
      })
    }
  }

  const longRest = () => {
    if (!character) return
    const resetSlots = { ...character.spellSlots }
    for (const level of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
      resetSlots[level] = { ...resetSlots[level], expended: 0 }
    }
    const updates: Partial<Character> = {
      spellSlots: resetSlots,
      currentHp: character.maxHp,
      hitDice: { ...character.hitDice, spent: 0 }
    }
    // Also reset Pact Magic slots for Warlocks
    if (character.pactMagic) {
      updates.pactMagic = { ...character.pactMagic, expended: 0 }
    }
    updateCharacter(updates)
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

  // Calculate total currency value in gold pieces
  const getTotalValueInGold = useCallback(() => {
    if (!character) return 0
    const { cp, sp, ep, gp, pp } = character.currency
    // Conversion rates: 1 pp = 10 gp, 1 gp = 1 gp, 1 ep = 0.5 gp, 1 sp = 0.1 gp, 1 cp = 0.01 gp
    return (pp * 10) + gp + (ep * 0.5) + (sp * 0.1) + (cp * 0.01)
  }, [character])

  // Calculate total coin weight (50 coins = 1 lb)
  const getTotalCoinWeight = useCallback(() => {
    if (!character) return 0
    const { cp, sp, ep, gp, pp } = character.currency
    const totalCoins = cp + sp + ep + gp + pp
    return totalCoins / 50
  }, [character])

  // Quick add currency
  const quickAddCurrency = () => {
    if (!character) return
    const amount = parseInt(quickAddAmount) || 0
    if (amount <= 0) return
    updateCharacter({
      currency: { ...character.currency, [quickAddType]: character.currency[quickAddType] + amount }
    })
    setQuickAddAmount('')
    setShowQuickAddCurrency(false)
  }

  // Convert currency to highest denominations
  const consolidateCurrency = () => {
    if (!character) return
    // Convert everything to copper first
    const { cp, sp, ep, gp, pp } = character.currency
    let totalCopper = cp + (sp * 10) + (ep * 50) + (gp * 100) + (pp * 1000)

    // Convert back to highest denominations
    const newPp = Math.floor(totalCopper / 1000)
    totalCopper %= 1000
    const newGp = Math.floor(totalCopper / 100)
    totalCopper %= 100
    const newSp = Math.floor(totalCopper / 10)
    totalCopper %= 10
    const newCp = totalCopper

    updateCharacter({
      currency: { cp: newCp, sp: newSp, ep: 0, gp: newGp, pp: newPp }
    })
  }

  // Inventory management functions
  const addInventoryItem = (item: InventoryItem) => {
    if (!character) return
    // Check if item already exists, if so increase quantity
    const existingIndex = character.inventory.findIndex(i => i.name === item.name)
    if (existingIndex >= 0) {
      const newInventory = [...character.inventory]
      newInventory[existingIndex] = {
        ...newInventory[existingIndex],
        quantity: newInventory[existingIndex].quantity + item.quantity
      }
      updateCharacter({ inventory: newInventory })
    } else {
      updateCharacter({ inventory: [...character.inventory, item] })
    }
  }

  const addGearToInventory = (gear: GearData) => {
    addInventoryItem({
      name: gear.name,
      quantity: 1,
      weight: gear.weight,
      category: gear.category,
      notes: gear.description
    })
    setShowInventoryModal(false)
    setInventorySearchQuery('')
    setInventoryCategoryFilter('all')
  }

  const addCustomItem = () => {
    if (!newItemName.trim()) return
    addInventoryItem({
      name: newItemName.trim(),
      quantity: newItemQuantity || 1,
      weight: newItemWeight || 0,
      category: newItemCategory,
      notes: newItemNotes.trim() || undefined
    })
    // Reset form
    setNewItemName('')
    setNewItemWeight(0)
    setNewItemQuantity(1)
    setNewItemCategory('adventuring gear')
    setNewItemNotes('')
    setShowCustomItemForm(false)
    setShowInventoryModal(false)
  }

  const updateInventoryQuantity = (index: number, quantity: number) => {
    if (!character) return
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      removeInventoryItem(index)
      return
    }
    const newInventory = [...character.inventory]
    newInventory[index] = { ...newInventory[index], quantity }
    updateCharacter({ inventory: newInventory })
  }

  const removeInventoryItem = (index: number) => {
    if (!character) return
    const newInventory = [...character.inventory]
    newInventory.splice(index, 1)
    updateCharacter({ inventory: newInventory })
    setItemToDelete(null)
  }

  // Tool proficiency functions
  const addToolProficiency = (toolName: string) => {
    if (!character) return
    // Don't add duplicate tools
    if (character.toolProficiencies.includes(toolName)) return
    updateCharacter({
      toolProficiencies: [...character.toolProficiencies, toolName]
    })
    setShowToolPicker(false)
    setToolSearchQuery('')
    setToolCategoryFilter('all')
  }

  const removeToolProficiency = (toolName: string) => {
    if (!character) return
    updateCharacter({
      toolProficiencies: character.toolProficiencies.filter(t => t !== toolName)
    })
  }

  const rollToolCheck = (toolName: string) => {
    if (!character) return
    const toolData = getToolByName(toolName)
    if (!toolData) return

    const profBonus = getProficiencyBonus(character.level)
    const abilityMod = getAbilityModifier(character.abilityScores[toolData.abilityUsed])
    const hasProficiency = true // They have proficiency if it's in their list
    const hasExpertise = false // TODO: Could add expertise tracking later
    const bonus = calculateToolCheckBonus(toolName, abilityMod, profBonus, hasProficiency, hasExpertise)

    // Roll d20
    const roll = Math.floor(Math.random() * 20) + 1
    const total = roll + bonus

    setToolRollResult({ toolName, roll, bonus, total })
    // Auto-clear the result after 5 seconds
    setTimeout(() => setToolRollResult(null), 5000)
  }

  // Group inventory items by category
  const groupedInventory = character?.inventory.reduce((groups, item, index) => {
    const category = item.category || 'other'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push({ item, index })
    return groups
  }, {} as Record<string, { item: InventoryItem; index: number }[]>) || {}

  // Check if character is proficient with a weapon
  const isWeaponProficient = (weapon: Weapon): boolean => {
    if (!character) return false
    const classData = getClassByName(character.class)
    if (!classData) return false

    // Check weapon proficiencies - classes list "Simple" or "Martial"
    const weaponData = getWeaponByName(weapon.name)
    if (weaponData) {
      const category = weaponData.category
      if (category === 'simple' && classData.weaponProficiencies.some(p => p.toLowerCase() === 'simple')) {
        return true
      }
      if (category === 'martial' && classData.weaponProficiencies.some(p => p.toLowerCase() === 'martial')) {
        return true
      }
    }

    // Check for specific weapon proficiencies
    if (classData.weaponProficiencies.some(p => p.toLowerCase() === weapon.name.toLowerCase())) {
      return true
    }

    return false
  }

  const getWeaponAttackBonus = (weapon: Weapon) => {
    if (!character) return 0
    const profBonus = getProficiencyBonus(character.level)
    const strMod = getAbilityModifier(character.abilityScores.strength)
    const dexMod = getAbilityModifier(character.abilityScores.dexterity)
    const isProficient = isWeaponProficient(weapon)

    return calculateAttackBonus(weapon, strMod, dexMod, profBonus, isProficient)
  }

  // Toggle weapon equipped status
  const toggleWeaponEquipped = (index: number) => {
    if (!character) return
    const newWeapons = [...character.weapons]
    newWeapons[index] = { ...newWeapons[index], isEquipped: !newWeapons[index].isEquipped }
    updateCharacter({ weapons: newWeapons })
  }

  // Toggle versatile weapon two-handing
  const toggleWeaponTwoHanding = (index: number) => {
    if (!character) return
    const newWeapons = [...character.weapons]
    newWeapons[index] = { ...newWeapons[index], isTwoHanding: !newWeapons[index].isTwoHanding }
    updateCharacter({ weapons: newWeapons })
  }

  const addWeapon = () => {
    if (!character || !newWeaponName.trim()) return
    const newWeapon: Weapon = {
      name: newWeaponName.trim(),
      damage: newWeaponDamage,
      damageType: newWeaponDamageType,
      properties: newWeaponProperties,
      isEquipped: true,
      isTwoHanding: false
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

  // Add weapon from weapon picker modal
  const addWeaponFromPicker = (weapon: Weapon) => {
    if (!character) return
    updateCharacter({
      weapons: [...character.weapons, weapon]
    })
  }

  const removeWeapon = (index: number) => {
    if (!character) return
    const newWeapons = [...character.weapons]
    newWeapons.splice(index, 1)
    updateCharacter({ weapons: newWeapons })
  }

  // Armor management functions
  const addArmorFromPicker = (armor: { name: string; isEquipped: boolean; isShield: boolean }) => {
    if (!character) return
    // Check if armor already exists
    const existingIndex = character.armor.findIndex(a => a.name === armor.name)
    if (existingIndex >= 0) {
      // Already have this armor, just ensure it's equipped
      const newArmor = [...character.armor]
      newArmor[existingIndex] = { ...newArmor[existingIndex], isEquipped: armor.isEquipped }
      updateCharacter({ armor: newArmor })
    } else {
      // Add new armor
      updateCharacter({ armor: [...character.armor, armor] })
    }
  }

  const toggleArmorEquipped = (index: number) => {
    if (!character) return
    const armor = character.armor[index]
    const newArmor = [...character.armor]

    if (armor.isShield) {
      // For shields, just toggle equipped
      newArmor[index] = { ...armor, isEquipped: !armor.isEquipped }
    } else {
      // For body armor, unequip all other body armor first (only one can be worn)
      for (let i = 0; i < newArmor.length; i++) {
        if (!newArmor[i].isShield && i !== index) {
          newArmor[i] = { ...newArmor[i], isEquipped: false }
        }
      }
      newArmor[index] = { ...armor, isEquipped: !armor.isEquipped }
    }

    updateCharacter({ armor: newArmor })
  }

  const removeArmor = (index: number) => {
    if (!character) return
    const newArmor = [...character.armor]
    newArmor.splice(index, 1)
    updateCharacter({ armor: newArmor })
  }

  const isArmorProficient = (armorName: string): boolean => {
    if (!character) return false
    const classData = getClassByName(character.class)
    if (!classData) return false

    const armorData = getArmorByName(armorName)
    if (!armorData) return false

    const normalizedProfs = classData.armorProficiencies.map(p => p.toLowerCase())

    if (armorData.category === 'shield') {
      return normalizedProfs.includes('shields') || normalizedProfs.includes('shield')
    }

    return normalizedProfs.includes(armorData.category) || normalizedProfs.includes('all')
  }

  const toggleWeaponProperty = (prop: WeaponProperty) => {
    if (newWeaponProperties.includes(prop)) {
      setNewWeaponProperties(newWeaponProperties.filter(p => p !== prop))
    } else {
      setNewWeaponProperties([...newWeaponProperties, prop])
    }
  }

  const updateBackstory = (field: keyof Backstory, value: string | Alignment | string[]) => {
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
      // Recalculate HP from scratch when reducing level (using average)
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

    // Base update object
    const updates: Partial<Character> = {
      level: newLevel,
      xp: editXp,
      maxHp: newMaxHp,
      currentHp: Math.min(character.currentHp, newMaxHp),
      hitDice: { ...character.hitDice, total: newLevel }
    }

    // When decreasing level, also update features and spell slots
    if (newLevel < oldLevel) {
      // Get features for the new level
      const classFeatures = getClassFeaturesForLevel(character.class, newLevel)
      const subclassFeatures = character.subclass
        ? getSubclassFeaturesForLevel(character.class, character.subclass, newLevel)
        : []

      // Keep any manually added features that aren't from class/subclass definitions
      const allClassSubclassFeatures = character.subclass
        ? [...getClassFeaturesForLevel(character.class, 20), ...getSubclassFeaturesForLevel(character.class, character.subclass, 20)]
        : getClassFeaturesForLevel(character.class, 20)

      const manualFeatures = character.classFeatures.filter(cf =>
        !allClassSubclassFeatures.some(f => f.name === cf.name && f.level === cf.level)
      )

      updates.classFeatures = [...classFeatures, ...subclassFeatures, ...manualFeatures]

      // Update spell slots for new level
      const newSpellSlots = getSpellSlotsForLevel(character.class, newLevel)
      updates.spellSlots = {
        1: { total: newSpellSlots[1].total, expended: Math.min(character.spellSlots[1].expended, newSpellSlots[1].total) },
        2: { total: newSpellSlots[2].total, expended: Math.min(character.spellSlots[2].expended, newSpellSlots[2].total) },
        3: { total: newSpellSlots[3].total, expended: Math.min(character.spellSlots[3].expended, newSpellSlots[3].total) },
        4: { total: newSpellSlots[4].total, expended: Math.min(character.spellSlots[4].expended, newSpellSlots[4].total) },
        5: { total: newSpellSlots[5].total, expended: Math.min(character.spellSlots[5].expended, newSpellSlots[5].total) },
        6: { total: newSpellSlots[6].total, expended: Math.min(character.spellSlots[6].expended, newSpellSlots[6].total) },
        7: { total: newSpellSlots[7].total, expended: Math.min(character.spellSlots[7].expended, newSpellSlots[7].total) },
        8: { total: newSpellSlots[8].total, expended: Math.min(character.spellSlots[8].expended, newSpellSlots[8].total) },
        9: { total: newSpellSlots[9].total, expended: Math.min(character.spellSlots[9].expended, newSpellSlots[9].total) },
      }

      // Update Pact Magic for Warlocks
      if (character.class === 'Warlock' && character.pactMagic) {
        const newPactMagic = getPactMagicSlots(newLevel)
        updates.pactMagic = {
          ...newPactMagic,
          expended: Math.min(character.pactMagic.expended, newPactMagic.slotCount)
        }
      }
      // Note: Equipment, currency, feats, and spells are preserved (not modified)
    }

    updateCharacter(updates)
    setShowLevelModal(false)
  }

  const startLevelUp = () => {
    if (!character || character.level >= 20) return
    setShowLevelUpHPModal(true)
  }

  // Helper to complete the level-up and show summary
  const completeLevelUp = (
    levelUpResult: LevelUpResult,
    hpGain: number,
    asiChoice?: ASIChoice,
    newSpells?: Spell[]
  ) => {
    if (!character) return

    const newMaxHp = character.maxHp + hpGain
    let updatedCharacter = { ...levelUpResult.character }

    // Apply ASI choice if present
    if (asiChoice) {
      if (asiChoice.type === 'asi') {
        const newAbilityScores = { ...updatedCharacter.abilityScores }
        for (const increase of asiChoice.increases) {
          newAbilityScores[increase.ability] = Math.min(20, newAbilityScores[increase.ability] + increase.amount)
        }
        updatedCharacter = { ...updatedCharacter, abilityScores: newAbilityScores }
      } else {
        const newFeats = [...updatedCharacter.feats, {
          name: asiChoice.feat.name,
          description: asiChoice.feat.description,
          prerequisite: asiChoice.feat.prerequisite
        }]
        updatedCharacter = { ...updatedCharacter, feats: newFeats }
      }
    }

    // Apply new spells if present
    if (newSpells && newSpells.length > 0) {
      updatedCharacter = {
        ...updatedCharacter,
        spells: [...updatedCharacter.spells, ...newSpells]
      }
    }

    // Apply HP changes
    updatedCharacter = {
      ...updatedCharacter,
      maxHp: newMaxHp,
      currentHp: Math.min(character.currentHp + hpGain, newMaxHp)
    }

    updateCharacter(updatedCharacter)

    // Show level-up summary
    setLevelUpSummary({
      newLevel: levelUpResult.character.level,
      previousLevel: character.level,
      hpGain,
      newMaxHp,
      levelUpResult,
      asiChoice,
    })

    setPendingLevelUp(null)
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
    } else if (levelUpResult.choices.newSpellsToLearn > 0 && isKnownCaster(character.class)) {
      // No ASI, but needs spell selection (for known casters)
      setPendingLevelUp({ levelUpResult, hpGain })
      setShowLevelUpSpellPicker(true)
    } else {
      // No ASI and no spells to learn, complete level-up directly
      completeLevelUp(levelUpResult, hpGain)
    }
  }

  const handleASIConfirm = (choice: ASIChoice) => {
    if (!character || !pendingLevelUp) return
    const { levelUpResult, hpGain } = pendingLevelUp

    setShowASIModal(false)

    // Check if we also need to select spells
    if (levelUpResult.choices.newSpellsToLearn > 0 && isKnownCaster(character.class)) {
      // Store the ASI choice and show spell picker
      setPendingLevelUp({ levelUpResult, hpGain, asiChoice: choice })
      setShowLevelUpSpellPicker(true)
    } else {
      // No spells to learn, complete level-up with ASI choice
      completeLevelUp(levelUpResult, hpGain, choice)
    }
  }

  const handleASICancel = () => {
    // Cancel ASI modal - also cancels the level up
    setShowASIModal(false)
    setPendingLevelUp(null)
  }

  const handleLevelUpSpellsConfirm = (selectedSpells: Spell[]) => {
    if (!character || !pendingLevelUp) return
    const { levelUpResult, hpGain, asiChoice } = pendingLevelUp

    setShowLevelUpSpellPicker(false)

    // Complete level-up with ASI choice (if any) and new spells
    completeLevelUp(levelUpResult, hpGain, asiChoice, selectedSpells)
  }

  const handleLevelUpSpellsCancel = () => {
    // Cancel spell picker - also cancels the level up
    setShowLevelUpSpellPicker(false)
    setPendingLevelUp(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading character...</p>
        </div>
      </div>
    )
  }

  if (notFound) {
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

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Failed to Load Character
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {loadError}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="inline-block bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Back to Characters
            </Link>
          </div>
        </div>
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
            <div className="flex items-start gap-4">
              {/* Character Portrait */}
              <button
                onClick={() => setShowImageEdit(true)}
                className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 hover:ring-2 hover:ring-indigo-500 transition-all cursor-pointer no-print"
                title="Click to edit character portrait"
              >
                {character.imageUrl ? (
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    style={character.imageStyle && (character.imageStyle.zoom !== 1 || character.imageStyle.x !== 0 || character.imageStyle.y !== 0) ? {
                      transform: `scale(${character.imageStyle.zoom}) translate(${character.imageStyle.x / character.imageStyle.zoom}%, ${character.imageStyle.y / character.imageStyle.zoom}%)`,
                      transformOrigin: 'center center',
                    } : undefined}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </button>
              {/* Print-only portrait (non-clickable) */}
              <div className="hidden print:block w-20 h-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {character.imageUrl ? (
                  <img
                    src={character.imageUrl}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    style={character.imageStyle && (character.imageStyle.zoom !== 1 || character.imageStyle.x !== 0 || character.imageStyle.y !== 0) ? {
                      transform: `scale(${character.imageStyle.zoom}) translate(${character.imageStyle.x / character.imageStyle.zoom}%, ${character.imageStyle.y / character.imageStyle.zoom}%)`,
                      transformOrigin: 'center center',
                    } : undefined}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {character.name}
                </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2 flex-wrap">
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
                    className="px-2 py-0.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors no-print"
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
                <span className="inline-flex items-center gap-1">
                  <SpeciesIcon species={character.species} size={20} />
                  {character.species}
                  {character.speciesAncestry && ` (${character.speciesAncestry.selectedOption})`}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ClassIcon className={character.class} size={20} />
                  {character.class}
                  {character.subclass && ` (${character.subclass})`}
                </span>
              </p>
              {character.classOrder && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {character.classOrder.name}
                </p>
              )}
              {character.background && (
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {character.background} Background
                </p>
              )}
              {/* Save status indicator */}
              <div className="mt-1 h-5 no-print">
                {saveStatus === 'saving' && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-sm text-green-600 dark:text-green-400 inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm text-red-600 dark:text-red-400 inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {saveError || 'Save failed'}
                    <button
                      onClick={retrySave}
                      className="ml-1 underline hover:no-underline"
                    >
                      Retry
                    </button>
                  </span>
                )}
              </div>
              </div>
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
                onClick={copyShareLink}
                className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors relative"
                title="Copy shareable link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                {showLinkCopied && (
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded whitespace-nowrap">
                    Link copied!
                  </span>
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
          {/* Armor Class - Enhanced */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 text-center relative">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Armor Class
            </p>
            {(() => {
              // Get equipped armor and shield
              const equippedArmor = character.armor?.find(a => a.isEquipped && !a.isShield)
              const equippedShield = character.armor?.find(a => a.isEquipped && a.isShield)
              const dexMod = getAbilityModifier(character.abilityScores.dexterity)
              const conMod = getAbilityModifier(character.abilityScores.constitution)
              const wisMod = getAbilityModifier(character.abilityScores.wisdom)

              // Calculate AC components for breakdown
              const armorData = equippedArmor ? getArmorByName(equippedArmor.name) : null
              const className = character.class.toLowerCase()

              // Calculate AC using the utility function
              const calculatedAC = calculateAC(
                equippedArmor?.name ?? null,
                !!equippedShield,
                dexMod,
                conMod,
                wisMod,
                character.class,
                character.manualACOverride
              )

              // Determine AC breakdown components
              let baseAC = 10
              let dexBonus = dexMod
              const shieldBonus = equippedShield ? 2 : 0
              let otherBonus = 0
              let acDescription = 'Unarmored'

              if (armorData) {
                baseAC = armorData.baseAC
                if (armorData.dexBonus === true) {
                  dexBonus = dexMod
                  acDescription = `${armorData.name} (Light)`
                } else if (armorData.dexBonus === 'max2') {
                  dexBonus = Math.min(dexMod, 2)
                  acDescription = `${armorData.name} (Medium)`
                } else {
                  dexBonus = 0
                  acDescription = `${armorData.name} (Heavy)`
                }
              } else if (!equippedArmor) {
                // Unarmored defense
                if (className === 'barbarian') {
                  otherBonus = conMod
                  acDescription = 'Unarmored Defense (Barbarian)'
                } else if (className === 'monk') {
                  otherBonus = wisMod
                  acDescription = 'Unarmored Defense (Monk)'
                }
              }

              return (
                <>
                  {/* Large AC Number */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setShowACBreakdown(!showACBreakdown)}
                    title="Click for AC breakdown"
                  >
                    <p className={`text-4xl font-bold ${character.manualACOverride !== undefined ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                      {character.manualACOverride !== undefined ? character.manualACOverride : calculatedAC}
                    </p>
                    {character.manualACOverride !== undefined && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        (Calculated: {calculatedAC})
                      </p>
                    )}
                  </div>

                  {/* Equipped Armor Name */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {equippedArmor ? equippedArmor.name : 'No Armor'}
                  </p>

                  {/* Shield Indicator */}
                  {equippedShield && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2A11.954 11.954 0 0110 1.944z" clipRule="evenodd" />
                      </svg>
                      Shield (+2)
                    </span>
                  )}

                  {/* AC Breakdown Tooltip/Popover */}
                  {showACBreakdown && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-3 min-w-[200px] text-left border border-gray-200 dark:border-gray-600">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-600 pb-1">
                        AC Breakdown
                      </p>
                      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex justify-between">
                          <span>Base:</span>
                          <span className="font-mono">{baseAC}</span>
                        </div>
                        {dexBonus !== 0 && (
                          <div className="flex justify-between">
                            <span>Dex Modifier:</span>
                            <span className="font-mono">{formatModifier(dexBonus)}</span>
                          </div>
                        )}
                        {shieldBonus > 0 && (
                          <div className="flex justify-between">
                            <span>Shield:</span>
                            <span className="font-mono">+{shieldBonus}</span>
                          </div>
                        )}
                        {otherBonus !== 0 && (
                          <div className="flex justify-between">
                            <span>{className === 'barbarian' ? 'Con Modifier:' : className === 'monk' ? 'Wis Modifier:' : 'Other:'}</span>
                            <span className="font-mono">{formatModifier(otherBonus)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-1 font-semibold">
                          <span>Total:</span>
                          <span className="font-mono">{calculatedAC}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                        {acDescription}
                      </p>
                    </div>
                  )}

                  {/* Override AC Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (showACOverride) {
                        // Closing - check if we should save or clear
                        if (acOverrideValue.trim() !== '') {
                          const newOverride = parseInt(acOverrideValue)
                          if (!isNaN(newOverride) && newOverride > 0) {
                            updateCharacter({ manualACOverride: newOverride })
                          }
                        }
                        setShowACOverride(false)
                        setAcOverrideValue('')
                      } else {
                        // Opening - prefill with current override if exists
                        setAcOverrideValue(character.manualACOverride?.toString() ?? '')
                        setShowACOverride(true)
                      }
                    }}
                    className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {character.manualACOverride !== undefined ? 'Edit Override' : 'Override AC'}
                  </button>

                  {/* Clear Override Button */}
                  {character.manualACOverride !== undefined && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        updateCharacter({ manualACOverride: undefined })
                      }}
                      className="ml-2 text-xs text-red-600 dark:text-red-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}

                  {/* Override Input */}
                  {showACOverride && (
                    <div className="mt-2 flex items-center gap-2 justify-center">
                      <input
                        type="number"
                        value={acOverrideValue}
                        onChange={(e) => setAcOverrideValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newOverride = parseInt(acOverrideValue)
                            if (!isNaN(newOverride) && newOverride > 0) {
                              updateCharacter({ manualACOverride: newOverride })
                            }
                            setShowACOverride(false)
                            setAcOverrideValue('')
                          } else if (e.key === 'Escape') {
                            setShowACOverride(false)
                            setAcOverrideValue('')
                          }
                        }}
                        placeholder="AC"
                        className="w-16 px-2 py-1 text-center text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const newOverride = parseInt(acOverrideValue)
                          if (!isNaN(newOverride) && newOverride > 0) {
                            updateCharacter({ manualACOverride: newOverride })
                          }
                          setShowACOverride(false)
                          setAcOverrideValue('')
                        }}
                        className="px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </>
              )
            })()}
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

        {/* Eldritch Invocations (Warlock only) */}
        {character.class === 'Warlock' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Eldritch Invocations
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({(character.eldritchInvocations?.length ?? 0)}/{getInvocationsKnown(character.level)})
                </span>
              </h2>
              <button
                onClick={() => setShowInvocationPicker(true)}
                className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                Manage Invocations
              </button>
            </div>
            {character.eldritchInvocations && character.eldritchInvocations.length > 0 ? (
              <div className="space-y-2">
                {character.eldritchInvocations.map((invocationName) => {
                  const invocation = INVOCATIONS.find(inv => inv.name === invocationName)
                  if (!invocation) return null
                  const isExpanded = expandedFeatures.has(invocationName)
                  return (
                    <div
                      key={invocationName}
                      className="bg-purple-50 dark:bg-purple-900/30 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFeatureExpanded(invocationName)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-purple-900 dark:text-purple-200">
                            {invocation.name}
                          </span>
                          {invocation.pactRequirement && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300">
                              Pact Boon
                            </span>
                          )}
                        </div>
                        <svg
                          className={`w-5 h-5 text-purple-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 text-sm text-purple-700 dark:text-purple-300">
                          {invocation.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No invocations selected. Click "Manage Invocations" to choose your Eldritch Invocations.
              </p>
            )}
          </div>
        )}

        {/* Battle Master Maneuvers (Battle Master Fighter only) */}
        {character.class === 'Fighter' && character.subclass === 'Battle Master' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Combat Superiority
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({(character.battleMasterManeuvers?.length ?? 0)}/{getManeuversKnown(character.level)} maneuvers)
                </span>
              </h2>
              <button
                onClick={() => setShowManeuverPicker(true)}
                className="text-sm px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors"
              >
                Manage Maneuvers
              </button>
            </div>
            {/* Superiority Dice Display */}
            {(() => {
              const { count, size } = getSuperiorityDice(character.level)
              return (
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-800 dark:text-amber-200 font-medium">
                      Superiority Dice
                    </span>
                    <span className="text-amber-700 dark:text-amber-300">
                      {count}{size}
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Recovered on Short or Long Rest
                  </p>
                </div>
              )
            })()}
            {character.battleMasterManeuvers && character.battleMasterManeuvers.length > 0 ? (
              <div className="space-y-2">
                {character.battleMasterManeuvers.map((maneuverName) => {
                  const maneuver = MANEUVERS.find(m => m.name === maneuverName)
                  if (!maneuver) return null
                  const isExpanded = expandedFeatures.has(`maneuver-${maneuverName}`)
                  return (
                    <div
                      key={maneuverName}
                      className="bg-amber-50 dark:bg-amber-900/30 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFeatureExpanded(`maneuver-${maneuverName}`)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                      >
                        <span className="font-medium text-amber-900 dark:text-amber-200">
                          {maneuver.name}
                        </span>
                        <svg
                          className={`w-5 h-5 text-amber-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 text-sm text-amber-700 dark:text-amber-300">
                          {maneuver.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No maneuvers selected. Click "Manage Maneuvers" to choose your Combat Maneuvers.
              </p>
            )}
          </div>
        )}

        {/* Metamagic Options (Sorcerer only) */}
        {character.class === 'Sorcerer' && character.level >= 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Metamagic
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({(character.metamagicOptions?.length ?? 0)}/{getMetamagicKnown(character.level)} options)
                </span>
              </h2>
              <button
                onClick={() => setShowMetamagicPicker(true)}
                className="text-sm px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded transition-colors"
              >
                Manage Metamagic
              </button>
            </div>
            {/* Sorcery Points Display */}
            <div className="mb-4 p-3 bg-violet-50 dark:bg-violet-900/30 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-violet-800 dark:text-violet-200 font-medium">
                  Sorcery Points
                </span>
                <span className="text-violet-700 dark:text-violet-300">
                  {getSorceryPoints(character.level)}
                </span>
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                Recovered on Long Rest
              </p>
            </div>
            {character.metamagicOptions && character.metamagicOptions.length > 0 ? (
              <div className="space-y-2">
                {character.metamagicOptions.map((metamagicName) => {
                  const metamagic = METAMAGIC_OPTIONS.find(m => m.name === metamagicName)
                  if (!metamagic) return null
                  const isExpanded = expandedFeatures.has(`metamagic-${metamagicName}`)
                  return (
                    <div
                      key={metamagicName}
                      className="bg-violet-50 dark:bg-violet-900/30 rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFeatureExpanded(`metamagic-${metamagicName}`)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-violet-900 dark:text-violet-200">
                            {metamagic.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                            {metamagic.sorceryPointCost} SP
                          </span>
                        </div>
                        <svg
                          className={`w-5 h-5 text-violet-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <div className="px-4 pb-3 text-sm text-violet-700 dark:text-violet-300">
                          {metamagic.description}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No metamagic selected. Click "Manage Metamagic" to choose your Metamagic options.
              </p>
            )}
          </div>
        )}

        {/* Damage Resistances & Breath Weapon */}
        {(character.damageResistances?.length || character.breathWeapon) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ancestry Abilities
            </h2>
            <div className="space-y-3">
              {/* Damage Resistances */}
              {character.damageResistances && character.damageResistances.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                    Damage Resistances
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {character.damageResistances.map((resistance) => (
                      <span
                        key={resistance}
                        className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full text-sm font-medium capitalize"
                      >
                        {resistance}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Breath Weapon (Dragonborn) */}
              {character.breathWeapon && (
                <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                    Breath Weapon
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-700 dark:text-red-400">Damage Type:</span>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded text-sm font-medium capitalize">
                        {character.breathWeapon.damageType}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-700 dark:text-red-400">Shape:</span>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded text-sm font-medium">
                        {character.breathWeapon.shape}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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

              const maxCantrips = getCantripsKnown(character.class, character.level)
              const currentCantrips = character.spells.filter(s => s.level === 0).length

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
                  {maxCantrips > 0 && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center col-span-2 md:col-span-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Cantrips Known</p>
                      <p className={`font-semibold ${currentCantrips > maxCantrips ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        {currentCantrips} / {maxCantrips}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Spell Slots / Pact Magic */}
            <div className="mb-6">
              {character.pactMagic ? (
                // Warlock Pact Magic display
                <>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pact Magic
                      <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                        ({character.pactMagic.slotCount} {character.pactMagic.slotCount === 1 ? 'slot' : 'slots'} at {getOrdinalLevel(character.pactMagic.slotLevel)} level)
                      </span>
                    </h3>
                    <button
                      onClick={shortRest}
                      className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Short Rest
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePactMagicSlot}
                      className="flex gap-1"
                    >
                      {Array.from({ length: character.pactMagic.slotCount }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-5 h-5 rounded-full border-2 transition-colors ${
                            i < character.pactMagic!.slotCount - character.pactMagic!.expended
                              ? 'bg-purple-500 border-purple-500'
                              : 'border-gray-400 dark:border-gray-500'
                          }`}
                        />
                      ))}
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {character.pactMagic.slotCount - character.pactMagic.expended}/{character.pactMagic.slotCount} available
                    </span>
                  </div>
                </>
              ) : (
                // Regular spell slots display
                <>
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
                </>
              )}
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
            <div className="flex gap-2">
              <button
                onClick={() => setShowWeaponPicker(true)}
                className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
              >
                Add Weapon
              </button>
              <button
                onClick={() => setShowAddWeapon(true)}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
              >
                Custom
              </button>
            </div>
          </div>

          {character.weapons.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No weapons yet.</p>
          ) : (
            <div className="space-y-3">
              {character.weapons.map((weapon, index) => {
                const attackBonus = getWeaponAttackBonus(weapon)
                const isProficient = isWeaponProficient(weapon)
                const isVersatile = weapon.properties.includes('versatile')
                const weaponData = getWeaponByName(weapon.name)
                const strMod = getAbilityModifier(character.abilityScores.strength)
                const dexMod = getAbilityModifier(character.abilityScores.dexterity)
                const damageBonus = calculateDamageBonus(weapon, strMod, dexMod, false)

                // Get current damage based on two-handing state
                const currentDamage = isVersatile && weapon.isTwoHanding && weaponData?.versatileDamage
                  ? weaponData.versatileDamage
                  : weapon.damage

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      weapon.isEquipped
                        ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    {/* Weapon Header Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Equip Toggle */}
                        <button
                          onClick={() => toggleWeaponEquipped(index)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            weapon.isEquipped
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-gray-400 dark:border-gray-500 hover:border-indigo-500'
                          }`}
                          title={weapon.isEquipped ? 'Unequip weapon' : 'Equip weapon'}
                        >
                          {weapon.isEquipped && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* Weapon Name */}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {weapon.name}
                        </span>

                        {/* Proficiency Indicator */}
                        {isProficient ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" title="Proficient">
                            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Prof
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300" title="Not Proficient">
                            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No Prof
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeWeapon(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove weapon"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Attack and Damage Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Attack:</span>
                        <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {formatModifier(attackBonus)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Damage:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {currentDamage}{damageBonus !== 0 && formatModifier(damageBonus)} {weapon.damageType}
                        </span>
                      </div>

                      {/* Versatile Toggle */}
                      {isVersatile && weaponData?.versatileDamage && (
                        <button
                          onClick={() => toggleWeaponTwoHanding(index)}
                          className={`px-2 py-1 text-xs rounded transition-colors ${
                            weapon.isTwoHanding
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 font-medium'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                          }`}
                          title={weapon.isTwoHanding ? 'Using two hands' : 'Using one hand'}
                        >
                          {weapon.isTwoHanding ? '2H' : '1H'}
                          <span className="ml-1 text-gray-400 dark:text-gray-500">
                            ({weapon.isTwoHanding ? weapon.damage : weaponData.versatileDamage})
                          </span>
                        </button>
                      )}
                    </div>

                    {/* Properties Row */}
                    {weapon.properties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {weapon.properties.map((prop) => (
                          <span
                            key={prop}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
          )}
        </div>

        {/* Armor Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Armor
            </h2>
            <button
              onClick={() => setShowArmorPicker(true)}
              className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              Add Armor
            </button>
          </div>

          {(!character.armor || character.armor.length === 0) ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No armor yet.</p>
          ) : (
            <div className="space-y-3">
              {character.armor.map((armor, index) => {
                const armorData = getArmorByName(armor.name)
                const isProficient = isArmorProficient(armor.name)

                return (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      armor.isEquipped
                        ? 'border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    {/* Armor Header Row */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {/* Equip Toggle */}
                        <button
                          onClick={() => toggleArmorEquipped(index)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                            armor.isEquipped
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-gray-400 dark:border-gray-500 hover:border-indigo-500'
                          }`}
                          title={armor.isEquipped ? 'Unequip armor' : 'Equip armor'}
                        >
                          {armor.isEquipped && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>

                        {/* Armor Name */}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {armor.name}
                        </span>

                        {/* Shield Badge */}
                        {armor.isShield && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                            Shield
                          </span>
                        )}

                        {/* Category Badge */}
                        {armorData && !armor.isShield && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                            armorData.category === 'light'
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                              : armorData.category === 'medium'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                              : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                          }`}>
                            {armorData.category}
                          </span>
                        )}

                        {/* Proficiency Indicator */}
                        {isProficient ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300" title="Proficient">
                            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Prof
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300" title="Not Proficient - Penalties Apply">
                            <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            No Prof
                          </span>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeArmor(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Remove armor"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Armor Stats Row */}
                    {armorData && (
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">AC:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {armor.isShield ? `+${armorData.baseAC}` : armorData.baseAC}
                            {armorData.dexBonus === true && ' + Dex'}
                            {armorData.dexBonus === 'max2' && ' + Dex (max 2)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Weight:</span>
                          <span className="text-gray-900 dark:text-white">{armorData.weight} lb.</span>
                        </div>
                        {armorData.minStrength > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded">
                            Str {armorData.minStrength}+ required
                          </span>
                        )}
                        {armorData.stealthDisadvantage && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                            Stealth Disadvantage
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Currency Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Currency
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuickAddCurrency(true)}
                className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              >
                Quick Add
              </button>
              <button
                onClick={consolidateCurrency}
                className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
              >
                Convert
              </button>
            </div>
          </div>

          {/* Currency Inputs */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            {(['cp', 'sp', 'ep', 'gp', 'pp'] as const).map((type) => {
              const labels: Record<'cp' | 'sp' | 'ep' | 'gp' | 'pp', string> = {
                cp: 'Copper',
                sp: 'Silver',
                ep: 'Electrum',
                gp: 'Gold',
                pp: 'Platinum'
              }
              return (
                <div key={type} className="text-center">
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                    {labels[type]}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={character.currency[type]}
                    onChange={(e) => updateCurrency(type, parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-2 text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg font-semibold"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500 uppercase">{type}</span>
                </div>
              )
            })}
          </div>

          {/* Total Value and Weight */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Value: </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {getTotalValueInGold().toFixed(2)} gp
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-500 dark:text-gray-400">Coin Weight: </span>
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {getTotalCoinWeight().toFixed(2)} lbs
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                ({character.currency.cp + character.currency.sp + character.currency.ep + character.currency.gp + character.currency.pp} coins)
              </span>
            </div>
          </div>

          {/* Quick Add Currency Modal */}
          {showQuickAddCurrency && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Add Currency
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quickAddAmount}
                      onChange={(e) => setQuickAddAmount(e.target.value)}
                      placeholder="Enter amount..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Currency Type
                    </label>
                    <select
                      value={quickAddType}
                      onChange={(e) => setQuickAddType(e.target.value as 'cp' | 'sp' | 'ep' | 'gp' | 'pp')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="cp">Copper (cp)</option>
                      <option value="sp">Silver (sp)</option>
                      <option value="ep">Electrum (ep)</option>
                      <option value="gp">Gold (gp)</option>
                      <option value="pp">Platinum (pp)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => {
                      setShowQuickAddCurrency(false)
                      setQuickAddAmount('')
                    }}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={quickAddCurrency}
                    disabled={!quickAddAmount || parseInt(quickAddAmount) <= 0}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inventory Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inventory
            </h2>
            <button
              onClick={() => setShowInventoryModal(true)}
              className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              Add Item
            </button>
          </div>

          {character.inventory.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No items in inventory yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedInventory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 capitalize">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map(({ item, index }) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900 dark:text-white font-medium truncate">{item.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({item.weight} lb{item.weight !== 1 ? 's' : ''} each)
                            </span>
                          </div>
                          {item.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate" title={item.notes}>
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {/* Quantity controls with +/- buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateInventoryQuantity(index, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateInventoryQuantity(index, parseInt(e.target.value) || 1)}
                              className="w-12 px-1 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                            />
                            <button
                              onClick={() => updateInventoryQuantity(index, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          {/* Total weight for this item */}
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-14 text-right">
                            {(item.weight * item.quantity).toFixed(1)} lbs
                          </span>
                          {/* Delete button */}
                          <button
                            onClick={() => setItemToDelete(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Total inventory weight */}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Inventory Weight:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {character.inventory.reduce((total, item) => total + (item.weight * item.quantity), 0).toFixed(1)} lbs
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Encumbrance Display */}
          {(() => {
            const strScore = character.abilityScores.strength
            const currentWeight = calculateCurrentWeight(character.inventory, character.weapons, character.armor)
            const maxCapacity = calculateCarryingCapacity(strScore)
            const status = getEncumbranceStatus(currentWeight, strScore)
            const penalties = getEncumbrancePenalties(status)
            const encumberedThreshold = strScore * 5
            const heavilyEncumberedThreshold = strScore * 10
            const weightPercentage = Math.min((currentWeight / maxCapacity) * 100, 100)

            // Color coding based on status
            const getProgressColor = () => {
              switch (status) {
                case 'heavily_encumbered':
                  return 'bg-red-500'
                case 'encumbered':
                  return 'bg-yellow-500'
                default:
                  return 'bg-green-500'
              }
            }

            const getStatusBadgeColor = () => {
              switch (status) {
                case 'heavily_encumbered':
                  return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                case 'encumbered':
                  return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                default:
                  return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }
            }

            const formatStatus = () => {
              switch (status) {
                case 'heavily_encumbered':
                  return 'Heavily Encumbered'
                case 'encumbered':
                  return 'Encumbered'
                default:
                  return 'Normal'
              }
            }

            return (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Encumbrance</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadgeColor()}`}>
                      {formatStatus()}
                    </span>
                    {/* Info tooltip */}
                    <div className="relative group">
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 w-64 shadow-lg">
                          <div className="font-semibold mb-1">Encumbrance Thresholds</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-green-400">Normal:</span>
                              <span>0 - {encumberedThreshold} lbs</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-yellow-400">Encumbered:</span>
                              <span>{encumberedThreshold + 1} - {heavilyEncumberedThreshold} lbs</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-red-400">Heavily Encumbered:</span>
                              <span>&gt; {heavilyEncumberedThreshold} lbs</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-700 pt-1 mt-1">
                              <span className="text-gray-400">Max Capacity:</span>
                              <span>{maxCapacity} lbs</span>
                            </div>
                          </div>
                          <div className="mt-2 text-gray-400 text-[10px]">
                            Based on Strength score of {strScore}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentWeight.toFixed(1)} / {maxCapacity} lbs
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor()} transition-all duration-300`}
                    style={{ width: `${weightPercentage}%` }}
                  />
                </div>

                {/* Show encumbrance thresholds as markers on the bar */}
                <div className="relative h-0">
                  <div
                    className="absolute top-[-8px] border-l-2 border-yellow-600 dark:border-yellow-400 h-2"
                    style={{ left: `${(encumberedThreshold / maxCapacity) * 100}%` }}
                    title={`Encumbered at ${encumberedThreshold} lbs`}
                  />
                  <div
                    className="absolute top-[-8px] border-l-2 border-red-600 dark:border-red-400 h-2"
                    style={{ left: `${(heavilyEncumberedThreshold / maxCapacity) * 100}%` }}
                    title={`Heavily encumbered at ${heavilyEncumberedThreshold} lbs`}
                  />
                </div>

                {/* Display penalties when encumbered */}
                {status !== 'normal' && (
                  <div className={`mt-3 p-2 rounded-lg text-sm ${
                    status === 'heavily_encumbered'
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                  }`}>
                    <div className="font-medium mb-1">Active Penalties:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-xs">
                      <li>Speed reduced by {penalties.speedReduction} ft</li>
                      {penalties.hasDisadvantageOnChecks && (
                        <li>Disadvantage on Str/Dex/Con ability checks, attack rolls, and saving throws</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* Tool Proficiencies Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tool Proficiencies
            </h2>
            <button
              onClick={() => setShowToolPicker(true)}
              className="text-sm px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              Add Tool
            </button>
          </div>

          {/* Tool Roll Result Display */}
          {toolRollResult && (
            <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                  {toolRollResult.toolName} Check
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {toolRollResult.roll} {toolRollResult.bonus >= 0 ? '+' : ''}{toolRollResult.bonus}
                  </span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    = {toolRollResult.total}
                  </span>
                </div>
              </div>
            </div>
          )}

          {character.toolProficiencies.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No tool proficiencies yet.</p>
          ) : (
            <div className="space-y-2">
              {character.toolProficiencies.map((toolName) => {
                const toolData = getToolByName(toolName)
                const abilityUsed = toolData?.abilityUsed || 'intelligence'
                const abilityMod = getAbilityModifier(character.abilityScores[abilityUsed])
                const profBonus = getProficiencyBonus(character.level)
                const totalBonus = abilityMod + profBonus // Proficient with the tool

                return (
                  <div
                    key={toolName}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white font-medium">{toolName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 uppercase">
                          {ABILITY_LABELS[abilityUsed]}
                        </span>
                      </div>
                      {toolData && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {toolData.category}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Bonus display */}
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatModifier(totalBonus)}
                      </span>
                      {/* Roll button */}
                      <button
                        onClick={() => rollToolCheck(toolName)}
                        className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors text-sm font-medium"
                      >
                        Roll
                      </button>
                      {/* Remove button */}
                      <button
                        onClick={() => removeToolProficiency(toolName)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove tool proficiency"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {spell.school} • {spell.castingTime}
                        </p>
                        <div className="flex items-center gap-0.5">
                          {spell.classes.map((cls) => (
                            <ClassIcon key={cls} className={cls} size={16} />
                          ))}
                        </div>
                      </div>
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

      {/* Weapon Picker Modal */}
      <WeaponPickerModal
        isOpen={showWeaponPicker}
        onClose={() => setShowWeaponPicker(false)}
        onAddWeapon={addWeaponFromPicker}
      />

      {/* Armor Picker Modal */}
      <ArmorPickerModal
        isOpen={showArmorPicker}
        onClose={() => setShowArmorPicker(false)}
        onAddArmor={addArmorFromPicker}
        armorProficiencies={getClassByName(character.class)?.armorProficiencies ?? []}
      />

      {/* Add Custom Weapon Modal */}
      {showAddWeapon && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Custom Weapon
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

      {/* Add Inventory Item Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showCustomItemForm ? 'Add Custom Item' : 'Add Item to Inventory'}
              </h3>
              <button
                onClick={() => {
                  setShowInventoryModal(false)
                  setInventorySearchQuery('')
                  setInventoryCategoryFilter('all')
                  setShowCustomItemForm(false)
                  setNewItemName('')
                  setNewItemWeight(0)
                  setNewItemQuantity(1)
                  setNewItemCategory('adventuring gear')
                  setNewItemNotes('')
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Toggle between gear list and custom item */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setShowCustomItemForm(false)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  !showCustomItemForm
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                From Gear List
              </button>
              <button
                onClick={() => setShowCustomItemForm(true)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                  showCustomItemForm
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Custom Item
              </button>
            </div>

            {showCustomItemForm ? (
              /* Custom Item Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., Mysterious Orb"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={newItemWeight}
                      onChange={(e) => setNewItemWeight(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newItemQuantity}
                      onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="adventuring gear">Adventuring Gear</option>
                    <option value="container">Container</option>
                    <option value="ammunition">Ammunition</option>
                    <option value="arcane focus">Arcane Focus</option>
                    <option value="druidic focus">Druidic Focus</option>
                    <option value="holy symbol">Holy Symbol</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={newItemNotes}
                    onChange={(e) => setNewItemNotes(e.target.value)}
                    placeholder="Description or notes..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  onClick={addCustomItem}
                  disabled={!newItemName.trim()}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Add to Inventory
                </button>
              </div>
            ) : (
              /* Gear List */
              <>
                {/* Search and Filter */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={inventorySearchQuery}
                    onChange={(e) => setInventorySearchQuery(e.target.value)}
                    placeholder="Search gear..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                  <select
                    value={inventoryCategoryFilter}
                    onChange={(e) => setInventoryCategoryFilter(e.target.value as GearCategory | 'all')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="adventuring gear">Adventuring Gear</option>
                    <option value="container">Containers</option>
                    <option value="ammunition">Ammunition</option>
                    <option value="arcane focus">Arcane Focus</option>
                    <option value="druidic focus">Druidic Focus</option>
                    <option value="holy symbol">Holy Symbol</option>
                  </select>
                </div>

                {/* Gear List */}
                <div className="overflow-y-auto flex-1 space-y-1">
                  {(() => {
                    const filteredGear = GEAR
                      .filter((gear) => {
                        if (inventoryCategoryFilter !== 'all' && gear.category !== inventoryCategoryFilter) return false
                        if (inventorySearchQuery) {
                          const query = inventorySearchQuery.toLowerCase()
                          return gear.name.toLowerCase().includes(query) ||
                                 gear.description.toLowerCase().includes(query)
                        }
                        return true
                      })
                      .sort((a, b) => a.name.localeCompare(b.name))

                    if (filteredGear.length === 0) {
                      return (
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                          No gear found matching your criteria.
                        </p>
                      )
                    }

                    return filteredGear.map((gear) => (
                      <button
                        key={gear.name}
                        onClick={() => addGearToInventory(gear)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded capitalize">
                              {gear.category}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white truncate">{gear.name}</span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                            {gear.weight} lb • {gear.cost} • {gear.description}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    ))
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Remove Item?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to remove <span className="font-medium">{character?.inventory[itemToDelete]?.name}</span> from your inventory?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setItemToDelete(null)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => removeInventoryItem(itemToDelete)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tool Picker Modal */}
      {showToolPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Tool Proficiency
              </h3>
              <button
                onClick={() => {
                  setShowToolPicker(false)
                  setToolSearchQuery('')
                  setToolCategoryFilter('all')
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
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                placeholder="Search tools..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                autoFocus
              />
              <select
                value={toolCategoryFilter}
                onChange={(e) => setToolCategoryFilter(e.target.value as ToolCategory | 'all')}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="artisan's tools">Artisan's Tools</option>
                <option value="gaming set">Gaming Sets</option>
                <option value="musical instrument">Musical Instruments</option>
                <option value="other">Other Tools</option>
              </select>
            </div>

            {/* Tool List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {(() => {
                const filteredTools = TOOLS.filter(tool => {
                  // Filter out tools already in proficiencies
                  if (character.toolProficiencies.includes(tool.name)) return false
                  // Apply search filter
                  if (toolSearchQuery && !tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase())) return false
                  // Apply category filter
                  if (toolCategoryFilter !== 'all' && tool.category !== toolCategoryFilter) return false
                  return true
                })

                if (filteredTools.length === 0) {
                  return (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      {toolSearchQuery || toolCategoryFilter !== 'all'
                        ? 'No matching tools found'
                        : 'All tools already added'}
                    </p>
                  )
                }

                return filteredTools.map(tool => (
                  <button
                    key={tool.name}
                    onClick={() => addToolProficiency(tool.name)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-left transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded capitalize">
                          {tool.category}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white truncate">{tool.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {tool.weight} lb • {tool.cost} • Uses {ABILITY_LABELS[tool.abilityUsed]}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-indigo-500 flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                ))
              })()}
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
              {editLevel < (character?.level || 1) && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                    Warning: Decreasing Level
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This will remove class features above level {editLevel} and recalculate HP using average values.
                    Equipment, currency, feats, and spells will be preserved.
                  </p>
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

      {/* Level-Up Spell Picker Modal */}
      {showLevelUpSpellPicker && character && pendingLevelUp && (
        <LevelUpSpellPickerModal
          characterClass={character.class}
          currentSpells={character.spells}
          spellsToSelect={pendingLevelUp.levelUpResult.choices.newSpellsToLearn}
          maxSpellLevel={pendingLevelUp.levelUpResult.choices.maxSpellLevel}
          onConfirm={handleLevelUpSpellsConfirm}
          onCancel={handleLevelUpSpellsCancel}
        />
      )}

      {/* Invocation Picker Modal */}
      {showInvocationPicker && character && character.class === 'Warlock' && (
        <InvocationPickerModal
          warlockLevel={character.level}
          currentInvocations={character.eldritchInvocations ?? []}
          hasEldritchBlast={character.spells.some(s => s.name === 'Eldritch Blast')}
          onConfirm={(invocations) => {
            updateCharacter({ eldritchInvocations: invocations })
            setShowInvocationPicker(false)
          }}
          onCancel={() => setShowInvocationPicker(false)}
        />
      )}

      {/* Maneuver Picker Modal */}
      {showManeuverPicker && character && character.class === 'Fighter' && character.subclass === 'Battle Master' && (
        <ManeuverPickerModal
          fighterLevel={character.level}
          currentManeuvers={character.battleMasterManeuvers ?? []}
          onConfirm={(maneuvers) => {
            updateCharacter({ battleMasterManeuvers: maneuvers })
            setShowManeuverPicker(false)
          }}
          onCancel={() => setShowManeuverPicker(false)}
        />
      )}

      {/* Metamagic Picker Modal */}
      {showMetamagicPicker && character && character.class === 'Sorcerer' && (
        <MetamagicPickerModal
          sorcererLevel={character.level}
          currentMetamagic={character.metamagicOptions ?? []}
          onConfirm={(metamagic) => {
            updateCharacter({ metamagicOptions: metamagic })
            setShowMetamagicPicker(false)
          }}
          onCancel={() => setShowMetamagicPicker(false)}
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

      {/* Character Image Edit Modal */}
      {showImageEdit && character && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Edit Character Portrait
            </h3>
            <CharacterImageInput
              value={character.imageUrl}
              imageStyle={character.imageStyle}
              onChange={(url) => updateCharacter({
                imageUrl: url,
                // Reset style if clearing image OR uploading a different image
                imageStyle: !url ? undefined : (url !== character.imageUrl ? undefined : character.imageStyle)
              })}
              onStyleChange={(style) => updateCharacter({ imageStyle: style })}
              size="large"
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowImageEdit(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
