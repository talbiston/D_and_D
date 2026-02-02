import { useState } from 'react'
import { getSubclassesByClass, getClassByName, type Subclass } from '../data/classes'

interface SubclassPickerModalProps {
  isOpen: boolean
  characterClass: string
  onConfirm: (subclassName: string) => void
  onCancel: () => void
}

export default function SubclassPickerModal({
  isOpen,
  characterClass,
  onConfirm,
  onCancel,
}: SubclassPickerModalProps) {
  const [selectedSubclass, setSelectedSubclass] = useState<string | null>(null)
  const [expandedSubclass, setExpandedSubclass] = useState<string | null>(null)

  const classData = getClassByName(characterClass)
  const subclasses = getSubclassesByClass(characterClass)
  const subclassTypeName = classData?.subclassName ?? 'Subclass'

  const handleConfirm = () => {
    if (selectedSubclass) {
      onConfirm(selectedSubclass)
      setSelectedSubclass(null)
      setExpandedSubclass(null)
    }
  }

  const toggleExpanded = (subclassName: string) => {
    setExpandedSubclass(expandedSubclass === subclassName ? null : subclassName)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Choose Your {subclassTypeName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            At level 3, {characterClass}s choose their {subclassTypeName.toLowerCase()}.
            This choice grants you unique features and abilities.
          </p>
        </div>

        {/* Subclass List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {subclasses.map((subclass) => {
              const isSelected = selectedSubclass === subclass.name
              const isExpanded = expandedSubclass === subclass.name

              return (
                <div
                  key={subclass.name}
                  className={`rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                  }`}
                >
                  {/* Subclass Header - Clickable to select */}
                  <button
                    onClick={() => setSelectedSubclass(subclass.name)}
                    className="w-full text-left p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Radio button */}
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Subclass info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${
                            isSelected
                              ? 'text-indigo-700 dark:text-indigo-300'
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {subclass.name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {subclass.description}
                        </p>

                        {/* Subclass spells preview */}
                        {subclass.spells && subclass.spells.length > 0 && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                              {subclassTypeName} Spells Available
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expand/Collapse button */}
                  <div className="px-4 pb-3">
                    <button
                      onClick={() => toggleExpanded(subclass.name)}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                    >
                      {isExpanded ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          Hide Details
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          View Details
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
                      {/* Full description */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Description
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {subclass.description}
                        </p>
                      </div>

                      {/* Features by level */}
                      <div className="mb-4">
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Features
                        </h5>
                        <div className="space-y-2">
                          {subclass.features.map((feature, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {feature.name}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 ml-1">
                                (Level {feature.level})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subclass spells */}
                      {subclass.spells && subclass.spells.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {subclassTypeName} Spells
                          </h5>
                          <div className="space-y-2">
                            {subclass.spells.map((spellGrant, index) => (
                              <div key={index} className="text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                  Level {spellGrant.level}:
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 ml-2">
                                  {spellGrant.spells.join(', ')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
            disabled={!selectedSubclass}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSubclass
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
