# PRD: Skill Expertise Selection

## Introduction

Add the ability for players to select and manage skill expertise. Currently, the app has expertise support in the data model and calculations, but no UI to actually set expertise on skills. This prevents players from using class features like Scholar (Wizard), Expertise (Rogue/Bard), and Deft Explorer (Ranger) that grant expertise in skills.

## Goals

- Allow players to set expertise on proficient skills
- Prompt for expertise selection during level-up when gaining expertise-granting features
- Allow manual expertise toggling on the character sheet anytime
- Enforce RAW rules: expertise only on proficient skills
- Respect feature-specific skill restrictions (e.g., Scholar only allows certain skills)

## User Stories

### US-001: Add expertise toggle to character sheet skills section
**Description:** As a player, I want to toggle expertise on my proficient skills from the character sheet so I can manage my expertise choices anytime.

**Acceptance Criteria:**
- [ ] Each proficient skill shows an expertise toggle (checkbox, button, or clickable indicator)
- [ ] Non-proficient skills cannot have expertise toggled (disabled/hidden toggle)
- [ ] Toggling expertise updates the skill bonus display immediately (+2 at low levels, scaling with proficiency)
- [ ] Expertise state persists when saving character
- [ ] Skills with expertise show 'E' indicator (already implemented)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-002: Create expertise picker modal for level-up
**Description:** As a player, when I level up and gain a feature that grants expertise, I want to be prompted to select which skill(s) to gain expertise in.

**Acceptance Criteria:**
- [ ] Create `ExpertisePickerModal` component similar to existing picker modals
- [ ] Modal shows list of valid skills based on the feature's restrictions
- [ ] Skills already with expertise are disabled/hidden
- [ ] Modal title reflects the feature name (e.g., "Scholar - Choose Expertise Skill")
- [ ] Number of selections matches the feature (1 for Scholar, 2 for Rogue Expertise)
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-003: Define expertise-granting features with skill restrictions
**Description:** As a developer, I need to define which class features grant expertise and what skill restrictions they have.

**Acceptance Criteria:**
- [ ] Add `expertiseGrant` field to class feature type with: `{ count: number, skills?: SkillName[] }`
- [ ] Scholar (Wizard L2): 1 expertise, restricted to Arcana, History, Investigation, Medicine, Nature, Religion
- [ ] Expertise (Rogue L1): 2 expertise, any proficient skill
- [ ] Expertise (Rogue L6): 2 expertise, any proficient skill
- [ ] Expertise (Bard L2): 2 expertise, any proficient skill
- [ ] Expertise (Bard L9): 2 expertise, any proficient skill
- [ ] Deft Explorer (Ranger L2): 1 expertise, any proficient skill
- [ ] Expertise (Ranger L9): 2 expertise, any proficient skill
- [ ] Typecheck passes

### US-004: Integrate expertise picker into level-up flow
**Description:** As a player, when I level up and my class gains an expertise feature, I want the expertise picker to appear automatically so I don't forget to choose.

**Acceptance Criteria:**
- [ ] During level-up, detect if the new level grants an expertise feature
- [ ] After HP roll and other level-up steps, show ExpertisePickerModal if applicable
- [ ] Selected expertise is applied to character's skills
- [ ] Level-up summary includes expertise choices made
- [ ] Typecheck passes
- [ ] Verify in browser using dev-browser skill

### US-005: Track expertise sources
**Description:** As a player, I want to know which feature granted each expertise so I can manage them correctly.

**Acceptance Criteria:**
- [ ] Add optional `expertiseSource?: string` field to skill type
- [ ] When expertise is granted via level-up, record the source feature name
- [ ] Display source in tooltip or skill detail when hovering over expertise indicator
- [ ] Manual expertise toggles use source "Manual" or similar
- [ ] Typecheck passes

## Functional Requirements

- FR-1: Expertise can only be added to skills where `proficient: true`
- FR-2: Toggling expertise on character sheet sets `skill.expertise = true/false`
- FR-3: Features with `expertiseGrant.skills` array restrict choices to those skills only
- FR-4: Features with `expertiseGrant.count` determine how many skills can be selected
- FR-5: Expertise picker shows only proficient skills that match any restrictions
- FR-6: Skills already with expertise cannot be selected again
- FR-7: Skill bonus with expertise = ability modifier + (proficiency bonus × 2)
- FR-8: Passive Perception with expertise uses doubled proficiency (already implemented)

## Non-Goals

- No tool expertise support in this PRD (future enhancement)
- No automatic expertise removal when losing proficiency (edge case)
- No expertise tracking limits (trust player to follow rules)
- No Jack of All Trades interaction (Bard feature, separate concern)

## Design Considerations

- Expertise toggle on character sheet should be subtle (small checkbox or click-to-cycle: none → proficient → expertise)
- Consider a three-state toggle: ○ (none) → ● (proficient) → ◉ (expertise)
- Modal should match existing picker modal styling (spell picker, invocation picker, etc.)
- Skills list in modal should show current bonus preview with expertise applied

## Technical Considerations

- Existing `Skill` type already has `expertise: boolean` field
- `getSkillBonus()` already handles expertise calculation
- Display already shows 'E' for expertise - just need toggle mechanism
- Level-up flow is in `CharacterSheetPage.tsx` - integrate picker there
- Class features are in `src/data/classes.ts` - add `expertiseGrant` metadata

### Class Features with Expertise Grants:

| Class | Feature | Level | Count | Restricted Skills |
|-------|---------|-------|-------|-------------------|
| Rogue | Expertise | 1 | 2 | Any proficient |
| Rogue | Expertise | 6 | 2 | Any proficient |
| Bard | Expertise | 2 | 2 | Any proficient |
| Bard | Expertise | 9 | 2 | Any proficient |
| Wizard | Scholar | 2 | 1 | Arcana, History, Investigation, Medicine, Nature, Religion |
| Ranger | Deft Explorer | 2 | 1 | Any proficient |
| Ranger | Expertise | 9 | 2 | Any proficient |

## Success Metrics

- Players can select expertise during level-up for applicable features
- Players can manually toggle expertise on character sheet
- Skill bonuses correctly reflect expertise (+doubled proficiency)
- No confusion about which skills are eligible for expertise

## Open Questions

- Should there be a visual distinction between "manually added" vs "feature-granted" expertise?
- Should removing proficiency from a skill automatically remove expertise?
- How to handle multiclass characters with multiple expertise sources?
