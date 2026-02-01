import type { Character } from '../types'

const STORAGE_KEY = 'dnd-characters'

/**
 * Save a character to localStorage
 * If the character already exists (by id), it will be updated
 */
export function saveCharacter(character: Character): void {
  const characters = loadCharacters()
  const existingIndex = characters.findIndex((c) => c.id === character.id)

  if (existingIndex >= 0) {
    characters[existingIndex] = character
  } else {
    characters.push(character)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters))
}

/**
 * Load all characters from localStorage
 * Returns an empty array if no characters exist
 */
export function loadCharacters(): Character[] {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    return []
  }

  try {
    return JSON.parse(data) as Character[]
  } catch {
    console.error('Failed to parse characters from localStorage')
    return []
  }
}

/**
 * Delete a character from localStorage by ID
 */
export function deleteCharacter(id: string): void {
  const characters = loadCharacters()
  const filtered = characters.filter((c) => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

/**
 * Get a single character by ID
 * Returns null if not found
 */
export function getCharacterById(id: string): Character | null {
  const characters = loadCharacters()
  return characters.find((c) => c.id === id) ?? null
}

/**
 * Export a character as a downloadable JSON file
 */
export function exportCharacterAsJson(character: Character): void {
  const json = JSON.stringify(character, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${character.name.toLowerCase().replace(/\s+/g, '-')}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Validate that an object has the required Character fields
 */
export function isValidCharacter(obj: unknown): obj is Character {
  if (!obj || typeof obj !== 'object') return false

  const c = obj as Record<string, unknown>

  // Check required string fields
  const requiredStrings = ['id', 'name', 'species', 'class', 'background']
  for (const field of requiredStrings) {
    if (typeof c[field] !== 'string') return false
  }

  // Check required number fields
  const requiredNumbers = ['level', 'xp', 'maxHp', 'currentHp', 'armorClass', 'speed']
  for (const field of requiredNumbers) {
    if (typeof c[field] !== 'number') return false
  }

  // Check required objects/arrays
  if (!c.abilityScores || typeof c.abilityScores !== 'object') return false
  if (!Array.isArray(c.skills)) return false

  return true
}

/**
 * Import a character from a JSON string
 * Returns the character if valid, null otherwise
 */
export function importCharacterFromJson(json: string): Character | null {
  try {
    const obj = JSON.parse(json)
    if (isValidCharacter(obj)) {
      return obj
    }
    return null
  } catch {
    return null
  }
}
