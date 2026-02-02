import { useState, useMemo } from 'react'
import type { SkillName, Skill, AbilityScores } from '../types'
import { SKILL_ABILITIES } from '../types'
import { getAbilityModifier, getSkillBonus, formatModifier } from '../utils/calculations'

// Skill labels for display
const SKILL_LABELS: Record<SkillName, string> = {
  athletics: 'Athletics',
  acrobatics: 'Acrobatics',
  sleightOfHand: 'Sleight of Hand',
  stealth: 'Stealth',
  arcana: 'Arcana',
  history: 'History',
  investigation: 'Investigation',
  nature: 'Nature',
  religion: 'Religion',
  animalHandling: 'Animal Handling',
  insight: 'Insight',
  medicine: 'Medicine',
  perception: 'Perception',
  survival: 'Survival',
  deception: 'Deception',
  intimidation: 'Intimidation',
  performance: 'Performance',
  persuasion: 'Persuasion',
}

interface ExpertisePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (selectedSkills: SkillName[]) => void
  title: string
  availableSkills?: SkillName[] // If specified, restrict to these skills
  count: number // Number of skills to select
  currentSkills: Skill[]
  abilityScores: AbilityScores
  proficiencyBonus: number
}

export default function ExpertisePickerModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  availableSkills,
  count,
  currentSkills,
  abilityScores,
  proficiencyBonus,
}: ExpertisePickerModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<SkillName[]>([])

  // Get list of eligible skills (proficient, no expertise, in availableSkills if specified)
  const eligibleSkills = useMemo(() => {
    return currentSkills.filter(skill => {
      // Must be proficient
      if (!skill.proficient) return false
      // Must not already have expertise
      if (skill.expertise) return false
      // If availableSkills specified, must be in that list
      if (availableSkills && !availableSkills.includes(skill.name)) return false
      return true
    })
  }, [currentSkills, availableSkills])

  const toggleSkill = (skillName: SkillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skillName))
    } else if (selectedSkills.length < count) {
      setSelectedSkills([...selectedSkills, skillName])
    }
  }

  const handleConfirm = () => {
    onConfirm(selectedSkills)
    setSelectedSkills([])
  }

  const handleClose = () => {
    setSelectedSkills([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Select {count} skill{count !== 1 ? 's' : ''} to gain expertise ({selectedSkills.length}/{count} selected)
          </p>
        </div>

        {/* Skill List */}
        <div className="flex-1 overflow-y-auto p-6">
          {eligibleSkills.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No eligible skills available. Skills must be proficient and not already have expertise.
            </p>
          ) : (
            <div className="space-y-2">
              {eligibleSkills.map((skill) => {
                const isSelected = selectedSkills.includes(skill.name)
                const canSelect = isSelected || selectedSkills.length < count
                const abilityMod = getAbilityModifier(abilityScores[SKILL_ABILITIES[skill.name]])
                const currentBonus = getSkillBonus(abilityMod, proficiencyBonus, true, false)
                const expertiseBonus = getSkillBonus(abilityMod, proficiencyBonus, true, true)

                return (
                  <button
                    key={skill.name}
                    onClick={() => toggleSkill(skill.name)}
                    disabled={!canSelect}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : canSelect
                        ? 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                        : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? 'bg-indigo-500 border-indigo-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`font-medium ${
                          isSelected
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {SKILL_LABELS[skill.name]}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatModifier(currentBonus)}
                        </span>
                        <span className="mx-1 text-gray-400">→</span>
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                          {formatModifier(expertiseBonus)}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedSkills.length !== count}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedSkills.length === count
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
