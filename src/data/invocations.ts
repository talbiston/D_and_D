// Eldritch Invocations for Warlocks (D&D 2024)

export interface Invocation {
  name: string
  description: string
  prerequisite?: string // e.g., "Pact of the Blade", "5th level", "Eldritch Blast cantrip"
  levelRequirement?: number // Minimum Warlock level required
  pactRequirement?: 'blade' | 'chain' | 'tome' // Required Pact Boon
}

export const INVOCATIONS: Invocation[] = [
  // No prerequisite invocations
  {
    name: 'Agonizing Blast',
    description: 'When you cast Eldritch Blast, add your Charisma modifier to the damage it deals on a hit.',
    prerequisite: 'Eldritch Blast cantrip',
  },
  {
    name: 'Armor of Shadows',
    description: 'You can cast Mage Armor on yourself at will, without expending a spell slot or Material components.',
  },
  {
    name: 'Beast Speech',
    description: 'You can cast Speak with Animals at will, without expending a spell slot.',
  },
  {
    name: 'Beguiling Influence',
    description: 'You gain proficiency in the Deception and Persuasion skills.',
  },
  {
    name: 'Devils Sight',
    description: 'You can see normally in Dim Light and Darkness—both magical and nonmagical—within 120 feet of yourself.',
  },
  {
    name: 'Eldritch Mind',
    description: 'You have Advantage on Constitution saving throws that you make to maintain Concentration.',
  },
  {
    name: 'Eldritch Spear',
    description: 'When you cast Eldritch Blast, its range is 300 feet.',
    prerequisite: 'Eldritch Blast cantrip',
  },
  {
    name: 'Eyes of the Rune Keeper',
    description: 'You can read all writing.',
  },
  {
    name: 'Fiendish Vigor',
    description: 'You can cast False Life on yourself at will as a 1st-level spell, without expending a spell slot or Material components.',
  },
  {
    name: 'Gaze of Two Minds',
    description: 'You can use a Bonus Action to touch a willing creature and perceive through its senses until the end of your next turn. As long as the creature is on the same plane of existence as you, you can take a Bonus Action on subsequent turns to maintain this connection.',
  },
  {
    name: 'Grasp of Hadar',
    description: 'Once per turn when you hit a creature with Eldritch Blast, you can move that creature in a straight line 10 feet closer to you.',
    prerequisite: 'Eldritch Blast cantrip',
  },
  {
    name: 'Lance of Lethargy',
    description: 'Once per turn when you hit a creature with Eldritch Blast, you can reduce that creature\'s speed by 10 feet until the end of your next turn.',
    prerequisite: 'Eldritch Blast cantrip',
  },
  {
    name: 'Lessons of the First Ones',
    description: 'You have received knowledge from an elder entity of the multiverse, allowing you to gain one Origin feat of your choice.',
  },
  {
    name: 'Mask of Many Faces',
    description: 'You can cast Disguise Self at will, without expending a spell slot.',
  },
  {
    name: 'Misty Visions',
    description: 'You can cast Silent Image at will, without expending a spell slot or Material components.',
  },
  {
    name: 'Otherworldly Leap',
    description: 'You can cast Jump on yourself at will, without expending a spell slot or Material components.',
  },
  {
    name: 'Pact of the Blade',
    description: 'As a Bonus Action, you can conjure a pact weapon in your hand—a Simple or Martial Melee weapon of your choice with which you bond. You can use your Charisma modifier instead of Strength or Dexterity for attack and damage rolls with this weapon.',
  },
  {
    name: 'Pact of the Chain',
    description: 'You learn the Find Familiar spell and can cast it as a Magic action without expending a spell slot. Your familiar can be an Imp, Pseudodragon, Quasit, or Sprite.',
  },
  {
    name: 'Pact of the Tome',
    description: 'Your patron gives you a Book of Shadows. When you gain this feature, choose three cantrips from any spell list. The cantrips appear in the book and don\'t count against the number of cantrips you know.',
  },
  {
    name: 'Repelling Blast',
    description: 'When you hit a creature with Eldritch Blast, you can push the creature up to 10 feet straight away from you.',
    prerequisite: 'Eldritch Blast cantrip',
  },
  {
    name: 'Thief of Five Fates',
    description: 'You can cast Bane once using a Pact Magic spell slot. You can\'t do so again until you finish a Long Rest.',
  },
  // 5th level invocations
  {
    name: 'Cloak of Flies',
    description: 'As a Bonus Action, you can surround yourself with a magical aura that looks like buzzing flies. The aura extends 5 feet from you in every direction and lasts for 1 minute. It grants you Advantage on Charisma (Intimidation) checks and disadvantage on other Charisma checks. Any other creature that starts its turn in the aura takes Poison damage equal to your Charisma modifier (minimum 0).',
    levelRequirement: 5,
  },
  {
    name: 'Eldritch Smite',
    description: 'Once per turn when you hit a creature with your pact weapon, you can expend a Pact Magic spell slot to deal an extra 1d8 Force damage per slot level to the target, plus an additional 1d8 Force damage. If the target is Huge or smaller, it is knocked Prone.',
    levelRequirement: 5,
    pactRequirement: 'blade',
  },
  {
    name: 'Maddening Hex',
    description: 'As a Bonus Action, you can cause a psychic disturbance around the target cursed by your Hex spell or a warlock feature of yours. When you do so, deal Psychic damage to the cursed target and each creature of your choice within 5 feet of it. The damage equals your Charisma modifier (minimum 1).',
    levelRequirement: 5,
    prerequisite: 'Hex spell or a warlock feature that curses',
  },
  {
    name: 'One with Shadows',
    description: 'When you are in Dim Light or Darkness, you can take the Hide action as a Bonus Action.',
    levelRequirement: 5,
  },
  {
    name: 'Sign of Ill Omen',
    description: 'You can cast Bestow Curse once using a Pact Magic spell slot. You can\'t do so again until you finish a Long Rest.',
    levelRequirement: 5,
  },
  {
    name: 'Thirsting Blade',
    description: 'You gain Extra Attack with your pact weapon.',
    levelRequirement: 5,
    pactRequirement: 'blade',
  },
  {
    name: 'Tomb of Levistus',
    description: 'As a Reaction when you take damage, you can entomb yourself in ice. You gain 10 Temporary Hit Points per Warlock level, which take as much of the triggering damage as possible. You also gain Vulnerability to Fire damage, your Speed is reduced to 0, and you have the Incapacitated condition until the end of your next turn.',
    levelRequirement: 5,
  },
  // 7th level invocations
  {
    name: 'Bewitching Whispers',
    description: 'You can cast Compulsion once using a Pact Magic spell slot. You can\'t do so again until you finish a Long Rest.',
    levelRequirement: 7,
  },
  {
    name: 'Ghostly Gaze',
    description: 'As a Bonus Action, you gain the ability to see through solid objects within 30 feet of yourself. This special sight lasts for 1 minute or until you end it as a Bonus Action. During that time, you perceive objects as ghostly, transparent images. Once you use this invocation, you can\'t do so again until you finish a Short or Long Rest.',
    levelRequirement: 7,
  },
  {
    name: 'Relentless Hex',
    description: 'Your curse creates a temporary bond between you and your target. As a Bonus Action, you can magically teleport to an unoccupied space you can see within 30 feet of the target cursed by your Hex spell or by a warlock feature of yours.',
    levelRequirement: 7,
    prerequisite: 'Hex spell or a warlock feature that curses',
  },
  {
    name: 'Sculptor of Flesh',
    description: 'You can cast Polymorph once using a Pact Magic spell slot. You can\'t do so again until you finish a Long Rest.',
    levelRequirement: 7,
  },
  // 9th level invocations
  {
    name: 'Ascendant Step',
    description: 'You can cast Levitate on yourself at will without expending a spell slot or Material components.',
    levelRequirement: 9,
  },
  {
    name: 'Gift of the Protectors',
    description: 'A creature whose name is inscribed in your Book of Shadows is protected. If the creature drops to 0 Hit Points, it instead drops to 1 Hit Point. Once this magic is triggered, no creature inscribed in the book can benefit from it until you finish a Long Rest.',
    levelRequirement: 9,
    pactRequirement: 'tome',
  },
  {
    name: 'Minions of Chaos',
    description: 'You can cast Conjure Elemental once using a Pact Magic spell slot. You can\'t do so again until you finish a Long Rest.',
    levelRequirement: 9,
  },
  {
    name: 'Whispers of the Grave',
    description: 'You can cast Speak with Dead at will without expending a spell slot.',
    levelRequirement: 9,
  },
  // 12th level invocations
  {
    name: 'Bond of the Talisman',
    description: 'While someone else is wearing your talisman, you can take the Teleport action to teleport to an unoccupied space within 10 feet of them. The wearer of your talisman can do the same. This feature can be used a number of times equal to your Proficiency Bonus, and all expended uses are restored when you finish a Long Rest.',
    levelRequirement: 12,
  },
  {
    name: 'Lifedrinker',
    description: 'Once per turn when you hit a creature with your pact weapon, you can deal an extra 1d6 Necrotic damage to the creature, and you regain Hit Points equal to the Necrotic damage dealt.',
    levelRequirement: 12,
    pactRequirement: 'blade',
  },
  // 15th level invocations
  {
    name: 'Chains of Carceri',
    description: 'You can cast Hold Monster at will—targeting a Celestial, Fiend, or Elemental—without expending a spell slot or Material components. You must finish a Long Rest before you can use this invocation on the same creature again.',
    levelRequirement: 15,
    pactRequirement: 'chain',
  },
  {
    name: 'Master of Myriad Forms',
    description: 'You can cast Alter Self at will without expending a spell slot.',
    levelRequirement: 15,
  },
  {
    name: 'Shroud of Shadow',
    description: 'You can cast Invisibility at will without expending a spell slot.',
    levelRequirement: 15,
  },
  {
    name: 'Visions of Distant Realms',
    description: 'You can cast Arcane Eye at will without expending a spell slot.',
    levelRequirement: 15,
  },
  {
    name: 'Witch Sight',
    description: 'You have Truesight with a range of 30 feet.',
    levelRequirement: 15,
  },
]

/**
 * Get the number of Eldritch Invocations a Warlock knows at a given level
 * Warlocks learn invocations at levels 1, 5, 7, 9, 12, 15, 18
 */
export function getInvocationsKnown(warlockLevel: number): number {
  const level = Math.max(1, Math.min(20, warlockLevel))
  if (level >= 18) return 8
  if (level >= 15) return 7
  if (level >= 12) return 6
  if (level >= 9) return 5
  if (level >= 7) return 4
  if (level >= 5) return 3
  if (level >= 2) return 2
  return 1 // Level 1
}

/**
 * Check if a character meets the prerequisites for an invocation
 */
export function meetsInvocationPrerequisites(
  invocation: Invocation,
  warlockLevel: number,
  pactBoon: 'blade' | 'chain' | 'tome' | null,
  hasEldritchBlast: boolean
): boolean {
  // Check level requirement
  if (invocation.levelRequirement && warlockLevel < invocation.levelRequirement) {
    return false
  }

  // Check pact requirement
  if (invocation.pactRequirement && pactBoon !== invocation.pactRequirement) {
    return false
  }

  // Check Eldritch Blast prerequisite
  if (invocation.prerequisite?.includes('Eldritch Blast cantrip') && !hasEldritchBlast) {
    return false
  }

  return true
}

/**
 * Get the Pact Boon a character has based on their invocations
 */
export function getPactBoon(invocations: Invocation[]): 'blade' | 'chain' | 'tome' | null {
  for (const inv of invocations) {
    if (inv.name === 'Pact of the Blade') return 'blade'
    if (inv.name === 'Pact of the Chain') return 'chain'
    if (inv.name === 'Pact of the Tome') return 'tome'
  }
  return null
}

export function getInvocationByName(name: string): Invocation | undefined {
  return INVOCATIONS.find((inv) => inv.name === name)
}
