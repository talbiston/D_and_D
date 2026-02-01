const AVAILABLE_CLASSES = [
  'artificer',
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
] as const

type AvailableClass = (typeof AVAILABLE_CLASSES)[number]

interface ClassIconProps {
  className: string
  size?: number
}

export default function ClassIcon({ className, size = 24 }: ClassIconProps) {
  const normalizedName = className.toLowerCase() as AvailableClass

  if (!AVAILABLE_CLASSES.includes(normalizedName)) {
    return null
  }

  return (
    <img
      src={`/icons/classes/${normalizedName}.svg`}
      alt={`${className} icon`}
      width={size}
      height={size}
      className="icon-invertible"
    />
  )
}
