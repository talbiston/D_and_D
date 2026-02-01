import type { Feat, SkillName } from '../types'

export interface Background {
  name: string
  description: string
  skillProficiencies: SkillName[]
  toolProficiency?: string
  languages: number // number of additional languages
  originFeat: Feat
  equipment: string[]
}

export const BACKGROUNDS: Background[] = [
  {
    name: 'Acolyte',
    description: 'You devoted yourself to service in a temple, learning sacred rites and providing sacrifices to the god or gods you worship.',
    skillProficiencies: ['insight', 'religion'],
    languages: 2,
    originFeat: {
      name: 'Magic Initiate (Cleric)',
      description: 'You learn two cantrips and one 1st-level spell from the Cleric spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Wisdom is your spellcasting ability for these spells.',
    },
    equipment: ['Holy symbol', 'Prayer book', 'Incense (5 sticks)', 'Vestments', 'Common clothes', '15 gp'],
  },
  {
    name: 'Criminal',
    description: 'You have a history of breaking the law and surviving by your wits.',
    skillProficiencies: ['deception', 'stealth'],
    toolProficiency: "Thieves' Tools",
    languages: 0,
    originFeat: {
      name: 'Alert',
      description: 'You gain a +5 bonus to initiative. You cannot be surprised while conscious. Other creatures do not gain advantage on attack rolls against you as a result of being unseen by you.',
    },
    equipment: ["Thieves' tools", 'Crowbar', 'Dark common clothes with hood', '15 gp'],
  },
  {
    name: 'Folk Hero',
    description: 'You come from a humble social rank, but you are destined for so much more.',
    skillProficiencies: ['animalHandling', 'survival'],
    toolProficiency: "Artisan's Tools (one of your choice)",
    languages: 0,
    originFeat: {
      name: 'Savage Attacker',
      description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the damage dice and use either total.',
    },
    equipment: ["Artisan's tools (one of your choice)", 'Shovel', 'Iron pot', 'Common clothes', '10 gp'],
  },
  {
    name: 'Noble',
    description: 'You understand wealth, power, and privilege. You carry a noble title.',
    skillProficiencies: ['history', 'persuasion'],
    languages: 1,
    originFeat: {
      name: 'Skilled',
      description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    },
    equipment: ['Fine clothes', 'Signet ring', 'Scroll of pedigree', '25 gp'],
  },
  {
    name: 'Sage',
    description: 'You spent years learning the lore of the multiverse. You scour markets for rare tomes.',
    skillProficiencies: ['arcana', 'history'],
    languages: 2,
    originFeat: {
      name: 'Magic Initiate (Wizard)',
      description: 'You learn two cantrips and one 1st-level spell from the Wizard spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Intelligence is your spellcasting ability for these spells.',
    },
    equipment: ['Ink and quill', 'Small knife', 'Letter from dead colleague', 'Common clothes', '10 gp'],
  },
  {
    name: 'Soldier',
    description: 'War has been your life for as long as you care to remember. You trained as a youth and fought for your nation.',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiency: 'Gaming Set (one of your choice)',
    languages: 0,
    originFeat: {
      name: 'Tough',
      description: 'Your hit point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.',
    },
    equipment: ['Insignia of rank', 'Trophy from fallen enemy', 'Dice set or playing cards', 'Common clothes', '10 gp'],
  },
]

/**
 * Get all background names
 */
export function getBackgroundNames(): string[] {
  return BACKGROUNDS.map((b) => b.name)
}

/**
 * Get background by name
 */
export function getBackgroundByName(name: string): Background | undefined {
  return BACKGROUNDS.find((b) => b.name === name)
}
