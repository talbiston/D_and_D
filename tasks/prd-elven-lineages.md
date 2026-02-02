# PRD: Elven Lineages

## Introduction

Add the three Elven Lineages from the 2024 Player's Handbook (Drow, High Elf, Wood Elf) to the character creation and management system. Currently, the app has only a generic "Elf" species with base traits. This update brings the Elf species in line with the 2024 PHB rules and matches the level of detail already implemented for other species like Dragonborn, Tiefling, and Gnome.

## Goals

- Allow players to select one of three Elven Lineages: Drow, High Elf, or Wood Elf
- Grant lineage-specific traits including cantrips, spells at levels 3 and 5, and unique abilities
- Automatically add lineage spells to the character's known spells at appropriate levels
- Update Keen Senses trait to allow choice between Insight, Perception, or Survival proficiency
- Prompt existing Elf characters to select a lineage when opened
- Reuse existing ancestry selection infrastructure

## User Stories

### US-001: Add Elven Lineage data to species definition
**Description:** As a developer, I need to add the three Elven Lineages to the Elf species data so players can select one during character creation.

**Acceptance Criteria:**
- [ ] Add `ancestry` field to Elf species in `src/data/species.ts`
- [ ] Drow lineage includes: 120ft Darkvision override, Dancing Lights cantrip, Faerie Fire (L3), Darkness (L5)
- [ ] High Elf lineage includes: Prestidigitation cantrip, Detect Magic (L3), Misty Step (L5)
- [ ] Wood Elf lineage includes: 35ft speed override, Druidcraft cantrip, Longstrider (L3), Pass Without Trace (L5)
- [ ] Each lineage has clear description text
- [ ] Typecheck passes

### US-002: Update Keen Senses to allow skill choice
**Description:** As a player, I want to choose between Insight, Perception, or Survival proficiency for my Elf's Keen Senses trait, matching the 2024 PHB rules.

**Acceptance Criteria:**
- [ ] Update Keen Senses trait description to mention all three skill options
- [ ] Add a mechanism to store the chosen skill (possibly via `speciesAncestry` or new field)
- [ ] Character creation allows selecting one of the three skills
- [ ] Selected skill is added to character's skill proficiencies
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Apply lineage-specific stat overrides
**Description:** As a player, when I select a lineage, I want my character's stats to update accordingly (Drow gets 120ft Darkvision, Wood Elf gets 35ft speed).

**Acceptance Criteria:**
- [ ] Drow lineage sets Darkvision to 120 feet (override base 60ft)
- [ ] Wood Elf lineage sets speed to 35 feet (override base 30ft)
- [ ] High Elf keeps default stats (60ft Darkvision, 30ft speed)
- [ ] Overrides display correctly on character sheet
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-004: Add lineage cantrips to known spells
**Description:** As a player, when I select an Elven Lineage, I want the lineage cantrip automatically added to my known spells.

**Acceptance Criteria:**
- [ ] Drow: Dancing Lights cantrip added to known spells at level 1
- [ ] High Elf: Prestidigitation cantrip added to known spells at level 1
- [ ] Wood Elf: Druidcraft cantrip added to known spells at level 1
- [ ] Cantrips appear in the Spells section of character sheet
- [ ] Cantrips are marked as coming from lineage (not class)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Add lineage spells at levels 3 and 5
**Description:** As a player, when my Elf character reaches levels 3 and 5, I want the appropriate lineage spells automatically added to my known spells.

**Acceptance Criteria:**
- [ ] At level 3: Drow gets Faerie Fire, High Elf gets Detect Magic, Wood Elf gets Longstrider
- [ ] At level 5: Drow gets Darkness, High Elf gets Misty Step, Wood Elf gets Pass Without Trace
- [ ] Spells only appear when character reaches the required level
- [ ] Spells are marked as lineage spells (castable once per Long Rest without slot)
- [ ] Spells also appear in trait description for reference
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-006: Prompt existing Elf characters to select lineage
**Description:** As a player with an existing Elf character, I want to be prompted to select a lineage when I open my character sheet so my character is updated to the new rules.

**Acceptance Criteria:**
- [ ] When opening an Elf character without `speciesAncestry`, show a modal prompting lineage selection
- [ ] Modal explains the three lineage options and their benefits
- [ ] User must select a lineage before continuing (modal is not dismissible without selection)
- [ ] After selection, character is updated with chosen lineage traits and spells
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-007: Display lineage in character header
**Description:** As a player, I want to see my Elven Lineage displayed in the character header alongside species name.

**Acceptance Criteria:**
- [ ] Character header shows "Elf (Drow)", "Elf (High Elf)", or "Elf (Wood Elf)"
- [ ] Home page character cards also show the lineage in parentheses
- [ ] Format matches how other species ancestries are displayed (e.g., "Dragonborn (Gold)")
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Add `ancestry` object to Elf species with three lineage options: Drow, High Elf, Wood Elf
- FR-2: Each lineage must specify: name, description, cantrip, level 3 spell, level 5 spell
- FR-3: Drow lineage must override Darkvision range to 120 feet
- FR-4: Wood Elf lineage must override base speed to 35 feet
- FR-5: Lineage cantrips must be added to character's known spells automatically
- FR-6: Lineage spells (L3, L5) must be added when character reaches appropriate level
- FR-7: Lineage spells must be flagged as "once per Long Rest without spell slot"
- FR-8: Keen Senses trait must allow choice of Insight, Perception, or Survival proficiency
- FR-9: Existing Elf characters without lineage must be prompted to select one
- FR-10: Lineage selection modal must be blocking (cannot dismiss without selecting)

## Non-Goals

- No implementation of High Elf's "swap cantrip after Long Rest" feature (too complex for MVP)
- No spellcasting ability choice UI (use Intelligence as default for lineage spells)
- No tracking of "once per Long Rest" spell usage (players track manually)
- No automatic spell slot integration for lineage spells

## Design Considerations

- Reuse existing ancestry dropdown component from character creation
- Follow same pattern as Dragonborn, Tiefling, Gnome ancestry implementations
- Migration modal should match existing modal styling (see delete confirmation modal)
- Lineage spells should appear in a "Racial Spells" or "Lineage Spells" subsection

## Technical Considerations

- The `SpeciesAncestryOption` interface may need new fields for:
  - `speedOverride?: number`
  - `darkvisionOverride?: number`
  - `leveledSpells?: { level: number; spell: string }[]`
- Character creation page already handles ancestry selection - minimal UI changes needed
- Need to handle spell addition on level-up, not just character creation
- Consider adding spells to a separate `racialSpells` array vs mixing with class spells

## Success Metrics

- Elf players can select a lineage during character creation
- Existing Elf characters are migrated to include a lineage
- Lineage-specific traits (Darkvision, speed) display correctly
- Lineage spells appear in the spells section at appropriate levels

## Open Questions

- Should lineage spells be editable/removable, or locked as racial features?
- How should the "once per Long Rest without slot" be displayed in the UI?
- Should we add species icons for each lineage (drow.svg and high-elf.svg already exist)?
