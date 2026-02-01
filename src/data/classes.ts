import type { AbilityName, ClassFeature } from '../types'

export interface Subclass {
  name: string
  description: string
  features: ClassFeature[]
}

export interface ClassData {
  name: string
  hitDie: number
  primaryAbility: AbilityName
  savingThrows: AbilityName[]
  armorProficiencies: string[]
  weaponProficiencies: string[]
  spellcastingAbility?: AbilityName
  classFeatures: ClassFeature[]
  subclassLevel?: number
  subclassName?: string // e.g., "Primal Path", "Bard College"
  subclasses?: Subclass[]
}

export const CLASSES: ClassData[] = [
  {
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    classFeatures: [
      { name: 'Rage', level: 1, description: 'Enter a battle fury that gives you Advantage on Strength checks and saving throws, bonus damage on melee attacks, and resistance to Bludgeoning, Piercing, and Slashing damage. Lasts 10 minutes or until you end it.' },
      { name: 'Unarmored Defense', level: 1, description: 'While not wearing armor, your AC equals 10 + Dexterity modifier + Constitution modifier. You can use a shield and still gain this benefit.' },
      { name: 'Danger Sense', level: 2, description: 'You have Advantage on Dexterity saving throws against effects you can see, such as traps and spells. You cannot be Blinded, Deafened, or Incapacitated to gain this benefit.' },
      { name: 'Reckless Attack', level: 2, description: 'When you make your first attack on your turn, you can decide to attack recklessly. Doing so gives you Advantage on melee weapon attack rolls using Strength during this turn, but attack rolls against you have Advantage until your next turn.' },
      { name: 'Primal Knowledge', level: 3, description: 'You gain proficiency in one skill of your choice from the Barbarian skill list.' },
      { name: 'Primal Path', level: 3, description: 'Choose a Primal Path that shapes the nature of your rage: Path of the Berserker, Path of the Wild Heart, Path of the World Tree, or Path of the Zealot.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { name: 'Fast Movement', level: 5, description: 'Your speed increases by 10 feet while you are not wearing Heavy armor.' },
      { name: 'Subclass Feature', level: 6, description: 'You gain a feature from your Primal Path subclass.' },
      { name: 'Feral Instinct', level: 7, description: 'Your instincts are so honed that you have Advantage on Initiative rolls. Additionally, if you are surprised at the beginning of combat and aren\'t Incapacitated, you can act normally on your first turn if you enter your Rage before doing anything else on that turn.' },
      { name: 'Instinctive Pounce', level: 7, description: 'As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Brutal Strike', level: 9, description: 'When you hit a creature with a melee weapon while Raging, you can forgo the bonus damage from Rage for that attack and instead cause the target to have Disadvantage on Strength checks and saving throws until the start of your next turn.' },
      { name: 'Subclass Feature', level: 10, description: 'You gain a feature from your Primal Path subclass.' },
      { name: 'Relentless Rage', level: 11, description: 'Your Rage can keep you fighting despite grievous wounds. If you drop to 0 Hit Points while Raging and don\'t die outright, you can make a DC 10 Constitution saving throw. If you succeed, your Hit Points instead change to a number equal to twice your Barbarian level. Each time you use this feature, the DC increases by 5. The DC resets to 10 when you finish a Short or Long Rest.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Improved Brutal Strike', level: 13, description: 'You have honed your Brutal Strike to devastating effect. When you use Brutal Strike, you can choose one of the following additional effects: Staggering Blow (the target has Disadvantage on the next attack roll it makes before the start of your next turn) or Sundering Blow (you deal extra damage equal to your Rage Damage bonus to the target).' },
      { name: 'Subclass Feature', level: 14, description: 'You gain a feature from your Primal Path subclass.' },
      { name: 'Persistent Rage', level: 15, description: 'Your Rage is so fierce that it only ends early if you fall Unconscious or choose to end it. Additionally, if you would be Charmed or Frightened while Raging, you can use your Reaction to maintain your Rage and become immune to the Charmed or Frightened condition for the duration of your Rage.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Improved Brutal Strike', level: 17, description: 'Your Brutal Strike becomes even more devastating. When you use Brutal Strike, you can now choose two effects from the list instead of one.' },
      { name: 'Indomitable Might', level: 18, description: 'If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Primal Champion', level: 20, description: 'You embody the power of the wilds. Your Strength and Constitution scores increase by 4. Your maximum for those scores is now 25.' },
    ],
    subclassLevel: 3,
    subclassName: 'Primal Path',
    subclasses: [
      {
        name: 'Path of the Berserker',
        description: 'For some barbarians, rage is a means to an end—that end being violence.',
        features: [
          { name: 'Frenzy', level: 3, description: 'You can go into a Frenzy when you Rage. While Frenzied, you can make one extra attack as part of the Attack action on each of your turns.' },
        ],
      },
      {
        name: 'Path of the Totem Warrior',
        description: 'The Path of the Totem Warrior is a spiritual journey, as you accept a spirit animal as your guide.',
        features: [
          { name: 'Spirit Seeker', level: 3, description: 'You gain the ability to cast Beast Sense and Speak with Animals as rituals.' },
          { name: 'Totem Spirit', level: 3, description: 'Choose a totem animal and gain its power while raging. Bear: resistance to all damage except psychic. Eagle: Dash as bonus action, opportunity attacks against you have disadvantage. Wolf: Allies have advantage on melee attacks against enemies within 5 feet of you.' },
        ],
      },
    ],
  },
  {
    name: 'Bard',
    hitDie: 8,
    primaryAbility: 'charisma',
    savingThrows: ['dexterity', 'charisma'],
    armorProficiencies: ['Light'],
    weaponProficiencies: ['Simple'],
    spellcastingAbility: 'charisma',
    classFeatures: [
      { name: 'Bardic Inspiration', level: 1, description: 'You can inspire others through stirring words or music. As a Bonus Action, give one creature within 60 feet an Inspiration die (d6). Once within 10 minutes, the creature can roll it and add the number rolled to one ability check, attack roll, or saving throw it makes.' },
      { name: 'Spellcasting', level: 1, description: 'You have learned to untangle and reshape the fabric of reality in harmony with your wishes and music. Charisma is your spellcasting ability.' },
      { name: 'Expertise', level: 2, description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.' },
      { name: 'Jack of All Trades', level: 2, description: 'You can add half your proficiency bonus, rounded down, to any ability check you make that does not already include your proficiency bonus.' },
      { name: 'Bard College', level: 3, description: 'Choose a Bard College that shapes your bardic abilities: College of Dance, College of Glamour, College of Lore, or College of Valor.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Font of Inspiration', level: 5, description: 'You regain all expended uses of Bardic Inspiration when you finish a Short or Long Rest.' },
      { name: 'Subclass Feature', level: 6, description: 'You gain a feature from your Bard College subclass.' },
      { name: 'Countercharm', level: 7, description: 'You can use musical notes or words of power to disrupt mind-influencing effects. As a Magic action, you can start a performance that lasts until the end of your next turn. During that time, you and any friendly creatures within 30 feet have Advantage on saving throws against being Charmed or Frightened.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Expertise', level: 9, description: 'Choose two more of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.' },
      { name: 'Magical Secrets', level: 10, description: 'You have plundered magical knowledge from a wide spectrum of disciplines. Choose two spells from any spell lists. The spells you choose must be of a level you can cast. The chosen spells count as Bard spells for you.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 14, description: 'You gain a feature from your Bard College subclass.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Superior Inspiration', level: 18, description: 'When you roll Initiative and have no uses of Bardic Inspiration left, you regain two expended uses of it.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Words of Creation', level: 20, description: 'You have mastered two of the words that were spoken when the world came into being. Whenever you use Bardic Inspiration, you can choose to use one of these words: Vox Anima (the creature regains 2d10 Hit Points) or Vox Potentis (the creature can roll the Bardic Inspiration die twice and use either roll).' },
    ],
    subclassLevel: 3,
    subclassName: 'Bard College',
    subclasses: [
      {
        name: 'College of Lore',
        description: 'Bards of the College of Lore know something about most things.',
        features: [
          { name: 'Bonus Proficiencies', level: 3, description: 'You gain proficiency with three skills of your choice.' },
          { name: 'Cutting Words', level: 3, description: 'When a creature you can see within 60 feet makes an attack roll, ability check, or damage roll, you can use your reaction to expend one use of your Bardic Inspiration to subtract the number rolled from the creature\'s roll.' },
        ],
      },
      {
        name: 'College of Valor',
        description: 'Bards of the College of Valor are daring skalds whose tales keep alive the memory of the great heroes of the past.',
        features: [
          { name: 'Bonus Proficiencies', level: 3, description: 'You gain proficiency with medium armor, shields, and martial weapons.' },
          { name: 'Combat Inspiration', level: 3, description: 'A creature that has a Bardic Inspiration die from you can roll that die and add the number rolled to a weapon damage roll it just made, or add it to their AC until the start of your next turn.' },
        ],
      },
    ],
  },
  {
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: 'wisdom',
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple'],
    spellcastingAbility: 'wisdom',
    classFeatures: [
      { name: 'Spellcasting', level: 1, description: 'You have learned to draw on divine magic through meditation and prayer. Wisdom is your spellcasting ability.' },
      { name: 'Divine Order', level: 1, description: 'Choose Protector (gain proficiency with Martial weapons and training with Heavy armor) or Thaumaturge (gain one cantrip from the Cleric spell list and proficiency in Religion).' },
      { name: 'Channel Divinity', level: 2, description: 'You gain the ability to channel divine energy directly from your deity, using it to fuel magical effects. You start with Divine Spark and Turn Undead.' },
      { name: 'Divine Domain', level: 3, description: 'Choose a Divine Domain that grants you features: Life Domain, Light Domain, Trickery Domain, or War Domain.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Sear Undead', level: 5, description: 'When you use Turn Undead, you can roll a number of d8s equal to your Wisdom modifier and add the rolls together. Each Undead that fails its saving throw takes Radiant damage equal to the roll.' },
      { name: 'Subclass Feature', level: 6, description: 'You gain a feature from your Divine Domain subclass.' },
      { name: 'Channel Divinity', level: 6, description: 'You can now use Channel Divinity twice between rests. When you finish a Short or Long Rest, you regain your expended uses.' },
      { name: 'Blessed Strikes', level: 7, description: 'Divine power infuses your strikes. When you hit a creature with a weapon attack or cantrip, you can deal an extra 1d8 Radiant damage. You can use this feature a number of times equal to your Wisdom modifier (minimum once). You regain all expended uses when you finish a Long Rest.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Divine Intervention', level: 10, description: 'You can call on your deity to intervene on your behalf. As a Magic action, describe the assistance you seek, and roll a d100. If you roll a number equal to or lower than your Cleric level, your deity intervenes. If successful, you can\'t use this feature again for 7 days; otherwise, you can use it again after a Long Rest.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Improved Blessed Strikes', level: 14, description: 'Your Blessed Strikes become more potent. The extra damage from Blessed Strikes increases to 2d8 Radiant damage.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 17, description: 'You gain a feature from your Divine Domain subclass.' },
      { name: 'Channel Divinity', level: 18, description: 'You can now use Channel Divinity three times between rests. When you finish a Short or Long Rest, you regain your expended uses.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Greater Divine Intervention', level: 20, description: 'Your call for divine intervention automatically succeeds. When you use Divine Intervention, choose the Cleric spell of level 5 or lower or the Wish spell. The spell doesn\'t require any components and takes effect as part of the Magic action to use Divine Intervention.' },
    ],
    subclassLevel: 3,
    subclassName: 'Divine Domain',
    subclasses: [
      {
        name: 'Life Domain',
        description: 'The Life domain focuses on the vibrant positive energy that sustains all life.',
        features: [
          { name: 'Disciple of Life', level: 3, description: 'Your healing spells are more effective. Whenever you use a spell of 1st level or higher to restore hit points, the creature regains additional hit points equal to 2 + the spell\'s level.' },
        ],
      },
      {
        name: 'Light Domain',
        description: 'Gods of light promote ideals of rebirth and renewal, truth, vigilance, and beauty.',
        features: [
          { name: 'Warding Flare', level: 3, description: 'When you are attacked by a creature within 30 feet, you can use your reaction to impose disadvantage on the attack roll by causing light to flare before the attacker.' },
        ],
      },
    ],
  },
  {
    name: 'Druid',
    hitDie: 8,
    primaryAbility: 'wisdom',
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple'],
    spellcastingAbility: 'wisdom',
    classFeatures: [
      { name: 'Druidic', level: 1, description: 'You know Druidic, the secret language of druids. You can speak the language and use it to leave hidden messages.' },
      { name: 'Primal Order', level: 1, description: 'Choose Magician (gain one cantrip from the Druid spell list and proficiency in Arcana) or Warden (gain proficiency with Martial weapons and training with Medium armor).' },
      { name: 'Spellcasting', level: 1, description: 'Drawing on the divine essence of nature, you can cast spells to shape that essence to your will. Wisdom is your spellcasting ability.' },
      { name: 'Wild Companion', level: 2, description: 'You can summon a nature spirit that assumes an animal form to aid you. As a Magic action, you can expend a spell slot to cast Find Familiar without Material components.' },
      { name: 'Wild Shape', level: 2, description: 'You can use your action to magically assume the shape of a beast that you have seen before. You can stay in beast shape for a number of hours equal to half your druid level.' },
      { name: 'Druid Circle', level: 3, description: 'Choose a Druid Circle: Circle of the Land, Circle of the Moon, Circle of the Sea, or Circle of the Stars.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Wild Resurgence', level: 5, description: 'Once per turn when you enter your Wild Shape, you regain one expended spell slot, but the slot must be level 1.' },
      { name: 'Subclass Feature', level: 6, description: 'You gain a feature from your Druid Circle.' },
      { name: 'Elemental Fury', level: 7, description: 'The might of the elements flows through you. You gain one of the following options of your choice: Potent Spellcasting (you add your Wisdom modifier to the damage you deal with any Druid cantrip) or Primal Strike (once on each of your turns when you hit a creature with an attack roll using a weapon or an Unarmed Strike while in Wild Shape, you can cause the target to take an extra 1d8 Cold, Fire, Lightning, or Thunder damage).' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 10, description: 'You gain a feature from your Druid Circle.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 14, description: 'You gain a feature from your Druid Circle.' },
      { name: 'Improved Elemental Fury', level: 15, description: 'Your Elemental Fury feature becomes more powerful. If you chose Potent Spellcasting, you add your Wisdom modifier to the damage of your Druid cantrips twice. If you chose Primal Strike, the extra damage increases to 2d8.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Beast Spells', level: 18, description: 'You can cast many of your Druid spells in any shape you assume using Wild Shape. You can perform the Somatic and Verbal components of a Druid spell while in a Wild Shape form, but you cannot provide Material components.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Archdruid', level: 20, description: 'The vitality of nature constantly blooms within you. You have a pool of healing power with the max equal to ten times your Druid level. As a Bonus Action, you can regain hit points from the pool. You also gain unlimited uses of Wild Shape, and you can ignore Verbal, Somatic, and Material components of Druid spells.' },
    ],
    subclassLevel: 3,
    subclassName: 'Druid Circle',
    subclasses: [
      {
        name: 'Circle of the Land',
        description: 'The Circle of the Land is made up of mystics and sages who safeguard ancient knowledge and rites.',
        features: [
          { name: 'Circle Spells', level: 3, description: 'Your mystical connection to the land grants you certain spells. Choose a terrain type; you gain access to its associated spells.' },
          { name: 'Land\'s Aid', level: 3, description: 'As a Magic action, you can expend a use of Wild Shape and choose a point within 60 feet. Vitality-giving flowers appear that heal creatures of your choice for 2d6 hit points.' },
        ],
      },
      {
        name: 'Circle of the Moon',
        description: 'Druids of the Circle of the Moon are fierce guardians of the wilds.',
        features: [
          { name: 'Combat Wild Shape', level: 3, description: 'You can use Wild Shape as a Bonus Action. While transformed, you can use a Bonus Action to expend a spell slot and regain 1d8 hit points per spell slot level.' },
          { name: 'Circle Forms', level: 3, description: 'You can transform into beasts with a CR as high as 1. At 6th level, this increases to your druid level divided by 3.' },
        ],
      },
    ],
  },
  {
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    armorProficiencies: ['Light', 'Medium', 'Heavy', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    classFeatures: [
      { name: 'Fighting Style', level: 1, description: 'You adopt a particular style of fighting as your specialty. Choose a Fighting Style feat.' },
      { name: 'Second Wind', level: 1, description: 'You have a limited well of stamina. As a Bonus Action, you can regain hit points equal to 1d10 + your Fighter level. You can use this feature a number of times equal to your proficiency bonus.' },
      { name: 'Weapon Mastery', level: 1, description: 'You have achieved a degree of mastery with the weapons you use. Choose 3 weapons with Mastery properties. You can use the Mastery property of these weapons.' },
      { name: 'Action Surge', level: 2, description: 'You can push yourself beyond your normal limits for a moment. On your turn, you can take one additional action. Once you use this feature, you must finish a Short or Long Rest before you can use it again.' },
      { name: 'Tactical Mind', level: 2, description: 'You have a mind for tactics. When you fail an ability check, you can expend a use of Second Wind to add a d10 to the roll, potentially turning the failure into a success.' },
      { name: 'Fighter Subclass', level: 3, description: 'Choose a Martial Archetype: Battle Master, Champion, Eldritch Knight, or Psi Warrior.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { name: 'Tactical Shift', level: 5, description: 'Whenever you activate your Second Wind, you can move up to half your Speed without provoking Opportunity Attacks.' },
      { name: 'Ability Score Improvement', level: 6, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 7, description: 'You gain a feature from your Martial Archetype subclass.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Indomitable', level: 9, description: 'You can reroll a saving throw that you fail. If you do so, you must use the new roll, and you can\'t use this feature again until you finish a Long Rest. You can use this feature once between Long Rests.' },
      { name: 'Tactical Master', level: 9, description: 'When you attack with a weapon whose Mastery property you can use, you can replace that property with the Push, Sap, or Slow property for that attack.' },
      { name: 'Subclass Feature', level: 10, description: 'You gain a feature from your Martial Archetype subclass.' },
      { name: 'Two Extra Attacks', level: 11, description: 'You can attack three times whenever you take the Attack action on your turn.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Indomitable', level: 13, description: 'You can now use Indomitable twice between Long Rests.' },
      { name: 'Studied Attacks', level: 13, description: 'You study your opponents and learn from each attack you make. If you make an attack roll against a creature and miss, you have Advantage on your next attack roll against that creature before the end of your next turn.' },
      { name: 'Ability Score Improvement', level: 14, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 15, description: 'You gain a feature from your Martial Archetype subclass.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Action Surge', level: 17, description: 'You can now use Action Surge twice before a rest, but only once per turn.' },
      { name: 'Indomitable', level: 17, description: 'You can now use Indomitable three times between Long Rests.' },
      { name: 'Subclass Feature', level: 18, description: 'You gain a feature from your Martial Archetype subclass.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Three Extra Attacks', level: 20, description: 'You can attack four times whenever you take the Attack action on your turn.' },
    ],
    subclassLevel: 3,
    subclassName: 'Martial Archetype',
    subclasses: [
      {
        name: 'Champion',
        description: 'The archetypal Champion focuses on raw physical power.',
        features: [
          { name: 'Improved Critical', level: 3, description: 'Your weapon attacks score a critical hit on a roll of 19 or 20.' },
        ],
      },
      {
        name: 'Battle Master',
        description: 'Those who emulate the Battle Master employ martial techniques passed down through generations.',
        features: [
          { name: 'Combat Superiority', level: 3, description: 'You learn maneuvers fueled by special dice called superiority dice. You have four superiority dice (d8s) and know three maneuvers.' },
        ],
      },
    ],
  },
  {
    name: 'Monk',
    hitDie: 8,
    primaryAbility: 'dexterity',
    savingThrows: ['strength', 'dexterity'],
    armorProficiencies: [],
    weaponProficiencies: ['Simple', 'Martial (with Monk weapon property)'],
    classFeatures: [
      { name: 'Martial Arts', level: 1, description: 'You can use Dexterity instead of Strength for unarmed strikes and monk weapons. You can roll a d6 in place of normal damage for unarmed strikes. When you take the Attack action with an unarmed strike or monk weapon, you can make one unarmed strike as a Bonus Action.' },
      { name: 'Unarmored Defense', level: 1, description: 'While not wearing armor or wielding a Shield, your AC equals 10 + your Dexterity modifier + your Wisdom modifier.' },
      { name: 'Focus Points', level: 2, description: 'You have 2 Focus Points. You can spend these points to fuel various ki features. You regain all expended Focus Points when you finish a Short or Long Rest.' },
      { name: 'Unarmored Movement', level: 2, description: 'Your speed increases by 10 feet while you are not wearing armor or wielding a Shield.' },
      { name: 'Uncanny Metabolism', level: 2, description: 'When you roll Initiative, you can regain all expended Focus Points. Once you use this feature, you cannot use it again until you finish a Long Rest.' },
      { name: 'Deflect Attacks', level: 3, description: 'When you are hit by an attack that deals Bludgeoning, Piercing, or Slashing damage, you can use your Reaction to reduce the damage by 1d10 + Dexterity modifier + Monk level.' },
      { name: 'Monk Subclass', level: 3, description: 'Choose a Monastic Tradition: Warrior of Mercy, Warrior of Shadow, Warrior of the Elements, or Warrior of the Open Hand.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Slow Fall', level: 4, description: 'You can use your Reaction when you fall to reduce any falling damage you take by an amount equal to five times your Monk level.' },
      { name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { name: 'Stunning Strike', level: 5, description: 'When you hit a creature with a Monk weapon or unarmed strike, you can spend 1 Focus Point to attempt a stunning strike. The target must succeed on a Constitution saving throw or be Stunned until the start of your next turn.' },
      { name: 'Subclass Feature', level: 6, description: 'You gain a feature from your Monastic Tradition subclass.' },
      { name: 'Unarmored Movement', level: 6, description: 'Your speed increases by 15 feet while you are not wearing armor or wielding a Shield.' },
      { name: 'Evasion', level: 7, description: 'When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Acrobatic Movement', level: 9, description: 'While you are not wearing armor or wielding a Shield, you gain the ability to move along vertical surfaces and across liquids on your turn without falling during the movement.' },
      { name: 'Heightened Focus', level: 10, description: 'Your Focus Points increase to match your Monk level. Additionally, when you spend a Focus Point, you can roll a d4 and regain a number of Focus Points equal to the number rolled. You can use this feature once, and regain the ability to do so when you finish a Short or Long Rest.' },
      { name: 'Self-Restoration', level: 10, description: 'Through sheer force of will, you can remove one of the following conditions from yourself at the end of each of your turns: Charmed, Frightened, or Poisoned. Additionally, you are immune to disease.' },
      { name: 'Unarmored Movement', level: 10, description: 'Your speed increases by 20 feet while you are not wearing armor or wielding a Shield.' },
      { name: 'Subclass Feature', level: 11, description: 'You gain a feature from your Monastic Tradition subclass.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Deflect Energy', level: 13, description: 'You can now use your Deflect Attacks feature against attacks that deal any damage type, not just Bludgeoning, Piercing, or Slashing.' },
      { name: 'Disciplined Survivor', level: 14, description: 'You gain proficiency in all saving throws. Additionally, whenever you make a saving throw and fail, you can spend 1 Focus Point to reroll it, and you must use the new roll.' },
      { name: 'Unarmored Movement', level: 14, description: 'Your speed increases by 25 feet while you are not wearing armor or wielding a Shield.' },
      { name: 'Perfect Focus', level: 15, description: 'When you roll Initiative and have fewer than 4 Focus Points remaining, you regain Focus Points until you have 4.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 17, description: 'You gain a feature from your Monastic Tradition subclass.' },
      { name: 'Superior Defense', level: 18, description: 'If your total for a Dexterity saving throw is less than your Dexterity score, you can use that score in place of the total. Additionally, while you have 0 Focus Points, your AC increases by 2.' },
      { name: 'Unarmored Movement', level: 18, description: 'Your speed increases by 30 feet while you are not wearing armor or wielding a Shield.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Body and Mind', level: 20, description: 'You have developed your body and mind to their pinnacle. Your Dexterity and Wisdom scores increase by 4. Your maximum for those scores is now 25.' },
    ],
  },
  {
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['Light', 'Medium', 'Heavy', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    spellcastingAbility: 'charisma',
    classFeatures: [
      { name: 'Lay on Hands', level: 1, description: 'Your blessed touch can heal wounds. You have a pool of healing power that replenishes when you take a Long Rest. With that pool, you can restore a total number of Hit Points equal to your Paladin level times 5.' },
      { name: 'Spellcasting', level: 1, description: 'You have learned to draw on divine magic through meditation and prayer. Charisma is your spellcasting ability.' },
      { name: 'Weapon Mastery', level: 1, description: 'You have achieved a degree of mastery with weapons. Choose 2 weapons with Mastery properties to gain their Mastery benefits.' },
      { name: 'Divine Smite', level: 2, description: 'When you hit a creature with a melee weapon attack, you can expend one spell slot to deal Radiant damage to the target, in addition to the weapon\'s damage. The extra damage is 2d8 for a 1st-level slot, plus 1d8 for each spell level higher than 1st.' },
      { name: 'Fighting Style', level: 2, description: 'You adopt a particular style of fighting as your specialty. Choose a Fighting Style feat.' },
      { name: 'Channel Divinity', level: 3, description: 'You gain the ability to channel divine energy, using it to fuel magical effects. You start with Divine Sense.' },
      { name: 'Paladin Subclass', level: 3, description: 'Choose a Sacred Oath: Oath of Devotion, Oath of Glory, Oath of the Ancients, or Oath of Vengeance.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { name: 'Faithful Steed', level: 5, description: 'You can cast Find Steed without expending a spell slot. You can also cast it normally.' },
      { name: 'Aura of Protection', level: 6, description: 'Whenever you or a friendly creature within 10 feet of you must make a saving throw, the creature gains a bonus to the saving throw equal to your Charisma modifier (minimum bonus of +1). You must be conscious to grant this bonus.' },
      { name: 'Subclass Feature', level: 7, description: 'You gain a feature from your Sacred Oath.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Abjure Foes', level: 9, description: 'As a Magic action, you can expend one use of your Channel Divinity to overwhelm foes with awe. Each creature of your choice that you can see within 60 feet of you must make a Wisdom saving throw. On a failed save, the creature has the Frightened condition for 1 minute or until it takes any damage. While Frightened in this way, the creature\'s Speed is 0.' },
      { name: 'Aura of Courage', level: 10, description: 'You and your allies are immune to the Frightened condition while within 10 feet of you. If a Frightened ally enters the aura, that ally\'s Frightened condition is suspended while in the aura.' },
      { name: 'Radiant Strikes', level: 11, description: 'Your strikes now carry divine energy. Once on each of your turns when you hit a creature with a melee weapon or an Unarmed Strike, you can cause that hit to deal an extra 1d8 Radiant damage.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Restoring Touch', level: 14, description: 'When you use Lay on Hands on a creature, you can also remove one or more of the following conditions from the creature: Blinded, Charmed, Deafened, Frightened, Paralyzed, or Stunned. You must expend 5 Hit Points from the healing pool for each condition you remove.' },
      { name: 'Subclass Feature', level: 15, description: 'You gain a feature from your Sacred Oath.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Aura Expansion', level: 18, description: 'Your Aura of Protection and Aura of Courage now extend to 30 feet instead of 10 feet.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 20, description: 'You gain a feature from your Sacred Oath.' },
    ],
  },
  {
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: 'dexterity',
    savingThrows: ['strength', 'dexterity'],
    armorProficiencies: ['Light', 'Medium', 'Shields'],
    weaponProficiencies: ['Simple', 'Martial'],
    spellcastingAbility: 'wisdom',
    classFeatures: [
      { name: 'Favored Enemy', level: 1, description: 'You can cast Hunter\'s Mark a number of times equal to your Wisdom modifier without expending a spell slot.' },
      { name: 'Spellcasting', level: 1, description: 'You have learned to use the magical essence of nature to cast spells. Wisdom is your spellcasting ability.' },
      { name: 'Weapon Mastery', level: 1, description: 'You have achieved a degree of mastery with weapons. Choose 2 weapons with Mastery properties to gain their Mastery benefits.' },
      { name: 'Deft Explorer', level: 2, description: 'You gain Expertise in one of your skill proficiencies. Your walking speed increases by 10 feet while you are not wearing Heavy armor.' },
      { name: 'Fighting Style', level: 2, description: 'You adopt a particular style of fighting as your specialty. Choose a Fighting Style feat.' },
      { name: 'Ranger Subclass', level: 3, description: 'Choose a Ranger Conclave: Beast Master, Fey Wanderer, Gloom Stalker, or Hunter.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Extra Attack', level: 5, description: 'You can attack twice, instead of once, whenever you take the Attack action on your turn.' },
      { name: 'Roving', level: 6, description: 'Your walking speed increases by 10 feet while you aren\'t wearing Heavy armor. You also have a Climb speed and a Swim speed equal to your walking speed.' },
      { name: 'Subclass Feature', level: 7, description: 'You gain a feature from your Ranger subclass.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Expertise', level: 9, description: 'Choose two more of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.' },
      { name: 'Tireless', level: 10, description: 'Primal forces now help fuel you on every journey. As an action, you can give yourself a number of Temporary Hit Points equal to 1d8 plus your Wisdom modifier (minimum 1). You can use this action a number of times equal to your Wisdom modifier (minimum 1), and you regain all expended uses when you finish a Long Rest. In addition, whenever you finish a Short Rest, your Exhaustion level is reduced by 1.' },
      { name: 'Subclass Feature', level: 11, description: 'You gain a feature from your Ranger subclass.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Relentless Hunter', level: 13, description: 'Taking damage can\'t break your Concentration on Hunter\'s Mark.' },
      { name: 'Nature\'s Veil', level: 14, description: 'You invoke spirits of nature to magically hide yourself. As a Bonus Action, you can give yourself the Invisible condition until the end of your next turn. You can use this feature a number of times equal to your Wisdom modifier (minimum 1), and you regain all expended uses when you finish a Long Rest.' },
      { name: 'Subclass Feature', level: 15, description: 'You gain a feature from your Ranger subclass.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Precise Hunter', level: 17, description: 'You have Advantage on attack rolls against the creature currently marked by your Hunter\'s Mark.' },
      { name: 'Feral Senses', level: 18, description: 'Your connection to the forces of nature grants you supernatural senses. You have Blindsight with a range of 30 feet.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Foe Slayer', level: 20, description: 'You become an unparalleled hunter of your enemies. Once per turn when you hit the creature marked by your Hunter\'s Mark, you can deal extra damage equal to your Wisdom modifier to that creature. This damage is the same type as the weapon\'s damage.' },
    ],
  },
  {
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: 'dexterity',
    savingThrows: ['dexterity', 'intelligence'],
    armorProficiencies: ['Light'],
    weaponProficiencies: ['Simple', 'Martial (with Finesse or Light property)'],
    classFeatures: [
      { name: 'Expertise', level: 1, description: 'Choose two of your skill proficiencies. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.' },
      { name: 'Sneak Attack', level: 1, description: 'Once per turn, you can deal extra 1d6 damage to one creature you hit with an attack if you have Advantage on the attack roll, or if another enemy of the target is within 5 feet of it. The attack must use a Finesse or a Ranged weapon.' },
      { name: 'Thieves\' Cant', level: 1, description: 'You know Thieves\' Cant, a secret mix of dialect, jargon, and code that allows you to hide messages in seemingly normal conversation.' },
      { name: 'Weapon Mastery', level: 1, description: 'You have achieved a degree of mastery with weapons. Choose 2 weapons with Mastery properties to gain their Mastery benefits.' },
      { name: 'Cunning Action', level: 2, description: 'Your quick thinking and agility allow you to move and act quickly. You can take a Bonus Action on each of your turns in combat to take the Dash, Disengage, or Hide action.' },
      { name: 'Rogue Subclass', level: 3, description: 'Choose a Roguish Archetype: Arcane Trickster, Assassin, Soulknife, or Thief.' },
      { name: 'Steady Aim', level: 3, description: 'As a Bonus Action, you give yourself Advantage on your next attack roll on the current turn. You can use this feature only if you haven\'t moved during this turn, and after you use it your speed is 0 until the end of the turn.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Cunning Strike', level: 5, description: 'You have developed cunning ways to use your Sneak Attack. When you deal Sneak Attack damage, you can add certain effects (such as Disarm, Poison, Trip, or Withdraw) by forfeiting some of your Sneak Attack dice.' },
      { name: 'Uncanny Dodge', level: 5, description: 'When an attacker that you can see hits you with an attack, you can use your Reaction to halve the attack\'s damage against you.' },
      { name: 'Expertise', level: 6, description: 'Choose two more of your skill proficiencies or one skill proficiency and your proficiency with Thieves\' Tools. Your proficiency bonus is doubled for any ability check you make that uses either of the chosen proficiencies.' },
      { name: 'Evasion', level: 7, description: 'When you are subjected to an effect that allows you to make a Dexterity saving throw to take only half damage, you instead take no damage if you succeed on the saving throw, and only half damage if you fail.' },
      { name: 'Subclass Feature', level: 7, description: 'You gain a feature from your Roguish Archetype.' },
      { name: 'Ability Score Improvement', level: 8, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Ability Score Improvement', level: 10, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Reliable Talent', level: 11, description: 'Whenever you make an ability check that uses one of your skill or tool proficiencies, you can treat a d20 roll of 9 or lower as a 10.' },
      { name: 'Ability Score Improvement', level: 12, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Subclass Feature', level: 13, description: 'You gain a feature from your Roguish Archetype.' },
      { name: 'Subtle Strikes', level: 13, description: 'When you attack, you know how to exploit a target\'s distraction. You have Advantage on any attack roll that targets a creature that is within 5 feet of at least one of your allies who isn\'t Incapacitated.' },
      { name: 'Devious Strikes', level: 14, description: 'You have practiced new ways to use your Sneak Attack. When you deal Sneak Attack damage, you can add one of the following Devious Strikes effects: Daze, Knock Out, or Obscure. These effects cost Sneak Attack dice but provide powerful options.' },
      { name: 'Slippery Mind', level: 15, description: 'Your cunning mind has grown harder to influence. You gain proficiency in Wisdom saving throws.' },
      { name: 'Ability Score Improvement', level: 16, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Elusive', level: 18, description: 'You are so evasive that attackers rarely gain the upper hand against you. No attack roll can have Advantage against you unless you have the Incapacitated condition.' },
      { name: 'Ability Score Improvement', level: 19, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Stroke of Luck', level: 20, description: 'You have an uncanny knack for succeeding when you need to. If you fail a d20 Test, you can turn the roll into a 20. Once you use this feature, you can\'t do so again until you finish a Short or Long Rest.' },
    ],
  },
  {
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: 'charisma',
    savingThrows: ['constitution', 'charisma'],
    armorProficiencies: [],
    weaponProficiencies: ['Simple'],
    spellcastingAbility: 'charisma',
    classFeatures: [
      { name: 'Innate Sorcery', level: 1, description: 'An event in your past left an indelible mark on you, infusing you with simmering magic. As a Bonus Action, you can unleash that magic for 1 minute, during which you gain Advantage on the attack rolls of Sorcerer spells, and your Spell Save DC increases by 1.' },
      { name: 'Spellcasting', level: 1, description: 'An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with Arcane Magic. Charisma is your spellcasting ability.' },
      { name: 'Font of Magic', level: 2, description: 'You can tap into a deep wellspring of magic within yourself. You have 2 Sorcery Points. You can use Sorcery Points to gain additional spell slots, or sacrifice spell slots to gain additional Sorcery Points.' },
      { name: 'Metamagic', level: 2, description: 'You can twist your spells to suit your needs. You learn two Metamagic options of your choice. You can use only one Metamagic option on a spell when you cast it, unless otherwise noted.' },
      { name: 'Sorcerer Subclass', level: 3, description: 'Choose a Sorcerous Origin: Aberrant Sorcery, Clockwork Sorcery, Draconic Sorcery, or Wild Magic Sorcery.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Sorcerous Restoration', level: 5, description: 'When you finish a Short Rest, you can regain expended Sorcery Points. The number of Sorcery Points you regain cannot exceed half your Sorcerer level (rounded down).' },
    ],
  },
  {
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: 'charisma',
    savingThrows: ['wisdom', 'charisma'],
    armorProficiencies: ['Light'],
    weaponProficiencies: ['Simple'],
    spellcastingAbility: 'charisma',
    classFeatures: [
      { name: 'Eldritch Invocations', level: 1, description: 'In your study of occult lore, you have unearthed Eldritch Invocations, fragments of forbidden knowledge that imbue you with an abiding magical ability. You learn one invocation of your choice.' },
      { name: 'Pact Magic', level: 1, description: 'Through occult ceremony, you have formed a pact with a mysterious entity to gain magical powers. Charisma is your spellcasting ability. You regain all expended spell slots when you finish a Short or Long Rest.' },
      { name: 'Magical Cunning', level: 2, description: 'If all your Pact Magic spell slots are expended, you can perform an esoteric rite for 1 minute, at the end of which you regain half of those spell slots (rounded up). Once you use this feature, you can\'t do so again until you finish a Long Rest.' },
      { name: 'Warlock Subclass', level: 3, description: 'Choose an Otherworldly Patron: Archfey Patron, Celestial Patron, Fiend Patron, or Great Old One Patron.' },
      { name: 'Pact Boon', level: 3, description: 'Your otherworldly patron grants you a pact boon, a special feature. Choose Pact of the Blade, Pact of the Chain, Pact of the Tome, or Pact of the Talisman.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
    ],
  },
  {
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: 'intelligence',
    savingThrows: ['intelligence', 'wisdom'],
    armorProficiencies: [],
    weaponProficiencies: ['Simple'],
    spellcastingAbility: 'intelligence',
    classFeatures: [
      { name: 'Arcane Recovery', level: 1, description: 'You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a Short Rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your Wizard level (rounded up).' },
      { name: 'Ritual Adept', level: 1, description: 'You can cast any spell as a Ritual if that spell has the Ritual tag and the spell is in your spellbook. You don\'t need to have the spell prepared.' },
      { name: 'Spellcasting', level: 1, description: 'As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power. Intelligence is your spellcasting ability.' },
      { name: 'Scholar', level: 2, description: 'You gain Expertise in one of the following skills: Arcana, History, Investigation, Medicine, Nature, or Religion.' },
      { name: 'Wizard Subclass', level: 3, description: 'Choose an Arcane Tradition: Abjurer, Diviner, Evoker, or Illusionist.' },
      { name: 'Ability Score Improvement', level: 4, description: 'Increase one ability score by 2, or two ability scores by 1 each. Alternatively, choose a feat.' },
      { name: 'Memorize Spell', level: 5, description: 'Whenever you finish a Short Rest, you can study your spellbook and replace one of the spells you have prepared with another spell from the spellbook.' },
    ],
  },
]

/**
 * Get a class by name
 */
export function getClassByName(name: string): ClassData | undefined {
  return CLASSES.find((c) => c.name.toLowerCase() === name.toLowerCase())
}

/**
 * Get all class names for dropdown
 */
export function getClassNames(): string[] {
  return CLASSES.map((c) => c.name)
}

/**
 * Check if a class is a spellcaster
 */
export function isSpellcaster(className: string): boolean {
  const classData = getClassByName(className)
  return classData?.spellcastingAbility !== undefined
}

/**
 * Get class features for a given class up to a certain level
 */
export function getClassFeaturesForLevel(
  className: string,
  level: number
): ClassFeature[] {
  const classData = getClassByName(className)
  if (!classData) return []
  return classData.classFeatures.filter((f) => f.level <= level)
}

/**
 * Get subclasses for a given class
 */
export function getSubclassesByClass(className: string): Subclass[] {
  const classData = getClassByName(className)
  return classData?.subclasses ?? []
}

/**
 * Get subclass names for a given class
 */
export function getSubclassNames(className: string): string[] {
  return getSubclassesByClass(className).map((s) => s.name)
}

/**
 * Get subclass by name for a given class
 */
export function getSubclass(className: string, subclassName: string): Subclass | undefined {
  return getSubclassesByClass(className).find((s) => s.name === subclassName)
}

/**
 * Get subclass features for a given class and subclass up to a certain level
 */
export function getSubclassFeaturesForLevel(
  className: string,
  subclassName: string,
  level: number
): ClassFeature[] {
  const subclass = getSubclass(className, subclassName)
  if (!subclass) return []
  return subclass.features.filter((f) => f.level <= level)
}
