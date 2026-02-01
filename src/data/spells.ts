import type { Spell } from '../types'

export const SPELLS: Spell[] = [
  // Cantrips (Level 0)
  {
    name: 'Fire Bolt',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You hurl a mote of fire at a creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 fire damage. A flammable object hit by this spell ignites if it isn\'t being worn or carried. This spell\'s damage increases by 1d10 when you reach 5th level (2d10), 11th level (3d10), and 17th level (4d10).',
    classes: ['Sorcerer', 'Wizard'],
  },
  {
    name: 'Light',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: false, material: true, materialDescription: 'a firefly or phosphorescent moss' },
    duration: '1 hour',
    concentration: false,
    ritual: false,
    description: 'You touch one object that is no larger than 10 feet in any dimension. Until the spell ends, the object sheds bright light in a 20-foot radius and dim light for an additional 20 feet. The light can be colored as you like. Completely covering the object with something opaque blocks the light. The spell ends if you cast it again or dismiss it as an action.',
    classes: ['Bard', 'Cleric', 'Sorcerer', 'Wizard'],
  },
  {
    name: 'Mage Hand',
    level: 0,
    school: 'conjuration',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 minute',
    concentration: false,
    ritual: false,
    description: 'A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration or until you dismiss it as an action. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again. You can use your action to control the hand and use it to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial.',
    classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
  },
  {
    name: 'Minor Illusion',
    level: 0,
    school: 'illusion',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: false, somatic: true, material: true, materialDescription: 'a bit of fleece' },
    duration: '1 minute',
    concentration: false,
    ritual: false,
    description: 'You create a sound or an image of an object within range that lasts for the duration. The illusion also ends if you dismiss it as an action or cast this spell again. If you create a sound, its volume can range from a whisper to a scream. If you create an image of an object, it must be no larger than a 5-foot cube.',
    classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
  },
  {
    name: 'Prestidigitation',
    level: 0,
    school: 'transmutation',
    castingTime: '1 action',
    range: '10 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Up to 1 hour',
    concentration: false,
    ritual: false,
    description: 'This spell is a minor magical trick that novice spellcasters use for practice. You create one of the following magical effects within range: a harmless sensory effect, light or snuff out a small flame, clean or soil a small object, chill/warm/flavor nonliving material, make a small mark or symbol appear, or create a trinket or illusory image that fits in your hand.',
    classes: ['Bard', 'Sorcerer', 'Warlock', 'Wizard'],
  },
  {
    name: 'Sacred Flame',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 radiant damage. The target gains no benefit from cover for this saving throw. The spell\'s damage increases by 1d8 when you reach 5th level (2d8), 11th level (3d8), and 17th level (4d8).',
    classes: ['Cleric'],
  },
  {
    name: 'Guidance',
    level: 0,
    school: 'divination',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    ritual: false,
    description: 'You touch one willing creature. Once before the spell ends, the target can roll a d4 and add the number rolled to one ability check of its choice. It can roll the die before or after making the ability check. The spell then ends.',
    classes: ['Cleric', 'Druid'],
  },
  {
    name: 'Eldritch Blast',
    level: 0,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A beam of crackling energy streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 force damage. The spell creates more than one beam when you reach higher levels: two beams at 5th level, three beams at 11th level, and four beams at 17th level. You can direct the beams at the same target or at different ones.',
    classes: ['Warlock'],
  },
  {
    name: 'Vicious Mockery',
    level: 0,
    school: 'enchantment',
    castingTime: '1 action',
    range: '60 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (though it need not understand you), it must succeed on a Wisdom saving throw or take 1d4 psychic damage and have disadvantage on the next attack roll it makes before the end of its next turn. This spell\'s damage increases by 1d4 when you reach 5th level (2d4), 11th level (3d4), and 17th level (4d4).',
    classes: ['Bard'],
  },
  {
    name: 'Spare the Dying',
    level: 0,
    school: 'necromancy',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You touch a living creature that has 0 hit points. The creature becomes stable. This spell has no effect on undead or constructs.',
    classes: ['Cleric'],
  },
  {
    name: 'Druidcraft',
    level: 0,
    school: 'transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'Whispering to the spirits of nature, you create one of the following effects within range: predict weather for 24 hours, make a flower bloom or seed pod open, create a harmless sensory effect, or instantly light or snuff out a small flame.',
    classes: ['Druid'],
  },
  {
    name: 'Thaumaturgy',
    level: 0,
    school: 'transmutation',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Up to 1 minute',
    concentration: false,
    ritual: false,
    description: 'You manifest a minor wonder, a sign of supernatural power. You create one of the following effects: your voice booms up to 3x louder, flames flicker or change color, you cause harmless tremors, create an instant sound, cause doors/windows to fly open or slam shut, or alter your eye appearance.',
    classes: ['Cleric'],
  },

  // Level 1 Spells
  {
    name: 'Magic Missile',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'You create three glowing darts of magical force. Each dart hits a creature of your choice that you can see within range. A dart deals 1d4 + 1 force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several. At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, the spell creates one more dart for each slot level above 1st.',
    classes: ['Sorcerer', 'Wizard'],
  },
  {
    name: 'Shield',
    level: 1,
    school: 'abjuration',
    castingTime: '1 reaction',
    range: 'Self',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 round',
    concentration: false,
    ritual: false,
    description: 'An invisible barrier of magical force appears and protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from magic missile.',
    classes: ['Sorcerer', 'Wizard'],
  },
  {
    name: 'Cure Wounds',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A creature you touch regains a number of hit points equal to 1d8 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d8 for each slot level above 1st.',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger'],
  },
  {
    name: 'Healing Word',
    level: 1,
    school: 'evocation',
    castingTime: '1 bonus action',
    range: '60 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A creature of your choice that you can see within range regains hit points equal to 1d4 + your spellcasting ability modifier. This spell has no effect on undead or constructs. At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, the healing increases by 1d4 for each slot level above 1st.',
    classes: ['Bard', 'Cleric', 'Druid'],
  },
  {
    name: 'Bless',
    level: 1,
    school: 'enchantment',
    castingTime: '1 action',
    range: '30 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a sprinkling of holy water' },
    duration: 'Concentration, up to 1 minute',
    concentration: true,
    ritual: false,
    description: 'You bless up to three creatures of your choice within range. Whenever a target makes an attack roll or a saving throw before the spell ends, the target can roll a d4 and add the number rolled to the attack roll or saving throw. At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, you can target one additional creature for each slot level above 1st.',
    classes: ['Cleric', 'Paladin'],
  },
  {
    name: 'Detect Magic',
    level: 1,
    school: 'divination',
    castingTime: '1 action',
    range: 'Self',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Concentration, up to 10 minutes',
    concentration: true,
    ritual: true,
    description: 'For the duration, you sense the presence of magic within 30 feet of you. If you sense magic in this way, you can use your action to see a faint aura around any visible creature or object in the area that bears magic, and you learn its school of magic, if any. The spell can penetrate most barriers, but it is blocked by 1 foot of stone, 1 inch of common metal, a thin sheet of lead, or 3 feet of wood or dirt.',
    classes: ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Wizard'],
  },
  {
    name: 'Sleep',
    level: 1,
    school: 'enchantment',
    castingTime: '1 action',
    range: '90 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a pinch of fine sand, rose petals, or a cricket' },
    duration: '1 minute',
    concentration: false,
    ritual: false,
    description: 'This spell sends creatures into a magical slumber. Roll 5d8; the total is how many hit points of creatures this spell can affect. Creatures within 20 feet of a point you choose within range are affected in ascending order of their current hit points (ignoring unconscious creatures). At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, roll an additional 2d8 for each slot level above 1st.',
    classes: ['Bard', 'Sorcerer', 'Wizard'],
  },
  {
    name: 'Thunderwave',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: 'Self (15-foot cube)',
    components: { verbal: true, somatic: true, material: false },
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: 'A wave of thunderous force sweeps out from you. Each creature in a 15-foot cube originating from you must make a Constitution saving throw. On a failed save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a successful save, the creature takes half as much damage and isn\'t pushed. At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d8 for each slot level above 1st.',
    classes: ['Bard', 'Druid', 'Sorcerer', 'Wizard'],
  },
  {
    name: 'Guiding Bolt',
    level: 1,
    school: 'evocation',
    castingTime: '1 action',
    range: '120 feet',
    components: { verbal: true, somatic: true, material: false },
    duration: '1 round',
    concentration: false,
    ritual: false,
    description: 'A flash of light streaks toward a creature of your choice within range. Make a ranged spell attack against the target. On a hit, the target takes 4d6 radiant damage, and the next attack roll made against this target before the end of your next turn has advantage. At Higher Levels: When you cast this spell using a spell slot of 2nd level or higher, the damage increases by 1d6 for each slot level above 1st.',
    classes: ['Cleric'],
  },
  {
    name: 'Hex',
    level: 1,
    school: 'enchantment',
    castingTime: '1 bonus action',
    range: '90 feet',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'the petrified eye of a newt' },
    duration: 'Concentration, up to 1 hour',
    concentration: true,
    ritual: false,
    description: 'You place a curse on a creature that you can see within range. Until the spell ends, you deal an extra 1d6 necrotic damage to the target whenever you hit it with an attack. Also, choose one ability when you cast the spell. The target has disadvantage on ability checks made with the chosen ability. At Higher Levels: When you cast this spell using a 3rd or 4th level slot, you can maintain concentration for up to 8 hours. With a 5th level or higher slot, up to 24 hours.',
    classes: ['Warlock'],
  },
  {
    name: 'Hunter\'s Mark',
    level: 1,
    school: 'divination',
    castingTime: '1 bonus action',
    range: '90 feet',
    components: { verbal: true, somatic: false, material: false },
    duration: 'Concentration, up to 1 hour',
    concentration: true,
    ritual: false,
    description: 'You choose a creature you can see within range and mystically mark it as your quarry. Until the spell ends, you deal an extra 1d6 damage to the target whenever you hit it with a weapon attack, and you have advantage on any Wisdom (Perception) or Wisdom (Survival) check you make to find it. If the target drops to 0 hit points before this spell ends, you can use a bonus action on a subsequent turn to mark a new creature.',
    classes: ['Ranger'],
  },
  {
    name: 'Mage Armor',
    level: 1,
    school: 'abjuration',
    castingTime: '1 action',
    range: 'Touch',
    components: { verbal: true, somatic: true, material: true, materialDescription: 'a piece of cured leather' },
    duration: '8 hours',
    concentration: false,
    ritual: false,
    description: 'You touch a willing creature who isn\'t wearing armor, and a protective magical force surrounds it until the spell ends. The target\'s base AC becomes 13 + its Dexterity modifier. The spell ends if the target dons armor or if you dismiss the spell as an action.',
    classes: ['Sorcerer', 'Wizard'],
  },
]

/**
 * Get all spells
 */
export function getAllSpells(): Spell[] {
  return SPELLS
}

/**
 * Get spells by level
 */
export function getSpellsByLevel(level: number): Spell[] {
  return SPELLS.filter((spell) => spell.level === level)
}

/**
 * Get spells available to a specific class
 */
export function getSpellsByClass(className: string): Spell[] {
  return SPELLS.filter((spell) =>
    spell.classes.some((c) => c.toLowerCase() === className.toLowerCase())
  )
}

/**
 * Get spells by level and class
 */
export function getSpellsByLevelAndClass(level: number, className: string): Spell[] {
  return SPELLS.filter(
    (spell) =>
      spell.level === level &&
      spell.classes.some((c) => c.toLowerCase() === className.toLowerCase())
  )
}

/**
 * Search spells by name
 */
export function searchSpells(query: string): Spell[] {
  const lowerQuery = query.toLowerCase()
  return SPELLS.filter((spell) => spell.name.toLowerCase().includes(lowerQuery))
}

/**
 * Get a spell by name
 */
export function getSpellByName(name: string): Spell | undefined {
  return SPELLS.find((spell) => spell.name.toLowerCase() === name.toLowerCase())
}
