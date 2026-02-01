import { useState, useMemo } from 'react'
import { ARMOR, type ArmorData, type ArmorCategory } from '../data/armor'
import type { CharacterArmor } from '../types'

interface ArmorPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onAddArmor: (armor: CharacterArmor) => void
  armorProficiencies: string[] // e.g., ['Light', 'Medium', 'Shields']
}

const CATEGORY_OPTIONS: ArmorCategory[] = ['light', 'medium', 'heavy', 'shield']

export default function ArmorPickerModal({
  isOpen,
  onClose,
  onAddArmor,
  armorProficiencies,
}: ArmorPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<ArmorCategory | 'all'>('all')
  const [selectedArmor, setSelectedArmor] = useState<ArmorData | null>(null)

  // Check if character is proficient with an armor category
  const isProficientWithCategory = (category: ArmorCategory): boolean => {
    // Normalize to lowercase for comparison
    const normalizedProfs = armorProficiencies.map(p => p.toLowerCase())

    if (category === 'shield') {
      return normalizedProfs.includes('shields') || normalizedProfs.includes('shield')
    }
    // For armor categories, check if they have 'Light', 'Medium', 'Heavy', or 'All'
    return normalizedProfs.includes(category) || normalizedProfs.includes('all')
  }

  // Check proficiency for a specific armor piece
  const isProficientWithArmor = (armor: ArmorData): boolean => {
    return isProficientWithCategory(armor.category)
  }

  // Filter armor based on search and category
  const filteredArmor = useMemo(() => {
    return ARMOR.filter((armor) => {
      // Search filter
      if (searchQuery && !armor.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Category filter
      if (categoryFilter !== 'all' && armor.category !== categoryFilter) {
        return false
      }
      return true
    })
  }, [searchQuery, categoryFilter])

  const handleAddArmor = () => {
    if (!selectedArmor) return

    const newArmor: CharacterArmor = {
      name: selectedArmor.name,
      isEquipped: true,
      isShield: selectedArmor.category === 'shield',
    }

    onAddArmor(newArmor)
    handleClose()
  }

  const handleClose = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setSelectedArmor(null)
    onClose()
  }

  // Helper to format Dex bonus display
  const formatDexBonus = (dexBonus: boolean | 'max2'): string => {
    if (dexBonus === true) return '+ Dex'
    if (dexBonus === 'max2') return '+ Dex (max 2)'
    return '—'
  }

  // Get category display color
  const getCategoryColor = (category: ArmorCategory): string => {
    switch (category) {
      case 'light':
        return 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
      case 'medium':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
      case 'heavy':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
      case 'shield':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-400'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Armor from Database
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 mb-4">
          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search armor..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400 self-center">Category:</span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                categoryFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                {cat === 'shield' ? 's' : ' Armor'}
              </button>
            ))}
          </div>
        </div>

        {/* Armor List and Details */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* Armor List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {filteredArmor.length === 0 ? (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
                No armor matches your filters.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredArmor.map((armor) => {
                  const isProficient = isProficientWithArmor(armor)
                  return (
                    <li
                      key={armor.name}
                      onClick={() => setSelectedArmor(armor)}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedArmor?.name === armor.name
                          ? 'bg-indigo-50 dark:bg-indigo-900/30'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {armor.name}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${getCategoryColor(armor.category)}`}>
                            {armor.category}
                          </span>
                          {!isProficient && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400">
                              Not Proficient
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          AC {armor.category === 'shield' ? `+${armor.baseAC}` : armor.baseAC}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                        {armor.dexBonus !== false && armor.category !== 'shield' && (
                          <span>{formatDexBonus(armor.dexBonus)}</span>
                        )}
                        {armor.stealthDisadvantage && (
                          <span className="text-red-500 dark:text-red-400">Stealth Disadvantage</span>
                        )}
                        {armor.minStrength > 0 && (
                          <span>Str {armor.minStrength}+</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Armor Details Panel */}
          <div className="w-64 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-y-auto">
            {selectedArmor ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {selectedArmor.name}
                </h4>

                {/* Proficiency Warning */}
                {!isProficientWithArmor(selectedArmor) && (
                  <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Your character is not proficient with this armor. Wearing it imposes disadvantage on ability checks, saving throws, and attack rolls involving Strength or Dexterity, and you can't cast spells.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className={`font-medium px-2 py-0.5 rounded ${getCategoryColor(selectedArmor.category)}`}>
                      {selectedArmor.category.charAt(0).toUpperCase() + selectedArmor.category.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Base AC:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selectedArmor.category === 'shield' ? `+${selectedArmor.baseAC}` : selectedArmor.baseAC}
                    </span>
                  </div>

                  {selectedArmor.category !== 'shield' && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Dex Bonus:</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatDexBonus(selectedArmor.dexBonus)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedArmor.weight} lb.
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedArmor.cost}
                    </span>
                  </div>

                  {selectedArmor.minStrength > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Min Strength:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedArmor.minStrength}
                      </span>
                    </div>
                  )}
                </div>

                {/* Properties */}
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                    Properties:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedArmor.stealthDisadvantage && (
                      <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full">
                        Stealth Disadvantage
                      </span>
                    )}
                    {selectedArmor.minStrength > 0 && (
                      <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 rounded-full">
                        Str {selectedArmor.minStrength} Required
                      </span>
                    )}
                    {!selectedArmor.stealthDisadvantage && selectedArmor.minStrength === 0 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                        No special properties
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
                  Select armor to see details
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddArmor}
            disabled={!selectedArmor}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Add Armor
          </button>
        </div>
      </div>
    </div>
  )
}
