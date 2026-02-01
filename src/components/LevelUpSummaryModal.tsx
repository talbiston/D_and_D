import type { ClassFeature, SpellSlots, AbilityName } from '../types'
import type { ASIChoice } from './ASIModal'

interface SpellSlotChange {
  level: number
  oldTotal: number
  newTotal: number
}

interface LevelUpSummaryModalProps {
  newLevel: number
  previousLevel: number
  className: string
  hpGain: number
  newMaxHp: number
  newClassFeatures: ClassFeature[]
  newSubclassFeatures: ClassFeature[]
  oldSpellSlots?: SpellSlots
  newSpellSlots?: SpellSlots
  asiChoice?: ASIChoice
  onClose: () => void
}

const ABILITY_LABELS: Record<AbilityName, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
}

export default function LevelUpSummaryModal({
  newLevel,
  previousLevel,
  className,
  hpGain,
  newMaxHp,
  newClassFeatures,
  newSubclassFeatures,
  oldSpellSlots,
  newSpellSlots,
  asiChoice,
  onClose,
}: LevelUpSummaryModalProps) {
  // Calculate spell slot changes
  const spellSlotChanges: SpellSlotChange[] = []
  if (oldSpellSlots && newSpellSlots) {
    for (let level = 1; level <= 9; level++) {
      const slotLevel = level as keyof SpellSlots
      const oldTotal = oldSpellSlots[slotLevel]?.total ?? 0
      const newTotal = newSpellSlots[slotLevel]?.total ?? 0
      if (newTotal > oldTotal) {
        spellSlotChanges.push({ level, oldTotal, newTotal })
      }
    }
  }

  const hasNewFeatures = newClassFeatures.length > 0 || newSubclassFeatures.length > 0
  const hasSpellSlotChanges = spellSlotChanges.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Level Up Complete!
          </h2>
          <p className="text-lg text-indigo-600 dark:text-indigo-400 mt-2 font-semibold">
            {className} Level {newLevel}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Level {previousLevel} → Level {newLevel}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* HP Increase */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide mb-2">
              Hit Points
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">HP Increased</span>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                +{hpGain}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-500 dark:text-gray-400 text-sm">New Max HP</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {newMaxHp}
              </span>
            </div>
          </div>

          {/* New Class Features */}
          {hasNewFeatures && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide mb-2">
                New Features
              </h3>
              <ul className="space-y-3">
                {newClassFeatures.map((feature, index) => (
                  <li key={`class-${index}`}>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {feature.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {feature.description}
                    </div>
                  </li>
                ))}
                {newSubclassFeatures.map((feature, index) => (
                  <li key={`subclass-${index}`}>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {feature.name}
                      <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                        Subclass
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                      {feature.description}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Spell Slot Changes */}
          {hasSpellSlotChanges && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2">
                Spell Slots
              </h3>
              <ul className="space-y-2">
                {spellSlotChanges.map(change => (
                  <li key={change.level} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300">
                      {getOrdinalLevel(change.level)} Level
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {change.oldTotal} → {change.newTotal}
                      <span className="text-blue-600 dark:text-blue-400 ml-1">
                        (+{change.newTotal - change.oldTotal})
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ASI/Feat Choice */}
          {asiChoice && (
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">
                {asiChoice.type === 'asi' ? 'Ability Score Improvement' : 'New Feat'}
              </h3>
              {asiChoice.type === 'asi' ? (
                <ul className="space-y-1">
                  {asiChoice.increases.map((inc, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        {ABILITY_LABELS[inc.ability]}
                      </span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        +{inc.amount}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {asiChoice.feat.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {asiChoice.feat.description}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}

function getOrdinalLevel(level: number): string {
  const ordinals = ['', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']
  return ordinals[level] || `${level}th`
}
