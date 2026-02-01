// Battle Master Maneuvers for Fighters (D&D 2024)

export interface Maneuver {
  name: string
  description: string
}

export const MANEUVERS: Maneuver[] = [
  {
    name: 'Ambush',
    description: 'When you make a Dexterity (Stealth) check or an Initiative roll, you can expend one Superiority Die and add the die to the roll, provided you don\'t have the Incapacitated condition.',
  },
  {
    name: 'Bait and Switch',
    description: 'When you\'re within 5 feet of a creature on your turn, you can expend one Superiority Die and switch places with that creature, provided you spend at least 5 feet of movement and the creature is willing and doesn\'t have the Incapacitated condition. This movement doesn\'t provoke Opportunity Attacks. Roll the Superiority Die. Until the start of your next turn, you or the other creature (your choice) gains a bonus to AC equal to the number rolled.',
  },
  {
    name: 'Commander\'s Strike',
    description: 'When you take the Attack action on your turn, you can forgo one of your attacks and use a Bonus Action to direct one of your companions to strike. When you do so, choose a friendly creature who can see or hear you and expend one Superiority Die. That creature can immediately use its Reaction to make one weapon attack, adding the Superiority Die to the attack\'s damage roll.',
  },
  {
    name: 'Commanding Presence',
    description: 'When you make a Charisma (Intimidation), Charisma (Performance), or Charisma (Persuasion) check, you can expend one Superiority Die and add the Superiority Die to the ability check.',
  },
  {
    name: 'Disarming Attack',
    description: 'When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to disarm the target, forcing it to drop one item of your choice that it\'s holding. You add the Superiority Die to the attack\'s damage roll, and the target must make a Strength saving throw. On a failed save, it drops the object you choose. The object lands at its feet.',
  },
  {
    name: 'Distracting Strike',
    description: 'When you hit a creature with an attack roll, you can expend one Superiority Die to distract the creature, giving your allies an opening. You add the Superiority Die to the attack\'s damage roll. The next attack roll against the target by an attacker other than you has Advantage if the attack is made before the start of your next turn.',
  },
  {
    name: 'Evasive Footwork',
    description: 'When you move, you can expend one Superiority Die, rolling the die and adding the number rolled to your AC until you stop moving.',
  },
  {
    name: 'Feinting Attack',
    description: 'You can expend one Superiority Die and use a Bonus Action on your turn to feint, choosing one creature within 5 feet of you as your target. You have Advantage on your next attack roll against that creature this turn. If that attack hits, add the Superiority Die to the attack\'s damage roll.',
  },
  {
    name: 'Goading Attack',
    description: 'When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to goad the target into attacking you. You add the Superiority Die to the attack\'s damage roll, and the target must make a Wisdom saving throw. On a failed save, the target has Disadvantage on all attack rolls against targets other than you until the end of your next turn.',
  },
  {
    name: 'Lunging Attack',
    description: 'When you make a melee weapon attack on your turn, you can expend one Superiority Die to increase your reach for that attack by 5 feet. If you hit, you add the Superiority Die to the attack\'s damage roll.',
  },
  {
    name: 'Maneuvering Attack',
    description: 'When you hit a creature with an attack roll, you can expend one Superiority Die to maneuver one of your comrades into a more advantageous position. You add the Superiority Die to the attack\'s damage roll, and you choose a friendly creature who can see or hear you. That creature can use its Reaction to move up to half its speed without provoking Opportunity Attacks from the target of your attack.',
  },
  {
    name: 'Menacing Attack',
    description: 'When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to frighten the target. You add the Superiority Die to the attack\'s damage roll, and the target must make a Wisdom saving throw. On a failed save, it has the Frightened condition until the end of your next turn.',
  },
  {
    name: 'Parry',
    description: 'When another creature damages you with a melee attack, you can use your Reaction and expend one Superiority Die to reduce the damage by the number you roll on your Superiority Die plus your Dexterity modifier.',
  },
  {
    name: 'Precision Attack',
    description: 'When you make an attack roll against a creature, you can expend one Superiority Die to add it to the roll. You can use this maneuver before or after making the attack roll, but before any effects of the attack are applied.',
  },
  {
    name: 'Pushing Attack',
    description: 'When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to drive the target back. You add the Superiority Die to the attack\'s damage roll, and if the target is Large or smaller, it must make a Strength saving throw. On a failed save, you push the target up to 15 feet away from you.',
  },
  {
    name: 'Quick Toss',
    description: 'As a Bonus Action, you can expend one Superiority Die and make a ranged attack with a weapon that has the Thrown property. You can draw the weapon as part of making this attack. If you hit, add the Superiority Die to the weapon\'s damage roll.',
  },
  {
    name: 'Rally',
    description: 'On your turn, you can use a Bonus Action and expend one Superiority Die to bolster the resolve of one of your companions. When you do so, choose a friendly creature who can see or hear you. That creature gains Temporary Hit Points equal to the Superiority Die roll plus your Intelligence, Wisdom, or Charisma modifier (your choice).',
  },
  {
    name: 'Riposte',
    description: 'When a creature misses you with a melee attack, you can use your Reaction and expend one Superiority Die to make a melee weapon attack against the creature. If you hit, you add the Superiority Die to the attack\'s damage roll.',
  },
  {
    name: 'Sweeping Attack',
    description: 'When you hit a creature with a melee weapon attack, you can expend one Superiority Die to attempt to damage another creature with the same attack. Choose another creature within 5 feet of the original target and within your reach. If the original attack roll would hit the second creature, it takes damage equal to the number you roll on your Superiority Die. The damage is of the same type dealt by the original attack.',
  },
  {
    name: 'Tactical Assessment',
    description: 'When you make an Intelligence (History), Intelligence (Investigation), or Wisdom (Insight) check, you can expend one Superiority Die and add the Superiority Die to the ability check.',
  },
  {
    name: 'Trip Attack',
    description: 'When you hit a creature with an attack roll, you can expend one Superiority Die to attempt to knock the target down. You add the Superiority Die to the attack\'s damage roll, and if the target is Large or smaller, it must make a Strength saving throw. On a failed save, you knock the target Prone.',
  },
]

/**
 * Get the number of maneuvers a Battle Master knows at a given level
 * Battle Masters learn 3 at level 3, then +2 at levels 7, 10, and 15
 */
export function getManeuversKnown(fighterLevel: number): number {
  const level = Math.max(1, Math.min(20, fighterLevel))
  if (level < 3) return 0 // Not a Battle Master yet
  if (level >= 15) return 9 // 3 + 2 + 2 + 2
  if (level >= 10) return 7 // 3 + 2 + 2
  if (level >= 7) return 5 // 3 + 2
  return 3 // Level 3-6
}

/**
 * Get the number and size of Superiority Dice a Battle Master has
 * Starts with 4 d8s at level 3, increases to 5 at level 7, 6 at level 15
 * Die size increases to d10 at level 10, d12 at level 18
 */
export function getSuperiorityDice(fighterLevel: number): { count: number; size: 'd8' | 'd10' | 'd12' } {
  const level = Math.max(1, Math.min(20, fighterLevel))

  // Determine die count
  let count: number
  if (level < 3) count = 0
  else if (level >= 15) count = 6
  else if (level >= 7) count = 5
  else count = 4

  // Determine die size
  let size: 'd8' | 'd10' | 'd12'
  if (level >= 18) size = 'd12'
  else if (level >= 10) size = 'd10'
  else size = 'd8'

  return { count, size }
}

/**
 * Get a maneuver by name
 */
export function getManeuverByName(name: string): Maneuver | undefined {
  return MANEUVERS.find((m) => m.name === name)
}
