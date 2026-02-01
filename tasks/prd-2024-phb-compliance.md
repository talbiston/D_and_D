# PRD: D&D 2024 PHB Compliance Fixes

## Introduction

The D&D character sheet application currently has gaps in 2024 Player's Handbook compliance. Several species have ancestry/lineage choices that aren't tracked or mechanically applied, approximately 190 spells for levels 4-9 are missing, and Cleric/Druid level 1 class feature choices (Divine Order/Primal Order) are not implemented. This update ensures the app accurately matches 2024 PHB rules for character creation with full mechanical integration.

## Goals

- Add species ancestry selection with full mechanical integration (auto-apply resistances, damage types, etc.)
- Add all missing spells from levels 4-9 per the 2024 PHB
- Implement Divine Order choice for Clerics with auto-granted proficiencies
- Implement Primal Order choice for Druids with auto-granted proficiencies
- Fix any other 2024 PHB discrepancies discovered during implementation

## User Stories

---

### US-001: Add Species Ancestry Type System
**Description:** As a developer, I need type definitions for species ancestry so the system can track and apply ancestry choices mechanically.

**Acceptance Criteria:**
- [ ] Add `SpeciesAncestryOption` interface with: name, description, damageResistance?, damageType?, breathWeaponShape?, spells?, abilities?
- [ ] Add `SpeciesAncestryData` interface with: choiceName, options array
- [ ] Add `ancestry?: SpeciesAncestryData` to Species interface
- [ ] Add `speciesAncestry?: { choiceName: string, selectedOption: string }` to Character interface
- [ ] Add `damageResistances?: string[]` to Character interface for mechanical integration
- [ ] Typecheck passes

---

### US-002: Add Dragonborn Ancestry Data
**Description:** As a player creating a Dragonborn, I want to choose my draconic ancestry so my breath weapon and resistance are correctly set.

**Acceptance Criteria:**
- [ ] Add ancestry data with 10 dragon types: Black, Blue, Brass, Bronze, Copper, Gold, Green, Red, Silver, White
- [ ] Each option includes: damage type (acid/cold/fire/lightning/poison), breath weapon shape (15-ft cone or 30-ft line), damage resistance
- [ ] Black: Acid, 30-ft line, acid resistance
- [ ] Blue: Lightning, 30-ft line, lightning resistance
- [ ] Brass: Fire, 30-ft line, fire resistance
- [ ] Bronze: Lightning, 30-ft line, lightning resistance
- [ ] Copper: Acid, 30-ft line, acid resistance
- [ ] Gold: Fire, 15-ft cone, fire resistance
- [ ] Green: Poison, 15-ft cone, poison resistance
- [ ] Red: Fire, 15-ft cone, fire resistance
- [ ] Silver: Cold, 15-ft cone, cold resistance
- [ ] White: Cold, 15-ft cone, cold resistance
- [ ] Typecheck passes

---

### US-003: Add Tiefling Legacy Data
**Description:** As a player creating a Tiefling, I want to choose my fiendish legacy so my resistance and innate spells are correctly set.

**Acceptance Criteria:**
- [ ] Add ancestry data with 3 legacy options: Abyssal, Chthonic, Infernal
- [ ] Abyssal: Poison resistance; spells: Poison Spray (1st), Ray of Sickness (3rd), Hold Person (5th)
- [ ] Chthonic: Necrotic resistance; spells: Chill Touch (1st), False Life (3rd), Ray of Enfeeblement (5th)
- [ ] Infernal: Fire resistance; spells: Thaumaturgy (1st), Hellish Rebuke (3rd), Darkness (5th)
- [ ] Each option includes level requirements for spells
- [ ] Typecheck passes

---

### US-004: Add Gnome Lineage Data
**Description:** As a player creating a Gnome, I want to choose my lineage so my abilities are correctly set.

**Acceptance Criteria:**
- [ ] Add ancestry data with 2 lineage options: Forest Gnome, Rock Gnome
- [ ] Forest Gnome: Minor Illusion cantrip, Speak with Small Beasts ability
- [ ] Rock Gnome: Prestidigitation cantrip, Tinker ability (create tiny clockwork devices)
- [ ] Typecheck passes

---

### US-005: Add Goliath Ancestry Data
**Description:** As a player creating a Goliath, I want to choose my giant ancestry so my abilities are correctly set.

**Acceptance Criteria:**
- [ ] Add ancestry data with 6 ancestry options: Cloud, Fire, Frost, Hill, Stone, Storm
- [ ] Cloud: Use Misty Step as Bonus Action (proficiency bonus times per long rest)
- [ ] Fire: Fire resistance
- [ ] Frost: Cold resistance
- [ ] Hill: Gain Heroic Inspiration when you use Dash or Dodge action
- [ ] Stone: Tremorsense 15 feet as Bonus Action (10 min, prof bonus times per long rest)
- [ ] Storm: Lightning and Thunder resistance
- [ ] Typecheck passes

---

### US-006: Add Aasimar Revelation Data
**Description:** As a player creating an Aasimar, I want to choose my celestial revelation so my level 3 transformation is correctly set.

**Acceptance Criteria:**
- [ ] Add ancestry data with 2 revelation options: Heavenly Wings, Radiant Soul
- [ ] Heavenly Wings: At level 3+, gain Fly Speed equal to walking speed during transformation
- [ ] Radiant Soul: At level 3+, deal extra Radiant damage equal to proficiency bonus during transformation
- [ ] Mark as level-gated (level 3 requirement noted)
- [ ] Typecheck passes

---

### US-007: Add Ancestry Selection UI to Character Creation
**Description:** As a player, I want to select my species ancestry during character creation so my character is properly configured.

**Acceptance Criteria:**
- [ ] When a species with ancestry is selected, show a second dropdown for ancestry choice
- [ ] Dropdown label matches the ancestry choice name (e.g., "Draconic Ancestry", "Fiendish Legacy")
- [ ] Show description of selected ancestry option below dropdown
- [ ] Ancestry dropdown is required for species that have ancestry options
- [ ] Ancestry resets when species changes
- [ ] Ancestry selection is saved to character data
- [ ] Typecheck passes
- [ ] Verify in browser: Select Dragonborn, confirm 10 dragon options appear
- [ ] Verify in browser: Select Human, confirm NO ancestry dropdown appears

---

### US-008: Apply Ancestry Mechanics to Character
**Description:** As a player, I want my ancestry choice to automatically apply its mechanical effects so I don't have to manually configure resistances and abilities.

**Acceptance Criteria:**
- [ ] Damage resistances from ancestry are added to character's `damageResistances` array
- [ ] Ancestry-granted cantrips are added to character's spell list
- [ ] Ancestry-granted spells are available at appropriate levels
- [ ] Breath weapon damage type and shape are stored and displayed for Dragonborn
- [ ] Resistances display in character sheet under traits or a resistances section
- [ ] Typecheck passes
- [ ] Verify in browser: Create Gold Dragonborn, confirm Fire resistance displays

---

### US-009: Add Divine Order Choice for Cleric
**Description:** As a player creating a Cleric, I want to choose Divine Order at level 1 so I get the correct proficiencies.

**Acceptance Criteria:**
- [ ] Add `classOrder?: { name: string, description: string }` to Character interface
- [ ] Add Divine Order options to Cleric class data: Protector, Thaumaturge
- [ ] Protector: Grants proficiency with Martial weapons and training with Heavy armor
- [ ] Thaumaturge: Grants one extra cantrip from Cleric spell list and proficiency in Religion skill
- [ ] Show Divine Order selection during character creation when Cleric is selected
- [ ] Auto-apply proficiencies based on selection
- [ ] Typecheck passes
- [ ] Verify in browser: Create Cleric with Protector, confirm Martial weapon proficiency added

---

### US-010: Add Primal Order Choice for Druid
**Description:** As a player creating a Druid, I want to choose Primal Order at level 1 so I get the correct proficiencies.

**Acceptance Criteria:**
- [ ] Add Primal Order options to Druid class data: Magician, Warden
- [ ] Magician: Grants one extra cantrip from Druid spell list and proficiency in Arcana skill
- [ ] Warden: Grants proficiency with Martial weapons and training with Medium armor
- [ ] Show Primal Order selection during character creation when Druid is selected
- [ ] Auto-apply proficiencies based on selection
- [ ] Typecheck passes
- [ ] Verify in browser: Create Druid with Warden, confirm Martial weapon proficiency added

---

### US-011: Add Level 4 Spells
**Description:** As a spellcaster, I need access to all level 4 spells from the 2024 PHB so I can select them when I reach the appropriate level.

**Acceptance Criteria:**
- [ ] Add all 2024 PHB level 4 spells (~45 spells) including:
  - Arcane Eye, Banishment, Blight, Compulsion, Confusion, Conjure Minor Elementals
  - Control Water, Death Ward, Dimension Door, Divination, Dominate Beast
  - Evard's Black Tentacles, Fabricate, Fire Shield, Freedom of Movement
  - Giant Insect, Grasping Vine, Greater Invisibility, Guardian of Faith
  - Hallucinatory Terrain, Ice Storm, Leomund's Secret Chest, Locate Creature
  - Mordenkainen's Faithful Hound, Mordenkainen's Private Sanctum, Otiluke's Resilient Sphere
  - Phantasmal Killer, Polymorph, Staggering Smite, Stone Shape, Stoneskin
  - Summon Aberration, Summon Construct, Summon Elemental, Wall of Fire
- [ ] Each spell has correct: school, casting time, range, components, duration, concentration flag, ritual flag, description, class list
- [ ] `getSpellsByLevel(4)` returns all added spells
- [ ] Typecheck passes

---

### US-012: Add Level 5 Spells
**Description:** As a spellcaster, I need access to all level 5 spells from the 2024 PHB.

**Acceptance Criteria:**
- [ ] Add all 2024 PHB level 5 spells (~45 spells) including:
  - Animate Objects, Antilife Shell, Awaken, Banishing Smite, Bigby's Hand
  - Circle of Power, Cloudkill, Commune, Commune with Nature, Cone of Cold
  - Conjure Elemental, Contact Other Plane, Contagion, Creation, Dispel Evil and Good
  - Dominate Person, Dream, Flame Strike, Geas, Greater Restoration
  - Hallow, Hold Monster, Insect Plague, Legend Lore, Mass Cure Wounds
  - Mislead, Modify Memory, Passwall, Planar Binding, Raise Dead
  - Reincarnate, Scrying, Seeming, Summon Celestial, Summon Dragon
  - Telekinesis, Teleportation Circle, Tree Stride, Wall of Force, Wall of Stone
- [ ] Each spell has correct metadata and class lists
- [ ] `getSpellsByLevel(5)` returns all added spells
- [ ] Typecheck passes

---

### US-013: Add Level 6 Spells
**Description:** As a spellcaster, I need access to all level 6 spells from the 2024 PHB.

**Acceptance Criteria:**
- [ ] Add all 2024 PHB level 6 spells (~35 spells) including:
  - Arcane Gate, Blade Barrier, Chain Lightning, Circle of Death, Conjure Fey
  - Contingency, Create Undead, Disintegrate, Drawmij's Instant Summons
  - Eyebite, Find the Path, Flesh to Stone, Forbiddance, Globe of Invulnerability
  - Guards and Wards, Harm, Heal, Heroes' Feast, Magic Jar
  - Mass Suggestion, Move Earth, Otiluke's Freezing Sphere, Otto's Irresistible Dance
  - Planar Ally, Primordial Ward, Programmed Illusion, Sunbeam
  - Transport via Plants, True Seeing, Wall of Ice, Wall of Thorns, Wind Walk, Word of Recall
- [ ] Each spell has correct metadata and class lists
- [ ] `getSpellsByLevel(6)` returns all added spells
- [ ] Typecheck passes

---

### US-014: Add Level 7 Spells
**Description:** As a spellcaster, I need access to all level 7 spells from the 2024 PHB.

**Acceptance Criteria:**
- [ ] Add all 2024 PHB level 7 spells (~25 spells) including:
  - Conjure Celestial, Delayed Blast Fireball, Divine Word, Etherealness
  - Finger of Death, Fire Storm, Forcecage, Mirage Arcane
  - Mordenkainen's Magnificent Mansion, Mordenkainen's Sword, Plane Shift
  - Power Word Pain, Prismatic Spray, Project Image, Regenerate
  - Resurrection, Reverse Gravity, Sequester, Simulacrum, Symbol, Teleport, Whirlwind
- [ ] Each spell has correct metadata and class lists
- [ ] `getSpellsByLevel(7)` returns all added spells
- [ ] Typecheck passes

---

### US-015: Add Level 8 Spells
**Description:** As a spellcaster, I need access to all level 8 spells from the 2024 PHB.

**Acceptance Criteria:**
- [ ] Add all 2024 PHB level 8 spells (~20 spells) including:
  - Abi-Dalzim's Horrid Wilting, Antimagic Field, Antipathy/Sympathy, Clone
  - Control Weather, Demiplane, Dominate Monster, Earthquake
  - Feeblemind, Glibness, Holy Aura, Incendiary Cloud
  - Maddening Darkness, Maze, Mind Blank, Power Word Stun, Sunburst, Telepathy, Tsunami
- [ ] Each spell has correct metadata and class lists
- [ ] `getSpellsByLevel(8)` returns all added spells
- [ ] Typecheck passes

---

### US-016: Add Level 9 Spells
**Description:** As a spellcaster, I need access to all level 9 spells from the 2024 PHB.

**Acceptance Criteria:**
- [ ] Add all 2024 PHB level 9 spells (~20 spells) including:
  - Astral Projection, Blade of Disaster, Foresight, Gate, Imprisonment
  - Mass Heal, Mass Polymorph, Meteor Swarm, Power Word Heal, Power Word Kill
  - Prismatic Wall, Psychic Scream, Shapechange, Storm of Vengeance
  - Time Stop, True Polymorph, True Resurrection, Weird, Wish
- [ ] Each spell has correct metadata and class lists
- [ ] `getSpellsByLevel(9)` returns all added spells
- [ ] `getSpellByName('Wish')` returns the Wish spell
- [ ] Typecheck passes

---

### US-017: Verify Spell Selection at High Levels
**Description:** As a high-level spellcaster, I want to select high-level spells during level-up so I can use my new spell slots.

**Acceptance Criteria:**
- [ ] Level 7+ Wizard can see and select level 4 spells
- [ ] Level 9+ full casters can see and select level 5 spells
- [ ] Level 17+ full casters can see and select level 9 spells
- [ ] Spell picker filters correctly by class and max spell level
- [ ] Typecheck passes
- [ ] Verify in browser: Create level 17 Wizard, add Wish spell successfully

---

### US-018: Display Ancestry Information on Character Sheet
**Description:** As a player viewing my character sheet, I want to see my ancestry choice and its effects clearly displayed.

**Acceptance Criteria:**
- [ ] Species section shows ancestry choice (e.g., "Dragonborn (Gold)")
- [ ] Damage resistances display in a visible location
- [ ] Dragonborn breath weapon details (damage type, shape) are visible
- [ ] Ancestry-granted spells appear in spell list with "(Innate)" notation
- [ ] Typecheck passes
- [ ] Verify in browser: Load Dragonborn character, confirm ancestry and resistance display

---

## Functional Requirements

- FR-1: Species with ancestry choices must require ancestry selection during character creation
- FR-2: Ancestry selection must mechanically apply damage resistances to character data
- FR-3: Dragonborn ancestry must set breath weapon damage type and shape
- FR-4: Tiefling legacy must grant innate spells at appropriate levels (1, 3, 5)
- FR-5: Cleric Divine Order choice must auto-grant correct proficiencies
- FR-6: Druid Primal Order choice must auto-grant correct proficiencies
- FR-7: All 2024 PHB spells for levels 4-9 must be available for selection
- FR-8: Spell selection must filter by character's class and maximum spell level
- FR-9: Character sheet must display ancestry choice and its mechanical effects

## Non-Goals

- Multiclassing support (single-class characters only)
- Spell preparation system for prepared casters (current system uses spells known)
- Automatic spell scaling at higher levels (handled by spell descriptions)
- Equipment/gear database expansion (beyond what's needed for class features)
- Subclass-specific spell lists

## Technical Considerations

- Extend existing Species interface rather than creating parallel data structure
- Ancestry data should be co-located with species data in `species.ts`
- Spell additions follow existing format in `spells.ts`
- Class order choices can follow similar pattern to subclass selection
- Damage resistances should be stored as array for future extensibility

## Success Metrics

- All 5 species with ancestry choices have functional selection UI
- All ~190 missing spells are available in spell picker
- Divine Order and Primal Order properly grant proficiencies
- Zero TypeScript errors after implementation
- Character creation flow supports all 2024 PHB options

## Open Questions

- Should ancestry-granted spells count against spells known limit? (Recommend: No, they are innate)
- Should resistances stack or be deduplicated? (Recommend: Deduplicate)
- Should we add a "Resistances" section to character sheet or integrate into traits? (Recommend: New section)
