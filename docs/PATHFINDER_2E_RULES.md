# Pathfinder 2E Remastered - Rules Engine Design

This document details the implementation design for the Pathfinder 2E Remastered rules engine, covering character creation, combat, spellcasting, conditions, and skill checks.

## Table of Contents

- [Overview](#overview)
- [Core Mechanics](#core-mechanics)
- [Character System](#character-system)
- [Combat System](#combat-system)
- [Spell System](#spell-system)
- [Condition System](#condition-system)
- [Skill System](#skill-system)
- [Dice Rolling](#dice-rolling)
- [Implementation Strategy](#implementation-strategy)

---

## Overview

### P2E Remastered Key Features

1. **Three-Action Economy**: Each turn provides 3 actions + 1 reaction
2. **Degrees of Success**: Critical Success, Success, Failure, Critical Failure
3. **Proficiency Tiers**: Untrained → Trained → Expert → Master → Legendary
4. **Conditions with Values**: Frightened 2, Clumsy 3, etc.
5. **Focus Points**: Separate resource pool from spell slots (fully restored after combat)
6. **Auto-Heightening**: Spells automatically scale with caster level
7. **Modifiers Only**: Ability scores represented as modifiers (-5 to +5+)

### Rules Engine Architecture

```
packages/rules-engine/
├── src/
│   ├── character/          # Character creation, progression
│   ├── combat/             # Action economy, attack resolution
│   ├── spells/             # Spell system, slots, effects
│   ├── conditions/         # Status conditions and effects
│   ├── skills/             # Skill checks and actions
│   ├── items/              # Equipment, weapons, armor
│   ├── feats/              # Feat system
│   └── dice/               # Random number generation
```

---

## Core Mechanics

### Proficiency System

The proficiency system is fundamental to P2E. Proficiency ranks provide escalating bonuses that scale with character level.

```typescript
enum ProficiencyRank {
  Untrained = 0,  // +0
  Trained = 2,    // +2 + level
  Expert = 4,     // +4 + level
  Master = 6,     // +6 + level
  Legendary = 8   // +8 + level
}

function calculateProficiencyBonus(rank: ProficiencyRank, level: number): number {
  if (rank === ProficiencyRank.Untrained) {
    return 0;
  }
  return rank + level;
}

// Example: Level 10 Expert
// Bonus = 4 + 10 = +14
```

### Degree of Success

Most checks in P2E have four possible outcomes:

```typescript
enum DegreeOfSuccess {
  CriticalSuccess,  // Beat DC by 10+
  Success,          // Meet or beat DC
  Failure,          // Below DC
  CriticalFailure   // Miss DC by 10+
}

function determineDegree(total: number, dc: number, naturalRoll: number): DegreeOfSuccess {
  let degree: DegreeOfSuccess;

  if (total >= dc + 10) {
    degree = DegreeOfSuccess.CriticalSuccess;
  } else if (total >= dc) {
    degree = DegreeOfSuccess.Success;
  } else if (total <= dc - 10) {
    degree = DegreeOfSuccess.CriticalFailure;
  } else {
    degree = DegreeOfSuccess.Failure;
  }

  // Natural 20: upgrade by one degree
  if (naturalRoll === 20) {
    if (degree === DegreeOfSuccess.Failure) degree = DegreeOfSuccess.Success;
    else if (degree === DegreeOfSuccess.Success) degree = DegreeOfSuccess.CriticalSuccess;
  }

  // Natural 1: downgrade by one degree
  if (naturalRoll === 1) {
    if (degree === DegreeOfSuccess.CriticalSuccess) degree = DegreeOfSuccess.Success;
    else if (degree === DegreeOfSuccess.Success) degree = DegreeOfSuccess.Failure;
    else if (degree === DegreeOfSuccess.Failure) degree = DegreeOfSuccess.CriticalFailure;
  }

  return degree;
}
```

### Modifier Types

P2E uses typed bonuses that don't stack with the same type:

```typescript
enum ModifierType {
  Ability = 'ability',           // From ability scores
  Proficiency = 'proficiency',   // From proficiency ranks
  Item = 'item',                 // From magic items
  Status = 'status',             // From spells/conditions
  Circumstance = 'circumstance'  // From tactics/environment
}

interface Modifier {
  type: ModifierType;
  value: number;
  source: string;
}

function combineModifiers(modifiers: Modifier[]): number {
  // Only highest bonus of each type applies
  const byType = new Map<ModifierType, number[]>();

  modifiers.forEach(mod => {
    if (!byType.has(mod.type)) {
      byType.set(mod.type, []);
    }
    byType.get(mod.type)!.push(mod.value);
  });

  let total = 0;
  byType.forEach(values => {
    // Take highest bonus and lowest penalty
    const bonuses = values.filter(v => v > 0);
    const penalties = values.filter(v => v < 0);

    if (bonuses.length > 0) {
      total += Math.max(...bonuses);
    }
    if (penalties.length > 0) {
      total += Math.min(...penalties);
    }
  });

  return total;
}
```

---

## Character System

### Character Data Model

```typescript
interface Character {
  // Identity
  id: string;
  name: string;
  player?: string;

  // Core Build
  ancestry: Ancestry;           // Human, Elf, Dwarf, etc.
  heritage: Heritage;           // Half-Elf, Mountain Dwarf, etc.
  background: Background;       // Acolyte, Criminal, Scholar, etc.
  class: Class;                 // Fighter, Wizard, Cleric, etc.
  level: number;
  experience: number;

  // Ability Scores (modifiers)
  abilities: AbilityScores;

  // Hit Points
  hp: number;
  maxHp: number;
  tempHp: number;

  // Armor Class
  ac: number;

  // Saves
  saves: {
    fortitude: Save;
    reflex: Save;
    will: Save;
  };

  // Perception
  perception: Perception;

  // Proficiencies
  proficiencies: {
    perception: ProficiencyRank;
    skills: Map<Skill, ProficiencyRank>;
    weapons: Map<WeaponGroup, ProficiencyRank>;
    armor: Map<ArmorGroup, ProficiencyRank>;
    classDC: ProficiencyRank;
    spells?: ProficiencyRank;
  };

  // Class Features
  classFeatures: ClassFeature[];
  feats: Feat[];

  // Spellcasting (if applicable)
  spellcasting?: SpellcastingData;

  // Equipment
  inventory: Item[];
  equipped: EquippedItems;
  currency: { cp: number; sp: number; gp: number; pp: number };

  // Active Effects
  conditions: Condition[];
  activeEffects: Effect[];

  // Movement
  speed: number;

  // Senses
  senses: Sense[];

  // Languages
  languages: string[];
}
```

### Ability Scores

P2E uses modifiers directly rather than tracking full scores:

```typescript
interface AbilityScores {
  strength: number;      // -5 to +5+ (modifier)
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

// If tracking full scores (for reference):
function abilityScoreToModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Ability boosts increase modifier by +1 (or score by +2)
function applyAbilityBoost(modifier: number): number {
  return modifier + 1;
}
```

### Character Creation Process

```typescript
interface CharacterCreationData {
  // Step 1: Concept
  name: string;

  // Step 2: Ancestry
  ancestry: AncestryChoice;
  heritage: HeritageChoice;
  ancestryFeat: FeatChoice;

  // Step 3: Background
  background: BackgroundChoice;
  backgroundBoosts: [Ability, Ability];
  backgroundSkill: Skill;

  // Step 4: Class
  class: ClassChoice;
  classKeyAbility: Ability;

  // Step 5: Free Boosts
  freeBoosts: [Ability, Ability, Ability, Ability];

  // Step 6: Finalize
  deity?: Deity;  // If relevant
  alignment?: Alignment;  // Removed in Remaster, but may track
}

class CharacterBuilder {
  createCharacter(data: CharacterCreationData): Character {
    const char: Character = this.initializeCharacter(data.name);

    // Apply ancestry
    this.applyAncestry(char, data.ancestry, data.heritage);
    char.feats.push(data.ancestryFeat);

    // Apply background
    this.applyBackground(char, data.background);
    this.applyAbilityBoosts(char, data.backgroundBoosts);
    char.proficiencies.skills.set(data.backgroundSkill, ProficiencyRank.Trained);

    // Apply class
    this.applyClass(char, data.class);
    this.applyAbilityBoost(char, data.classKeyAbility);

    // Apply free boosts
    this.applyAbilityBoosts(char, data.freeBoosts);

    // Calculate derived stats
    this.calculateDerivedStats(char);

    // Starting equipment
    this.applyStartingEquipment(char, data.class);

    return char;
  }

  private calculateDerivedStats(char: Character): void {
    // Max HP = Ancestry HP + Class HP + (Con mod × level)
    char.maxHp = char.ancestry.hp + char.class.hp + (char.abilities.constitution * char.level);
    char.hp = char.maxHp;

    // AC = 10 + Dex mod + Proficiency + Armor + Shield
    char.ac = this.calculateAC(char);

    // Saves = Ability mod + Proficiency
    char.saves.fortitude.bonus = char.abilities.constitution +
      calculateProficiencyBonus(char.saves.fortitude.proficiency, char.level);
    char.saves.reflex.bonus = char.abilities.dexterity +
      calculateProficiencyBonus(char.saves.reflex.proficiency, char.level);
    char.saves.will.bonus = char.abilities.wisdom +
      calculateProficiencyBonus(char.saves.will.proficiency, char.level);

    // Perception = Wis mod + Proficiency
    char.perception.bonus = char.abilities.wisdom +
      calculateProficiencyBonus(char.proficiencies.perception, char.level);
  }
}
```

### Level Advancement

```typescript
class ProgressionManager {
  levelUp(char: Character): void {
    char.level++;

    // HP increase
    char.maxHp += char.class.hp + char.abilities.constitution;
    char.hp = char.maxHp;  // Optional: full heal on level up

    // Class features
    const levelFeatures = this.getClassFeaturesForLevel(char.class, char.level);
    char.classFeatures.push(...levelFeatures);

    // Ability boosts (every 5 levels)
    if (char.level % 5 === 0) {
      // Player chooses 4 ability boosts
      this.grantAbilityBoosts(char, 4);
    }

    // Skill increases
    const skillIncreases = this.getSkillIncreasesForLevel(char.class, char.level);
    if (skillIncreases > 0) {
      // Player chooses which skills to increase
      this.grantSkillIncreases(char, skillIncreases);
    }

    // Feats
    if (this.grantsAncestryFeat(char.level)) {
      // Grant ancestry feat
    }
    if (this.grantsClassFeat(char.class, char.level)) {
      // Grant class feat
    }
    if (this.grantsGeneralFeat(char.level)) {
      // Grant general feat
    }

    // Spell slots (if caster)
    if (char.spellcasting) {
      this.updateSpellSlots(char);
    }

    // Recalculate all derived stats
    this.recalculateStats(char);
  }
}
```

---

## Combat System

### Three-Action Economy

Every character gets 3 actions per turn plus 1 reaction:

```typescript
enum ActionCost {
  Free = 0,          // Free action (no cost)
  OneAction = 1,     // ◆ Single action
  TwoActions = 2,    // ◆◆ Activity
  ThreeActions = 3,  // ◆◆◆ Activity
  Reaction = -1      // ↻ Reaction (special timing)
}

interface CombatTurn {
  combatantId: string;
  actionsRemaining: number;     // Starts at 3
  reactionUsed: boolean;         // Resets at start of own turn
  movementTaken: number;         // For tracking multiple Strides
  actionsThisTurn: ActionRecord[];
}

interface ActionRecord {
  actionId: string;
  cost: ActionCost;
  traits: ActionTrait[];
  result: ActionResult;
}
```

### Core Actions

```typescript
// Basic Actions (available to all characters)
const CORE_ACTIONS = {
  Stride: {
    cost: ActionCost.OneAction,
    traits: ['Move'],
    description: 'Move up to your Speed'
  },

  Strike: {
    cost: ActionCost.OneAction,
    traits: ['Attack'],
    description: 'Make a melee or ranged attack'
  },

  RaiseShield: {
    cost: ActionCost.OneAction,
    traits: [],
    description: 'Gain +2 circumstance bonus to AC until start of next turn'
  },

  TakeCover: {
    cost: ActionCost.OneAction,
    traits: [],
    description: 'Gain cover bonuses if near suitable object'
  },

  CastSpell: {
    cost: 'varies',  // Usually 2 actions
    traits: ['Concentrate'],
    description: 'Cast a spell'
  },

  Aid: {
    cost: ActionCost.Reaction,
    traits: [],
    trigger: 'An ally is about to use an action that requires a check',
    description: 'Grant +1 circumstance bonus (or more with high check)'
  },

  AttackOfOpportunity: {
    cost: ActionCost.Reaction,
    traits: ['Attack'],
    trigger: 'Enemy uses manipulate action or moves out of reach',
    description: 'Make a Strike against triggering creature'
  }
};
```

### Multiple Attack Penalty (MAP)

```typescript
interface MAPInfo {
  attacksThisTurn: number;
  penalty: number;
}

function calculateMAP(turn: CombatTurn, weapon: Weapon): MAPInfo {
  // Count attacks with Attack trait this turn
  const attacks = turn.actionsThisTurn.filter(a =>
    a.traits.includes('Attack')
  ).length;

  // Agile weapons have reduced MAP (-4/-8 instead of -5/-10)
  const isAgile = weapon.traits.includes('Agile');

  let penalty = 0;
  if (attacks === 1) {
    penalty = isAgile ? -4 : -5;
  } else if (attacks >= 2) {
    penalty = isAgile ? -8 : -10;
  }

  return { attacksThisTurn: attacks, penalty };
}

// MAP applies to ANY action with Attack trait:
// - Strike
// - Grapple
// - Shove
// - Trip
// - Disarm
// - Spell attack rolls
```

### Initiative

```typescript
class InitiativeManager {
  rollInitiative(participants: Combatant[]): InitiativeResult[] {
    return participants.map(p => {
      const roll = DiceRoller.d20();
      const bonus = p.perception.bonus;  // Perception used for initiative

      return {
        combatantId: p.id,
        roll: roll,
        total: roll + bonus,
        tiebreaker: bonus  // Higher perception wins ties
      };
    }).sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return b.tiebreaker - a.tiebreaker;
    });
  }
}
```

### Attack Resolution

```typescript
class AttackResolver {
  resolveAttack(
    attacker: Character,
    target: Character,
    weapon: Weapon,
    map: number = 0
  ): AttackResult {
    // Roll attack
    const roll = DiceRoller.d20();
    const attackBonus = this.calculateAttackBonus(attacker, weapon);
    const total = roll + attackBonus + map;

    // Target AC
    const targetAC = this.calculateAC(target);

    // Determine degree of success
    const degree = determineDegree(total, targetAC, roll);

    // Roll damage on hit
    let damage: DamageResult | undefined;
    if (degree >= DegreeOfSuccess.Success) {
      damage = this.rollDamage(
        attacker,
        weapon,
        degree === DegreeOfSuccess.CriticalSuccess
      );

      // Apply damage
      this.applyDamage(target, damage);
    }

    return {
      attacker: attacker.id,
      target: target.id,
      roll,
      total,
      targetAC,
      degree,
      damage
    };
  }

  private calculateAttackBonus(char: Character, weapon: Weapon): number {
    // Ability modifier (Str or Dex for finesse)
    const abilityMod = weapon.traits.includes('Finesse')
      ? Math.max(char.abilities.strength, char.abilities.dexterity)
      : weapon.ranged ? char.abilities.dexterity : char.abilities.strength;

    // Proficiency
    const weaponGroup = weapon.group;
    const proficiency = char.proficiencies.weapons.get(weaponGroup) ?? ProficiencyRank.Untrained;
    const profBonus = calculateProficiencyBonus(proficiency, char.level);

    // Item bonus (magic weapons)
    const itemBonus = weapon.potency ?? 0;

    // Status/Circumstance modifiers
    const modifiers = this.getAttackModifiers(char);
    const modBonus = combineModifiers(modifiers);

    return abilityMod + profBonus + itemBonus + modBonus;
  }

  private rollDamage(char: Character, weapon: Weapon, isCritical: boolean): DamageResult {
    // Base weapon damage
    let damage = DiceRoller.roll(weapon.damageDice);

    // Add ability modifier (Str for melee, Dex for ranged)
    const abilityMod = weapon.ranged
      ? char.abilities.dexterity
      : char.abilities.strength;
    damage += abilityMod;

    // Weapon specialization
    if (this.hasWeaponSpecialization(char, weapon.group)) {
      const proficiency = char.proficiencies.weapons.get(weapon.group)!;
      damage += this.getSpecializationDamage(proficiency);
    }

    // Property runes (flaming, frost, etc.)
    damage += this.calculatePropertyRuneDamage(weapon);

    // Critical hit: double all damage
    if (isCritical) {
      damage *= 2;

      // Deadly trait: add extra dice
      if (weapon.traits.some(t => t.startsWith('Deadly'))) {
        const deadlyDie = this.extractDeadlyDie(weapon.traits);
        damage += DiceRoller.roll(deadlyDie);
      }

      // Fatal trait: upgrade damage die
      if (weapon.traits.some(t => t.startsWith('Fatal'))) {
        // Replace damage die with fatal die and add one extra
        const fatalDie = this.extractFatalDie(weapon.traits);
        damage = DiceRoller.roll(`${weapon.diceCount + 1}${fatalDie}`);
      }
    }

    return {
      amount: damage,
      type: weapon.damageType,
      isCritical
    };
  }

  private getSpecializationDamage(proficiency: ProficiencyRank): number {
    // Expert: +2, Master: +4, Legendary: +6
    if (proficiency >= ProficiencyRank.Expert) {
      return 2 + ((proficiency - ProficiencyRank.Expert) / 2) * 2;
    }
    return 0;
  }
}
```

### Armor Class Calculation

```typescript
function calculateAC(char: Character): number {
  // Base AC = 10 + Dex mod + Proficiency + Armor bonus + Shield bonus

  let ac = 10;

  // Dexterity (capped by armor)
  const armor = char.equipped.armor;
  const dexMod = armor
    ? Math.min(char.abilities.dexterity, armor.dexCap ?? 99)
    : char.abilities.dexterity;
  ac += dexMod;

  // Armor proficiency
  if (armor) {
    const armorProf = char.proficiencies.armor.get(armor.category) ?? ProficiencyRank.Untrained;
    ac += calculateProficiencyBonus(armorProf, char.level);

    // Armor bonus (from magic armor)
    ac += armor.acBonus;
  }

  // Shield (if raised this turn)
  if (char.activeEffects.some(e => e.type === 'raised-shield')) {
    const shield = char.equipped.shield;
    if (shield) {
      ac += shield.acBonus;
    }
  }

  // Modifiers (status, circumstance)
  const modifiers = getACModifiers(char);
  ac += combineModifiers(modifiers);

  return ac;
}
```

---

## Spell System

### Spell Data Structure

```typescript
interface Spell {
  id: string;
  name: string;
  level: number;  // 0 (cantrip) to 10
  traditions: MagicTradition[];
  rarity: 'common' | 'uncommon' | 'rare';

  // Casting requirements
  cast: ActionCost;
  components: SpellComponent[];  // Somatic, Verbal, Material, Focus
  requirements?: string;
  trigger?: string;  // For reaction spells

  // Targeting
  range: Range;
  area?: Area;
  targets?: string;
  duration?: Duration;

  // Traits
  traits: SpellTrait[];

  // Mechanics
  savingThrow?: {
    type: SaveType;
    basic: boolean;
  };
  spellAttack?: boolean;

  // Effects
  effect: SpellEffect;
  heightened?: Map<number, SpellEffectModification>;

  // Description
  description: string;
  heightenedDescription?: string;
}

enum MagicTradition {
  Arcane = 'arcane',
  Divine = 'divine',
  Occult = 'occult',
  Primal = 'primal'
}

type SpellComponent = 'somatic' | 'verbal' | 'material' | 'focus';

interface SpellEffect {
  type: 'damage' | 'healing' | 'condition' | 'buff' | 'debuff' | 'summon' | 'utility';

  // Execute spell effect
  apply(
    caster: Character,
    targets: Character[],
    castingLevel: number,
    degree?: DegreeOfSuccess
  ): SpellResult;
}
```

### Spell Slots

```typescript
interface SpellSlots {
  level: number;
  total: number;
  used: number;
}

interface SpellcastingData {
  tradition: MagicTradition;
  proficiency: ProficiencyRank;
  keyAbility: keyof AbilityScores;

  // Spell slots
  spellSlots: Map<number, SpellSlots>;  // 1-10

  // Known/Prepared spells
  spellsKnown?: Spell[];      // Spontaneous casters
  spellsPrepared?: Spell[];   // Prepared casters
  spellbook?: Spell[];        // Wizards

  // Focus spells
  focusPoints: number;
  maxFocusPoints: number;  // Max 3
  focusSpells: Spell[];

  // Cantrips
  cantrips: Spell[];
}

class SpellSlotManager {
  // Check if character can cast spell
  canCast(char: Character, spell: Spell, heightenTo?: number): boolean {
    const casting = char.spellcasting;
    if (!casting) return false;

    // Cantrips are always available
    if (spell.level === 0) return true;

    // Focus spells use focus points
    if (spell.traits.includes('Focus')) {
      return casting.focusPoints > 0;
    }

    // Check spell slots
    const level = heightenTo ?? spell.level;
    const slots = casting.spellSlots.get(level);
    if (!slots) return false;

    return slots.used < slots.total;
  }

  // Use spell resources
  useResources(char: Character, spell: Spell, heightenTo?: number): void {
    const casting = char.spellcasting!;

    if (spell.level === 0) {
      // Cantrips don't consume resources
      return;
    }

    if (spell.traits.includes('Focus')) {
      casting.focusPoints = Math.max(0, casting.focusPoints - 1);
    } else {
      const level = heightenTo ?? spell.level;
      const slots = casting.spellSlots.get(level)!;
      slots.used++;
    }
  }

  // Refocus (Remaster: restores ALL focus points after combat)
  refocus(char: Character): void {
    const casting = char.spellcasting;
    if (casting) {
      casting.focusPoints = casting.maxFocusPoints;
    }
  }

  // Daily preparation
  restoreSlots(char: Character): void {
    const casting = char.spellcasting;
    if (!casting) return;

    // Restore all spell slots
    casting.spellSlots.forEach(slots => {
      slots.used = 0;
    });

    // Restore focus points
    casting.focusPoints = casting.maxFocusPoints;

    // Prepared casters clear prepared spells
    if (casting.spellsPrepared) {
      casting.spellsPrepared = [];
    }
  }
}
```

### Spell Casting

```typescript
class SpellCastingManager {
  castSpell(
    caster: Character,
    spell: Spell,
    targets: Character[],
    heightenTo?: number
  ): SpellResult {
    const castingLevel = heightenTo ?? spell.level;

    // Validate
    if (!this.canCast(caster, spell, castingLevel)) {
      return { success: false, message: 'Cannot cast spell' };
    }

    // Consume resources
    this.slotManager.useResources(caster, spell, castingLevel);

    // Get heightened effect
    const effect = this.getEffect(spell, castingLevel);

    // Resolve spell
    if (spell.spellAttack) {
      return this.resolveSpellAttack(caster, spell, targets, effect, castingLevel);
    } else if (spell.savingThrow) {
      return this.resolveSpellSave(caster, spell, targets, effect, castingLevel);
    } else {
      // Auto-success (buffs, summons, etc.)
      return effect.apply(caster, targets, castingLevel);
    }
  }

  private resolveSpellAttack(
    caster: Character,
    spell: Spell,
    targets: Character[],
    effect: SpellEffect,
    level: number
  ): SpellResult {
    const results: SpellResult[] = [];

    for (const target of targets) {
      const roll = DiceRoller.d20();
      const spellAttack = this.calculateSpellAttack(caster);
      const targetAC = calculateAC(target);

      const degree = determineDegree(roll + spellAttack, targetAC, roll);

      // Apply effects based on degree
      const result = effect.apply(caster, [target], level, degree);

      // Critical success doubles damage
      if (degree === DegreeOfSuccess.CriticalSuccess && result.damage) {
        result.damage *= 2;
      }

      results.push(result);
    }

    return this.combineResults(results);
  }

  private resolveSpellSave(
    caster: Character,
    spell: Spell,
    targets: Character[],
    effect: SpellEffect,
    level: number
  ): SpellResult {
    const dc = this.calculateSpellDC(caster);
    const results: SpellResult[] = [];

    for (const target of targets) {
      const saveRoll = this.rollSave(target, spell.savingThrow!.type);
      const degree = determineDegree(saveRoll.total, dc, saveRoll.natural);

      let result: SpellResult;

      if (spell.savingThrow!.basic) {
        // Basic save: scale damage by degree
        result = effect.apply(caster, [target], level);

        if (degree === DegreeOfSuccess.CriticalSuccess) {
          result.damage = 0;  // No damage
        } else if (degree === DegreeOfSuccess.Success) {
          result.damage = Math.floor((result.damage ?? 0) / 2);  // Half damage
        } else if (degree === DegreeOfSuccess.CriticalFailure) {
          result.damage = (result.damage ?? 0) * 2;  // Double damage
        }
        // Failure: full damage (no change)
      } else {
        // Non-basic: spell defines effects per degree
        result = effect.apply(caster, [target], level, degree);
      }

      results.push(result);
    }

    return this.combineResults(results);
  }

  private calculateSpellAttack(caster: Character): number {
    const casting = caster.spellcasting!;

    // Ability modifier
    const abilityMod = caster.abilities[casting.keyAbility];

    // Proficiency
    const profBonus = calculateProficiencyBonus(casting.proficiency, caster.level);

    // Item bonus (staves, wands)
    const itemBonus = this.getItemBonus(caster, 'spell-attack');

    return abilityMod + profBonus + itemBonus;
  }

  private calculateSpellDC(caster: Character): number {
    return 10 + this.calculateSpellAttack(caster);
  }

  private getEffect(spell: Spell, level: number): SpellEffect {
    // Check for specific heightened version
    if (spell.heightened?.has(level)) {
      const modification = spell.heightened.get(level)!;
      return this.applyHeightening(spell.effect, modification);
    }

    // Auto-heightening for cantrips
    if (spell.level === 0) {
      // Cantrips auto-heighten to half character level (rounded up)
      return spell.effect;  // Effect should handle auto-heightening internally
    }

    return spell.effect;
  }
}
```

### Example Spell: Fireball

```typescript
const FIREBALL: Spell = {
  id: 'fireball',
  name: 'Fireball',
  level: 3,
  traditions: [MagicTradition.Arcane, MagicTradition.Primal],
  rarity: 'common',

  cast: ActionCost.TwoActions,
  components: ['somatic', 'verbal'],

  range: { value: 500, unit: 'feet' },
  area: { shape: 'burst', size: 20 },

  traits: ['Evocation', 'Fire'],

  savingThrow: {
    type: SaveType.Reflex,
    basic: true
  },

  effect: {
    type: 'damage',
    apply: (caster, targets, level, degree) => {
      // Base: 6d6 fire damage
      // Heightened: +2d6 per level above 3rd
      const extraLevels = Math.max(0, level - 3);
      const diceCoun= 6 + (extraLevels * 2);

      let damage = DiceRoller.roll(`${diceCount}d6`);

      // Basic save already handled by spell system

      return {
        success: true,
        damage,
        damageType: 'fire',
        message: `Fireball deals ${damage} fire damage`
      };
    }
  },

  heightened: new Map([
    // Auto-scales: +2d6 per level above 3rd
  ]),

  description: 'A roaring blast of fire appears at a spot you designate, dealing 6d6 fire damage.',
  heightenedDescription: '+1: The damage increases by 2d6.'
};
```

---

## Condition System

### Condition Data Model

```typescript
interface Condition {
  id: string;
  type: ConditionType;
  name: string;
  value?: number;  // For valued conditions (Clumsy 2, Frightened 3)
  duration?: ConditionDuration;
  source?: string;

  // Modifiers applied by this condition
  modifiers: Modifier[];

  // Lifecycle hooks
  onApply?: (char: Character, condition: Condition) => void;
  onRemove?: (char: Character, condition: Condition) => void;
  onTurnStart?: (char: Character, condition: Condition) => void;
  onTurnEnd?: (char: Character, condition: Condition) => void;
}

interface ConditionDuration {
  type: 'rounds' | 'minutes' | 'hours' | 'encounter' | 'unlimited';
  remaining?: number;
}

enum ConditionType {
  // Lowered Abilities
  Clumsy = 'clumsy',
  Drained = 'drained',
  Enfeebled = 'enfeebled',
  Stupefied = 'stupefied',

  // Senses
  Blinded = 'blinded',
  Dazzled = 'dazzled',
  Deafened = 'deafened',
  Invisible = 'invisible',

  // Mental
  Confused = 'confused',
  Controlled = 'controlled',
  Fascinated = 'fascinated',
  Frightened = 'frightened',

  // Death and Dying
  Doomed = 'doomed',
  Dying = 'dying',
  Unconscious = 'unconscious',
  Wounded = 'wounded',

  // Movement
  Grabbed = 'grabbed',
  Immobilized = 'immobilized',
  Paralyzed = 'paralyzed',
  Restrained = 'restrained',
  Slowed = 'slowed',
  Quickened = 'quickened',

  // Positioning
  Prone = 'prone',

  // Detection
  Concealed = 'concealed',
  Hidden = 'hidden',
  Observed = 'observed',
  Undetected = 'undetected',

  // Combat States
  FlatFooted = 'flat-footed',
  Flanked = 'flanked',

  // Other
  Fatigued = 'fatigued',
  Sickened = 'sickened',
  Stunned = 'stunned',
  Persistent Damage = 'persistent-damage'
}
```

### Key Condition Implementations

```typescript
// Clumsy: Penalty to Dex-based checks
const CLUMSY: ConditionDefinition = {
  type: ConditionType.Clumsy,
  name: 'Clumsy',
  requiresValue: true,
  getModifiers: (value) => [
    { type: ModifierType.Status, target: 'ac', value: -value },
    { type: ModifierType.Status, target: 'reflex', value: -value },
    { type: ModifierType.Status, target: 'dexterity-skills', value: -value },
    { type: ModifierType.Status, target: 'ranged-attack', value: -value }
  ]
};

// Frightened: Penalty to all checks, decreases by 1 each turn
const FRIGHTENED: ConditionDefinition = {
  type: ConditionType.Frightened,
  name: 'Frightened',
  requiresValue: true,
  getModifiers: (value) => [
    { type: ModifierType.Status, target: 'all', value: -value }
  ],
  onTurnEnd: (char, condition) => {
    if (condition.value && condition.value > 0) {
      condition.value--;
      if (condition.value === 0) {
        removeCondition(char, condition.id);
      }
    }
  }
};

// Dying: Near death, make recovery checks
const DYING: ConditionDefinition = {
  type: ConditionType.Dying,
  name: 'Dying',
  requiresValue: true,
  onApply: (char, condition) => {
    // Also apply unconscious
    applyCondition(char, ConditionType.Unconscious);

    // Check if dead (dying 4+ by default)
    const dyingThreshold = 4 + (char.feats.some(f => f.id === 'diehard') ? 1 : 0);
    if ((condition.value ?? 1) >= dyingThreshold) {
      killCharacter(char);
    }
  },
  onTurnEnd: (char, condition) => {
    // Roll recovery check: DC = 10 + dying value
    const dc = 10 + (condition.value ?? 1);
    const roll = DiceRoller.d20();
    const recovery = roll + char.abilities.constitution;
    const degree = determineDegree(recovery, dc, roll);

    if (degree >= DegreeOfSuccess.Success) {
      // Reduce dying
      condition.value = Math.max(0, (condition.value ?? 1) - 1);
      if (condition.value === 0) {
        removeCondition(char, ConditionType.Dying);
        // Still unconscious but stabilized
      }
    } else {
      // Increase dying
      condition.value = (condition.value ?? 1) + 1;
      if (degree === DegreeOfSuccess.CriticalFailure) {
        condition.value++;  // Increase by 2 total
      }

      // Check death
      const dyingThreshold = 4 + (char.feats.some(f => f.id === 'diehard') ? 1 : 0);
      if (condition.value >= dyingThreshold) {
        killCharacter(char);
      }
    }
  }
};

// Slowed: Lose actions at start of turn
const SLOWED: ConditionDefinition = {
  type: ConditionType.Slowed,
  name: 'Slowed',
  requiresValue: true,
  onTurnStart: (char, condition) => {
    const turn = getCurrentTurn();
    turn.actionsRemaining = Math.max(0, 3 - (condition.value ?? 1));
  }
};

// Persistent Damage: Take damage at end of turn
const PERSISTENT_DAMAGE: ConditionDefinition = {
  type: ConditionType['Persistent Damage'],
  name: 'Persistent Damage',
  requiresValue: true,
  damageType: 'varies',  // Fire, bleed, acid, etc.
  onTurnEnd: (char, condition) => {
    // Take damage
    applyDamage(char, {
      amount: condition.value ?? 0,
      type: condition.damageType,
      source: 'persistent'
    });

    // Flat check DC 15 to end condition
    const flatCheck = DiceRoller.d20();
    if (flatCheck >= 15) {
      removeCondition(char, condition.id);
    }
  }
};
```

---

## Skill System

### Skills

```typescript
enum Skill {
  // Strength
  Athletics = 'athletics',

  // Dexterity
  Acrobatics = 'acrobatics',
  Stealth = 'stealth',
  Thievery = 'thievery',

  // Intelligence
  Arcana = 'arcana',
  Crafting = 'crafting',
  Lore = 'lore',
  Nature = 'nature',
  Occultism = 'occultism',
  Society = 'society',

  // Wisdom
  Medicine = 'medicine',
  Religion = 'religion',
  Survival = 'survival',

  // Charisma
  Deception = 'deception',
  Diplomacy = 'diplomacy',
  Intimidation = 'intimidation',
  Performance = 'performance'
}

const SKILL_ABILITIES: Record<Skill, keyof AbilityScores> = {
  [Skill.Athletics]: 'strength',
  [Skill.Acrobatics]: 'dexterity',
  // ... etc
};
```

### Skill Check Resolution

```typescript
class SkillManager {
  makeCheck(
    char: Character,
    skill: Skill,
    dc: number,
    modifiers: Modifier[] = []
  ): CheckResult {
    // Roll
    const roll = DiceRoller.d20();

    // Calculate bonus
    const bonus = this.calculateBonus(char, skill, modifiers);
    const total = roll + bonus;

    // Determine degree
    const degree = determineDegree(total, dc, roll);

    return {
      roll,
      bonus,
      total,
      dc,
      degree,
      success: degree >= DegreeOfSuccess.Success
    };
  }

  private calculateBonus(char: Character, skill: Skill, additionalMods: Modifier[]): number {
    // Ability
    const ability = SKILL_ABILITIES[skill];
    const abilityMod = char.abilities[ability];

    // Proficiency
    const proficiency = char.proficiencies.skills.get(skill) ?? ProficiencyRank.Untrained;
    const profBonus = calculateProficiencyBonus(proficiency, char.level);

    // Item bonus
    const itemBonus = this.getItemBonus(char, skill);

    // Other modifiers
    const allMods = [
      ...this.getSkillModifiers(char, skill),
      ...additionalMods
    ];
    const modBonus = combineModifiers(allMods);

    return abilityMod + profBonus + itemBonus + modBonus;
  }
}
```

---

## Dice Rolling

### Dice Roller

```typescript
class DiceRoller {
  static d20(): number {
    return this.roll('1d20');
  }

  static roll(expression: string): number {
    // Parse: "3d6+4" or "2d10" or "1d8"
    const match = expression.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) throw new Error(`Invalid dice expression: ${expression}`);

    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;

    let total = modifier;
    for (let i = 0; i < count; i++) {
      total += this.randomInt(1, sides);
    }

    return total;
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// For testing, can inject a RNG implementation
interface RNG {
  random(): number;  // Returns [0, 1)
}

class SeededDiceRoller extends DiceRoller {
  constructor(private rng: RNG) {
    super();
  }

  static randomInt(min: number, max: number): number {
    return Math.floor(this.rng.random() * (max - min + 1)) + min;
  }
}
```

---

## Implementation Strategy

### Phase 1: Core Systems (Weeks 1-2)

1. **Dice Roller & RNG**
   - Implement dice rolling
   - Add seeded RNG for testing
   - Test distributions

2. **Ability Scores & Proficiency**
   - Ability score calculations
   - Proficiency system
   - Modifier combining

3. **Character Data Model**
   - Complete Character interface
   - Serialization/deserialization
   - Character creation wizard

### Phase 2: Combat (Weeks 3-4)

1. **Action Economy**
   - 3-action system
   - Action tracking
   - Reaction timing

2. **Attack Resolution**
   - Attack rolls
   - Damage calculation
   - Critical hits/misses
   - MAP

3. **Combat Flow**
   - Initiative
   - Turn management
   - End-of-round processing

### Phase 3: Spells & Conditions (Weeks 5-6)

1. **Spell System**
   - Spell data model
   - Spell slots management
   - Focus points
   - Spell casting resolution

2. **Conditions**
   - Condition application/removal
   - Condition effects
   - Duration tracking
   - Lifecycle hooks

### Phase 4: Skills & Integration (Weeks 7-8)

1. **Skill System**
   - Skill checks
   - Skill actions
   - Exploration activities

2. **Integration Testing**
   - Full combat scenarios
   - Spell interactions
   - Condition stacking
   - Edge cases

### Testing Strategy

```typescript
// Example: Combat resolution test
describe('CombatManager', () => {
  test('resolves full combat turn', () => {
    const fighter = createTestCharacter('Fighter', 5);
    const goblin = createTestMonster('Goblin');

    const combat = combatManager.startCombat([fighter, goblin]);

    // Fighter's turn: Stride + Strike + Strike
    const stride = combatManager.executeAction(STRIDE, { distance: 25 });
    expect(stride.success).toBe(true);
    expect(combat.currentTurn.actionsRemaining).toBe(2);

    const strike1 = combatManager.executeAction(STRIKE, { target: goblin.id });
    expect(strike1.map).toBe(0);  // No MAP on first attack

    const strike2 = combatManager.executeAction(STRIKE, { target: goblin.id });
    expect(strike2.map).toBe(-5);  // Second attack has -5 MAP

    expect(combat.currentTurn.actionsRemaining).toBe(0);
  });
});
```

---

## Next Steps

With the rules engine design complete, the next areas to explore are:

1. **Content Database** - Structure for 600+ spells, feats, items, ancestries, classes
2. **Combat UI** - How to display 3-action economy, target selection, spell lists
3. **Character Sheet** - Complex character data in Gold Box-style interface
4. **AI System** - Enemy behavior, spell selection, tactical positioning

See also:
- [Architecture](./ARCHITECTURE.md)
- [Solid.js Migration Guide](./SOLIDJS_MIGRATION_GUIDE.md)
