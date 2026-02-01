import { useState, useMemo } from 'react'
import { WEAPONS, type WeaponData, type WeaponCategory } from '../data/weapons'
import type { Weapon, WeaponProperty } from '../types'

interface WeaponPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onAddWeapon: (weapon: Weapon) => void
}

const ALL_PROPERTIES: WeaponProperty[] = [
  'ammunition',
  'finesse',
  'heavy',
  'light',
  'loading',
  'range',
  'reach',
  'thrown',
  'two-handed',
  'versatile',
]

export default function WeaponPickerModal({
  isOpen,
  onClose,
  onAddWeapon,
}: WeaponPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<WeaponCategory | 'all'>('all')
  const [propertyFilters, setPropertyFilters] = useState<WeaponProperty[]>([])
  const [selectedWeapon, setSelectedWeapon] = useState<WeaponData | null>(null)

  // Filter weapons based on search, category, and properties
  const filteredWeapons = useMemo(() => {
    return WEAPONS.filter((weapon) => {
      // Search filter
      if (searchQuery && !weapon.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      // Category filter
      if (categoryFilter !== 'all' && weapon.category !== categoryFilter) {
        return false
      }
      // Property filters (must have ALL selected properties)
      if (propertyFilters.length > 0) {
        const hasAllProperties = propertyFilters.every((prop) =>
          weapon.properties.includes(prop)
        )
        if (!hasAllProperties) {
          return false
        }
      }
      return true
    })
  }, [searchQuery, categoryFilter, propertyFilters])

  const togglePropertyFilter = (prop: WeaponProperty) => {
    setPropertyFilters((prev) =>
      prev.includes(prop) ? prev.filter((p) => p !== prop) : [...prev, prop]
    )
  }

  const handleAddWeapon = () => {
    if (!selectedWeapon) return

    const newWeapon: Weapon = {
      name: selectedWeapon.name,
      damage: selectedWeapon.damage,
      damageType: selectedWeapon.damageType,
      properties: selectedWeapon.properties,
      isEquipped: true,
      isTwoHanding: false,
    }

    onAddWeapon(newWeapon)
    handleClose()
  }

  const handleClose = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setPropertyFilters([])
    setSelectedWeapon(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add Weapon from Database
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
            placeholder="Search weapons..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            autoFocus
          />

          {/* Category Filter */}
          <div className="flex gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400 self-center">Category:</span>
            {(['all', 'simple', 'martial'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {/* Property Filters */}
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400 block mb-1">Properties:</span>
            <div className="flex flex-wrap gap-1">
              {ALL_PROPERTIES.map((prop) => (
                <button
                  key={prop}
                  onClick={() => togglePropertyFilter(prop)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    propertyFilters.includes(prop)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-indigo-400'
                  }`}
                >
                  {prop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Weapons List and Details */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* Weapons List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {filteredWeapons.length === 0 ? (
              <p className="p-4 text-gray-500 dark:text-gray-400 text-center">
                No weapons match your filters.
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWeapons.map((weapon) => (
                  <li
                    key={weapon.name}
                    onClick={() => setSelectedWeapon(weapon)}
                    className={`p-3 cursor-pointer transition-colors ${
                      selectedWeapon?.name === weapon.name
                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {weapon.name}
                        </span>
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                          weapon.category === 'simple'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                            : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400'
                        }`}>
                          {weapon.category}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {weapon.damage} {weapon.damageType}
                      </span>
                    </div>
                    {weapon.properties.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {weapon.properties.map((prop) => (
                          <span
                            key={prop}
                            className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                          >
                            {prop}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Weapon Details Panel */}
          <div className="w-64 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-y-auto">
            {selectedWeapon ? (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
                  {selectedWeapon.name}
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Category:</span>
                    <span className={`font-medium ${
                      selectedWeapon.category === 'simple'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-purple-600 dark:text-purple-400'
                    }`}>
                      {selectedWeapon.category.charAt(0).toUpperCase() + selectedWeapon.category.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Type:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedWeapon.type.charAt(0).toUpperCase() + selectedWeapon.type.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Damage:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selectedWeapon.damage} {selectedWeapon.damageType}
                    </span>
                  </div>

                  {selectedWeapon.versatileDamage && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Versatile:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedWeapon.versatileDamage}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedWeapon.weight} lb.
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Cost:</span>
                    <span className="text-gray-900 dark:text-white">
                      {selectedWeapon.cost}
                    </span>
                  </div>

                  {selectedWeapon.range && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Range:</span>
                      <span className="text-gray-900 dark:text-white">
                        {selectedWeapon.range.normal}/{selectedWeapon.range.long} ft.
                      </span>
                    </div>
                  )}
                </div>

                {selectedWeapon.properties.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">
                      Properties:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedWeapon.properties.map((prop) => (
                        <span
                          key={prop}
                          className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full"
                        >
                          {prop}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
                  Select a weapon to see details
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
            onClick={handleAddWeapon}
            disabled={!selectedWeapon}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Add Weapon
          </button>
        </div>
      </div>
    </div>
  )
}
