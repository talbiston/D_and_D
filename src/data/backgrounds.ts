import type { Feat, SkillName } from '../types'

export interface Background {
  name: string
  description: string
  skillProficiencies: SkillName[]
  toolProficiency: string
  abilityScoreOptions: string[] // The three abilities the player can choose to boost
  originFeat: Feat
  equipment: string[]
}

export const BACKGROUNDS: Background[] = [
  {
    name: 'Acolyte',
    description: 'You devoted yourself to service in a temple, learning sacred rites and providing sacrifices to the god or gods you worship.',
    skillProficiencies: ['insight', 'religion'],
    toolProficiency: "Calligrapher's Supplies",
    abilityScoreOptions: ['intelligence', 'wisdom', 'charisma'],
    originFeat: {
      name: 'Magic Initiate (Cleric)',
      description: 'You learn two cantrips and one 1st-level spell from the Cleric spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Wisdom is your spellcasting ability for these spells.',
    },
    equipment: ['Holy Symbol', 'Parchment (10 sheets)', 'Robe', 'Candle (3)', '50 GP'],
  },
  {
    name: 'Artisan',
    description: 'You began mopping floors and scrubbing tables in an artisan\'s workshop while you were still young. You learned to craft basic goods and absorbed the rudiments of a trade.',
    skillProficiencies: ['investigation', 'persuasion'],
    toolProficiency: "Artisan's Tools (one of your choice)",
    abilityScoreOptions: ['strength', 'dexterity', 'intelligence'],
    originFeat: {
      name: 'Crafter',
      description: 'You gain proficiency with three Artisan\'s Tools of your choice. When you craft an item using a tool with which you have proficiency, the required crafting time is reduced by 20%. When you craft an item, you can make it for 10% less than the normal cost.',
    },
    equipment: ["Artisan's Tools (same as proficiency)", 'Traveler\'s Clothes', 'Pouch', '50 GP'],
  },
  {
    name: 'Charlatan',
    description: 'Once you were old enough to order your own affairs, you left your old life behind. You have spent years perfecting the art of deception and manipulation.',
    skillProficiencies: ['deception', 'sleightOfHand'],
    toolProficiency: 'Forgery Kit',
    abilityScoreOptions: ['dexterity', 'constitution', 'charisma'],
    originFeat: {
      name: 'Skilled',
      description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    },
    equipment: ['Forgery Kit', 'Costume', 'Fine Clothes', '15 GP'],
  },
  {
    name: 'Criminal',
    description: 'You eked out a living in dark alleyways, cutting purses or burgling shops. Perhaps you were part of a small gang of like-minded criminals.',
    skillProficiencies: ['sleightOfHand', 'stealth'],
    toolProficiency: "Thieves' Tools",
    abilityScoreOptions: ['dexterity', 'constitution', 'intelligence'],
    originFeat: {
      name: 'Alert',
      description: 'You gain a +5 bonus to initiative. You cannot be surprised while conscious. Other creatures do not gain advantage on attack rolls against you as a result of being unseen by you.',
    },
    equipment: ["Thieves' Tools", 'Crowbar', 'Dark Common Clothes with Hood', '15 GP'],
  },
  {
    name: 'Entertainer',
    description: 'You spent much of your youth following minstrels, musicians, and performers. You learned their trade and their way of life.',
    skillProficiencies: ['acrobatics', 'performance'],
    toolProficiency: 'Musical Instrument (one of your choice)',
    abilityScoreOptions: ['strength', 'dexterity', 'charisma'],
    originFeat: {
      name: 'Musician',
      description: 'You gain proficiency with three Musical Instruments of your choice. After you finish a Short or Long Rest, you can play a song on a Musical Instrument with which you have proficiency and give Heroic Inspiration to allies who hear the song. The number of allies you can affect equals your Proficiency Bonus.',
    },
    equipment: ['Musical Instrument (same as proficiency)', 'Mirror', 'Costume (2)', 'Fine Clothes', '8 GP'],
  },
  {
    name: 'Farmer',
    description: 'You grew up close to the land. Years tending crops and livestock have given you a practical mind and a strong back.',
    skillProficiencies: ['animalHandling', 'nature'],
    toolProficiency: "Carpenter's Tools",
    abilityScoreOptions: ['strength', 'constitution', 'wisdom'],
    originFeat: {
      name: 'Tough',
      description: 'Your hit point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.',
    },
    equipment: ["Carpenter's Tools", 'Healer\'s Kit', 'Iron Pot', 'Shovel', 'Common Clothes', '30 GP'],
  },
  {
    name: 'Guard',
    description: 'Your feet ache when you remember the countless hours you spent at your post, but at least you learned how to stay alert.',
    skillProficiencies: ['athletics', 'perception'],
    toolProficiency: 'Gaming Set (one of your choice)',
    abilityScoreOptions: ['strength', 'intelligence', 'wisdom'],
    originFeat: {
      name: 'Alert',
      description: 'You gain a +5 bonus to initiative. You cannot be surprised while conscious. Other creatures do not gain advantage on attack rolls against you as a result of being unseen by you.',
    },
    equipment: ['Gaming Set (same as proficiency)', 'Quiver with 20 Arrows', 'Shortbow', 'Hooded Lantern', 'Manacles', 'Common Clothes', '10 GP'],
  },
  {
    name: 'Guide',
    description: 'You came of age in the wilds, far from civilization. You\'ve navigated forests, mountains, and wastelands, and you know how to survive the dangers they hold.',
    skillProficiencies: ['stealth', 'survival'],
    toolProficiency: "Cartographer's Tools",
    abilityScoreOptions: ['dexterity', 'constitution', 'wisdom'],
    originFeat: {
      name: 'Magic Initiate (Druid)',
      description: 'You learn two cantrips and one 1st-level spell from the Druid spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Wisdom is your spellcasting ability for these spells.',
    },
    equipment: ["Cartographer's Tools", 'Bedroll', 'Tent (two-person)', 'Traveler\'s Clothes', '3 GP'],
  },
  {
    name: 'Hermit',
    description: 'You lived for a time in seclusion, either in a sheltered community or entirely alone. In the quiet of your solitude, you contemplated the nature of existence.',
    skillProficiencies: ['medicine', 'religion'],
    toolProficiency: 'Herbalism Kit',
    abilityScoreOptions: ['constitution', 'wisdom', 'charisma'],
    originFeat: {
      name: 'Healer',
      description: 'When you use a healer\'s kit to stabilize a dying creature, they also regain 1 HP. As an action, you can spend one use of a healer\'s kit to restore 1d6 + 4 + target\'s HD in HP. Each creature can only benefit from this once per rest.',
    },
    equipment: ['Herbalism Kit', 'Quarterstaff', 'Book (philosophy)', 'Lamp', 'Oil (3 flasks)', 'Common Clothes', '16 GP'],
  },
  {
    name: 'Merchant',
    description: 'You learned the art of the deal from someone who made a living from trade. You understand the value of goods and how to negotiate a fair price.',
    skillProficiencies: ['animalHandling', 'persuasion'],
    toolProficiency: "Navigator's Tools",
    abilityScoreOptions: ['constitution', 'intelligence', 'charisma'],
    originFeat: {
      name: 'Lucky',
      description: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend a luck point to roll an additional d20 and choose which to use. You can also spend a luck point when an attack is made against you. You regain luck points on a long rest.',
    },
    equipment: ["Navigator's Tools", 'Traveler\'s Clothes', 'Pouch', '22 GP'],
  },
  {
    name: 'Noble',
    description: 'Born into a family of prestige and power, you received an education in the courtly graces. Your family might have a title, or you might have been raised by servants.',
    skillProficiencies: ['history', 'persuasion'],
    toolProficiency: 'Gaming Set (one of your choice)',
    abilityScoreOptions: ['strength', 'intelligence', 'charisma'],
    originFeat: {
      name: 'Skilled',
      description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    },
    equipment: ['Gaming Set (same as proficiency)', 'Fine Clothes', 'Perfume', 'Signet Ring', '29 GP'],
  },
  {
    name: 'Sage',
    description: 'You spent years learning the lore of the multiverse. You scoured manuscripts, studied scrolls, and listened to the greatest experts on the subjects that interest you.',
    skillProficiencies: ['arcana', 'history'],
    toolProficiency: "Calligrapher's Supplies",
    abilityScoreOptions: ['constitution', 'intelligence', 'wisdom'],
    originFeat: {
      name: 'Magic Initiate (Wizard)',
      description: 'You learn two cantrips and one 1st-level spell from the Wizard spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Intelligence is your spellcasting ability for these spells.',
    },
    equipment: ["Calligrapher's Supplies", 'Book (history)', 'Parchment (8 sheets)', 'Robe', '8 GP'],
  },
  {
    name: 'Sailor',
    description: 'You\'ve spent your youth aboard ships and working in ports. You learned the rhythms of the sea and the skills needed to survive on the water.',
    skillProficiencies: ['acrobatics', 'perception'],
    toolProficiency: "Navigator's Tools",
    abilityScoreOptions: ['strength', 'dexterity', 'wisdom'],
    originFeat: {
      name: 'Tavern Brawler',
      description: 'Your Strength or Constitution score increases by 1 (max 20). You are proficient with improvised weapons. Your unarmed strikes deal 1d4 + Strength modifier bludgeoning damage. When you hit with an unarmed strike or improvised weapon on your turn, you can use a bonus action to grapple.',
    },
    equipment: ["Navigator's Tools", 'Dagger', 'Rope (50 feet)', 'Traveler\'s Clothes', '20 GP'],
  },
  {
    name: 'Scribe',
    description: 'You spent your formative years in a scriptorium, copying texts and learning the secrets of books, paper, and ink. You know how to preserve knowledge for future generations.',
    skillProficiencies: ['history', 'investigation'],
    toolProficiency: "Calligrapher's Supplies",
    abilityScoreOptions: ['dexterity', 'intelligence', 'wisdom'],
    originFeat: {
      name: 'Skilled',
      description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    },
    equipment: ["Calligrapher's Supplies", 'Fine Clothes', 'Lamp', 'Oil (3 flasks)', 'Parchment (12 sheets)', '23 GP'],
  },
  {
    name: 'Soldier',
    description: 'You trained as a soldier on a battlefield or in a camp. You learned discipline, how to march, and how to fight. War has marked you.',
    skillProficiencies: ['athletics', 'intimidation'],
    toolProficiency: 'Gaming Set (one of your choice)',
    abilityScoreOptions: ['strength', 'dexterity', 'constitution'],
    originFeat: {
      name: 'Savage Attacker',
      description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the damage dice and use either total.',
    },
    equipment: ['Gaming Set (same as proficiency)', 'Healer\'s Kit', 'Quiver with 20 Arrows', 'Shortbow', 'Spear', 'Common Clothes', '14 GP'],
  },
  {
    name: 'Wayfarer',
    description: 'You grew up on the road, traveling from place to place. Perhaps you were part of a caravan, or you were a wanderer by nature. The road is your home.',
    skillProficiencies: ['insight', 'stealth'],
    toolProficiency: "Thieves' Tools",
    abilityScoreOptions: ['dexterity', 'wisdom', 'charisma'],
    originFeat: {
      name: 'Lucky',
      description: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend a luck point to roll an additional d20 and choose which to use. You can also spend a luck point when an attack is made against you. You regain luck points on a long rest.',
    },
    equipment: ["Thieves' Tools", 'Bedroll', 'Mess Kit', 'Traveler\'s Clothes', 'Waterskin', '16 GP'],
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
