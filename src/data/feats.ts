import type { Feat } from '../types'

export interface FeatData extends Feat {
  prerequisite?: string
  category?: 'general' | 'origin' | 'fighting' | 'epic'
}

export const FEATS: FeatData[] = [
  // General Feats
  {
    name: 'Alert',
    description: 'You gain a +5 bonus to initiative. You cannot be surprised while conscious. Other creatures do not gain advantage on attack rolls against you as a result of being unseen by you.',
    category: 'origin',
  },
  {
    name: 'Athlete',
    description: 'Your Strength or Dexterity score increases by 1 (max 20). When prone, standing up uses only 5 feet of movement. Climbing does not cost extra movement. Running jumps require only 5 feet of movement.',
    category: 'general',
  },
  {
    name: 'Actor',
    description: 'Your Charisma score increases by 1 (max 20). You have advantage on Deception and Performance checks when trying to pass yourself off as someone else. You can mimic speech and sounds if you have heard them for at least 1 minute.',
    category: 'general',
  },
  {
    name: 'Charger',
    description: 'When you use your action to Dash, you can use a bonus action to make one melee weapon attack or shove a creature. If you move at least 10 feet in a straight line, you gain +5 damage on the attack or push 10 feet on the shove.',
    category: 'general',
  },
  {
    name: 'Crafter',
    description: 'You gain proficiency with three Artisan\'s Tools of your choice. When you craft an item using a tool with which you have proficiency, the required crafting time is reduced by 20%. When you craft an item, you can make it for 10% less than the normal cost.',
    category: 'origin',
  },
  {
    name: 'Chef',
    description: 'Your Constitution or Wisdom score increases by 1 (max 20). During short rests, you can cook special food that grants extra hit points equal to 1d8 plus your proficiency bonus. You can prepare treats that provide temporary hit points.',
    category: 'general',
  },
  {
    name: 'Crossbow Expert',
    description: 'You ignore the loading property of crossbows. Being within 5 feet of a hostile creature does not impose disadvantage on ranged attack rolls. When you use the Attack action with a one-handed weapon, you can use a bonus action to attack with a hand crossbow.',
    category: 'general',
  },
  {
    name: 'Crusher',
    description: 'Your Strength or Constitution score increases by 1 (max 20). Once per turn, when you hit with bludgeoning damage, you can move the target 5 feet. On a critical hit, attacks against the target have advantage until the start of your next turn.',
    prerequisite: 'Bludgeoning weapon proficiency',
    category: 'general',
  },
  {
    name: 'Defensive Duelist',
    description: 'When you are wielding a finesse weapon and another creature hits you with a melee attack, you can use your reaction to add your proficiency bonus to your AC for that attack.',
    prerequisite: 'Dexterity 13 or higher',
    category: 'general',
  },
  {
    name: 'Dual Wielder',
    description: 'You gain +1 AC while wielding a separate melee weapon in each hand. You can use two-weapon fighting with non-light weapons. You can draw or stow two one-handed weapons when you would normally be able to draw or stow only one.',
    category: 'general',
  },
  {
    name: 'Durable',
    description: 'Your Constitution score increases by 1 (max 20). When you roll a Hit Die to regain hit points, the minimum number of hit points you regain equals twice your Constitution modifier (minimum 2).',
    category: 'general',
  },
  {
    name: 'Elemental Adept',
    description: 'Choose a damage type: acid, cold, fire, lightning, or thunder. Spells you cast ignore resistance to that damage type. When you roll damage for a spell of that type, you can treat any 1 on a damage die as a 2.',
    prerequisite: 'Spellcasting ability',
    category: 'general',
  },
  {
    name: 'Fey Touched',
    description: 'Your Intelligence, Wisdom, or Charisma score increases by 1 (max 20). You learn Misty Step and one 1st-level divination or enchantment spell. You can cast each once per long rest without a spell slot, or by using spell slots.',
    category: 'general',
  },
  {
    name: 'Fighting Initiate',
    description: 'You learn one Fighting Style option of your choice from the fighter class. If you already have a style, you can replace it when you gain a level.',
    prerequisite: 'Proficiency with a martial weapon',
    category: 'fighting',
  },
  {
    name: 'Grappler',
    description: 'You have advantage on attack rolls against a creature you are grappling. You can use your action to try to pin a creature grappled by you, restraining both of you until the grapple ends.',
    prerequisite: 'Strength 13 or higher',
    category: 'general',
  },
  {
    name: 'Great Weapon Master',
    description: 'On your turn, when you score a critical hit or reduce a creature to 0 HP with a melee weapon, you can make one melee weapon attack as a bonus action. Before attacking with a heavy weapon, you can take -5 to hit for +10 damage.',
    category: 'general',
  },
  {
    name: 'Healer',
    description: 'When you use a healer\'s kit to stabilize a dying creature, they also regain 1 HP. As an action, you can spend one use of a healer\'s kit to restore 1d6 + 4 + target\'s HD in HP. Each creature can only benefit from this once per rest.',
    category: 'origin',
  },
  {
    name: 'Heavily Armored',
    description: 'Your Strength score increases by 1 (max 20). You gain proficiency with heavy armor.',
    prerequisite: 'Proficiency with medium armor',
    category: 'general',
  },
  {
    name: 'Inspiring Leader',
    description: 'You can spend 10 minutes inspiring companions. Up to 6 friendly creatures within 30 feet who can see or hear you gain temporary hit points equal to your level + your Charisma modifier.',
    prerequisite: 'Charisma 13 or higher',
    category: 'general',
  },
  {
    name: 'Keen Mind',
    description: 'Your Intelligence score increases by 1 (max 20). You always know which way is north. You always know the number of hours left before the next sunrise or sunset. You can accurately recall anything you have seen or heard within the past month.',
    category: 'general',
  },
  {
    name: 'Lightly Armored',
    description: 'Your Strength or Dexterity score increases by 1 (max 20). You gain proficiency with light armor.',
    category: 'general',
  },
  {
    name: 'Lucky',
    description: 'You have 3 luck points. Whenever you make an attack roll, ability check, or saving throw, you can spend a luck point to roll an additional d20 and choose which to use. You can also spend a luck point when an attack is made against you. You regain luck points on a long rest.',
    category: 'origin',
  },
  {
    name: 'Mage Slayer',
    description: 'When a creature within 5 feet of you casts a spell, you can use your reaction to make a melee weapon attack. When you damage a creature concentrating on a spell, they have disadvantage on the save. You have advantage on saves against spells cast within 5 feet.',
    category: 'general',
  },
  {
    name: 'Magic Initiate (Bard)',
    description: 'You learn two cantrips and one 1st-level spell from the Bard spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Charisma is your spellcasting ability for these spells.',
    category: 'origin',
  },
  {
    name: 'Magic Initiate (Cleric)',
    description: 'You learn two cantrips and one 1st-level spell from the Cleric spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Wisdom is your spellcasting ability for these spells.',
    category: 'origin',
  },
  {
    name: 'Magic Initiate (Druid)',
    description: 'You learn two cantrips and one 1st-level spell from the Druid spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Wisdom is your spellcasting ability for these spells.',
    category: 'origin',
  },
  {
    name: 'Magic Initiate (Sorcerer)',
    description: 'You learn two cantrips and one 1st-level spell from the Sorcerer spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Charisma is your spellcasting ability for these spells.',
    category: 'origin',
  },
  {
    name: 'Magic Initiate (Warlock)',
    description: 'You learn two cantrips and one 1st-level spell from the Warlock spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Charisma is your spellcasting ability for these spells.',
    category: 'origin',
  },
  {
    name: 'Magic Initiate (Wizard)',
    description: 'You learn two cantrips and one 1st-level spell from the Wizard spell list. You can cast the 1st-level spell once per long rest without expending a spell slot, or by using spell slots. Intelligence is your spellcasting ability for these spells.',
    category: 'origin',
  },
  {
    name: 'Martial Adept',
    description: 'You learn two maneuvers from the Battle Master archetype. You gain one superiority die (d6) which is expended when you use a maneuver. You regain it on a short or long rest.',
    category: 'general',
  },
  {
    name: 'Medium Armor Master',
    description: 'Wearing medium armor does not impose disadvantage on Stealth checks. When wearing medium armor, you can add 3 instead of 2 from your Dexterity modifier to your AC if you have Dexterity 16 or higher.',
    prerequisite: 'Proficiency with medium armor',
    category: 'general',
  },
  {
    name: 'Mobile',
    description: 'Your speed increases by 10 feet. When you use the Dash action, difficult terrain does not cost extra movement. When you make a melee attack against a creature, you do not provoke opportunity attacks from that creature for the rest of the turn.',
    category: 'general',
  },
  {
    name: 'Musician',
    description: 'You gain proficiency with three Musical Instruments of your choice. After you finish a Short or Long Rest, you can play a song on a Musical Instrument with which you have proficiency and give Heroic Inspiration to allies who hear the song. The number of allies you can affect equals your Proficiency Bonus.',
    category: 'origin',
  },
  {
    name: 'Mounted Combatant',
    description: 'You have advantage on melee attack rolls against unmounted creatures smaller than your mount. You can force an attack targeting your mount to target you instead. If your mount is subjected to a Dex save for half damage, it takes no damage on success and half on failure.',
    category: 'general',
  },
  {
    name: 'Observant',
    description: 'Your Intelligence or Wisdom score increases by 1 (max 20). If you can see a creature\'s mouth while it speaks in a language you understand, you can interpret what it\'s saying by reading its lips. You have a +5 bonus to passive Perception and Investigation.',
    category: 'general',
  },
  {
    name: 'Piercer',
    description: 'Your Strength or Dexterity score increases by 1 (max 20). Once per turn, when you hit with piercing damage, you can reroll one damage die and take the new result. When you score a critical hit with piercing damage, you can roll one additional damage die.',
    category: 'general',
  },
  {
    name: 'Poisoner',
    description: 'You are proficient with the poisoner\'s kit. As an action, you can apply poison to a weapon or piece of ammunition. A creature hit by it must make a DC 14 Con save or take 2d8 poison damage and be poisoned until the end of your next turn.',
    category: 'general',
  },
  {
    name: 'Polearm Master',
    description: 'When you take the Attack action with a glaive, halberd, quarterstaff, or spear, you can use a bonus action to make a melee attack with the opposite end for 1d4 bludgeoning. Creatures provoke opportunity attacks when they enter your reach.',
    category: 'general',
  },
  {
    name: 'Resilient',
    description: 'Choose one ability score. That score increases by 1 (max 20). You gain proficiency in saving throws using that ability.',
    category: 'general',
  },
  {
    name: 'Ritual Caster',
    description: 'You learn two 1st-level ritual spells. You can cast these spells as rituals if they have the ritual tag. When you find a ritual spell, you can add it to your book if it is a level for which you have spell slots.',
    prerequisite: 'Intelligence or Wisdom 13 or higher',
    category: 'general',
  },
  {
    name: 'Savage Attacker',
    description: 'Once per turn when you roll damage for a melee weapon attack, you can reroll the damage dice and use either total.',
    category: 'origin',
  },
  {
    name: 'Sentinel',
    description: 'When you hit a creature with an opportunity attack, the creature\'s speed becomes 0 for the rest of the turn. Creatures provoke opportunity attacks even if they take the Disengage action. When a creature within 5 feet attacks a target other than you, you can use your reaction to make a melee attack against it.',
    category: 'general',
  },
  {
    name: 'Shadow Touched',
    description: 'Your Intelligence, Wisdom, or Charisma score increases by 1 (max 20). You learn Invisibility and one 1st-level illusion or necromancy spell. You can cast each once per long rest without a spell slot, or by using spell slots.',
    category: 'general',
  },
  {
    name: 'Sharpshooter',
    description: 'Attacking at long range does not impose disadvantage on ranged weapon attack rolls. Your ranged weapon attacks ignore half and three-quarters cover. Before attacking, you can take -5 to hit for +10 damage with a ranged weapon.',
    category: 'general',
  },
  {
    name: 'Shield Master',
    description: 'If you take the Attack action, you can use a bonus action to shove a creature within 5 feet with your shield. You can add your shield\'s AC bonus to Dex saves against effects that target only you. If you succeed on a Dex save for half damage, you take no damage instead.',
    category: 'general',
  },
  {
    name: 'Skilled',
    description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    category: 'origin',
  },
  {
    name: 'Skulker',
    description: 'You can try to hide when lightly obscured. When you are hidden and miss with a ranged weapon attack, making the attack does not reveal your position. Dim light does not impose disadvantage on Perception checks relying on sight.',
    prerequisite: 'Dexterity 13 or higher',
    category: 'general',
  },
  {
    name: 'Slasher',
    description: 'Your Strength or Dexterity score increases by 1 (max 20). Once per turn, when you hit with slashing damage, you can reduce the target\'s speed by 10 feet until the start of your next turn. On a critical hit, the target has disadvantage on attack rolls until the start of your next turn.',
    category: 'general',
  },
  {
    name: 'Spell Sniper',
    description: 'When you cast a spell that requires an attack roll, the spell\'s range is doubled. Your ranged spell attacks ignore half and three-quarters cover. You learn one cantrip that requires an attack roll from any class\'s spell list.',
    prerequisite: 'Ability to cast at least one spell',
    category: 'general',
  },
  {
    name: 'Tavern Brawler',
    description: 'Your Strength or Constitution score increases by 1 (max 20). You are proficient with improvised weapons. Your unarmed strikes deal 1d4 + Strength modifier bludgeoning damage. When you hit with an unarmed strike or improvised weapon on your turn, you can use a bonus action to grapple.',
    category: 'origin',
  },
  {
    name: 'Telekinetic',
    description: 'Your Intelligence, Wisdom, or Charisma score increases by 1 (max 20). You learn Mage Hand, which is invisible and can be cast without components. As a bonus action, you can shove a creature within 30 feet 5 feet (Str save negates).',
    category: 'general',
  },
  {
    name: 'Telepathic',
    description: 'Your Intelligence, Wisdom, or Charisma score increases by 1 (max 20). You can speak telepathically to any creature within 60 feet. You can cast Detect Thoughts once per long rest without a spell slot, requiring no components.',
    category: 'general',
  },
  {
    name: 'Tough',
    description: 'Your hit point maximum increases by an amount equal to twice your level when you gain this feat. Whenever you gain a level thereafter, your hit point maximum increases by an additional 2 hit points.',
    category: 'origin',
  },
  {
    name: 'War Caster',
    description: 'You have advantage on Constitution saving throws to maintain concentration on a spell. You can perform somatic components even when you have weapons or a shield in both hands. When a creature provokes an opportunity attack, you can cast a spell at it instead.',
    prerequisite: 'Ability to cast at least one spell',
    category: 'general',
  },
  {
    name: 'Weapon Master',
    description: 'Your Strength or Dexterity score increases by 1 (max 20). You gain proficiency with four weapons of your choice. Each must be a simple or martial weapon.',
    category: 'general',
  },
]

/**
 * Get all feat names
 */
export function getFeatNames(): string[] {
  return FEATS.map((f) => f.name)
}

/**
 * Get feat by name
 */
export function getFeatByName(name: string): FeatData | undefined {
  return FEATS.find((f) => f.name === name)
}

/**
 * Get feats by category
 */
export function getFeatsByCategory(category: FeatData['category']): FeatData[] {
  return FEATS.filter((f) => f.category === category)
}
