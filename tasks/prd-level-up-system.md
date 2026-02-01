# PRD: D&D 2024 Level-Up System

## Introduction

Implement a complete level progression system (levels 1-20) for the D&D 2024 character sheet app. This enables players to level up their characters with a simple button that auto-applies standard benefits while allowing manual overrides for choices like HP rolls, ability score improvements, and new spells. The system covers all 12 PHB classes with full subclass support.

## Goals

- Support character progression from level 1 to 20 for all 12 classes
- Provide one-click level-up with sensible defaults
- Allow manual override for player choices (HP method, ASI vs feat, spell selection)
- Automatically update all level-dependent stats (proficiency bonus, spell slots, scaling features)
- Display new features and choices clearly when leveling up
- Support all subclasses from the 2024 PHB

## User Stories

### US-001: Add class features for levels 6-20
**Description:** As a player, I want all class features from levels 6-20 available so my character gains the correct abilities as they level up.

**Acceptance Criteria:**
- [ ] Barbarian features added for levels 6-20 (Brutal Strike, Feral Instinct, Relentless Rage, etc.)
- [ ] Bard features added for levels 6-20 (Countercharm, Superior Inspiration, etc.)
- [ ] Cleric features added for levels 6-20 (Blessed Strikes, Divine Intervention, etc.)
- [ ] Druid features added for levels 6-20 (Elemental Fury, Archdruid, etc.)
- [ ] Fighter features added for levels 6-20 (Extra Attack x3, Indomitable, etc.)
- [ ] Monk features added for levels 6-20 (Evasion, Stillness of Mind, Perfect Self, etc.)
- [ ] Paladin features added for levels 6-20 (Aura of Protection, Aura of Courage, etc.)
- [ ] Ranger features added for levels 6-20 (Roving, Tireless, Foe Slayer, etc.)
- [ ] Rogue features added for levels 6-20 (Evasion, Reliable Talent, Slippery Mind, etc.)
- [ ] Sorcerer features added for levels 6-20 (Sorcery Incarnate, Arcane Apotheosis, etc.)
- [ ] Warlock features added for levels 6-20 (additional invocations, Eldritch Master, etc.)
- [ ] Wizard features added for levels 6-20 (Spell Mastery, Signature Spells, etc.)
- [ ] Each feature includes level, name, and summary description with key mechanics
- [ ] Typecheck passes

### US-002: Add all subclass features
**Description:** As a player, I want all subclass features available so I can fully utilize my chosen subclass at higher levels.

**Acceptance Criteria:**
- [ ] Barbarian subclasses complete: Berserker, Wild Heart, World Tree, Zealot
- [ ] Bard subclasses complete: Dance, Glamour, Lore, Valor
- [ ] Cleric subclasses complete: Life, Light, Trickery, War
- [ ] Druid subclasses complete: Land, Moon, Sea, Stars
- [ ] Fighter subclasses complete: Battle Master, Champion, Eldritch Knight, Psi Warrior
- [ ] Monk subclasses complete: Mercy, Shadow, Elements, Open Hand
- [ ] Paladin subclasses complete: Devotion, Glory, Ancients, Vengeance
- [ ] Ranger subclasses complete: Beast Master, Fey Wanderer, Gloom Stalker, Hunter
- [ ] Rogue subclasses complete: Arcane Trickster, Assassin, Soulknife, Thief
- [ ] Sorcerer subclasses complete: Aberrant, Clockwork, Draconic, Wild Magic
- [ ] Warlock subclasses complete: Archfey, Celestial, Fiend, Great Old One
- [ ] Wizard subclasses complete: Abjurer, Diviner, Evoker, Illusionist
- [ ] Subclass features include correct unlock levels (varies by class)
- [ ] Typecheck passes

### US-003: Add spell slot progression table
**Description:** As a player, I want my spell slots to automatically update when I level up so I have the correct number of slots for my level.

**Acceptance Criteria:**
- [ ] Create spell slot progression data for full casters (Bard, Cleric, Druid, Sorcerer, Wizard)
- [ ] Create spell slot progression for half casters (Paladin, Ranger) - slots start at level 2
- [ ] Create Pact Magic progression for Warlock (slots + slot level)
- [ ] Spell slots automatically update when character level changes
- [ ] Display correct max spell level available at each level
- [ ] Typecheck passes

### US-004: Add cantrips known progression
**Description:** As a spellcaster, I want to gain additional cantrips at the correct levels so I can expand my magical repertoire.

**Acceptance Criteria:**
- [ ] Track cantrips known per class per level
- [ ] Bard: 2 at 1st, +1 at 4th, 10th
- [ ] Cleric: 3 at 1st, +1 at 4th, 10th
- [ ] Druid: 2 at 1st, +1 at 4th, 10th
- [ ] Sorcerer: 4 at 1st, +1 at 4th, 10th
- [ ] Warlock: 2 at 1st, +1 at 4th, 10th
- [ ] Wizard: 3 at 1st, +1 at 4th, 10th
- [ ] Level-up prompts user to select new cantrips when earned
- [ ] Typecheck passes

### US-005: Add scaling feature calculations
**Description:** As a player, I want features that scale with level to automatically show correct values so I don't have to calculate them manually.

**Acceptance Criteria:**
- [ ] Sneak Attack: calculate dice based on Rogue level (1d6 at 1, +1d6 every odd level)
- [ ] Bardic Inspiration die: d6→d8 at 5th, d10 at 10th, d12 at 15th
- [ ] Martial Arts die: d6→d8 at 5th, d10 at 11th, d12 at 17th
- [ ] Rage damage: +2→+3 at 9th, +4 at 16th
- [ ] Rage count: 2→3 at 3rd, 4 at 6th, 5 at 12th, 6 at 17th, unlimited at 20th
- [ ] Ki/Focus Points: equal to Monk level
- [ ] Sorcery Points: equal to Sorcerer level
- [ ] Wild Shape CR: calculate based on Druid level and Circle
- [ ] Channel Divinity uses: 1→2 at 6th, 3 at 18th
- [ ] Lay on Hands pool: 5 × Paladin level
- [ ] Create utility functions for each scaling calculation
- [ ] Display calculated values in character sheet features section
- [ ] Typecheck passes

### US-006: Add Ability Score Improvement tracking
**Description:** As a player, I want to be notified when I earn an ASI and be able to choose between ability increases or feats.

**Acceptance Criteria:**
- [ ] Track ASI levels per class (most: 4, 8, 12, 16, 19; Fighter: +6, 14; Rogue: +10)
- [ ] Store which ASI choices have been made vs pending
- [ ] When leveling to an ASI level, prompt user with choice
- [ ] Option A: +2 to one ability (max 20) or +1 to two abilities
- [ ] Option B: Select a feat from available feats list
- [ ] Apply chosen bonuses to character immediately
- [ ] Show "ASI Available" indicator if pending choices exist
- [ ] Typecheck passes

### US-007: Create level-up button and auto-apply logic
**Description:** As a player, I want a simple "Level Up" button that automatically applies standard level-up benefits so leveling is quick and easy.

**Acceptance Criteria:**
- [ ] "Level Up" button visible on character sheet when not at max level (20)
- [ ] Clicking button increments character level by 1
- [ ] Auto-applies: new class features for the level
- [ ] Auto-applies: new subclass features for the level (if subclass selected)
- [ ] Auto-applies: updated proficiency bonus
- [ ] Auto-applies: updated spell slots for casters
- [ ] Auto-applies: recalculated scaling features
- [ ] Opens modal for required choices (HP, ASI, new spells)
- [ ] Character saved after level-up completes
- [ ] Typecheck passes
- [ ] Verify in browser: level up from 1→2 works correctly

### US-008: Create HP increase choice modal
**Description:** As a player, I want to choose how to increase my HP each level (roll or take average) so I can play my preferred style.

**Acceptance Criteria:**
- [ ] Modal appears during level-up showing HP options
- [ ] Display hit die type for current class (d6, d8, d10, d12)
- [ ] Option A: "Roll" - simulate roll and show result + CON mod
- [ ] Option B: "Take Average" - show fixed value (die/2 + 1) + CON mod
- [ ] Show preview of new max HP before confirming
- [ ] Apply chosen HP increase to character max HP and current HP
- [ ] Typecheck passes
- [ ] Verify in browser: HP modal displays and applies correctly

### US-009: Create ASI/Feat selection modal
**Description:** As a player, I want a clear interface to choose between ability score increases or feats when I reach ASI levels.

**Acceptance Criteria:**
- [ ] Modal appears at ASI levels (4, 8, 12, 16, 19 + class extras)
- [ ] Tab or toggle to switch between "Ability Scores" and "Feat" options
- [ ] Ability Score tab: dropdowns to select which abilities to increase
- [ ] Shows current score and preview of new score
- [ ] Enforces max of 20 for any ability
- [ ] Feat tab: searchable list of available feats
- [ ] Shows feat description and prerequisites
- [ ] Feats with unmet prerequisites are disabled/grayed
- [ ] Selected choice applied to character on confirm
- [ ] Typecheck passes
- [ ] Verify in browser: ASI modal works at level 4

### US-010: Create new spell selection interface
**Description:** As a spellcaster, I want to select new spells when I level up so I can customize my spell list.

**Acceptance Criteria:**
- [ ] Track spells known vs prepared caster distinction
- [ ] Known casters (Bard, Ranger, Sorcerer, Warlock): prompt to select new spells at level-up
- [ ] Show how many new spells can be learned this level
- [ ] Filter spells by level (up to max castable)
- [ ] Filter spells by class spell list
- [ ] Search spells by name
- [ ] Show spell school, casting time, concentration, ritual tags
- [ ] Prepared casters (Cleric, Druid, Paladin, Wizard): show updated spells available
- [ ] Typecheck passes
- [ ] Verify in browser: Bard at level 2 can select new spell

### US-011: Add Extra Attack progression
**Description:** As a martial character, I want Extra Attack to show the correct number of attacks for my level.

**Acceptance Criteria:**
- [ ] Track Extra Attack feature for Barbarian, Fighter, Monk, Paladin, Ranger
- [ ] Standard Extra Attack (2 attacks) at level 5
- [ ] Fighter Extra Attack (3 attacks) at level 11
- [ ] Fighter Extra Attack (4 attacks) at level 20
- [ ] Display attack count in class features section
- [ ] Typecheck passes

### US-012: Add proficiency bonus auto-calculation
**Description:** As a player, I want proficiency bonus to automatically update based on my level.

**Acceptance Criteria:**
- [ ] Proficiency bonus calculated: +2 (1-4), +3 (5-8), +4 (9-12), +5 (13-16), +6 (17-20)
- [ ] All dependent values update when proficiency changes:
  - Saving throws
  - Skill bonuses
  - Spell save DC
  - Spell attack bonus
  - Attack bonuses with proficient weapons
- [ ] Typecheck passes

### US-013: Add level-down/edit level functionality
**Description:** As a player, I want to manually adjust my level in case of mistakes or for testing purposes.

**Acceptance Criteria:**
- [ ] "Edit Level" option in character sheet (existing modal)
- [ ] Can set level to any value 1-20
- [ ] Warning shown if lowering level (features may be lost)
- [ ] Recalculates all level-dependent values
- [ ] Does not remove manually added feats/spells (only auto-granted ones)
- [ ] Typecheck passes

### US-014: Display level-up summary
**Description:** As a player, I want to see a summary of everything I gained when leveling up so I understand my new capabilities.

**Acceptance Criteria:**
- [ ] After level-up completes, show summary modal/section
- [ ] Lists: new class features gained
- [ ] Lists: new subclass features gained (if any)
- [ ] Lists: HP increase amount and new total
- [ ] Lists: new spell slots (if changed)
- [ ] Lists: ASI/feat chosen (if applicable)
- [ ] Lists: new spells learned (if applicable)
- [ ] Lists: any scaling changes (Sneak Attack dice, etc.)
- [ ] "Got it" button to dismiss
- [ ] Typecheck passes
- [ ] Verify in browser: summary displays after level-up

### US-015: Add Warlock Pact Magic system
**Description:** As a Warlock, I want my Pact Magic to work correctly with slots that recharge on short rest and scale differently.

**Acceptance Criteria:**
- [ ] Warlock spell slots separate from regular spell slots
- [ ] Slot count: 1 at 1st, 2 at 2nd, 3 at 11th, 4 at 17th
- [ ] Slot level: 1st at 1st level, increases to 5th at 9th level
- [ ] All Warlock slots are same level (not tiered like other casters)
- [ ] Track short rest vs long rest recovery separately
- [ ] Display Pact Magic slots distinctly on character sheet
- [ ] Typecheck passes

### US-016: Add Eldritch Invocation progression
**Description:** As a Warlock, I want to gain and manage Eldritch Invocations as I level up.

**Acceptance Criteria:**
- [ ] Track invocations known: 1 at 1st, +1 at 2nd, 5th, 7th, 9th, 12th, 15th, 18th
- [ ] Create invocation data with names, descriptions, prerequisites
- [ ] Level-up prompts Warlock to select new invocation when earned
- [ ] Some invocations have level prerequisites
- [ ] Some invocations have Pact Boon prerequisites
- [ ] Display invocations in class features section
- [ ] Typecheck passes

### US-017: Add Fighter Maneuvers (Battle Master)
**Description:** As a Battle Master Fighter, I want to learn and track combat maneuvers.

**Acceptance Criteria:**
- [ ] Create maneuver data with names and descriptions
- [ ] Battle Master learns 3 maneuvers at 3rd, +2 at 7th, 10th, 15th
- [ ] Superiority dice: 4 at 3rd, 5 at 7th, 6 at 15th
- [ ] Superiority die size: d8→d10 at 10th, d12 at 18th
- [ ] Prompt to select maneuvers at appropriate levels
- [ ] Display maneuvers and dice in class features
- [ ] Typecheck passes

### US-018: Add Metamagic progression (Sorcerer)
**Description:** As a Sorcerer, I want to learn and use Metamagic options as I level up.

**Acceptance Criteria:**
- [ ] Create Metamagic option data with names, costs, descriptions
- [ ] Sorcerer learns 2 at 2nd level, +1 at 10th and 17th
- [ ] Sorcery point costs vary by option
- [ ] Prompt to select Metamagic at appropriate levels
- [ ] Display Metamagic options and Sorcery Points on character sheet
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Store class feature data for all levels 1-20 for all 12 classes
- FR-2: Store subclass feature data for all 48 subclasses (4 per class × 12 classes)
- FR-3: Calculate spell slots based on class and level using standard progression tables
- FR-4: Calculate proficiency bonus as Math.ceil(level / 4) + 1
- FR-5: Track pending choices (ASI, spells, invocations, etc.) separately from completed ones
- FR-6: Level-up button disabled at level 20
- FR-7: HP increase minimum is 1 (even with negative CON mod)
- FR-8: Multiclassing is NOT supported (single class only)
- FR-9: All level-dependent calculations must update reactively when level changes
- FR-10: Character data persists to localStorage after each level-up step

## Non-Goals (Out of Scope)

- Multiclassing support
- Custom/homebrew classes or subclasses
- Automatic XP tracking and level-up triggers
- Class-specific equipment grants at level-up
- Retraining rules (swapping old features for new ones)
- Optional class features from supplementary books
- Magic item attunement slot increases

## Technical Considerations

- Class/subclass data will significantly increase bundle size; consider lazy loading or code splitting
- Scaling calculations should be pure functions for easy testing
- Level-up state machine: gather choices → validate → apply → save
- Consider storing "base" values vs "calculated" values separately in character data
- Reuse existing feat picker modal pattern for spell/invocation/maneuver selection

## Design Considerations

- Level-up button should be prominent but not intrusive (perhaps near level display)
- Choice modals should clearly show "what you're giving up" vs "what you're getting"
- Use consistent card/list patterns for feature, spell, and feat selection
- Show "NEW" badges on recently gained features
- Consider celebration animation/confetti on level-up completion

## Success Metrics

- Player can level a character from 1 to 20 without errors
- All class features display correctly at each level
- Level-up takes under 60 seconds for straightforward choices
- No manual calculation required for any level-dependent value
- Character sheet accurately reflects 2024 PHB rules

## Open Questions

1. Should we add a "quick level" option to jump multiple levels at once (for starting at higher levels)?
2. Should spell selection show spell descriptions inline or in a tooltip/modal?
3. How should we handle the Wizard's spellbook (learning spells from scrolls/books)?
4. Should there be an "undo last level-up" feature?

## Appendix: Level Feature Summary by Class

### Barbarian
| Level | Features |
|-------|----------|
| 1 | Rage, Unarmored Defense, Weapon Mastery |
| 2 | Danger Sense, Reckless Attack |
| 3 | Primal Knowledge, Primal Path (subclass) |
| 4 | Ability Score Improvement |
| 5 | Extra Attack, Fast Movement |
| 6 | Subclass feature |
| 7 | Feral Instinct, Instinctive Pounce |
| 8 | Ability Score Improvement |
| 9 | Brutal Strike |
| 10 | Subclass feature |
| 11 | Relentless Rage |
| 12 | Ability Score Improvement |
| 13 | Improved Brutal Strike |
| 14 | Subclass feature |
| 15 | Persistent Rage |
| 16 | Ability Score Improvement |
| 17 | Improved Brutal Strike |
| 18 | Indomitable Might |
| 19 | Ability Score Improvement |
| 20 | Primal Champion |

### Bard
| Level | Features |
|-------|----------|
| 1 | Bardic Inspiration (d6), Spellcasting |
| 2 | Expertise, Jack of All Trades |
| 3 | Bard College (subclass) |
| 4 | Ability Score Improvement |
| 5 | Bardic Inspiration (d8), Font of Inspiration |
| 6 | Subclass feature |
| 7 | Countercharm |
| 8 | Ability Score Improvement |
| 9 | Expertise |
| 10 | Bardic Inspiration (d10), Magical Secrets |
| 11 | — |
| 12 | Ability Score Improvement |
| 13 | — |
| 14 | Subclass feature |
| 15 | Bardic Inspiration (d12) |
| 16 | Ability Score Improvement |
| 17 | — |
| 18 | Superior Inspiration |
| 19 | Ability Score Improvement |
| 20 | Words of Creation |

### Cleric
| Level | Features |
|-------|----------|
| 1 | Divine Order, Spellcasting |
| 2 | Channel Divinity (1/rest) |
| 3 | Divine Domain (subclass) |
| 4 | Ability Score Improvement |
| 5 | Sear Undead |
| 6 | Subclass feature, Channel Divinity (2/rest) |
| 7 | Blessed Strikes |
| 8 | Ability Score Improvement |
| 9 | — |
| 10 | Divine Intervention |
| 11 | — |
| 12 | Ability Score Improvement |
| 13 | — |
| 14 | Improved Blessed Strikes |
| 15 | — |
| 16 | Ability Score Improvement |
| 17 | Subclass feature |
| 18 | Channel Divinity (3/rest) |
| 19 | Ability Score Improvement |
| 20 | Greater Divine Intervention |

### Druid
| Level | Features |
|-------|----------|
| 1 | Druidic, Primal Order, Spellcasting |
| 2 | Wild Companion, Wild Shape |
| 3 | Druid Circle (subclass) |
| 4 | Ability Score Improvement |
| 5 | Wild Resurgence |
| 6 | Subclass feature |
| 7 | Elemental Fury |
| 8 | Ability Score Improvement |
| 9 | — |
| 10 | Subclass feature |
| 11 | — |
| 12 | Ability Score Improvement |
| 13 | — |
| 14 | Subclass feature |
| 15 | Improved Elemental Fury |
| 16 | Ability Score Improvement |
| 17 | — |
| 18 | Beast Spells |
| 19 | Ability Score Improvement |
| 20 | Archdruid |

### Fighter
| Level | Features |
|-------|----------|
| 1 | Fighting Style, Second Wind, Weapon Mastery |
| 2 | Action Surge (1 use), Tactical Mind |
| 3 | Fighter Subclass |
| 4 | Ability Score Improvement |
| 5 | Extra Attack, Tactical Shift |
| 6 | Ability Score Improvement |
| 7 | Subclass feature |
| 8 | Ability Score Improvement |
| 9 | Indomitable (1 use), Tactical Master |
| 10 | Subclass feature |
| 11 | Two Extra Attacks |
| 12 | Ability Score Improvement |
| 13 | Indomitable (2 uses), Studied Attacks |
| 14 | Ability Score Improvement |
| 15 | Subclass feature |
| 16 | Ability Score Improvement |
| 17 | Action Surge (2 uses), Indomitable (3 uses) |
| 18 | Subclass feature |
| 19 | Ability Score Improvement |
| 20 | Three Extra Attacks |

### Monk
| Level | Features |
|-------|----------|
| 1 | Martial Arts (d6), Unarmored Defense |
| 2 | Monk's Focus, Unarmored Movement (+10), Uncanny Metabolism |
| 3 | Deflect Attacks, Monk Subclass |
| 4 | Ability Score Improvement, Slow Fall |
| 5 | Extra Attack, Martial Arts (d8), Stunning Strike |
| 6 | Subclass feature, Unarmored Movement (+15) |
| 7 | Evasion |
| 8 | Ability Score Improvement |
| 9 | Acrobatic Movement |
| 10 | Heightened Focus, Self-Restoration, Unarmored Movement (+20) |
| 11 | Subclass feature, Martial Arts (d10) |
| 12 | Ability Score Improvement |
| 13 | Deflect Energy |
| 14 | Disciplined Survivor, Unarmored Movement (+25) |
| 15 | Perfect Focus |
| 16 | Ability Score Improvement |
| 17 | Subclass feature, Martial Arts (d12) |
| 18 | Superior Defense, Unarmored Movement (+30) |
| 19 | Ability Score Improvement |
| 20 | Body and Mind |

### Paladin
| Level | Features |
|-------|----------|
| 1 | Lay on Hands, Spellcasting, Weapon Mastery |
| 2 | Divine Smite, Fighting Style |
| 3 | Channel Divinity, Paladin Subclass |
| 4 | Ability Score Improvement |
| 5 | Extra Attack, Faithful Steed |
| 6 | Aura of Protection |
| 7 | Subclass feature |
| 8 | Ability Score Improvement |
| 9 | Abjure Foes |
| 10 | Aura of Courage |
| 11 | Radiant Strikes |
| 12 | Ability Score Improvement |
| 13 | — |
| 14 | Restoring Touch |
| 15 | Subclass feature |
| 16 | Ability Score Improvement |
| 17 | — |
| 18 | Aura Expansion |
| 19 | Ability Score Improvement |
| 20 | Subclass feature |

### Ranger
| Level | Features |
|-------|----------|
| 1 | Favored Enemy, Spellcasting, Weapon Mastery |
| 2 | Deft Explorer, Fighting Style |
| 3 | Ranger Subclass |
| 4 | Ability Score Improvement |
| 5 | Extra Attack |
| 6 | Roving |
| 7 | Subclass feature |
| 8 | Ability Score Improvement |
| 9 | Expertise |
| 10 | Tireless |
| 11 | Subclass feature |
| 12 | Ability Score Improvement |
| 13 | Relentless Hunter |
| 14 | Nature's Veil |
| 15 | Subclass feature |
| 16 | Ability Score Improvement |
| 17 | Precise Hunter |
| 18 | Feral Senses |
| 19 | Ability Score Improvement |
| 20 | Foe Slayer |

### Rogue
| Level | Features |
|-------|----------|
| 1 | Expertise, Sneak Attack (1d6), Thieves' Cant, Weapon Mastery |
| 2 | Cunning Action |
| 3 | Rogue Subclass, Steady Aim, Sneak Attack (2d6) |
| 4 | Ability Score Improvement |
| 5 | Cunning Strike, Sneak Attack (3d6), Uncanny Dodge |
| 6 | Expertise |
| 7 | Evasion, Sneak Attack (4d6), Subclass feature |
| 8 | Ability Score Improvement |
| 9 | Sneak Attack (5d6) |
| 10 | Ability Score Improvement |
| 11 | Reliable Talent, Sneak Attack (6d6) |
| 12 | Ability Score Improvement |
| 13 | Sneak Attack (7d6), Subclass feature, Subtle Strikes |
| 14 | Devious Strikes |
| 15 | Slippery Mind, Sneak Attack (8d6) |
| 16 | Ability Score Improvement |
| 17 | Sneak Attack (9d6) |
| 18 | Elusive |
| 19 | Ability Score Improvement, Sneak Attack (10d6) |
| 20 | Stroke of Luck |

### Sorcerer
| Level | Features |
|-------|----------|
| 1 | Innate Sorcery, Spellcasting |
| 2 | Font of Magic, Metamagic (2 options) |
| 3 | Sorcerer Subclass |
| 4 | Ability Score Improvement |
| 5 | Sorcerous Restoration |
| 6 | Subclass feature |
| 7 | Sorcery Incarnate |
| 8 | Ability Score Improvement |
| 9 | — |
| 10 | Metamagic (+1 option) |
| 11 | — |
| 12 | Ability Score Improvement |
| 13 | — |
| 14 | Subclass feature |
| 15 | — |
| 16 | Ability Score Improvement |
| 17 | Metamagic (+1 option) |
| 18 | Subclass feature |
| 19 | Ability Score Improvement |
| 20 | Arcane Apotheosis |

### Warlock
| Level | Features |
|-------|----------|
| 1 | Eldritch Invocations (1), Pact Magic |
| 2 | Eldritch Invocations (+1), Magical Cunning |
| 3 | Pact Boon, Warlock Subclass |
| 4 | Ability Score Improvement |
| 5 | Eldritch Invocations (+1) |
| 6 | Subclass feature |
| 7 | Eldritch Invocations (+1) |
| 8 | Ability Score Improvement |
| 9 | Contact Patron, Eldritch Invocations (+1) |
| 10 | Subclass feature |
| 11 | Mystic Arcanum (6th) |
| 12 | Ability Score Improvement, Eldritch Invocations (+1) |
| 13 | Mystic Arcanum (7th) |
| 14 | Subclass feature |
| 15 | Eldritch Invocations (+1), Mystic Arcanum (8th) |
| 16 | Ability Score Improvement |
| 17 | Mystic Arcanum (9th) |
| 18 | Eldritch Invocations (+1) |
| 19 | Ability Score Improvement |
| 20 | Eldritch Master |

### Wizard
| Level | Features |
|-------|----------|
| 1 | Arcane Recovery, Ritual Adept, Spellcasting |
| 2 | Scholar |
| 3 | Wizard Subclass |
| 4 | Ability Score Improvement |
| 5 | Memorize Spell |
| 6 | Subclass feature |
| 7 | — |
| 8 | Ability Score Improvement |
| 9 | — |
| 10 | Subclass feature |
| 11 | — |
| 12 | Ability Score Improvement |
| 13 | — |
| 14 | Subclass feature |
| 15 | — |
| 16 | Ability Score Improvement |
| 17 | — |
| 18 | Spell Mastery |
| 19 | Ability Score Improvement |
| 20 | Signature Spells |
