import { useState, useRef, useCallback } from 'react'
import type { ImageStyle } from '../types'

interface CharacterImageInputProps {
  value?: string
  imageStyle?: ImageStyle
  onChange: (url: string | undefined) => void
  onStyleChange?: (style: ImageStyle | undefined) => void
  size?: 'small' | 'medium' | 'large'
}

const MAX_FILE_SIZE = 500 * 1024 // 500KB

const DEFAULT_STYLE: ImageStyle = { zoom: 1, x: 0, y: 0 }

export default function CharacterImageInput({
  value,
  imageStyle,
  onChange,
  onStyleChange,
  size = 'medium',
}: CharacterImageInputProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url')
  const [urlInput, setUrlInput] = useState(value?.startsWith('data:') ? '' : value || '')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Use default style if none provided
  const currentStyle = imageStyle ?? DEFAULT_STYLE

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
    // Only call onChange - parent component should handle clearing imageStyle
    // when imageUrl is cleared (to avoid race conditions with separate calls)
    onChange(undefined)
    setUrlInput('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleZoomChange = (zoom: number) => {
    onStyleChange?.({ ...currentStyle, zoom })
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!value) return
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - currentStyle.x, y: e.clientY - currentStyle.y })
  }, [value, currentStyle.x, currentStyle.y])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const newX = Math.max(-50, Math.min(50, e.clientX - dragStart.x))
    const newY = Math.max(-50, Math.min(50, e.clientY - dragStart.y))
    onStyleChange?.({ ...currentStyle, x: newX, y: newY })
  }, [isDragging, dragStart, currentStyle, onStyleChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const resetPosition = () => {
    onStyleChange?.({ ...currentStyle, x: 0, y: 0 })
  }

  const resetZoom = () => {
    onStyleChange?.({ ...currentStyle, zoom: 1 })
  }

  // Only apply transform if style has non-default values
  const hasCustomStyle = currentStyle.zoom !== 1 || currentStyle.x !== 0 || currentStyle.y !== 0
  const imageTransformStyle = hasCustomStyle ? {
    transform: `scale(${currentStyle.zoom}) translate(${currentStyle.x / currentStyle.zoom}%, ${currentStyle.y / currentStyle.zoom}%)`,
    transformOrigin: 'center center',
  } : undefined

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

      {/* Preview with zoom/pan controls */}
      {value && (
        <div className="space-y-3">
          <div className="flex items-start gap-4">
            {/* Draggable preview */}
            <div
              ref={previewRef}
              className={`${imageSizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 cursor-move select-none`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              title="Drag to reposition"
            >
              <img
                src={value}
                alt="Character preview"
                className="w-full h-full object-cover pointer-events-none"
                style={imageTransformStyle}
                draggable={false}
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
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors text-left"
              >
                Remove
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Drag image to reposition
              </p>
            </div>
          </div>

          {/* Zoom control */}
          {onStyleChange && (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-600 dark:text-gray-400 w-12">
                  Zoom
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={currentStyle.zoom}
                  onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {Math.round(currentStyle.zoom * 100)}%
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetZoom}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset Zoom
                </button>
                <button
                  type="button"
                  onClick={resetPosition}
                  className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Reset Position
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
