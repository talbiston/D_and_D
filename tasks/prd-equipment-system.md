# PRD: Equipment System

## Introduction

Implement a comprehensive equipment management system based on D&D 2024 Player's Handbook Chapter 6. This includes a complete database of weapons, armor, adventuring gear, and tools with automatic calculations for attack bonuses, armor class, encumbrance, and tool proficiency checks. Users can manage their inventory with weight tracking and choose starting equipment during character creation.

## Goals

- Provide complete weapon database with all PHB weapons and auto-calculated attack/damage bonuses
- Provide complete armor database with automatic AC calculation (with manual override)
- Implement full inventory system with weight tracking and encumbrance rules
- Allow players to choose between starting equipment packs or starting gold during character creation
- Implement tool proficiency system with tool-based ability checks
- Calculate carrying capacity based on Strength score
- Support equipment categories: weapons, armor, adventuring gear, tools, and miscellaneous

## User Stories

### US-001: Create weapons data file with all PHB weapons
**Description:** As a developer, I need a complete weapons database so players can select from official D&D weapons.

**Acceptance Criteria:**
- [ ] Create `src/data/weapons.ts` with all simple weapons (club, dagger, greatclub, handaxe, javelin, light hammer, mace, quarterstaff, sickle, spear, light crossbow, dart, shortbow, sling)
- [ ] Include all martial weapons (battleaxe, flail, glaive, greataxe, greatsword, halberd, lance, longsword, maul, morningstar, pike, rapier, scimitar, shortsword, trident, war pick, warhammer, whip, blowgun, hand crossbow, heavy crossbow, longbow, net)
- [ ] Each weapon includes: name, category (simple/martial), type (melee/ranged), damage dice, damage type, weight, cost, properties array, and range (if applicable)
- [ ] Export helper functions: `getWeaponByName()`, `getWeaponsByCategory()`, `getWeaponsByProperty()`
- [ ] Typecheck passes

### US-002: Create armor data file with all PHB armor
**Description:** As a developer, I need a complete armor database so players can select from official D&D armor.

**Acceptance Criteria:**
- [ ] Create `src/data/armor.ts` with all light armor (padded, leather, studded leather)
- [ ] Include all medium armor (hide, chain shirt, scale mail, breastplate, half plate)
- [ ] Include all heavy armor (ring mail, chain mail, splint, plate)
- [ ] Include shields
- [ ] Each armor includes: name, category (light/medium/heavy/shield), baseAC, dexBonus (true/false/max2), minStrength (if any), stealthDisadvantage, weight, cost
- [ ] Export helper functions: `getArmorByName()`, `getArmorByCategory()`
- [ ] Typecheck passes

### US-003: Create adventuring gear data file
**Description:** As a developer, I need an adventuring gear database for common equipment items.

**Acceptance Criteria:**
- [ ] Create `src/data/gear.ts` with common adventuring gear (backpack, bedroll, rope, torch, rations, waterskin, tinderbox, etc.)
- [ ] Include containers with capacity (backpack, pouch, sack, chest, etc.)
- [ ] Each item includes: name, category, weight, cost, description
- [ ] Categories: "adventuring gear", "container", "ammunition", "holy symbol", "arcane focus", "druidic focus"
- [ ] Export helper functions: `getGearByName()`, `getGearByCategory()`
- [ ] Typecheck passes

### US-004: Create tools data file with all PHB tools
**Description:** As a developer, I need a complete tools database for proficiency tracking.

**Acceptance Criteria:**
- [ ] Create `src/data/tools.ts` with all artisan's tools (alchemist's supplies, brewer's supplies, calligrapher's supplies, carpenter's tools, cartographer's tools, cobbler's tools, cook's utensils, glassblower's tools, jeweler's tools, leatherworker's tools, mason's tools, painter's supplies, potter's tools, smith's tools, tinker's tools, weaver's tools, woodcarver's tools)
- [ ] Include gaming sets (dice set, dragonchess set, playing card set, three-dragon ante set)
- [ ] Include musical instruments (bagpipes, drum, dulcimer, flute, horn, lute, lyre, pan flute, shawm, viol)
- [ ] Include other tools (disguise kit, forgery kit, herbalism kit, navigator's tools, poisoner's kit, thieves' tools, vehicles)
- [ ] Each tool includes: name, category, weight, cost, abilityUsed (for checks)
- [ ] Export helper functions: `getToolByName()`, `getToolsByCategory()`
- [ ] Typecheck passes

### US-005: Create equipment packs data for starting equipment
**Description:** As a developer, I need equipment pack definitions for character creation.

**Acceptance Criteria:**
- [ ] Create `src/data/equipmentPacks.ts` with all PHB equipment packs
- [ ] Include: Burglar's Pack, Diplomat's Pack, Dungeoneer's Pack, Entertainer's Pack, Explorer's Pack, Priest's Pack, Scholar's Pack
- [ ] Each pack includes: name, cost, contents (array of {item, quantity})
- [ ] Export helper function: `getPackByName()`
- [ ] Typecheck passes

### US-006: Add class starting equipment options to classes data
**Description:** As a developer, I need starting equipment options defined for each class.

**Acceptance Criteria:**
- [ ] Update `src/data/classes.ts` to include `startingEquipment` for each class
- [ ] Each class has equipment choices (e.g., "longsword OR any martial weapon")
- [ ] Each class has a `startingGold` option (dice formula like "5d4 x 10 gp")
- [ ] Include armor, weapons, packs, and other gear per PHB
- [ ] Typecheck passes

### US-007: Update Character type for enhanced equipment tracking
**Description:** As a developer, I need to update the Character type to support the new equipment system.

**Acceptance Criteria:**
- [ ] Update `Weapon` interface to reference weapon data (add `isEquipped`, `isTwoHanding` for versatile)
- [ ] Add `Armor` interface with: name, isEquipped, isShield
- [ ] Add `equippedArmor` and `equippedShield` fields to Character
- [ ] Add `inventory` field as array of InventoryItem (name, quantity, weight, category, notes)
- [ ] Add `toolProficiencies` as string array (tool names)
- [ ] Add `carryingCapacity` computed field or helper function
- [ ] Add `manualACOverride` optional field for manual AC override
- [ ] Typecheck passes

### US-008: Create AC calculation utility
**Description:** As a user, I want my AC calculated automatically based on equipped armor so I don't have to calculate it manually.

**Acceptance Criteria:**
- [ ] Create `calculateAC()` function in `src/utils/calculations.ts`
- [ ] Calculate AC from: base armor + Dex modifier (respecting armor limits) + shield bonus
- [ ] Handle unarmored defense for Barbarian (10 + Dex + Con)
- [ ] Handle unarmored defense for Monk (10 + Dex + Wis)
- [ ] Handle "no armor" case (10 + Dex)
- [ ] Support Mage Armor spell effect (13 + Dex when unarmored)
- [ ] Return calculated AC, but allow `manualACOverride` to take precedence if set
- [ ] Typecheck passes

### US-009: Create attack bonus calculation utility
**Description:** As a user, I want my weapon attack bonuses calculated automatically.

**Acceptance Criteria:**
- [ ] Create `calculateAttackBonus()` function in `src/utils/calculations.ts`
- [ ] Calculate: proficiency bonus (if proficient) + ability modifier
- [ ] Use Strength for melee weapons, Dexterity for ranged weapons
- [ ] Handle Finesse property (use higher of Str or Dex)
- [ ] Handle Thrown property correctly (Str for melee, can use for ranged)
- [ ] Include weapon's attackBonus modifier if present (magic weapons)
- [ ] Typecheck passes

### US-010: Create damage calculation utility
**Description:** As a user, I want my weapon damage displayed with the correct modifier.

**Acceptance Criteria:**
- [ ] Create `calculateDamageBonus()` function in `src/utils/calculations.ts`
- [ ] Add ability modifier to damage (Str for melee, Dex for Finesse/ranged)
- [ ] Handle two-weapon fighting (no modifier for off-hand unless has fighting style)
- [ ] Handle versatile weapons (show both 1h and 2h damage)
- [ ] Format output as "1d8+3 slashing" style
- [ ] Typecheck passes

### US-011: Create encumbrance calculation utility
**Description:** As a user, I want to see my current carry weight and encumbrance status.

**Acceptance Criteria:**
- [ ] Create `calculateCarryingCapacity()` function: Strength score x 15 lbs
- [ ] Create `calculateCurrentWeight()` function: sum of all inventory + equipped items
- [ ] Create `getEncumbranceStatus()` function returning: "normal", "encumbered", "heavily encumbered"
- [ ] Encumbered: carrying weight > Strength x 5 (speed -10)
- [ ] Heavily Encumbered: carrying weight > Strength x 10 (speed -20, disadvantage on ability checks, attacks, saves using Str, Dex, or Con)
- [ ] Typecheck passes

### US-012: Create tool check utility
**Description:** As a user, I want to make tool proficiency checks with the correct bonus.

**Acceptance Criteria:**
- [ ] Create `calculateToolCheck()` function in `src/utils/calculations.ts`
- [ ] Add proficiency bonus if character has proficiency with the tool
- [ ] Add relevant ability modifier based on the tool's associated ability
- [ ] Support expertise (double proficiency bonus) for tools
- [ ] Typecheck passes

### US-013: Add equipment selection to character creation - weapons
**Description:** As a user, I want to select my starting weapons during character creation.

**Acceptance Criteria:**
- [ ] Add weapon selection step to CharacterCreatePage
- [ ] Show class-specific weapon choices (e.g., Fighter: "martial weapon and shield" OR "two martial weapons")
- [ ] Allow selecting from weapon database based on restrictions
- [ ] Show weapon stats (damage, properties) when selecting
- [ ] Selected weapons are added to character's weapons array
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-014: Add equipment selection to character creation - armor
**Description:** As a user, I want to select my starting armor during character creation.

**Acceptance Criteria:**
- [ ] Add armor selection step to CharacterCreatePage
- [ ] Show class-specific armor options based on proficiencies
- [ ] Only show armor the character is proficient with
- [ ] Display AC calculation preview when selecting armor
- [ ] Selected armor is set as equipped
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-015: Add equipment pack or gold choice to character creation
**Description:** As a user, I want to choose between starting equipment packs or starting gold.

**Acceptance Criteria:**
- [ ] Add toggle: "Equipment Pack" vs "Starting Gold"
- [ ] If pack: show class's equipment pack choice and add contents to inventory
- [ ] If gold: roll starting gold dice and add to currency
- [ ] Display pack contents when pack is selected
- [ ] Show gold amount when gold option is selected
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-016: Display weapons on character sheet with attack/damage
**Description:** As a user, I want to see my weapons with calculated attack bonus and damage on the character sheet.

**Acceptance Criteria:**
- [ ] Display weapons section on character sheet
- [ ] Show each weapon with: name, attack bonus (e.g., "+5"), damage (e.g., "1d8+3 slashing")
- [ ] Show weapon properties as tags/badges
- [ ] Indicate if proficient (checkmark or similar)
- [ ] Allow marking weapon as equipped/unequipped
- [ ] Support versatile toggle for 1h/2h damage display
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-017: Display armor and AC on character sheet
**Description:** As a user, I want to see my equipped armor and calculated AC on the character sheet.

**Acceptance Criteria:**
- [ ] Display equipped armor name and type
- [ ] Display equipped shield if any
- [ ] Show calculated AC prominently
- [ ] Show breakdown tooltip: "10 + 2 (armor) + 3 (Dex) + 2 (shield) = 17"
- [ ] Add "Override AC" button/toggle for manual entry
- [ ] When override is set, show both calculated and override values
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-018: Create inventory management UI
**Description:** As a user, I want to manage my inventory with add/remove/edit capabilities.

**Acceptance Criteria:**
- [ ] Display inventory list grouped by category (gear, ammunition, containers, etc.)
- [ ] Show item name, quantity, weight per item, total weight
- [ ] Add item button opens modal with gear database search
- [ ] Allow custom item entry (name, weight, quantity, notes)
- [ ] Edit quantity inline or via modal
- [ ] Delete item with confirmation
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-019: Display encumbrance status on character sheet
**Description:** As a user, I want to see my current carry weight and encumbrance status.

**Acceptance Criteria:**
- [ ] Display current weight / carrying capacity (e.g., "45 / 150 lbs")
- [ ] Show visual progress bar for weight
- [ ] Color code: green (normal), yellow (encumbered), red (heavily encumbered)
- [ ] Display encumbrance penalties when applicable
- [ ] Show tooltip explaining encumbrance rules
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-020: Add tool proficiency tracking and checks
**Description:** As a user, I want to see my tool proficiencies and make tool checks.

**Acceptance Criteria:**
- [ ] Display tool proficiencies section on character sheet
- [ ] List all proficient tools with their associated ability
- [ ] Show check bonus for each tool (proficiency + ability modifier)
- [ ] Add "Roll" button to roll d20 + bonus for tool check
- [ ] Support adding/removing tool proficiencies
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-021: Add weapon to inventory from database
**Description:** As a user, I want to add weapons from the database to my inventory.

**Acceptance Criteria:**
- [ ] "Add Weapon" button opens weapon picker modal
- [ ] Search/filter weapons by name, category, properties
- [ ] Show weapon details on selection
- [ ] Add selected weapon to character's weapons array
- [ ] Newly added weapons default to unequipped
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-022: Add armor to inventory from database
**Description:** As a user, I want to add armor from the database to my inventory.

**Acceptance Criteria:**
- [ ] "Add Armor" button opens armor picker modal
- [ ] Search/filter armor by name, category
- [ ] Show armor details and AC calculation preview
- [ ] Warn if not proficient with selected armor
- [ ] Add selected armor to character's inventory
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-023: Equip/unequip armor with AC recalculation
**Description:** As a user, I want to equip armor and have my AC update automatically.

**Acceptance Criteria:**
- [ ] Armor items have equip/unequip toggle
- [ ] Only one armor can be equipped at a time (auto-unequip previous)
- [ ] One shield can be equipped alongside armor
- [ ] AC recalculates immediately on equip/unequip
- [ ] Show warning if lacking proficiency (disadvantage on checks/attacks)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-024: Currency management and conversion
**Description:** As a user, I want to manage my currency with conversion options.

**Acceptance Criteria:**
- [ ] Display all currency types (cp, sp, ep, gp, pp) with editable values
- [ ] Add currency button (quick add gold from loot)
- [ ] "Convert" button to consolidate coins (e.g., 100cp -> 1gp)
- [ ] Show total value in gold pieces
- [ ] Currency has weight: 50 coins = 1 lb (optional setting)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

## Functional Requirements

- FR-1: Store complete weapon data with name, damage, type, properties, weight, cost
- FR-2: Store complete armor data with name, AC calculation, weight, cost, requirements
- FR-3: Store adventuring gear with weight, cost, and descriptions
- FR-4: Store tools with associated ability scores for checks
- FR-5: Calculate attack bonus as proficiency (if proficient) + ability modifier + magic bonus
- FR-6: Calculate damage as dice + ability modifier + magic bonus
- FR-7: Calculate AC as base armor AC + Dex modifier (within limits) + shield + other bonuses
- FR-8: Support unarmored defense for Barbarian and Monk classes
- FR-9: Allow manual AC override that takes precedence over calculated value
- FR-10: Calculate carrying capacity as Strength x 15 pounds
- FR-11: Calculate encumbrance thresholds at Str x 5 and Str x 10
- FR-12: Track tool proficiencies and calculate tool check bonuses
- FR-13: Provide starting equipment choices during character creation
- FR-14: Allow choice between equipment packs or starting gold
- FR-15: Display encumbrance status with visual indicator and penalties
- FR-16: Support adding/removing/editing inventory items
- FR-17: Support equipping/unequipping weapons and armor
- FR-18: Support currency tracking and conversion between denominations

## Non-Goals

- Mount and vehicle management (beyond basic proficiency tracking)
- Magic item special abilities (just track name and basic bonuses)
- Ammunition tracking automation (users track manually)
- Shopping/merchant system
- Item crafting rules
- Carrying capacity variants (e.g., Powerful Build handled separately)
- Lifestyle expenses tracking

## Technical Considerations

- Reuse existing dice roller component for tool checks and starting gold rolls
- Weapon/armor data files should be similar structure to existing `spells.ts`
- Equipment weight should use number type (pounds), not string
- AC calculation should be a pure function that can be called from multiple places
- Consider memoization for expensive calculations (total weight, AC)
- Equipped items should be separate from inventory to avoid duplication

## Design Considerations

- Weapons section should show attack/damage prominently (similar to paper character sheet)
- AC display should be large and prominent with breakdown on hover/click
- Inventory should support drag-and-drop reordering (nice to have)
- Encumbrance bar should be visually clear without being obtrusive
- Mobile-friendly inventory management

## Success Metrics

- All PHB weapons and armor available in database
- AC calculates correctly for all armor types and class features
- Attack/damage bonuses calculate correctly including Finesse
- Encumbrance rules applied correctly based on carry weight
- Character creation includes equipment selection
- Tool checks roll with correct bonuses

## Open Questions

- Should ammunition (arrows, bolts) auto-decrement when attacking? (Deferred to non-goal for now)
- Should we track attunement for magic items? (Consider for future enhancement)
- How to handle dual-wielding weapon display?
