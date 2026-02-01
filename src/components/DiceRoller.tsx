import { useState } from 'react'

interface RollResult {
  notation: string
  total: number
  rolls: number[]
  modifier: number
  timestamp: number
}

function parseDiceNotation(notation: string): { count: number; sides: number; modifier: number } | null {
  // Match patterns like "2d6", "d20", "1d8+3", "2d6-1"
  const match = notation.toLowerCase().trim().match(/^(\d*)d(\d+)([+-]\d+)?$/)
  if (!match) return null

  const count = match[1] ? parseInt(match[1]) : 1
  const sides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0

  if (count < 1 || count > 100 || sides < 1 || sides > 100) return null

  return { count, sides, modifier }
}

function rollDice(count: number, sides: number): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1)
}

interface DiceRollerProps {
  isOpen: boolean
  onClose: () => void
}

export default function DiceRoller({ isOpen, onClose }: DiceRollerProps) {
  const [customNotation, setCustomNotation] = useState('')
  const [history, setHistory] = useState<RollResult[]>([])
  const [error, setError] = useState('')

  const executeRoll = (notation: string) => {
    const parsed = parseDiceNotation(notation)
    if (!parsed) {
      setError('Invalid dice notation. Use format like "2d6" or "1d20+5"')
      return
    }

    setError('')
    const rolls = rollDice(parsed.count, parsed.sides)
    const total = rolls.reduce((sum, r) => sum + r, 0) + parsed.modifier

    const result: RollResult = {
      notation: notation.toLowerCase(),
      total,
      rolls,
      modifier: parsed.modifier,
      timestamp: Date.now(),
    }

    setHistory((prev) => [result, ...prev.slice(0, 4)])
  }

  const quickRoll = (sides: number) => {
    executeRoll(`1d${sides}`)
  }

  const handleCustomRoll = (e: React.FormEvent) => {
    e.preventDefault()
    if (customNotation.trim()) {
      executeRoll(customNotation.trim())
      setCustomNotation('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Dice Roller
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Quick Roll Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
            <button
              key={sides}
              onClick={() => quickRoll(sides)}
              className="px-3 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors font-medium text-sm"
            >
              d{sides}
            </button>
          ))}
        </div>

        {/* Custom Roll */}
        <form onSubmit={handleCustomRoll} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={customNotation}
              onChange={(e) => setCustomNotation(e.target.value)}
              placeholder="e.g., 2d6+3"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              Roll
            </button>
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
          )}
        </form>

        {/* Roll History */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Roll History
          </h4>
          {history.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">No rolls yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((result, i) => (
                <div
                  key={result.timestamp}
                  className={`p-3 rounded-lg ${
                    i === 0
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {result.notation}
                    </span>
                    <span className={`text-2xl font-bold ${
                      i === 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {result.total}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    [{result.rolls.join(', ')}]
                    {result.modifier !== 0 && ` ${result.modifier > 0 ? '+' : ''}${result.modifier}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
