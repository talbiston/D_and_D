const AVAILABLE_SPECIES = [
  'tiefling',
  'forest-gnome',
  'high-elf',
  'drow',
  'firbolg',
  'triton',
  'yuan-ti',
  'air-genasi',
  'earth-genasi',
  'fire-genasi',
  'water-genasi',
] as const

type AvailableSpecies = (typeof AVAILABLE_SPECIES)[number]

interface SpeciesIconProps {
  species: string
  size?: number
}

export default function SpeciesIcon({ species, size = 24 }: SpeciesIconProps) {
  // Convert species name to lowercase-hyphenated format
  // e.g., "Forest Gnome" -> "forest-gnome"
  const normalizedName = species.toLowerCase().replace(/\s+/g, '-') as AvailableSpecies

  if (!AVAILABLE_SPECIES.includes(normalizedName)) {
    return null
  }

  return (
    <img
      src={`/icons/species/${normalizedName}.svg`}
      alt={`${species} icon`}
      width={size}
      height={size}
      className="icon-invertible"
    />
  )
}
