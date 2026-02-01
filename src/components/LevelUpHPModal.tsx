import { useState } from 'react'

interface LevelUpHPModalProps {
  hitDie: number
  conModifier: number
  currentMaxHp: number
  newLevel: number
  onConfirm: (hpGain: number) => void
  onCancel: () => void
}

export default function LevelUpHPModal({
  hitDie,
  conModifier,
  currentMaxHp,
  newLevel,
  onConfirm,
  onCancel,
}: LevelUpHPModalProps) {
  const [hpGain, setHpGain] = useState<number | null>(null)
  const [rollResult, setRollResult] = useState<number | null>(null)
  const [method, setMethod] = useState<'roll' | 'average' | null>(null)

  // Calculate average HP gain: (hitDie / 2) + 1 + CON mod
  const averageGain = Math.floor(hitDie / 2) + 1 + conModifier

  const handleRoll = () => {
    // Roll: random 1-hitDie
    const roll = Math.floor(Math.random() * hitDie) + 1
    setRollResult(roll)
    // HP gain: roll + CON mod (minimum 1 total)
    const gain = Math.max(1, roll + conModifier)
    setHpGain(gain)
    setMethod('roll')
  }

  const handleTakeAverage = () => {
    setRollResult(null)
    setHpGain(Math.max(1, averageGain))
    setMethod('average')
  }

  const handleConfirm = () => {
    if (hpGain !== null) {
      onConfirm(hpGain)
    }
  }

  const formatModifier = (mod: number) => {
    return mod >= 0 ? `+${mod}` : `${mod}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Level Up - HP Increase
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Advancing to Level {newLevel}
        </p>

        {/* Class Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Hit Die:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                d{hitDie}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">CON Modifier:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                {formatModifier(conModifier)}
              </span>
            </div>
          </div>
        </div>

        {/* HP Choice Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleRoll}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
              method === 'roll'
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg">🎲</span>
              <span>Roll</span>
              <span className="text-xs opacity-75">1d{hitDie} {formatModifier(conModifier)}</span>
            </div>
          </button>
          <button
            onClick={handleTakeAverage}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
              method === 'average'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
            }`}
          >
            <div className="flex flex-col items-center">
              <span className="text-lg">📊</span>
              <span>Take Average</span>
              <span className="text-xs opacity-75">
                {Math.floor(hitDie / 2) + 1} {formatModifier(conModifier)} = {averageGain}
              </span>
            </div>
          </button>
        </div>

        {/* Result Preview */}
        {hpGain !== null && (
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-4">
            {method === 'roll' && rollResult !== null && (
              <div className="text-sm text-indigo-700 dark:text-indigo-300 mb-2">
                Rolled: <span className="font-bold">{rollResult}</span> on d{hitDie}
                {conModifier !== 0 && (
                  <span> {formatModifier(conModifier)} (CON)</span>
                )}
                {rollResult + conModifier < 1 && (
                  <span className="text-xs ml-1">(minimum 1)</span>
                )}
              </div>
            )}
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600 dark:text-gray-400">HP Gain:</span>
                <span className="ml-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  +{hpGain}
                </span>
              </div>
              <div className="text-right">
                <span className="text-gray-600 dark:text-gray-400">New Max HP:</span>
                <span className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {currentMaxHp + hpGain}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {currentMaxHp} → {currentMaxHp + hpGain}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={hpGain === null}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
