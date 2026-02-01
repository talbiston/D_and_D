import { useState, useMemo } from 'react'
import type { AbilityScores, AbilityName, Feat } from '../types'
import { FEATS, type FeatData } from '../data/feats'

interface ASIModalProps {
  currentAbilityScores: AbilityScores
  currentFeats: Feat[]
  newLevel: number
  onConfirm: (choice: ASIChoice) => void
  onCancel: () => void
}

export type ASIChoice =
  | { type: 'asi'; increases: { ability: AbilityName; amount: number }[] }
  | { type: 'feat'; feat: FeatData }

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

const ABILITY_SHORT_LABELS: Record<AbilityName, string> = {
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

export default function ASIModal({
  currentAbilityScores,
  currentFeats,
  newLevel,
  onConfirm,
  onCancel,
}: ASIModalProps) {
  const [activeTab, setActiveTab] = useState<'abilities' | 'feat'>('abilities')

  // ASI state
  const [asiMode, setASIMode] = useState<'+2' | '+1/+1'>('+2')
  const [selectedAbility1, setSelectedAbility1] = useState<AbilityName>('strength')
  const [selectedAbility2, setSelectedAbility2] = useState<AbilityName>('dexterity')

  // Feat state
  const [featSearchQuery, setFeatSearchQuery] = useState('')
  const [selectedFeat, setSelectedFeat] = useState<FeatData | null>(null)

  // Get list of already taken feats
  const takenFeatNames = useMemo(() => {
    return new Set(currentFeats.map(f => f.name))
  }, [currentFeats])

  // Filter feats based on search and eligibility
  const filteredFeats = useMemo(() => {
    return FEATS.filter(feat => {
      // Filter by search query
      if (featSearchQuery) {
        const query = featSearchQuery.toLowerCase()
        const matchesName = feat.name.toLowerCase().includes(query)
        const matchesDescription = feat.description.toLowerCase().includes(query)
        const matchesCategory = feat.category?.toLowerCase().includes(query)
        if (!matchesName && !matchesDescription && !matchesCategory) {
          return false
        }
      }
      return true
    })
  }, [featSearchQuery])

  // Check if a feat is eligible (not already taken)
  const isFeatEligible = (feat: FeatData): boolean => {
    return !takenFeatNames.has(feat.name)
  }

  // Calculate ability score preview
  const getPreviewScore = (ability: AbilityName): number => {
    const current = currentAbilityScores[ability]
    if (asiMode === '+2') {
      if (ability === selectedAbility1) {
        return Math.min(20, current + 2)
      }
    } else {
      if (ability === selectedAbility1) {
        return Math.min(20, current + 1)
      }
      if (ability === selectedAbility2) {
        return Math.min(20, current + 1)
      }
    }
    return current
  }

  // Check if a score would exceed max
  const wouldExceedMax = (ability: AbilityName, increase: number): boolean => {
    return currentAbilityScores[ability] + increase > 20
  }

  // Validate the current ASI selection
  const isASIValid = (): boolean => {
    if (asiMode === '+2') {
      return !wouldExceedMax(selectedAbility1, 2) || currentAbilityScores[selectedAbility1] === 19
    } else {
      // +1/+1 mode - abilities must be different
      if (selectedAbility1 === selectedAbility2) return false
      return true
    }
  }

  // Get the actual increase amount (capped at 20)
  const getActualIncrease = (ability: AbilityName, requestedIncrease: number): number => {
    const current = currentAbilityScores[ability]
    return Math.min(requestedIncrease, 20 - current)
  }

  const handleConfirm = () => {
    if (activeTab === 'abilities') {
      if (asiMode === '+2') {
        const actualIncrease = getActualIncrease(selectedAbility1, 2)
        onConfirm({
          type: 'asi',
          increases: [{ ability: selectedAbility1, amount: actualIncrease }]
        })
      } else {
        const increases: { ability: AbilityName; amount: number }[] = []
        const inc1 = getActualIncrease(selectedAbility1, 1)
        const inc2 = getActualIncrease(selectedAbility2, 1)
        if (inc1 > 0) increases.push({ ability: selectedAbility1, amount: inc1 })
        if (inc2 > 0) increases.push({ ability: selectedAbility2, amount: inc2 })
        onConfirm({ type: 'asi', increases })
      }
    } else {
      if (selectedFeat) {
        onConfirm({ type: 'feat', feat: selectedFeat })
      }
    }
  }

  const canConfirm = (): boolean => {
    if (activeTab === 'abilities') {
      return isASIValid()
    } else {
      return selectedFeat !== null && isFeatEligible(selectedFeat)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Ability Score Improvement
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Level {newLevel} - Choose an ability score increase or a feat
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('abilities')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'abilities'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Ability Scores
          </button>
          <button
            onClick={() => setActiveTab('feat')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'feat'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Feat
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'abilities' ? (
            <div className="space-y-4">
              {/* ASI Mode Selection */}
              <div className="flex gap-2">
                <button
                  onClick={() => setASIMode('+2')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    asiMode === '+2'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  +2 to One Ability
                </button>
                <button
                  onClick={() => setASIMode('+1/+1')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    asiMode === '+1/+1'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  +1 to Two Abilities
                </button>
              </div>

              {/* Ability Selection */}
              <div className="space-y-3">
                {asiMode === '+2' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select an ability to increase by 2:
                    </label>
                    <select
                      value={selectedAbility1}
                      onChange={(e) => setSelectedAbility1(e.target.value as AbilityName)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    >
                      {ABILITY_ORDER.map((ability) => (
                        <option key={ability} value={ability}>
                          {ABILITY_LABELS[ability]} ({currentAbilityScores[ability]})
                          {wouldExceedMax(ability, 2) && currentAbilityScores[ability] < 20 && ' - capped at 20'}
                          {currentAbilityScores[ability] >= 20 && ' - already at max'}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First ability (+1):
                      </label>
                      <select
                        value={selectedAbility1}
                        onChange={(e) => setSelectedAbility1(e.target.value as AbilityName)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        {ABILITY_ORDER.map((ability) => (
                          <option key={ability} value={ability}>
                            {ABILITY_LABELS[ability]} ({currentAbilityScores[ability]})
                            {currentAbilityScores[ability] >= 20 && ' - already at max'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Second ability (+1):
                      </label>
                      <select
                        value={selectedAbility2}
                        onChange={(e) => setSelectedAbility2(e.target.value as AbilityName)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                      >
                        {ABILITY_ORDER.filter(a => a !== selectedAbility1).map((ability) => (
                          <option key={ability} value={ability}>
                            {ABILITY_LABELS[ability]} ({currentAbilityScores[ability]})
                            {currentAbilityScores[ability] >= 20 && ' - already at max'}
                          </option>
                        ))}
                      </select>
                    </div>
                    {selectedAbility1 === selectedAbility2 && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Please select two different abilities
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Preview
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {ABILITY_ORDER.map((ability) => {
                    const current = currentAbilityScores[ability]
                    const preview = getPreviewScore(ability)
                    const changed = preview !== current
                    return (
                      <div
                        key={ability}
                        className={`text-center p-2 rounded ${
                          changed ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500' : ''
                        }`}
                      >
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ABILITY_SHORT_LABELS[ability]}
                        </div>
                        <div className={`text-lg font-bold ${
                          changed ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {changed ? (
                            <>
                              <span className="text-gray-400 line-through text-sm mr-1">{current}</span>
                              {preview}
                            </>
                          ) : (
                            current
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Feat Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search feats..."
                  value={featSearchQuery}
                  onChange={(e) => setFeatSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Feat List */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {filteredFeats.map((feat) => {
                  const eligible = isFeatEligible(feat)
                  const isSelected = selectedFeat?.name === feat.name
                  return (
                    <button
                      key={feat.name}
                      onClick={() => eligible && setSelectedFeat(feat)}
                      disabled={!eligible}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                          : eligible
                            ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${
                          eligible ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {feat.name}
                        </span>
                        {feat.category && (
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            feat.category === 'origin'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                              : feat.category === 'fighting'
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                          }`}>
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
                      {!eligible && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Already taken
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Selected Feat Preview */}
              {selectedFeat && (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Selected: {selectedFeat.name}
                  </h4>
                  {selectedFeat.prerequisite && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      Prerequisite: {selectedFeat.prerequisite}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {selectedFeat.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm()}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
