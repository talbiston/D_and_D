# PRD: D&D 5e Character Sheet Web App

## Introduction

A local web application that serves as a complete digital D&D 5th Edition character sheet, specifically targeting the **2024 Player's Handbook** rules (not the 2014 version). Users can create new characters, manage multiple characters, track stats during gameplay, and export/import character data as JSON files. The app provides full rules automation including calculated modifiers, class/species data, and a spell database.

Based on the official 2024 D&D character sheet PDF with two pages: core stats/combat/features and spellcasting/equipment/backstory.

## Goals

- Allow users to create D&D characters with guided workflows
- Provide real-time stat tracking during gameplay (HP, spell slots, death saves)
- Auto-calculate all derived values (modifiers, proficiency, spell DC, skill bonuses)
- Include comprehensive D&D 5e (2024) data: classes, species, spells, equipment
- Support multiple characters with easy selection/switching
- Enable portable data via JSON export/import
- Deliver a modern, responsive web UI that works on desktop and tablet

## User Stories

### Phase 1: Foundation & Core Data Entry

#### US-001: Project setup with modern web stack
**Description:** As a developer, I need the project scaffolded so I can build the application.

**Acceptance Criteria:**
- [ ] Initialize project with Vite + React + TypeScript
- [ ] Add Tailwind CSS for styling
- [ ] Set up basic folder structure (components, types, data, utils)
- [ ] Create basic App component with routing (react-router-dom)
- [ ] Project runs with `npm run dev`
- [ ] Typecheck passes

#### US-002: Define TypeScript types for character data
**Description:** As a developer, I need complete type definitions so character data is type-safe throughout the app.

**Acceptance Criteria:**
- [ ] Define `Character` interface with all fields from PDF (basic info, ability scores, skills, combat stats, equipment, spells, backstory)
- [ ] Define supporting types: `AbilityScore`, `Skill`, `Weapon`, `Spell`, `Equipment`, `ClassFeature`, `Feat`, `SpeciesTrait`
- [ ] Define enums for: abilities, skills, damage types, spell schools, armor types
- [ ] Export all types from a central `types/index.ts`
- [ ] Typecheck passes

#### US-003: Character list/selection screen
**Description:** As a user, I want to see all my characters on launch so I can choose which one to view or edit.

**Acceptance Criteria:**
- [ ] Home page shows grid/list of saved characters
- [ ] Each character card shows: name, class, level, species
- [ ] "Create New Character" button prominently displayed
- [ ] Clicking a character navigates to character sheet view
- [ ] Empty state shown when no characters exist
- [ ] Typecheck passes

#### US-004: Create new character - basic info
**Description:** As a user, I want to enter my character's basic information to start building them.

**Acceptance Criteria:**
- [ ] New character form with fields: name, species, class, subclass, background, level, XP
- [ ] Species dropdown populated from data (see US-010)
- [ ] Class dropdown populated from data (see US-009)
- [ ] Subclass dropdown filters based on selected class
- [ ] Level input (1-20) with XP auto-calculation or manual entry
- [ ] "Next" button proceeds to ability scores
- [ ] Typecheck passes

#### US-005: Ability score entry with modifier calculation
**Description:** As a user, I want to enter my ability scores and see modifiers calculated automatically.

**Acceptance Criteria:**
- [ ] Six ability score inputs: STR, DEX, CON, INT, WIS, CHA
- [ ] Each shows score (editable) and modifier (calculated: floor((score-10)/2))
- [ ] Support for standard array, point buy, or manual entry modes
- [ ] Saving throw proficiencies selectable (checkboxes)
- [ ] Saving throw bonuses auto-calculated (modifier + proficiency if proficient)
- [ ] Typecheck passes

#### US-006: Skill proficiency selection and calculation
**Description:** As a user, I want to select my skill proficiencies and see bonuses calculated.

**Acceptance Criteria:**
- [ ] List all 18 skills grouped by ability
- [ ] Checkbox for proficiency, checkbox for expertise (double proficiency)
- [ ] Skill bonus auto-calculated: ability modifier + proficiency bonus (if proficient) + proficiency bonus again (if expertise)
- [ ] Proficiency bonus derived from level (formula: floor((level-1)/4)+2)
- [ ] Passive Perception auto-calculated (10 + Perception bonus)
- [ ] Typecheck passes

#### US-007: Save character to localStorage and JSON export
**Description:** As a user, I want to save my character and export it as a JSON file.

**Acceptance Criteria:**
- [ ] "Save" button persists character to localStorage
- [ ] Auto-save on significant changes (debounced)
- [ ] "Export JSON" button downloads character as `[name].json`
- [ ] JSON is human-readable (pretty-printed)
- [ ] Typecheck passes

#### US-008: Import character from JSON file
**Description:** As a user, I want to import a character from a JSON file so I can restore or share characters.

**Acceptance Criteria:**
- [ ] "Import Character" button on home screen
- [ ] File picker accepts `.json` files
- [ ] Validates JSON structure matches Character type
- [ ] Shows error message if invalid
- [ ] Imported character appears in character list
- [ ] Typecheck passes

### Phase 2: D&D Rules Data

#### US-009: Class data with features
**Description:** As a developer, I need class data so the app can auto-populate class features.

**Acceptance Criteria:**
- [ ] JSON data file with all 12 PHB classes
- [ ] Each class includes: name, hit die, primary ability, saving throw proficiencies, armor/weapon proficiencies
- [ ] Class features array with: name, level gained, description
- [ ] Subclass data with features
- [ ] Spellcasting info (if applicable): ability, slots per level, spells known/prepared
- [ ] Typecheck passes

#### US-010: Species data with traits
**Description:** As a developer, I need species data so the app can auto-populate species traits.

**Acceptance Criteria:**
- [ ] JSON data file with core species (Human, Elf, Dwarf, Halfling, Dragonborn, Gnome, Half-Elf, Half-Orc, Tiefling, plus 2024 additions)
- [ ] Each species includes: name, size, speed, traits (name + description)
- [ ] Ability score increases (or note about 2024 flexible rules)
- [ ] Languages granted
- [ ] Typecheck passes

#### US-011: Spell database
**Description:** As a developer, I need a spell database so users can select and reference spells.

**Acceptance Criteria:**
- [ ] JSON data file with SRD/basic spells (at minimum: all cantrips + levels 1-3 for core classes)
- [ ] Each spell includes: name, level, school, casting time, range, components (V/S/M), duration, concentration (bool), ritual (bool), description
- [ ] Class spell lists (which classes can cast each spell)
- [ ] Searchable/filterable in UI (see US-016)
- [ ] Typecheck passes

#### US-012: Equipment and weapons data
**Description:** As a developer, I need equipment data for the equipment management features.

**Acceptance Criteria:**
- [ ] JSON data with standard weapons (simple + martial, melee + ranged)
- [ ] Weapon properties: damage dice, damage type, properties (finesse, versatile, etc.), weight, cost
- [ ] Armor data: AC, type (light/medium/heavy), strength requirement, stealth disadvantage
- [ ] Common adventuring gear with weight and cost
- [ ] Typecheck passes

### Phase 3: Character Sheet View (Gameplay Mode)

#### US-013: Character sheet layout - page 1 (stats & combat)
**Description:** As a user, I want to view my character's stats in a clean layout matching the PDF sections.

**Acceptance Criteria:**
- [ ] Header: character name, class, level, species, subclass, background
- [ ] Combat stats row: AC, initiative, speed, size, passive perception
- [ ] HP section: current (editable), max, temp HP
- [ ] Hit dice: total and spent tracker
- [ ] Death saves: success/failure checkboxes (3 each)
- [ ] Ability scores displayed with modifiers and saving throws
- [ ] Skills list with bonuses
- [ ] Responsive layout (works on desktop and tablet)
- [ ] Typecheck passes

#### US-014: Character sheet layout - combat features
**Description:** As a user, I want to see my weapons, class features, species traits, and feats.

**Acceptance Criteria:**
- [ ] Weapons table: name, attack bonus, damage, notes
- [ ] Attack bonus auto-calculated (proficiency + STR/DEX mod based on weapon)
- [ ] Class features section populated from class data for current level
- [ ] Species traits section populated from species data
- [ ] Feats section (editable list)
- [ ] Equipment/proficiencies section
- [ ] Typecheck passes

#### US-015: HP and resource tracking during gameplay
**Description:** As a user, I want to quickly adjust HP and track resources during combat.

**Acceptance Criteria:**
- [ ] Click current HP to open quick +/- adjuster
- [ ] "Damage" and "Heal" buttons with amount input
- [ ] Temp HP handled correctly (damage temp first)
- [ ] Hit dice spending: click to spend, shows remaining
- [ ] Death save tracking: click to toggle success/failure
- [ ] Reset death saves button (when stabilized/healed)
- [ ] Changes auto-save
- [ ] Typecheck passes

#### US-016: Spellcasting page
**Description:** As a user, I want to manage my spells and track spell slots.

**Acceptance Criteria:**
- [ ] Spellcasting header: ability, modifier, save DC, attack bonus (all auto-calculated)
- [ ] Spell slot tracker by level: total and expended (clickable to mark used)
- [ ] Cantrips list (always available)
- [ ] Prepared/known spells list organized by level
- [ ] Each spell shows: name, casting time, range, C/R/M indicators
- [ ] Click spell to see full description in modal/panel
- [ ] "Add Spell" opens spell database browser (search, filter by level/school/class)
- [ ] Long rest button resets all spell slots
- [ ] Typecheck passes

#### US-017: Equipment and inventory management
**Description:** As a user, I want to manage my equipment and track currency.

**Acceptance Criteria:**
- [ ] Equipment list with add/remove functionality
- [ ] Equipment browser to add from database
- [ ] Custom item entry for non-standard items
- [ ] Currency tracker: CP, SP, EP, GP, PP with +/- controls
- [ ] Magic item attunement slots (3 max) with tracking
- [ ] Total weight calculation (optional encumbrance)
- [ ] Typecheck passes

#### US-018: Backstory and personality page
**Description:** As a user, I want to record my character's backstory, appearance, and personality.

**Acceptance Criteria:**
- [ ] Appearance section: text area or structured fields (height, weight, eyes, hair, etc.)
- [ ] Backstory text area (rich text or markdown support)
- [ ] Personality traits, ideals, bonds, flaws fields
- [ ] Alignment selector
- [ ] Languages list (editable)
- [ ] Notes section for misc info
- [ ] Typecheck passes

### Phase 4: Character Creation Wizard

#### US-019: Guided character creation flow
**Description:** As a user, I want a step-by-step wizard to create a character so I don't miss anything.

**Acceptance Criteria:**
- [ ] Multi-step wizard: Species → Class → Abilities → Skills → Equipment → Spells → Backstory → Review
- [ ] Progress indicator showing current step
- [ ] Back/Next navigation
- [ ] Each step validates before proceeding
- [ ] Final review shows summary of all choices
- [ ] "Create Character" saves and navigates to character sheet
- [ ] Typecheck passes

#### US-020: Class-based starting equipment selection
**Description:** As a user, I want to choose my starting equipment based on my class.

**Acceptance Criteria:**
- [ ] Equipment step shows class starting equipment options
- [ ] Choice between equipment packs where applicable
- [ ] Selected equipment added to character inventory
- [ ] Gold alternative option if using purchase method
- [ ] Typecheck passes

#### US-021: Level-up workflow
**Description:** As a user, I want guidance when leveling up my character.

**Acceptance Criteria:**
- [ ] "Level Up" button on character sheet when XP >= next level threshold
- [ ] Level up wizard shows: HP increase (roll or average), new features gained
- [ ] ASI/Feat selection at appropriate levels (4, 8, 12, 16, 19)
- [ ] New spell slots shown for casters
- [ ] Spell selection for classes that learn spells on level up
- [ ] Summary of changes before confirming
- [ ] Typecheck passes

### Phase 5: Polish & UX

#### US-022: Responsive navigation and tabs
**Description:** As a user, I want easy navigation between character sheet sections.

**Acceptance Criteria:**
- [ ] Tab navigation: Stats | Combat | Spells | Equipment | Backstory
- [ ] Tabs work on mobile (scrollable or hamburger menu)
- [ ] Current tab highlighted
- [ ] URL updates with tab (allows bookmarking)
- [ ] Keyboard navigation support
- [ ] Typecheck passes

#### US-023: Dark mode support
**Description:** As a user, I want to use dark mode for comfortable viewing during evening sessions.

**Acceptance Criteria:**
- [ ] Toggle in header/settings
- [ ] Respects system preference by default
- [ ] Persists preference in localStorage
- [ ] All components styled for both modes
- [ ] Typecheck passes

#### US-024: Dice roller utility
**Description:** As a user, I want to quickly roll dice from the character sheet.

**Acceptance Criteria:**
- [ ] Dice roller component accessible from header
- [ ] Quick buttons for common dice: d4, d6, d8, d10, d12, d20, d100
- [ ] Custom roll input (e.g., "2d6+3")
- [ ] Click any attack/skill/save to roll with appropriate modifier
- [ ] Roll history visible
- [ ] Typecheck passes

#### US-025: Print-friendly character sheet
**Description:** As a user, I want to print my character sheet for offline use.

**Acceptance Criteria:**
- [ ] "Print" button generates print-optimized view
- [ ] Layout fits standard letter/A4 paper
- [ ] All essential info included (stats, skills, features, spells)
- [ ] Clean formatting without UI chrome
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Characters stored as JSON in localStorage with unique IDs
- FR-2: All derived stats (modifiers, proficiency, spell DC, skill bonuses, attack bonuses) auto-calculated
- FR-3: Proficiency bonus = floor((level-1)/4) + 2
- FR-4: Ability modifier = floor((score-10)/2)
- FR-5: Spell Save DC = 8 + proficiency + spellcasting ability modifier
- FR-6: Spell Attack Bonus = proficiency + spellcasting ability modifier
- FR-7: Initiative = DEX modifier (+ other bonuses if applicable)
- FR-8: Passive Perception = 10 + Perception skill bonus
- FR-9: Export produces valid JSON that can be re-imported
- FR-10: Class features automatically populated based on class and level
- FR-11: Species traits automatically populated based on species selection
- FR-12: Spell database searchable by name, level, school, and class list

## Non-Goals

- No multiplayer/party management features
- No DM tools or encounter tracking
- No character optimization suggestions or build guides
- No official D&D Beyond integration
- No user accounts or cloud sync (local + file export only)
- No mobile app (web only, but responsive)
- No homebrew content management system (users can manually enter custom items)

## Technical Considerations

- **Stack:** Vite + React + TypeScript + Tailwind CSS
- **Routing:** React Router for navigation
- **State:** React Context or Zustand for character state management
- **Storage:** localStorage for persistence, JSON files for import/export
- **Data:** Static JSON files for classes, species, spells, equipment (SRD content)
- **No backend required:** Fully client-side application

## Design Considerations

- Modern, clean UI with cards and clear visual hierarchy
- Responsive design targeting desktop (primary) and tablet
- Accessible: keyboard navigation, screen reader support, sufficient contrast
- Subtle fantasy theming without overwhelming the usability
- Quick access to frequently-used actions (HP adjustment, spell slots)

## Success Metrics

- Character creation completable in under 10 minutes with wizard
- All derived stats calculate correctly per D&D 5e rules
- HP and spell slot tracking requires single click during gameplay
- Export/import works reliably with no data loss
- App loads and responds quickly (< 2s initial load)

## Open Questions

- How comprehensive should the spell database be (SRD only vs expanded)?
- Should we include a compendium/reference section for rules lookup?
- Do we want to support custom/homebrew classes and species?

## Rules Reference

**Target Ruleset:** 2024 Player's Handbook (D&D 5e revised)
- Reference: https://online.anyflip.com/mldog/ynbn/mobile/

Key 2024 PHB differences to implement:
- Species (not "races") with flexible ability score increases
- Backgrounds now grant Origin Feats
- Revised class features and subclass progression
- Updated feat system
- Revised spell lists per class
