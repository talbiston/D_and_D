import { useState, useMemo } from 'react'
import { METAMAGIC_OPTIONS, type Metamagic, getMetamagicKnown } from '../data/metamagic'
import { getSorceryPoints } from '../utils/calculations'

interface MetamagicPickerModalProps {
  sorcererLevel: number
  currentMetamagic: string[]
  onConfirm: (metamagic: string[]) => void
  onCancel: () => void
}

export default function MetamagicPickerModal({
  sorcererLevel,
  currentMetamagic,
  onConfirm,
  onCancel,
}: MetamagicPickerModalProps) {
  const [selectedMetamagic, setSelectedMetamagic] = useState<string[]>(currentMetamagic)
  const [searchQuery, setSearchQuery] = useState('')

  const maxMetamagic = getMetamagicKnown(sorcererLevel)
  const sorceryPoints = getSorceryPoints(sorcererLevel)

  // Filter metamagic based on search
  const filteredMetamagic = useMemo(() => {
    return METAMAGIC_OPTIONS.filter((m) => {
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

  // Check if a metamagic option can be selected
  const canSelectMetamagic = (metamagic: Metamagic): { eligible: boolean; reason?: string } => {
    // Already selected
    if (selectedMetamagic.includes(metamagic.name)) {
      return { eligible: true }
    }

    // Would exceed max
    if (selectedMetamagic.length >= maxMetamagic) {
      return { eligible: false, reason: `Maximum ${maxMetamagic} options` }
    }

    return { eligible: true }
  }

  const toggleMetamagic = (metamagicName: string) => {
    if (selectedMetamagic.includes(metamagicName)) {
      setSelectedMetamagic(selectedMetamagic.filter((name) => name !== metamagicName))
    } else {
      const metamagic = METAMAGIC_OPTIONS.find((m) => m.name === metamagicName)
      if (metamagic && canSelectMetamagic(metamagic).eligible) {
        setSelectedMetamagic([...selectedMetamagic, metamagicName])
      }
    }
  }

  const handleConfirm = () => {
    onConfirm(selectedMetamagic)
  }

  const formatCost = (cost: number | string): string => {
    if (typeof cost === 'number') {
      return `${cost} SP`
    }
    return cost
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Metamagic Options</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select up to {maxMetamagic} options ({selectedMetamagic.length}/{maxMetamagic} selected)
          </p>
          <p className="text-sm text-violet-600 dark:text-violet-400 mt-1">
            Sorcery Points: {sorceryPoints}
          </p>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search metamagic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Metamagic List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-2">
            {filteredMetamagic.map((metamagic) => {
              const isSelected = selectedMetamagic.includes(metamagic.name)
              const { eligible, reason } = canSelectMetamagic(metamagic)
              const canToggle = isSelected || eligible

              return (
                <button
                  key={metamagic.name}
                  onClick={() => toggleMetamagic(metamagic.name)}
                  disabled={!canToggle}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                      : canToggle
                        ? 'border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600'
                        : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${
                            isSelected
                              ? 'text-violet-700 dark:text-violet-300'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {metamagic.name}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300">
                          {formatCost(metamagic.sorceryPointCost)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {metamagic.description}
                      </p>
                    </div>
                    <div className="flex items-center ml-3">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded bg-violet-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
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
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
