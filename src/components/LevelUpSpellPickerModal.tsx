import { useState, useMemo } from 'react'
import type { Spell } from '../types'
import { SPELLS } from '../data/spells'

interface LevelUpSpellPickerModalProps {
  characterClass: string
  currentSpells: Spell[]
  spellsToSelect: number
  maxSpellLevel: number
  onConfirm: (selectedSpells: Spell[]) => void
  onCancel: () => void
}

/**
 * Get spells available for a class filtered by max spell level
 */
function getAvailableSpells(
  characterClass: string,
  currentSpells: Spell[],
  maxSpellLevel: number
): Spell[] {
  const knownSpellNames = new Set(currentSpells.map((s) => s.name))

  return SPELLS.filter((spell) => {
    // Must be in the class's spell list
    if (!spell.classes.includes(characterClass)) return false
    // Must be a leveled spell (not cantrip - cantrips are learned separately)
    if (spell.level === 0) return false
    // Must be at or below max spell level
    if (spell.level > maxSpellLevel) return false
    // Must not already be known
    if (knownSpellNames.has(spell.name)) return false
    return true
  }).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
}

export default function LevelUpSpellPickerModal({
  characterClass,
  currentSpells,
  spellsToSelect,
  maxSpellLevel,
  onConfirm,
  onCancel,
}: LevelUpSpellPickerModalProps) {
  const [selectedSpells, setSelectedSpells] = useState<Spell[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all')

  const availableSpells = useMemo(
    () => getAvailableSpells(characterClass, currentSpells, maxSpellLevel),
    [characterClass, currentSpells, maxSpellLevel]
  )

  const filteredSpells = useMemo(() => {
    return availableSpells.filter((spell) => {
      if (levelFilter !== 'all' && spell.level !== levelFilter) return false
      if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [availableSpells, levelFilter, searchQuery])

  const toggleSpell = (spell: Spell) => {
    const isSelected = selectedSpells.some((s) => s.name === spell.name)
    if (isSelected) {
      setSelectedSpells(selectedSpells.filter((s) => s.name !== spell.name))
    } else if (selectedSpells.length < spellsToSelect) {
      setSelectedSpells([...selectedSpells, spell])
    }
  }

  const isSpellSelected = (spell: Spell) => {
    return selectedSpells.some((s) => s.name === spell.name)
  }

  const canConfirm = selectedSpells.length === spellsToSelect

  // Generate level filter options based on max spell level
  const levelOptions = useMemo(() => {
    const options: { value: number | 'all'; label: string }[] = [{ value: 'all', label: 'All Levels' }]
    for (let i = 1; i <= maxSpellLevel; i++) {
      options.push({ value: i, label: `Level ${i}` })
    }
    return options
  }, [maxSpellLevel])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Learn New Spells
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select {spellsToSelect} spell{spellsToSelect > 1 ? 's' : ''} to learn
              {selectedSpells.length > 0 && (
                <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                  ({selectedSpells.length}/{spellsToSelect} selected)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selected Spells Preview */}
        {selectedSpells.length > 0 && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
            <p className="text-xs text-indigo-700 dark:text-indigo-300 mb-2 font-medium">Selected:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSpells.map((spell) => (
                <button
                  key={spell.name}
                  onClick={() => toggleSpell(spell)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded text-sm hover:bg-indigo-200 dark:hover:bg-indigo-700"
                >
                  <span className="text-xs opacity-75">Lvl {spell.level}</span>
                  {spell.name}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search spells..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {levelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Spell List */}
        <div className="overflow-y-auto flex-1 space-y-1 min-h-0">
          {filteredSpells.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No spells available matching your criteria.
            </p>
          ) : (
            filteredSpells.map((spell) => {
              const selected = isSpellSelected(spell)
              const disabled = !selected && selectedSpells.length >= spellsToSelect

              return (
                <button
                  key={spell.name}
                  onClick={() => toggleSpell(spell)}
                  disabled={disabled}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left rounded-lg transition-colors ${
                    selected
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                      : disabled
                      ? 'bg-gray-50 dark:bg-gray-700/50 opacity-50 cursor-not-allowed'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded shrink-0">
                        Lvl {spell.level}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white truncate">{spell.name}</span>
                      {spell.concentration && <span className="text-xs text-gray-500 shrink-0">(C)</span>}
                      {spell.ritual && <span className="text-xs text-gray-500 shrink-0">(R)</span>}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {spell.school} • {spell.castingTime} • {spell.range}
                    </p>
                  </div>
                  <div className="ml-2 shrink-0">
                    {selected ? (
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedSpells)}
            disabled={!canConfirm}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canConfirm
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirm ({selectedSpells.length}/{spellsToSelect})
          </button>
        </div>
      </div>
    </div>
  )
}
