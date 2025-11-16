# Gold Box UI/UX Design

This document details the user interface and user experience design for a modern Gold Box-style CRPG, preserving the classic menu-driven feel while incorporating modern usability enhancements.

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Classic Gold Box Analysis](#classic-gold-box-analysis)
- [Modern Adaptations](#modern-adaptations)
- [Screen Layouts](#screen-layouts)
- [Combat Interface](#combat-interface)
- [Character Management](#character-management)
- [Spell & Inventory Systems](#spell--inventory-systems)
- [Accessibility](#accessibility)
- [Visual Design](#visual-design)

---

## Overview

### Project Goals

Create a modern PWA CRPG that:
- **Preserves**: The tactical depth and menu-driven interface of Gold Box games
- **Modernizes**: Visual clarity, accessibility, and input methods
- **Enhances**: Information density without overwhelming the player

### Target Audience

- **Primary**: Desktop users with keyboard + mouse
- **Secondary**: Tablet users with touch controls
- **Tertiary**: Mobile (responsive fallback, simplified UI)

---

## Design Principles

### Core Principles

1. **Menu-Driven Navigation**
   - Hierarchical command menus
   - Keyboard shortcuts for all actions
   - Always show available options

2. **Information Density**
   - Multiple information panels simultaneously visible
   - Text-heavy descriptions (Gold Box style)
   - Detailed combat feedback

3. **Tactical Clarity**
   - Clear grid visualization
   - Action economy always visible
   - Turn order and status at-a-glance

4. **Keyboard-First, Mouse-Enhanced**
   - All actions accessible via keyboard
   - Mouse provides faster access
   - Touch gestures for mobile

5. **Respect Player Time**
   - Fast animations (skippable)
   - Quick-save anywhere
   - Minimize clicks for common actions

### What We Keep from Gold Box

✅ **Menu-based command system**
✅ **Split-screen information panels**
✅ **Text-based descriptions and feedback**
✅ **First-person exploration → top-down combat**
✅ **Active character system**
✅ **Always visible options**

### What We Modernize

🆕 **Mouse support** (not just keyboard)
🆕 **Tooltips and hover states**
🆕 **Smooth animations** (optional, can disable)
🆕 **Responsive layout** (adapts to screen size)
🆕 **Accessibility features** (screen reader, high contrast)
🆕 **Modern visual polish** (while keeping retro aesthetic)

---

## Classic Gold Box Analysis

### Original Interface Characteristics

**Pool of Radiance (1988) Interface:**

1. **Keyboard-Only Navigation**
   - Numpad 7/1 for vertical menus
   - First letter for command selection
   - No mouse support

2. **Split-Screen Layout**
   - Main viewport (first-person or combat grid)
   - Character status panel (always visible)
   - Message/text area (scrolling log)
   - Command menu (context-sensitive)

3. **Active Character System**
   - One character highlighted at a time
   - Commands apply to active character
   - Cycle through party members

4. **Menu Hierarchy**
   ```
   Adventure Menu
   ├── Move (M)
   ├── View (V)
   │   ├── Character (C)
   │   ├── Items (I)
   │   └── Spells (S)
   ├── Cast (C)
   │   ├── Select Character
   │   ├── Select Spell
   │   └── Select Target
   ├── Area (A)
   ├── Encamp (E)
   │   ├── Rest (R)
   │   ├── Save (S)
   │   └── Memorize (M)
   ├── Search (S)
   └── Look (L)
   ```

5. **Combat Mode Switch**
   - Exploration: First-person view
   - Combat: Top-down isometric grid
   - Separate interfaces for each

### Strengths of Classic Design

✅ **Consistent interface** - Same pattern everywhere
✅ **Always shows options** - No hidden commands
✅ **Efficient for power users** - Fast keyboard navigation
✅ **Information-dense** - Lots of data on screen
✅ **Tactical depth** - Grid-based positioning matters

### Weaknesses to Address

❌ **Steep learning curve** - Must memorize commands
❌ **No visual feedback** - Minimal hover/selection states
❌ **Clunky navigation** - Many keypresses for simple actions
❌ **Dated visuals** - CGA/EGA graphics (though charming!)
❌ **Accessibility** - No screen reader, no color options

---

## Modern Adaptations

### Input Methods

#### Keyboard (Primary)

```typescript
// Keyboard shortcuts
const SHORTCUTS = {
  // Global
  'Escape': 'Cancel/Back',
  'Space': 'Confirm/Continue',
  'Tab': 'Cycle party members',

  // Exploration
  'M': 'Move',
  'L': 'Look',
  'S': 'Search',
  'C': 'Cast spell',
  'U': 'Use item',
  'A': 'Camp/Rest',

  // Combat
  '1-9': 'Select action',
  'Enter': 'End turn',
  'Arrow Keys': 'Move cursor/Navigate',

  // Menus
  'I': 'Inventory',
  'P': 'Party',
  'K': 'Spellbook',
  'H': 'Character sheet',

  // Meta
  'F1': 'Help',
  'F5': 'Quick save',
  'F9': 'Quick load'
};
```

#### Mouse (Enhanced)

- **Click**: Select action, target, menu item
- **Right-click**: Context menu, cancel
- **Hover**: Show tooltips, highlight interactables
- **Scroll**: Navigate lists, zoom (if applicable)

#### Touch (Mobile Fallback)

- **Tap**: Select/Confirm
- **Long press**: Context menu
- **Swipe**: Navigate menus, scroll
- **Pinch**: Zoom (combat grid)

### Visual Hierarchy

```
Priority 1 (Always Visible):
- Current action state
- Active character
- HP/critical status
- Available actions

Priority 2 (Easy to Check):
- Party status
- Turn order (combat)
- Message log
- Location info

Priority 3 (On-Demand):
- Detailed character stats
- Item descriptions
- Spell details
- Help text
```

---

## Screen Layouts

### Main Game Screen

```
┌─────────────────────────────────────────────────────────────┐
│ [MENU BAR] File  Party  Magic  Camp  Options       [TIME]   │
├────────────────────────────┬────────────────────────────────┤
│                            │  ┌──────────────────────────┐  │
│                            │  │ PARTY STATUS             │  │
│                            │  ├──────────────────────────┤  │
│                            │  │ ⚔ Valeros   HP: 45/45    │  │
│                            │  │ ⚔ Merisiel  HP: 38/38    │  │
│    [MAIN VIEWPORT]         │  │ ⚔ Kyra      HP: 42/42    │  │
│                            │  │ ⚔ Ezren     HP: 32/32    │  │
│    600x400+ pixels         │  │ ⚔ Seoni     HP: 30/30    │  │
│                            │  │ ⚔ Harsk     HP: 40/40    │  │
│    First-person view or    │  └──────────────────────────┘  │
│    tactical combat grid    │                                │
│                            │  ┌──────────────────────────┐  │
│                            │  │ LOCATION                 │  │
│                            │  ├──────────────────────────┤  │
│                            │  │ The Slums                │  │
│                            │  │ District of New Haven    │  │
│                            │  │                          │  │
│                            │  │ [Mini-map if applicable] │  │
│                            │  └──────────────────────────┘  │
├────────────────────────────┴────────────────────────────────┤
│ [MESSAGE LOG] (scrollable, 3-4 lines visible)                │
│ You hear sounds of combat ahead.                             │
│ The party advances cautiously through the narrow alley.      │
│ Valeros: "Something's not right here..."                     │
└──────────────────────────────────────────────────────────────┘
│ [ACTION BAR] Move  Look  Search  Camp  Cast  Use  Talk       │
└──────────────────────────────────────────────────────────────┘

Dimensions:
- Viewport: 60% width, 70% height
- Sidebar: 40% width, 70% height
- Message Log: 100% width, 15% height
- Action Bar: 100% width, 15% height
```

### Responsive Breakpoints

```css
/* Desktop (1280px+) - Full layout as shown */
@media (min-width: 1280px) {
  .game-screen {
    grid-template-columns: 1fr 400px;
  }
}

/* Tablet (768px-1279px) - Stack some elements */
@media (min-width: 768px) and (max-width: 1279px) {
  .game-screen {
    grid-template-columns: 1fr 300px;
  }
  .sidebar {
    font-size: 0.9em;
  }
}

/* Mobile (< 768px) - Simplified UI */
@media (max-width: 767px) {
  .game-screen {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none; /* Show on demand */
  }
  .action-bar {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## Combat Interface

### Tactical Combat Layout

```
┌──────────────────────────────────────────────────────────────┐
│ COMBAT - Round 3 │ Valeros (Fighter 5) │ Initiative: 18     │
├──────────────────────────────┬───────────────────────────────┤
│                              │ ┌───────────────────────────┐ │
│                              │ │ TURN ORDER                │ │
│                              │ ├───────────────────────────┤ │
│  [TACTICAL GRID]             │ │ ▶ Valeros      18  ❤❤❤❤❤ │ │
│                              │ │   Goblin Warr. 16  ❤❤❤❤  │ │
│  20x20 isometric grid        │ │   Merisiel      15  ❤❤❤❤❤│ │
│  rendered with PixiJS        │ │   Goblin Arch.  14  ❤❤❤  │ │
│                              │ │   Kyra          12  ❤❤❤❤❤│ │
│  - Character sprites         │ │   Goblin Dog    10  ❤❤❤❤ │ │
│  - Enemy sprites             │ │   Ezren          8  ❤❤❤❤❤│ │
│  - Terrain                   │ └───────────────────────────┘ │
│  - Movement paths            │                               │
│  - Spell areas               │ ┌───────────────────────────┐ │
│  - Line of sight             │ │ ACTIONS (3 remaining)     │ │
│                              │ ├───────────────────────────┤ │
│  [Hover: Enemy HP/AC]        │ │ ◆◆◆ (Action economy)      │ │
│  [Click: Select target]      │ ├───────────────────────────┤ │
│                              │ │ ◆ Strike                  │ │
│                              │ │ ◆ Stride                  │ │
│                              │ │ ◆ Raise Shield            │ │
│                              │ │ ◆◆ Power Attack           │ │
│                              │ │ ◆◆ Sudden Charge          │ │
│                              │ │ ◆◆◆ Whirlwind Strike      │ │
│                              │ │                           │ │
│                              │ │ [End Turn]                │ │
│                              │ └───────────────────────────┘ │
│                              │                               │
│                              │ ┌───────────────────────────┐ │
│                              │ │ TARGET INFO (on hover)    │ │
│                              │ ├───────────────────────────┤ │
│                              │ │ Goblin Warrior            │ │
│                              │ │ HP: 16/24  AC: 16         │ │
│                              │ │ Conditions: Frightened 1  │ │
│                              │ └───────────────────────────┘ │
├──────────────────────────────┴───────────────────────────────┤
│ [COMBAT LOG] (Auto-scroll, can pause)                         │
│ > Valeros strikes Goblin Warrior: HIT! 12 slashing damage    │
│ > Goblin Warrior is bloodied (HP: 16/24)                      │
│ > Merisiel moves 25 feet and attacks: CRITICAL HIT!           │
│ > 24 piercing damage. Goblin Warrior dies.                    │
└───────────────────────────────────────────────────────────────┘
```

### Combat Grid Rendering (PixiJS)

```typescript
// apps/game/src/rendering/pixi/TacticalGrid.ts

class TacticalGrid {
  private app: PIXI.Application;
  private gridContainer: PIXI.Container;
  private tileSize = 40; // pixels

  render(combat: CombatState): void {
    this.gridContainer.removeChildren();

    // Draw grid
    this.drawGrid(combat.grid.width, combat.grid.height);

    // Draw terrain
    this.drawTerrain(combat.grid.tiles);

    // Draw characters
    combat.party.forEach(char => {
      this.drawCharacter(char, char.position);
    });

    // Draw enemies
    combat.enemies.forEach(enemy => {
      this.drawEnemy(enemy, enemy.position);
    });

    // Draw effects
    combat.activeEffects.forEach(effect => {
      this.drawEffect(effect);
    });

    // Draw movement range (if applicable)
    if (this.selectedAction?.type === 'move') {
      this.drawMovementRange(this.activeCharacter);
    }

    // Draw spell area (if applicable)
    if (this.selectedAction?.area) {
      this.drawSpellArea(this.hoveredTile, this.selectedAction.area);
    }
  }

  private drawGrid(width: number, height: number): void {
    const grid = new PIXI.Graphics();

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        // Isometric transformation
        const isoX = (x - y) * (this.tileSize / 2);
        const isoY = (x + y) * (this.tileSize / 4);

        // Draw tile outline
        grid.lineStyle(1, 0x666666, 0.5);
        grid.beginFill(0x1a1a1a, 0.8);
        grid.drawPolygon([
          isoX, isoY,
          isoX + this.tileSize / 2, isoY + this.tileSize / 4,
          isoX, isoY + this.tileSize / 2,
          isoX - this.tileSize / 2, isoY + this.tileSize / 4
        ]);
        grid.endFill();
      }
    }

    this.gridContainer.addChild(grid);
  }

  private drawCharacter(char: Character, pos: Position): void {
    const sprite = PIXI.Sprite.from(char.spritesheet);

    // Position sprite on grid
    const isoPos = this.gridToIso(pos);
    sprite.position.set(isoPos.x, isoPos.y);
    sprite.anchor.set(0.5, 0.5);

    // Add HP bar
    const hpBar = this.createHPBar(char.hp, char.maxHp);
    hpBar.position.set(isoPos.x, isoPos.y - 30);

    // Add condition icons
    if (char.conditions.length > 0) {
      const conditionIcons = this.createConditionIcons(char.conditions);
      conditionIcons.position.set(isoPos.x, isoPos.y + 30);
      this.gridContainer.addChild(conditionIcons);
    }

    this.gridContainer.addChild(sprite);
    this.gridContainer.addChild(hpBar);

    // Make interactive
    sprite.eventMode = 'static';
    sprite.on('pointerover', () => this.onCharacterHover(char));
    sprite.on('click', () => this.onCharacterClick(char));
  }
}
```

### Combat Action Selection

Three-action economy visualization:

```typescript
// Action economy indicator
function ActionEconomy(props: { actionsRemaining: number }) {
  return (
    <div class="action-economy">
      <For each={[1, 2, 3]}>
        {(actionNum) => (
          <div
            class="action-pip"
            classList={{
              available: actionNum <= props.actionsRemaining,
              used: actionNum > props.actionsRemaining
            }}
            title={`Action ${actionNum}`}
          >
            ◆
          </div>
        )}
      </For>
    </div>
  );
}

// Action list with cost indicators
function ActionList(props: { actions: CombatAction[]; actionsRemaining: number }) {
  return (
    <div class="action-list">
      <For each={props.actions}>
        {(action) => {
          const canAfford = action.cost <= props.actionsRemaining;

          return (
            <button
              class="action-button"
              disabled={!canAfford}
              classList={{
                'one-action': action.cost === 1,
                'two-actions': action.cost === 2,
                'three-actions': action.cost === 3,
                disabled: !canAfford
              }}
              onClick={() => selectAction(action)}
            >
              {/* Action cost pips */}
              <div class="action-cost">
                <For each={Array(action.cost).fill(0)}>
                  {() => <span class="pip">◆</span>}
                </For>
              </div>

              {/* Action name */}
              <div class="action-name">{action.name}</div>

              {/* MAP indicator if applicable */}
              <Show when={action.traits.includes('Attack') && hasMAP()}>
                <div class="map-penalty">MAP: {getMAP()}</div>
              </Show>
            </button>
          );
        }}
      </For>
    </div>
  );
}
```

---

## Character Management

### Character Sheet

**Tabbed interface for dense information:**

```
┌────────────────────────────────────────────────────────────┐
│ CHARACTER SHEET │ [View] [Inventory] [Spells] [Feats]      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  VALEROS - Human Fighter 5                                 │
│  [Portrait]              HP: 45/45    AC: 20                │
│  Neutral                 Exp: 9,450 / 13,000                │
│                                                             │
│  ┌─────────────────────┐  ┌──────────────────────────┐    │
│  │ ABILITY SCORES      │  │ SAVES & PERCEPTION       │    │
│  ├─────────────────────┤  ├──────────────────────────┤    │
│  │ STR  18  +4  ●●●●  │  │ Fortitude  +9 (Expert)   │    │
│  │ DEX  14  +2  ●●    │  │ Reflex     +6 (Trained)  │    │
│  │ CON  14  +2  ●●    │  │ Will       +4 (Trained)  │    │
│  │ INT  10  +0        │  │ Perception +7 (Expert)   │    │
│  │ WIS  12  +1  ●     │  └──────────────────────────┘    │
│  │ CHA   8  -1        │                                   │
│  └─────────────────────┘  ┌──────────────────────────┐    │
│                           │ SPEED & LANGUAGES        │    │
│  ┌─────────────────────┐  ├──────────────────────────┤    │
│  │ ATTACKS             │  │ Speed: 25 ft             │    │
│  ├─────────────────────┤  │ Languages: Common, Elven │    │
│  │ Longsword +1        │  └──────────────────────────┘    │
│  │ +11 to hit          │                                   │
│  │ 1d8+5 slashing      │  ┌──────────────────────────┐    │
│  │ Crit: 2d8+10        │  │ CLASS FEATURES           │    │
│  │                     │  ├──────────────────────────┤    │
│  │ Composite Longbow   │  │ • Attack of Opportunity  │    │
│  │ +8 to hit           │  │ • Shield Block           │    │
│  │ 1d8+2 piercing      │  │ • Bravery                │    │
│  │ Range: 100 ft       │  │ • Weapon Specialization  │    │
│  └─────────────────────┘  └──────────────────────────┘    │
│                                                             │
│  [<< Back]  [Level Up]  [Export]  [Close]                  │
└─────────────────────────────────────────────────────────────┘
```

### Party Management

Grid view of all party members:

```typescript
function PartyManagementScreen() {
  const [selectedChar, setSelectedChar] = createSignal<Character | null>(null);

  return (
    <div class="party-management">
      <h2>Party Management</h2>

      <div class="party-grid">
        <For each={party.members}>
          {(char) => (
            <div
              class="party-card"
              onClick={() => setSelectedChar(char)}
            >
              <div class="card-portrait">
                <img src={char.portrait} alt={char.name} />
              </div>

              <div class="card-info">
                <h3>{char.name}</h3>
                <div class="card-class">
                  {char.ancestry.name} {char.class.name} {char.level}
                </div>

                {/* HP Bar */}
                <div class="hp-bar">
                  <div
                    class="hp-fill"
                    style={{ width: `${(char.hp / char.maxHp) * 100}%` }}
                  />
                  <span>{char.hp}/{char.maxHp}</span>
                </div>

                {/* Quick Stats */}
                <div class="quick-stats">
                  <span>AC: {char.ac}</span>
                  <span>Perception: +{char.perception}</span>
                </div>

                {/* Conditions */}
                <Show when={char.conditions.length > 0}>
                  <div class="conditions">
                    <For each={char.conditions}>
                      {(cond) => (
                        <span class="condition-badge">{cond.name}</span>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              <button onClick={() => openCharacterSheet(char)}>
                View Sheet
              </button>
            </div>
          )}
        </For>

        {/* Add party member slot */}
        <Show when={party.members.length < 6}>
          <div class="party-card add-member">
            <button onClick={openCharacterCreation}>
              <span class="add-icon">+</span>
              <span>Add Member</span>
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
```

---

## Spell & Inventory Systems

### Spellbook Interface

```
┌──────────────────────────────────────────────────────────┐
│ SPELLBOOK - Ezren (Wizard 5)                              │
├───────────────────────┬──────────────────────────────────┤
│ SPELL SLOTS           │ SPELL LIST                       │
│                       │                                  │
│ Level 0: ∞ (Cantrips) │ [Filter: All Levels ▼]          │
│ Level 1: ●●●○         │ [Search: _____________]          │
│ Level 2: ●●○          │                                  │
│ Level 3: ●○           │ ┌────────────────────────────┐  │
│                       │ │ ⚡ Fireball         Level 3 │  │
│ FOCUS POINTS          │ │ Evocation, Fire            │  │
│ ◆◆○                   │ │                            │  │
│                       │ │ 🔥 Burning Hands   Level 1 │  │
│ [Prepare Spells]      │ │ Evocation, Fire            │  │
│                       │ │                            │  │
│                       │ │ 🎯 Magic Missile   Level 1 │  │
│                       │ │ Evocation, Force           │  │
│                       │ │                            │  │
│                       │ │ 🛡️ Shield          Level 1 │  │
│                       │ │ Abjuration                 │  │
│                       │ └────────────────────────────┘  │
├───────────────────────┴──────────────────────────────────┤
│ SPELL DETAILS                                             │
│                                                           │
│ Fireball (Level 3, Arcane/Primal)                        │
│ Cast: ◆◆ (2 actions)  Range: 500 ft  Area: 20-ft burst  │
│ Save: Reflex (basic)                                      │
│                                                           │
│ A roaring blast of fire appears at a spot you designate, │
│ dealing 6d6 fire damage.                                  │
│                                                           │
│ Heightened (+1): The damage increases by 2d6.            │
│                                                           │
│ [Cast Spell]  [Heighten to Level 4 ▼]                    │
└───────────────────────────────────────────────────────────┘
```

### Inventory Interface

```
┌──────────────────────────────────────────────────────────┐
│ INVENTORY - Valeros                                       │
├───────────────────────┬──────────────────────────────────┤
│ CURRENCY              │ ITEMS                            │
│ 0 pp  125 gp          │                                  │
│ 45 sp  120 cp         │ [All ▼] [Weapons] [Armor] [...]  │
│                       │                                  │
│ BULK: 8.5 / 10        │ ┌────────────────────────────┐  │
│ [████████░░]          │ │ ⚔️ Longsword +1            │  │
│                       │ │ Equipped | 1L | 35 gp      │  │
│ EQUIPPED              │ │                            │  │
│                       │ │ 🏹 Composite Longbow       │  │
│ Weapon 1:             │ │ Equipped | 2L | 20 gp      │  │
│ Longsword +1          │ │                            │  │
│                       │ │ 🛡️ Steel Shield            │  │
│ Weapon 2:             │ │ 1L | 2 gp                  │  │
│ Composite Longbow     │ │                            │  │
│                       │ │ 🍷 Healing Potion (3)      │  │
│ Armor:                │ │ Consumable | L | 10 gp ea. │  │
│ Breastplate +1        │ └────────────────────────────┘  │
│                       │                                  │
│ Shield:               │                                  │
│ Steel Shield          │                                  │
│                       │                                  │
├───────────────────────┴──────────────────────────────────┤
│ ITEM DETAILS                                              │
│                                                           │
│ Longsword +1 (Magic Weapon, Level 2)                     │
│ Damage: 1d8+5 slashing  Traits: Versatile P, Magical     │
│                                                           │
│ A finely crafted longsword with a +1 potency rune        │
│ etched into the blade.                                    │
│                                                           │
│ [Unequip]  [Drop]  [Inspect]                             │
└───────────────────────────────────────────────────────────┘
```

---

## Accessibility

### Keyboard Navigation

**Complete keyboard control:**

```typescript
// Global keyboard shortcuts
const KEYBOARD_MAP = {
  // Navigation
  'Tab': 'Next interactive element',
  'Shift+Tab': 'Previous interactive element',
  'Arrow Keys': 'Navigate menus/grid',
  'Enter': 'Confirm/Select',
  'Escape': 'Cancel/Back',
  'Space': 'Continue/Next page',

  // Quick Actions
  'I': 'Open Inventory',
  'C': 'Open Spellbook',
  'P': 'Open Party',
  'H': 'Open Character Sheet',
  'J': 'Open Journal',

  // Combat
  '1-9': 'Quick-select action',
  'T': 'Next turn',
  'Ctrl+Z': 'Undo move (if allowed)',

  // Meta
  'F1': 'Help',
  'F5': 'Quick Save',
  'F9': 'Quick Load',
  'F11': 'Fullscreen',
  'Ctrl+S': 'Save Game',

  // Accessibility
  'Ctrl++': 'Increase UI scale',
  'Ctrl+-': 'Decrease UI scale',
  'Ctrl+H': 'Toggle high contrast mode'
};
```

### Screen Reader Support

```typescript
// ARIA labels for screen readers
<button
  aria-label={`Cast ${spell.name}, level ${spell.level} ${spell.traditions.join(' ')} spell, costs ${spell.actions} actions`}
  aria-describedby={`spell-description-${spell.id}`}
>
  {spell.name}
</button>

<div
  id={`spell-description-${spell.id}`}
  class="sr-only"
>
  {spell.description}
</div>

// Live regions for combat updates
<div
  class="combat-log"
  role="log"
  aria-live="polite"
  aria-atomic="false"
>
  {combatLog.map(entry => (
    <div class="log-entry">{entry}</div>
  ))}
</div>
```

### High Contrast Mode

```css
/* High contrast theme */
.high-contrast {
  --bg-primary: #000000;
  --bg-secondary: #1a1a1a;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --border: #ffffff;
  --highlight: #ffff00;
  --danger: #ff0000;
  --success: #00ff00;
}

.high-contrast .button {
  border: 2px solid var(--border);
  font-weight: bold;
}

.high-contrast .button:focus {
  outline: 3px solid var(--highlight);
  outline-offset: 2px;
}
```

### UI Scaling

```typescript
// User-adjustable UI scale
function UIScaleControl() {
  const [scale, setScale] = createSignal(100); // percentage

  createEffect(() => {
    document.documentElement.style.fontSize = `${scale()}%`;
  });

  return (
    <div class="ui-scale-control">
      <label>UI Scale: {scale()}%</label>
      <input
        type="range"
        min="75"
        max="150"
        step="5"
        value={scale()}
        onInput={(e) => setScale(parseInt(e.currentTarget.value))}
      />
    </div>
  );
}
```

---

## Visual Design

### Color Palette

**Retro-Modern Aesthetic:**

```css
:root {
  /* Backgrounds */
  --bg-primary: #0d0d0d;      /* Deep black */
  --bg-secondary: #1a1a1a;    /* Dark gray */
  --bg-tertiary: #2a2a2a;     /* Medium gray */
  --bg-panel: #1a1a1add;      /* Semi-transparent panel */

  /* Text */
  --text-primary: #e0e0e0;    /* Off-white */
  --text-secondary: #b0b0b0;  /* Light gray */
  --text-muted: #808080;      /* Medium gray */
  --text-highlight: #ffd700;  /* Gold (CRT amber) */

  /* Accents */
  --accent-primary: #4a9eff;  /* Bright blue */
  --accent-secondary: #ff6b4a; /* Coral red */
  --accent-success: #4aff88;  /* Bright green */
  --accent-warning: #ffaa4a;  /* Orange */
  --accent-danger: #ff4a4a;   /* Bright red */

  /* UI Elements */
  --border-color: #3a3a3a;
  --border-highlight: #4a9eff;
  --shadow: rgba(0, 0, 0, 0.5);

  /* HP Colors */
  --hp-healthy: #4aff88;      /* >66% */
  --hp-wounded: #ffaa4a;      /* 33-66% */
  --hp-critical: #ff4a4a;     /* <33% */

  /* Magic Colors */
  --arcane-color: #8a2be2;    /* Purple */
  --divine-color: #ffd700;    /* Gold */
  --occult-color: #4b0082;    /* Indigo */
  --primal-color: #228b22;    /* Forest green */
}
```

### Typography

```css
/* Pixel-perfect retro font for headers */
@font-face {
  font-family: 'PixelFont';
  src: url('/fonts/pixel-font.woff2') format('woff2');
}

/* Modern readable font for body text */
@font-face {
  font-family: 'GameFont';
  src: url('/fonts/source-code-pro.woff2') format('woff2');
}

body {
  font-family: 'GameFont', 'Courier New', monospace;
  font-size: 16px;
  line-height: 1.5;
}

h1, h2, h3 {
  font-family: 'PixelFont', monospace;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.combat-log {
  font-family: 'GameFont', monospace;
  font-size: 14px;
}
```

### Visual Effects

```css
/* Scanline effect (optional, can disable) */
.viewport::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%,
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  opacity: 0.1;
}

/* CRT glow effect */
.text-highlight {
  color: var(--text-highlight);
  text-shadow:
    0 0 5px var(--text-highlight),
    0 0 10px var(--text-highlight);
}

/* Button hover effect */
.button:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-highlight);
  box-shadow: 0 0 10px rgba(74, 158, 255, 0.3);
  transform: translateY(-1px);
  transition: all 0.15s ease;
}

/* Panel borders */
.panel {
  border: 2px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-panel);
  backdrop-filter: blur(5px);
}
```

---

## Summary

### Key UI Decisions

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Layout** | Split-screen, info-dense | Gold Box tradition, efficient use of space |
| **Input** | Keyboard-first, mouse-enhanced | Accessibility + modern convenience |
| **Combat** | Perspective switch to tactical grid | Classic Gold Box pattern, tactical clarity |
| **Menus** | Hierarchical, always visible | No hidden options, power-user friendly |
| **Visual Style** | Retro-modern (pixel + polish) | Nostalgic yet contemporary |
| **Accessibility** | Full keyboard, screen reader, scaling | Modern standards |

### Design Benefits

✅ **Familiar**: Gold Box fans recognize the patterns
✅ **Efficient**: High information density, fast navigation
✅ **Tactical**: Clear visualization of combat positioning
✅ **Accessible**: Multiple input methods, screen reader support
✅ **Scalable**: Responsive design for different screens
✅ **Modern**: Polish and usability improvements

---

## Next Steps

With UI/UX design complete, remaining areas:

1. **Start Implementation** - Create actual project structure
2. **Graphics Pipeline** - PixiJS + Three.js rendering details
3. **AI System** - Enemy behavior and tactics

See also:
- [Architecture](./ARCHITECTURE.md)
- [Pathfinder 2E Rules](./PATHFINDER_2E_RULES.md)
- [Content Pipeline](./CONTENT_PIPELINE.md)
- [Solid.js Migration Guide](./SOLIDJS_MIGRATION_GUIDE.md)
