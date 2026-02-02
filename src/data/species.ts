import type { SpeciesTrait, Size, SpeciesAncestryData } from '../types'

export interface Species {
  name: string
  size: Size
  speed: number
  traits: SpeciesTrait[]
  languages: string[]
  ancestry?: SpeciesAncestryData
}

export const SPECIES: Species[] = [
  {
    name: 'Human',
    size: 'medium',
    speed: 30,
    traits: [
      {
        name: 'Resourceful',
        description: 'You gain Heroic Inspiration whenever you finish a Long Rest.',
      },
      {
        name: 'Skillful',
        description: 'You gain proficiency in one skill of your choice.',
      },
      {
        name: 'Versatile',
        description: 'You gain an Origin feat of your choice.',
      },
    ],
    languages: ['Common'],
  },
  {
    name: 'Elf',
    size: 'medium',
    speed: 30,
    traits: [
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
      },
      {
        name: 'Fey Ancestry',
        description:
          "You have Advantage on saving throws you make to avoid or end the Charmed condition.",
      },
      {
        name: 'Keen Senses',
        description: 'You have proficiency in the Perception skill.',
      },
      {
        name: 'Trance',
        description:
          "You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.",
      },
    ],
    languages: ['Common', 'Elvish'],
    ancestry: {
      choiceName: 'Elven Lineage',
      options: [
        {
          name: 'Drow',
          description:
            'The Drow are Elves who long ago chose to follow the god Lolth. Adapted to the lightless depths of the Underdark, you have superior darkvision (120 feet). You know the Dancing Lights cantrip. At 3rd level, you learn Faerie Fire, and at 5th level, you learn Darkness. You can cast each lineage spell once per Long Rest without expending a spell slot.',
          darkvisionOverride: 120,
          cantrip: 'Dancing Lights',
          leveledSpells: [
            { level: 3, spell: 'Faerie Fire' },
            { level: 5, spell: 'Darkness' },
          ],
        },
        {
          name: 'High Elf',
          description:
            'High Elves are Elves with a strong connection to the arcane. You know the Prestidigitation cantrip. At 3rd level, you learn Detect Magic, and at 5th level, you learn Misty Step. You can cast each lineage spell once per Long Rest without expending a spell slot.',
          cantrip: 'Prestidigitation',
          leveledSpells: [
            { level: 3, spell: 'Detect Magic' },
            { level: 5, spell: 'Misty Step' },
          ],
        },
        {
          name: 'Wood Elf',
          description:
            'Wood Elves are Elves at home in the forests of the world. Your base Speed is 35 feet. You know the Druidcraft cantrip. At 3rd level, you learn Longstrider, and at 5th level, you learn Pass Without Trace. You can cast each lineage spell once per Long Rest without expending a spell slot.',
          speedOverride: 35,
          cantrip: 'Druidcraft',
          leveledSpells: [
            { level: 3, spell: 'Longstrider' },
            { level: 5, spell: 'Pass Without Trace' },
          ],
        },
      ],
    },
  },
  {
    name: 'Dwarf',
    size: 'medium',
    speed: 30,
    traits: [
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 120 feet.',
      },
      {
        name: 'Dwarven Resilience',
        description:
          'You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.',
      },
      {
        name: 'Dwarven Toughness',
        description:
          'Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.',
      },
      {
        name: 'Stonecunning',
        description:
          'As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You must be on a stone surface or touching a stone surface to use this Tremorsense. You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
      },
    ],
    languages: ['Common', 'Dwarvish'],
  },
  {
    name: 'Halfling',
    size: 'small',
    speed: 30,
    traits: [
      {
        name: 'Brave',
        description: 'You have Advantage on saving throws you make to avoid or end the Frightened condition.',
      },
      {
        name: 'Halfling Nimbleness',
        description:
          "You can move through the space of any creature that is a size larger than you, but you can't stop in the same space.",
      },
      {
        name: 'Luck',
        description:
          'When you roll a 1 on the d20 of a D20 Test, you can reroll the die, and you must use the new roll.',
      },
      {
        name: 'Naturally Stealthy',
        description:
          'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.',
      },
    ],
    languages: ['Common', 'Halfling'],
  },
  {
    name: 'Dragonborn',
    size: 'medium',
    speed: 30,
    traits: [
      {
        name: 'Draconic Ancestry',
        description:
          'Your lineage stems from a dragon progenitor. Choose the type of dragon from the Draconic Ancestors table. Your choice affects your Breath Weapon and Damage Resistance traits.',
      },
      {
        name: 'Breath Weapon',
        description:
          'When you take the Attack action on your turn, you can replace one of your attacks with an exhalation of magical energy in either a 15-foot Cone or a 30-foot Line that is 5 feet wide. Each creature in that area must make a Dexterity saving throw (DC = 8 + your Constitution modifier + your Proficiency Bonus). On a failed save, a creature takes 1d10 damage of the type determined by your Draconic Ancestry trait. On a successful save, a creature takes half as much damage. This damage increases by 1d10 when you reach character levels 5 (2d10), 11 (3d10), and 17 (4d10). You can use this Breath Weapon a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
      },
      {
        name: 'Damage Resistance',
        description: 'You have Resistance to the damage type determined by your Draconic Ancestry trait.',
      },
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
      },
    ],
    languages: ['Common', 'Draconic'],
    ancestry: {
      choiceName: 'Draconic Ancestry',
      options: [
        {
          name: 'Black',
          description: 'You have acid resistance and your breath weapon deals acid damage in a 30-foot line.',
          damageType: 'acid',
          breathWeaponShape: '30-foot line',
          damageResistance: 'acid',
        },
        {
          name: 'Blue',
          description: 'You have lightning resistance and your breath weapon deals lightning damage in a 30-foot line.',
          damageType: 'lightning',
          breathWeaponShape: '30-foot line',
          damageResistance: 'lightning',
        },
        {
          name: 'Brass',
          description: 'You have fire resistance and your breath weapon deals fire damage in a 30-foot line.',
          damageType: 'fire',
          breathWeaponShape: '30-foot line',
          damageResistance: 'fire',
        },
        {
          name: 'Bronze',
          description: 'You have lightning resistance and your breath weapon deals lightning damage in a 30-foot line.',
          damageType: 'lightning',
          breathWeaponShape: '30-foot line',
          damageResistance: 'lightning',
        },
        {
          name: 'Copper',
          description: 'You have acid resistance and your breath weapon deals acid damage in a 30-foot line.',
          damageType: 'acid',
          breathWeaponShape: '30-foot line',
          damageResistance: 'acid',
        },
        {
          name: 'Gold',
          description: 'You have fire resistance and your breath weapon deals fire damage in a 15-foot cone.',
          damageType: 'fire',
          breathWeaponShape: '15-foot cone',
          damageResistance: 'fire',
        },
        {
          name: 'Green',
          description: 'You have poison resistance and your breath weapon deals poison damage in a 15-foot cone.',
          damageType: 'poison',
          breathWeaponShape: '15-foot cone',
          damageResistance: 'poison',
        },
        {
          name: 'Red',
          description: 'You have fire resistance and your breath weapon deals fire damage in a 15-foot cone.',
          damageType: 'fire',
          breathWeaponShape: '15-foot cone',
          damageResistance: 'fire',
        },
        {
          name: 'Silver',
          description: 'You have cold resistance and your breath weapon deals cold damage in a 15-foot cone.',
          damageType: 'cold',
          breathWeaponShape: '15-foot cone',
          damageResistance: 'cold',
        },
        {
          name: 'White',
          description: 'You have cold resistance and your breath weapon deals cold damage in a 15-foot cone.',
          damageType: 'cold',
          breathWeaponShape: '15-foot cone',
          damageResistance: 'cold',
        },
      ],
    },
  },
  {
    name: 'Gnome',
    size: 'small',
    speed: 30,
    traits: [
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
      },
      {
        name: 'Gnomish Cunning',
        description:
          'You have Advantage on Intelligence, Wisdom, and Charisma saving throws.',
      },
      {
        name: 'Gnomish Lineage',
        description:
          'You are part of a lineage that grants you supernatural abilities. Choose one of the following options: Forest Gnome (Minor Illusion cantrip, Speak with Small Beasts) or Rock Gnome (Prestidigitation cantrip, Tinker).',
      },
    ],
    languages: ['Common', 'Gnomish'],
    ancestry: {
      choiceName: 'Gnomish Lineage',
      options: [
        {
          name: 'Forest Gnome',
          description: 'You know the Minor Illusion cantrip. You can also cast Speak with Animals once per Long Rest without expending a spell slot.',
          spells: ['Minor Illusion'],
        },
        {
          name: 'Rock Gnome',
          description: 'You know the Prestidigitation cantrip. You also have proficiency with Tinker\'s Tools and can use them to craft tiny clockwork devices.',
          spells: ['Prestidigitation'],
        },
      ],
    },
  },
  {
    name: 'Tiefling',
    size: 'medium',
    speed: 30,
    traits: [
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
      },
      {
        name: 'Fiendish Legacy',
        description:
          'You are the recipient of a fiendish legacy that grants you supernatural abilities. Choose a legacy from the Fiendish Legacies table: Abyssal, Chthonic, or Infernal. You gain the level 1 benefit of the chosen legacy.',
      },
      {
        name: 'Otherworldly Presence',
        description: 'You know the Thaumaturgy cantrip.',
      },
    ],
    languages: ['Common', 'Infernal'],
    ancestry: {
      choiceName: 'Fiendish Legacy',
      options: [
        {
          name: 'Abyssal',
          description: 'You have poison resistance. You also know the Poison Spray cantrip. Starting at level 3, you can cast Ray of Sickness once per Long Rest. Starting at level 5, you can cast Hold Person once per Long Rest.',
          damageResistance: 'poison',
        },
        {
          name: 'Chthonic',
          description: 'You have necrotic resistance. You also know the Chill Touch cantrip. Starting at level 3, you can cast False Life once per Long Rest. Starting at level 5, you can cast Ray of Enfeeblement once per Long Rest.',
          damageResistance: 'necrotic',
        },
        {
          name: 'Infernal',
          description: 'You have fire resistance. You also know the Fire Bolt cantrip. Starting at level 3, you can cast Hellish Rebuke once per Long Rest. Starting at level 5, you can cast Darkness once per Long Rest.',
          damageResistance: 'fire',
        },
      ],
    },
  },
  {
    name: 'Orc',
    size: 'medium',
    speed: 30,
    traits: [
      {
        name: 'Adrenaline Rush',
        description:
          'You can take the Dash action as a Bonus Action. When you do so, you gain a number of Temporary Hit Points equal to your Proficiency Bonus. You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Short or Long Rest.',
      },
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 120 feet.',
      },
      {
        name: 'Relentless Endurance',
        description:
          "When you are reduced to 0 Hit Points but not killed outright, you can drop to 1 Hit Point instead. Once you use this trait, you can't do so again until you finish a Long Rest.",
      },
    ],
    languages: ['Common', 'Orc'],
  },
  {
    name: 'Goliath',
    size: 'medium',
    speed: 35,
    traits: [
      {
        name: "Giant Ancestry",
        description:
          'You are descended from Giants. Choose one of the following benefits: Cloud (use Misty Step as Bonus Action), Fire (fire damage resistance), Frost (cold damage resistance), Hill (Heroic Inspiration when taking Dash/Dodge), Stone (15 foot Tremorsense), or Storm (lightning/thunder resistance).',
      },
      {
        name: 'Large Form',
        description:
          "Starting at character level 5, you can change your size to Large as a Bonus Action if you're in a big enough space. This lasts for 10 minutes or until you end it as a Bonus Action. During this time you have Advantage on Strength checks and your Speed increases by 10 feet. Once you use this trait, you can't do so again until you finish a Long Rest.",
      },
      {
        name: 'Powerful Build',
        description:
          'You have Advantage on any saving throw you make to end the Grappled condition. You also count as one size larger when determining your carrying capacity.',
      },
    ],
    languages: ['Common', 'Giant'],
    ancestry: {
      choiceName: 'Giant Ancestry',
      options: [
        {
          name: 'Cloud',
          description: 'You can cast Misty Step as a Bonus Action without expending a spell slot. You can use this trait a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.',
        },
        {
          name: 'Fire',
          description: 'You have resistance to fire damage.',
          damageResistance: 'fire',
        },
        {
          name: 'Frost',
          description: 'You have resistance to cold damage.',
          damageResistance: 'cold',
        },
        {
          name: 'Hill',
          description: 'When you take the Dash or Dodge action, you gain Heroic Inspiration.',
        },
        {
          name: 'Stone',
          description: 'You have Tremorsense with a range of 15 feet.',
        },
        {
          name: 'Storm',
          description: 'You have resistance to lightning and thunder damage.',
          damageResistance: 'lightning',
        },
      ],
    },
  },
  {
    name: 'Aasimar',
    size: 'medium',
    speed: 30,
    traits: [
      {
        name: 'Celestial Resistance',
        description: 'You have Resistance to Necrotic and Radiant damage.',
      },
      {
        name: 'Darkvision',
        description: 'You have Darkvision with a range of 60 feet.',
      },
      {
        name: 'Healing Hands',
        description:
          'As a Magic action, you touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains a number of Hit Points equal to the total rolled. Once you use this trait, you can\'t use it again until you finish a Long Rest.',
      },
      {
        name: 'Light Bearer',
        description: 'You know the Light cantrip.',
      },
      {
        name: 'Celestial Revelation',
        description:
          'When you reach character level 3, you can transform as a Bonus Action using one of the options below (choose when you gain this level). The transformation lasts for 1 minute or until you end it as a Bonus Action. Once you transform, you can\'t do so again until you finish a Long Rest. Heavenly Wings: Gain a Fly Speed equal to your Speed. Radiant Soul: Damage dealt with spells or weapons has extra Radiant damage equal to your Proficiency Bonus.',
      },
    ],
    languages: ['Common', 'Celestial'],
    ancestry: {
      choiceName: 'Celestial Revelation',
      options: [
        {
          name: 'Heavenly Wings',
          description: 'When you transform, you gain a Fly Speed equal to your Speed for 1 minute.',
        },
        {
          name: 'Radiant Soul',
          description: 'When you transform, damage you deal with spells or weapons has extra Radiant damage equal to your Proficiency Bonus for 1 minute.',
        },
      ],
    },
  },
]

/**
 * Get a species by name
 */
export function getSpeciesByName(name: string): Species | undefined {
  return SPECIES.find((s) => s.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all species names for dropdown
 */
export function getSpeciesNames(): string[] {
  return SPECIES.map((s) => s.name)
}
