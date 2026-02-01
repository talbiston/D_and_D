# PRD: App Artwork and Icons

## Introduction

Add tasteful artwork and icons to the D&D character sheet app to enhance the visual experience and create a modern fantasy aesthetic. This includes class icons, species icons (where available), and subtle background textures throughout the application.

## Goals

- Add visual identity to character classes with official-style icons
- Enhance species display with icons where available
- Create a cohesive modern fantasy aesthetic with subtle textures
- Improve visual scanning and recognition across the app
- Maintain excellent readability in both light and dark modes

## Assets Available

From the downloaded D&D 5e Icons pack (`/tmp/...scratchpad/`):

**Class Icons (all 13):**
- Artificer, Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger, Rogue, Sorcerer, Warlock, Wizard

**Species Icons (11 available):**
- Tiefling, Forest Gnome, High Elf, Drow, Firbolg, Triton, Yuan-Ti
- Air Genasi, Earth Genasi, Fire Genasi, Water Genasi

**Not available (skip these):**
- Dragonborn, Dwarf, Halfling, Human, Orc, Aasimar, Goliath
- Ability score icons
- Spell school icons

## User Stories

### US-001: Set up icon infrastructure
**Description:** As a developer, I need an organized icon system so icons can be easily used throughout the app.

**Acceptance Criteria:**
- [ ] Create `public/icons/classes/` directory with all 13 class SVGs (lowercase filenames)
- [ ] Create `public/icons/species/` directory with available species SVGs (lowercase filenames)
- [ ] SVG files are cleaned up (removed unnecessary metadata, consistent viewBox)
- [ ] Typecheck passes

### US-002: Create ClassIcon component
**Description:** As a developer, I need a reusable ClassIcon component to display class icons consistently.

**Acceptance Criteria:**
- [ ] Create `src/components/ClassIcon.tsx` component
- [ ] Accepts `className` (the D&D class name) and `size` props
- [ ] Returns null gracefully for unknown classes
- [ ] Supports dark mode (CSS filter or currentColor approach)
- [ ] Default size is 24px
- [ ] Typecheck passes

### US-003: Create SpeciesIcon component
**Description:** As a developer, I need a reusable SpeciesIcon component to display species icons where available.

**Acceptance Criteria:**
- [ ] Create `src/components/SpeciesIcon.tsx` component
- [ ] Accepts `species` name and `size` props
- [ ] Returns null gracefully for species without icons
- [ ] Supports dark mode styling
- [ ] Default size is 24px
- [ ] Typecheck passes

### US-004: Add class icon to character sheet header
**Description:** As a user, I want to see my character's class icon in the character sheet header so the class is visually identifiable.

**Acceptance Criteria:**
- [ ] Class icon appears next to class name in character sheet header
- [ ] Icon is 28-32px size
- [ ] Icon displays correctly in both light and dark modes
- [ ] Typecheck passes
- [ ] Verify in browser

### US-005: Add species icon to character sheet header
**Description:** As a user, I want to see my character's species icon (if available) in the character sheet header.

**Acceptance Criteria:**
- [ ] Species icon appears next to species name (when icon exists)
- [ ] No icon shown for species without icons (no broken image)
- [ ] Icon is 28-32px size
- [ ] Displays correctly in both light and dark modes
- [ ] Typecheck passes
- [ ] Verify in browser

### US-006: Add icons to home page character cards
**Description:** As a user, I want to see class and species icons on character cards on the home page for quick visual identification.

**Acceptance Criteria:**
- [ ] Class icon appears on each character card
- [ ] Species icon appears on each character card (when available)
- [ ] Icons are 24px size on cards
- [ ] Cards remain visually balanced and not cluttered
- [ ] Typecheck passes
- [ ] Verify in browser

### US-007: Add class icon to character creation
**Description:** As a user, I want to see class icons in the class selection dropdown during character creation.

**Acceptance Criteria:**
- [ ] Class icon appears next to each class option in dropdown/selector
- [ ] Selected class shows icon prominently
- [ ] Icons are 20-24px in dropdown
- [ ] Typecheck passes
- [ ] Verify in browser

### US-008: Add subtle background texture to cards
**Description:** As a user, I want cards to have a subtle parchment-like texture for a fantasy feel without sacrificing readability.

**Acceptance Criteria:**
- [ ] Create or source a subtle parchment/paper texture (very low opacity)
- [ ] Apply texture to main card components
- [ ] Texture is subtle enough to not interfere with text readability
- [ ] Works well in both light and dark modes (may need different textures)
- [ ] Typecheck passes
- [ ] Verify in browser

### US-009: Add icons to spell picker modal
**Description:** As a user, I want to see class icons in the spell picker to identify which classes can cast each spell.

**Acceptance Criteria:**
- [ ] Small class icons (16-20px) shown for each spell's available classes
- [ ] Icons appear in the spell list rows
- [ ] Does not clutter the interface
- [ ] Typecheck passes
- [ ] Verify in browser

## Functional Requirements

- FR-1: Store all icon SVGs in `public/icons/` with subdirectories for categories
- FR-2: Icon components must handle missing icons gracefully (return null, no errors)
- FR-3: All icons must be visible in both light and dark modes
- FR-4: Icons should use CSS for dark mode adaptation (filter or fill color)
- FR-5: Default icon size is 24px, configurable via props
- FR-6: Background textures must be very subtle (5-15% opacity range)
- FR-7: Texture must not impact text contrast ratios for accessibility

## Non-Goals

- No ability score icons (not available in pack)
- No spell school icons (not available in pack)
- No animated icons
- No icon customization by users
- No icons for species not in the downloaded pack
- No faction icons (save for future feature)

## Design Considerations

- **Icon style:** The downloaded icons are solid black (#00040c). For dark mode, use CSS `filter: invert(1)` or modify SVGs to use `currentColor`
- **Texture approach:** Use a semi-transparent PNG overlay or CSS pattern. Keep opacity very low (5-10%)
- **Placement:** Icons should enhance, not dominate. Place beside text, not replacing it
- **Consistency:** Same size icons in same contexts throughout app

## Technical Considerations

- SVGs in `public/` folder can be referenced via `<img src="/icons/classes/wizard.svg">`
- Alternatively, import SVGs as React components for more control
- For dark mode, CSS `filter: invert(1) brightness(0.9)` works well on dark icons
- Consider lazy loading icons if performance becomes an issue
- Texture images should be small and tileable (< 50KB)

## Success Metrics

- Icons display correctly on all character sheets
- No visual regression in light or dark mode
- App maintains fast load times (< 100KB added for all icons)
- Visual coherence - icons feel like part of the app, not bolted on

## Open Questions

- Should class icons also appear in the level-up modals?
- Should we add a subtle border/frame around icons?
