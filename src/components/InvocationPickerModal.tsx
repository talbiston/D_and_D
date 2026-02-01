import { useState, useMemo } from 'react'
import { INVOCATIONS, type Invocation, meetsInvocationPrerequisites, getPactBoon, getInvocationsKnown } from '../data/invocations'

interface InvocationPickerModalProps {
  warlockLevel: number
  currentInvocations: string[]
  hasEldritchBlast: boolean
  onConfirm: (invocations: string[]) => void
  onCancel: () => void
}

export default function InvocationPickerModal({
  warlockLevel,
  currentInvocations,
  hasEldritchBlast,
  onConfirm,
  onCancel,
}: InvocationPickerModalProps) {
  const [selectedInvocations, setSelectedInvocations] = useState<string[]>(currentInvocations)
  const [searchQuery, setSearchQuery] = useState('')

  const maxInvocations = getInvocationsKnown(warlockLevel)

  // Determine current pact boon based on selected invocations
  const currentPactBoon = useMemo(() => {
    const selectedInvocationData = INVOCATIONS.filter(inv => selectedInvocations.includes(inv.name))
    return getPactBoon(selectedInvocationData)
  }, [selectedInvocations])

  // Filter invocations based on search and prerequisites
  const filteredInvocations = useMemo(() => {
    return INVOCATIONS.filter(inv => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = inv.name.toLowerCase().includes(query)
        const matchesDescription = inv.description.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription) {
          return false
        }
      }
      return true
    })
  }, [searchQuery])

  // Check if an invocation can be selected
  const canSelectInvocation = (invocation: Invocation): { eligible: boolean; reason?: string } => {
    // Already selected
    if (selectedInvocations.includes(invocation.name)) {
      return { eligible: true }
    }

    // Would exceed max
    if (selectedInvocations.length >= maxInvocations) {
      return { eligible: false, reason: `Maximum ${maxInvocations} invocations` }
    }

    // Check prerequisites
    if (!meetsInvocationPrerequisites(invocation, warlockLevel, currentPactBoon, hasEldritchBlast)) {
      if (invocation.levelRequirement && warlockLevel < invocation.levelRequirement) {
        return { eligible: false, reason: `Requires level ${invocation.levelRequirement}` }
      }
      if (invocation.pactRequirement) {
        const pactNames = { blade: 'Pact of the Blade', chain: 'Pact of the Chain', tome: 'Pact of the Tome' }
        return { eligible: false, reason: `Requires ${pactNames[invocation.pactRequirement]}` }
      }
      if (invocation.prerequisite?.includes('Eldritch Blast') && !hasEldritchBlast) {
        return { eligible: false, reason: 'Requires Eldritch Blast cantrip' }
      }
      return { eligible: false, reason: 'Prerequisites not met' }
    }

    return { eligible: true }
  }

  const toggleInvocation = (invocationName: string) => {
    if (selectedInvocations.includes(invocationName)) {
      setSelectedInvocations(selectedInvocations.filter(name => name !== invocationName))
    } else {
      const invocation = INVOCATIONS.find(inv => inv.name === invocationName)
      if (invocation && canSelectInvocation(invocation).eligible) {
        setSelectedInvocations([...selectedInvocations, invocationName])
      }
    }
  }

  const handleConfirm = () => {
    onConfirm(selectedInvocations)
  }

  // Group invocations by level requirement
  const groupedInvocations = useMemo(() => {
    const groups: { label: string; invocations: Invocation[] }[] = [
      { label: 'No Level Requirement', invocations: [] },
      { label: 'Level 5+', invocations: [] },
      { label: 'Level 7+', invocations: [] },
      { label: 'Level 9+', invocations: [] },
      { label: 'Level 12+', invocations: [] },
      { label: 'Level 15+', invocations: [] },
    ]

    for (const inv of filteredInvocations) {
      if (!inv.levelRequirement) {
        groups[0].invocations.push(inv)
      } else if (inv.levelRequirement <= 5) {
        groups[1].invocations.push(inv)
      } else if (inv.levelRequirement <= 7) {
        groups[2].invocations.push(inv)
      } else if (inv.levelRequirement <= 9) {
        groups[3].invocations.push(inv)
      } else if (inv.levelRequirement <= 12) {
        groups[4].invocations.push(inv)
      } else {
        groups[5].invocations.push(inv)
      }
    }

    return groups.filter(g => g.invocations.length > 0)
  }, [filteredInvocations])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Eldritch Invocations
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select up to {maxInvocations} invocations ({selectedInvocations.length}/{maxInvocations} selected)
          </p>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Search invocations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Invocation List */}
        <div className="flex-1 overflow-y-auto p-6">
          {groupedInvocations.map((group) => (
            <div key={group.label} className="mb-6">
              <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                {group.label}
              </h4>
              <div className="space-y-2">
                {group.invocations.map((invocation) => {
                  const isSelected = selectedInvocations.includes(invocation.name)
                  const { eligible, reason } = canSelectInvocation(invocation)
                  const canToggle = isSelected || eligible

                  return (
                    <button
                      key={invocation.name}
                      onClick={() => toggleInvocation(invocation.name)}
                      disabled={!canToggle}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                          : canToggle
                          ? 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                          : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              isSelected
                                ? 'text-purple-700 dark:text-purple-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {invocation.name}
                            </span>
                            {invocation.pactRequirement && (
                              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                Pact of the {invocation.pactRequirement.charAt(0).toUpperCase() + invocation.pactRequirement.slice(1)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {invocation.description}
                          </p>
                          {invocation.prerequisite && !invocation.prerequisite.includes('Eldritch Blast') && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                              Prerequisite: {invocation.prerequisite}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center ml-3">
                          {isSelected ? (
                            <div className="w-5 h-5 rounded bg-purple-500 flex items-center justify-center">
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
          ))}
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
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
