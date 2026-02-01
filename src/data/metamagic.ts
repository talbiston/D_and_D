// Metamagic Options for Sorcerers (D&D 2024)

export interface Metamagic {
  name: string
  description: string
  sorceryPointCost: number | string // Can be a number or a variable like "varies"
}

export const METAMAGIC_OPTIONS: Metamagic[] = [
  {
    name: 'Careful Spell',
    description:
      'When you cast a spell that forces other creatures to make a saving throw, you can protect some of those creatures from the spell\'s full force. To do so, spend 1 Sorcery Point and choose a number of those creatures up to your Charisma modifier (minimum of one creature). A chosen creature automatically succeeds on its saving throw against the spell, and it takes no damage if it would normally take half damage on a successful save.',
    sorceryPointCost: 1,
  },
  {
    name: 'Distant Spell',
    description:
      'When you cast a spell that has a range of at least 5 feet, you can spend 1 Sorcery Point to double the range of the spell. When you cast a spell that has a range of Touch, you can spend 1 Sorcery Point to make the range of the spell 30 feet.',
    sorceryPointCost: 1,
  },
  {
    name: 'Empowered Spell',
    description:
      'When you roll damage for a spell, you can spend 1 Sorcery Point to reroll a number of the damage dice up to your Charisma modifier (minimum of one). You must use the new rolls. You can use Empowered Spell even if you have already used a different Metamagic option during the casting of the spell.',
    sorceryPointCost: 1,
  },
  {
    name: 'Extended Spell',
    description:
      'When you cast a spell that has a duration of 1 minute or longer, you can spend 1 Sorcery Point to double its duration, to a maximum duration of 24 hours.',
    sorceryPointCost: 1,
  },
  {
    name: 'Heightened Spell',
    description:
      'When you cast a spell that forces a creature to make a saving throw to resist its effects, you can spend 2 Sorcery Points to give one target of the spell Disadvantage on its first saving throw against the spell.',
    sorceryPointCost: 2,
  },
  {
    name: 'Quickened Spell',
    description:
      'When you cast a spell that has a casting time of an action, you can spend 2 Sorcery Points to change the casting time to a Bonus Action for this casting. You can\'t modify a spell in this way if you\'ve already cast a level 1+ spell on the current turn, nor can you cast a level 1+ spell on this turn after modifying a spell in this way.',
    sorceryPointCost: 2,
  },
  {
    name: 'Seeking Spell',
    description:
      'If you make an attack roll for a spell and miss, you can spend 1 Sorcery Point to reroll the d20, and you must use the new roll. You can use Seeking Spell even if you have already used a different Metamagic option during the casting of the spell.',
    sorceryPointCost: 1,
  },
  {
    name: 'Subtle Spell',
    description:
      'When you cast a spell, you can spend 1 Sorcery Point to cast it without any Verbal or Somatic components.',
    sorceryPointCost: 1,
  },
  {
    name: 'Transmuted Spell',
    description:
      'When you cast a spell that deals a type of damage from the following list, you can spend 1 Sorcery Point to change that damage type to one of the other listed types: Acid, Cold, Fire, Lightning, Poison, Thunder.',
    sorceryPointCost: 1,
  },
  {
    name: 'Twinned Spell',
    description:
      'When you cast a spell, such as Charm Person, that can be cast with a higher-level spell slot to target an additional creature, you can spend 1 Sorcery Point to increase the spell\'s effective level by 1.',
    sorceryPointCost: 1,
  },
]

/**
 * Get the number of Metamagic options a Sorcerer knows at a given level
 * Sorcerers learn 2 at level 2, then +1 at levels 10 and 17
 */
export function getMetamagicKnown(sorcererLevel: number): number {
  const level = Math.max(1, Math.min(20, sorcererLevel))
  if (level < 2) return 0 // No Metamagic at level 1
  if (level >= 17) return 4 // 2 + 1 + 1
  if (level >= 10) return 3 // 2 + 1
  return 2 // Level 2-9
}

/**
 * Get a Metamagic option by name
 */
export function getMetamagicByName(name: string): Metamagic | undefined {
  return METAMAGIC_OPTIONS.find((m) => m.name === name)
}
