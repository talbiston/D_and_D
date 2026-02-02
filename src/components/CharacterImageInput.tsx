import { useState, useRef } from 'react'

interface CharacterImageInputProps {
  value?: string
  onChange: (url: string | undefined) => void
  size?: 'small' | 'medium' | 'large'
}

const MAX_FILE_SIZE = 500 * 1024 // 500KB

export default function CharacterImageInput({
  value,
  onChange,
  size = 'medium',
}: CharacterImageInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [urlInput, setUrlInput] = useState(value?.startsWith('data:') ? '' : value || '')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const imageSizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  }

  const handleUrlChange = (url: string) => {
    setUrlInput(url)
    setError(null)
    if (url.trim()) {
      onChange(url.trim())
    } else {
      onChange(undefined)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setError('Image must be less than 500KB')
      return
    }

    setError(null)

    // Convert to base64
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      onChange(base64)
    }
    reader.onerror = () => {
      setError('Failed to read file')
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    onChange(undefined)
    setUrlInput('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            mode === 'url'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
            mode === 'upload'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Upload
        </button>
      </div>

      {/* Input area */}
      {mode === 'url' ? (
        <input
          type="url"
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.png"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700
              dark:file:bg-indigo-900/50 dark:file:text-indigo-300
              hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/70
              file:cursor-pointer file:transition-colors"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF, or WebP. Max 500KB.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Preview */}
      {value && (
        <div className="flex items-center gap-4">
          <div className={`${imageSizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0`}>
            <img
              src={value}
              alt="Character preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                setError('Failed to load image')
              }}
              onLoad={(e) => {
                e.currentTarget.style.display = 'block'
                setError(null)
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
