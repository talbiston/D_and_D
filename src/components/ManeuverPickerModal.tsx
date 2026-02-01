import { useState, useMemo } from 'react'
import { MANEUVERS, type Maneuver, getManeuversKnown, getSuperiorityDice } from '../data/maneuvers'

interface ManeuverPickerModalProps {
  fighterLevel: number
  currentManeuvers: string[]
  onConfirm: (maneuvers: string[]) => void
  onCancel: () => void
}

export default function ManeuverPickerModal({
  fighterLevel,
  currentManeuvers,
  onConfirm,
  onCancel,
}: ManeuverPickerModalProps) {
  const [selectedManeuvers, setSelectedManeuvers] = useState<string[]>(currentManeuvers)
  const [searchQuery, setSearchQuery] = useState('')

  const maxManeuvers = getManeuversKnown(fighterLevel)
  const { count: diceCount, size: diceSize } = getSuperiorityDice(fighterLevel)

  // Filter maneuvers based on search
  const filteredManeuvers = useMemo(() => {
    return MANEUVERS.filter(m => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = m.name.toLowerCase().includes(query)
        const matchesDescription = m.description.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) {
          return false
        }
      }
      return true
    })
  }, [searchQuery])

  // Check if a maneuver can be selected
  const canSelectManeuver = (maneuver: Maneuver): { eligible: boolean; reason?: string } => {
    // Already selected
    if (selectedManeuvers.includes(maneuver.name)) {
      return { eligible: true }
    }

    // Would exceed max
    if (selectedManeuvers.length >= maxManeuvers) {
      return { eligible: false, reason: `Maximum ${maxManeuvers} maneuvers` }
    }

    return { eligible: true }
  }

  const toggleManeuver = (maneuverName: string) => {
    if (selectedManeuvers.includes(maneuverName)) {
      setSelectedManeuvers(selectedManeuvers.filter(name => name !== maneuverName))
    } else {
      const maneuver = MANEUVERS.find(m => m.name === maneuverName)
      if (maneuver && canSelectManeuver(maneuver).eligible) {
        setSelectedManeuvers([...selectedManeuvers, maneuverName])
      }
    }
  }

  const handleConfirm = () => {
    onConfirm(selectedManeuvers)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Battle Master Maneuvers
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select up to {maxManeuvers} maneuvers ({selectedManeuvers.length}/{maxManeuvers} selected)
          </p>
          <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
            Superiority Dice: {diceCount}{diceSize}
          </p>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search maneuvers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Maneuver List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filteredManeuvers.map((maneuver) => {
              const isSelected = selectedManeuvers.includes(maneuver.name)
              const { eligible, reason } = canSelectManeuver(maneuver)
              const canToggle = isSelected || eligible

              return (
                <button
                  key={maneuver.name}
                  onClick={() => toggleManeuver(maneuver.name)}
                  disabled={!canToggle}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30'
                      : canToggle
                      ? 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600'
                      : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <span className={`font-medium ${
                        isSelected
                          ? 'text-amber-700 dark:text-amber-300'
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {maneuver.name}
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {maneuver.description}
                      </p>
                    </div>
                    <div className="flex items-center ml-3">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      ) : eligible ? (
                        <div className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600" />
                      ) : (
                        <span className="text-xs text-red-500 dark:text-red-400">{reason}</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
