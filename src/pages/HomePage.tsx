import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCharacters, deleteCharacter as deleteCharacterApi, type CharacterSummary } from '../utils/api'
import { useDarkModeContext } from '../context/DarkModeContext'
import ClassIcon from '../components/ClassIcon'
import SpeciesIcon from '../components/SpeciesIcon'

export default function HomePage() {
  const [characters, setCharacters] = useState<CharacterSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<CharacterSummary | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { isDark, toggle: toggleDarkMode } = useDarkModeContext()

  const fetchCharacters = async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const data = await listCharacters()
      setCharacters(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load characters')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCharacters()
  }, [])

  const handleDeleteClick = (e: React.MouseEvent, character: CharacterSummary) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteConfirm(character)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await deleteCharacterApi(deleteConfirm.id)
      setCharacters(characters.filter(c => c.id !== deleteConfirm.id))
      setDeleteConfirm(null)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to delete character')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            D&D Character Sheet
          </h1>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <Link
              to="/character/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Create New Character
            </Link>
          </div>
        </header>

        {loadError && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg text-red-700 dark:text-red-400 flex items-center justify-between">
            <span>{loadError}</span>
            <button
              onClick={fetchCharacters}
              className="ml-4 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">
              &#x2694;
            </div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No Characters Yet
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Create your first character to begin your adventure!
            </p>
            <Link
              to="/character/new"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Create Your First Character
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div
                key={character.id}
                className="relative bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <Link
                  to={`/character/${character.id}`}
                  className="block p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Character thumbnail */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                      {character.imageUrl ? (
                        <img
                          src={character.imageUrl}
                          alt={character.name}
                          className="w-full h-full object-cover object-top"
                          style={character.imageStyle && (character.imageStyle.zoom !== 1 || character.imageStyle.x !== 0 || character.imageStyle.y !== 0) ? {
                            transform: `scale(${character.imageStyle.zoom}) translate(${character.imageStyle.x / character.imageStyle.zoom}%, ${character.imageStyle.y / character.imageStyle.zoom}%)`,
                            transformOrigin: 'center center',
                          } : undefined}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 pr-8 truncate">
                        {character.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        Level {character.level}{' '}
                        <span className="inline-flex items-center gap-1">
                          <SpeciesIcon species={character.species} size={18} />
                          {character.species}
                        </span>{' '}
                        <span className="inline-flex items-center gap-1">
                          <ClassIcon className={character.class} size={18} />
                          {character.class}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={(e) => handleDeleteClick(e, character)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Delete character"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Character?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span>? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
