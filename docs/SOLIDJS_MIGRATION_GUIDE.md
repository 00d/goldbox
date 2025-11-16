# Solid.js Migration Guide for React Developers

This guide helps React developers transition to Solid.js for building high-performance game UIs. Solid.js offers near-vanilla JavaScript performance (~5% overhead) while maintaining a familiar JSX-based development experience.

## Table of Contents

- [Quick Comparison](#quick-comparison)
- [State Management](#state-management)
- [Effects and Side Effects](#effects-and-side-effects)
- [Computed Values](#computed-values)
- [Component Structure](#component-structure)
- [Conditional Rendering](#conditional-rendering)
- [Lists and Iteration](#lists-and-iteration)
- [Props Handling](#props-handling)
- [The 5 Biggest Gotchas](#the-5-biggest-gotchas)
- [Gold Box UI Patterns](#gold-box-ui-patterns)
- [TypeScript Setup](#typescript-setup)
- [Learning Resources](#learning-resources)

## Quick Comparison

| Feature | React | Solid.js |
|---------|-------|----------|
| **State** | `useState(0)` | `createSignal(0)` |
| **Access State** | `count` | `count()` *(function call!)* |
| **Effects** | `useEffect(() => {}, [deps])` | `createEffect(() => {})` *(auto-tracks)* |
| **Computed** | `useMemo(() => {}, [deps])` | `createMemo(() => {})` |
| **Conditionals** | `{flag && <Component />}` | `<Show when={flag()}>` |
| **Lists** | `items.map(i => <Item />)` | `<For each={items()}>` |
| **Component Runs** | Every render | **Once** (setup only) |
| **Bundle Size** | ~45KB (React + ReactDOM) | ~7KB |

---

## State Management

### React Approach

```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### Solid.js Approach

```typescript
import { createSignal } from 'solid-js';

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <p>Count: {count()}</p>  {/* Call as function! */}
      <button onClick={() => setCount(count() + 1)}>Increment</button>
    </div>
  );
}
```

**Key Difference**: Signals are **getter functions**. You must call `count()` to read the value.

### Updating State

Both use similar setter patterns:

```typescript
// Direct value
setCount(5);

// Function updater
setCount(prev => prev + 1);
```

---

## Effects and Side Effects

### React: Manual Dependency Tracking

```typescript
import { useEffect } from 'react';

useEffect(() => {
  console.log('Count changed:', count);
  document.title = `Count: ${count}`;
}, [count]);  // Must manually specify dependencies
```

### Solid.js: Automatic Dependency Tracking

```typescript
import { createEffect } from 'solid-js';

createEffect(() => {
  console.log('Count changed:', count());
  document.title = `Count: ${count()}`;
});  // No dependency array needed!
```

**Key Difference**: Solid **automatically tracks** which signals are accessed inside the effect. No stale closure issues!

---

## Computed Values

### React: useMemo

```typescript
const doubled = useMemo(() => count * 2, [count]);
const quadrupled = useMemo(() => doubled * 2, [doubled]);
```

### Solid.js: createMemo or Functions

```typescript
// For expensive computations, use createMemo
const doubled = createMemo(() => count() * 2);
const quadrupled = createMemo(() => doubled() * 2);

// For simple derivations, just use functions
const doubled = () => count() * 2;
const quadrupled = () => doubled() * 2;
```

**Key Difference**: Memos in Solid are also getter functions. Simple derivations don't need memoization.

---

## Component Structure

### React: Components Re-run on Every Render

```typescript
function Counter() {
  const [count, setCount] = useState(0);

  console.log('Component rendering');  // Logs on every state change

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Solid.js: Components Run Once (Setup Phase)

```typescript
function Counter() {
  const [count, setCount] = createSignal(0);

  console.log('Component setup');  // Logs ONCE!

  return <button onClick={() => setCount(count() + 1)}>{count()}</button>;
}
```

**Mental Model Shift**:
- **React**: Components are render functions that re-execute
- **Solid**: Components are setup functions that create reactive bindings once

This is why Solid doesn't need hooks rules - there's no re-execution!

---

## Conditional Rendering

### React: Direct Conditionals Work Fine

```typescript
function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <div>
      {isLoggedIn && <Dashboard />}
      {user ? <Profile user={user} /> : <Login />}
    </div>
  );
}
```

### Solid.js: Use Control Flow Components

```typescript
import { Show } from 'solid-js';

function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = createSignal(false);
  const [user, setUser] = createSignal(null);

  return (
    <div>
      <Show when={isLoggedIn()}>
        <Dashboard />
      </Show>

      <Show when={user()} fallback={<Login />}>
        {(u) => <Profile user={u} />}  {/* Type-safe callback */}
      </Show>
    </div>
  );
}
```

**Why?** `<Show>` ensures proper cleanup and maintains reactivity. The callback pattern provides type narrowing.

### Switch/Match for Multiple Conditions

```typescript
import { Switch, Match } from 'solid-js';

<Switch fallback={<div>Not Found</div>}>
  <Match when={state() === 'loading'}>
    <Spinner />
  </Match>
  <Match when={state() === 'error'}>
    <ErrorMessage />
  </Match>
  <Match when={state() === 'success'}>
    <Content />
  </Match>
</Switch>
```

---

## Lists and Iteration

### React: Array.map()

```typescript
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          <UserCard user={user} />
        </li>
      ))}
    </ul>
  );
}
```

### Solid.js: For Component (Keyed by Reference)

```typescript
import { For } from 'solid-js';

function UserList(props) {
  return (
    <ul>
      <For each={props.users}>
        {(user) => (
          <li>
            <UserCard user={user} />
          </li>
        )}
      </For>
    </ul>
  );
}
```

**Key Differences**:
- No `key` prop needed - Solid keys by reference automatically
- More efficient updates - only changed items re-render
- The callback receives the item, not index (use `<Index>` for index-keyed lists)

### Index Component (Keyed by Index)

```typescript
import { Index } from 'solid-js';

<Index each={items()}>
  {(item, i) => (
    <div>
      {i}: {item()}  {/* item is a signal here! */}
    </div>
  )}
</Index>
```

Use `<Index>` when items can move/reorder frequently.

---

## Props Handling

### React: Destructuring is Safe

```typescript
function Button({ label, onClick, disabled = false }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Solid.js: Never Destructure Props!

```typescript
// ❌ BAD: Loses reactivity!
function Button(props) {
  const { label, onClick, disabled } = props;  // BROKEN!
  return <button onClick={onClick}>{label}</button>;
}

// ✅ GOOD: Access directly
function Button(props) {
  return (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.label}
    </button>
  );
}
```

**Why?** Props are reactive getters. Destructuring breaks the reactive chain.

### Setting Defaults with mergeProps

```typescript
import { mergeProps } from 'solid-js';

function Button(props) {
  const merged = mergeProps({ label: 'Click Me', disabled: false }, props);

  return (
    <button onClick={merged.onClick} disabled={merged.disabled}>
      {merged.label}
    </button>
  );
}
```

### Splitting Props with splitProps

```typescript
import { splitProps } from 'solid-js';

function Button(props) {
  const [local, others] = splitProps(props, ['label', 'icon']);

  return (
    <button {...others}>  {/* Pass through onClick, disabled, etc. */}
      {local.icon && <Icon name={local.icon} />}
      {local.label}
    </button>
  );
}
```

---

## The 5 Biggest Gotchas

### 1. Props Are NOT Plain Objects

```typescript
// ❌ This breaks reactivity
function Component(props) {
  const { name, age } = props;  // Values frozen at creation time
  return <div>{name}</div>;  // Won't update!
}

// ✅ Always access via props.
function Component(props) {
  return <div>{props.name}</div>;  // Reactive!
}
```

### 2. Signals Are Functions

```typescript
const [count, setCount] = createSignal(0);

// ❌ Missing function call
console.log(count);  // Logs: [Function]
<div>{count}</div>  // Shows: [Function]

// ✅ Call it
console.log(count());  // Logs: 0
<div>{count()}</div>  // Shows: 0
```

### 3. Components Run Once, Not Per Render

```typescript
function Component() {
  console.log('Component function called');  // Only once!

  const [count, setCount] = createSignal(0);

  // This expression runs once and creates a reactive binding
  return <div>{count()}</div>;  // Updates happen via fine-grained reactivity
}
```

### 4. Direct Conditionals Can Break Reactivity

```typescript
// ⚠️ Works but not optimal - no cleanup
function Component() {
  const [show, setShow] = createSignal(true);
  return <div>{show() && <ExpensiveComponent />}</div>;
}

// ✅ Preferred - proper lifecycle management
import { Show } from 'solid-js';

function Component() {
  const [show, setShow] = createSignal(true);
  return (
    <div>
      <Show when={show()}>
        <ExpensiveComponent />  {/* Properly cleaned up when hidden */}
      </Show>
    </div>
  );
}
```

### 5. No Dependency Arrays = No Stale Closures!

```typescript
// REACT PROBLEM: Stale closure
function Component() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      console.log(count);  // Stale! Shows old value
    }, 1000);
  }, []);  // Empty deps = frozen count
}

// SOLID.JS: Just works!
function Component() {
  const [count, setCount] = createSignal(0);

  createEffect(() => {
    setTimeout(() => {
      console.log(count());  // Always fresh! Auto-tracks
    }, 1000);
  });
}
```

---

## Gold Box UI Patterns

### Pattern 1: Character Sheet with Tabs

```typescript
import { createSignal, Show, For } from 'solid-js';

interface Character {
  name: string;
  ancestry: string;
  class: string;
  hp: number;
  maxHp: number;
  dexMod: number;
  armorBonus: number;
  abilities: { [key: string]: number };
  inventory: Item[];
  spells: Spell[];
}

function CharacterSheet(props: { character: Character; onClose: () => void }) {
  const [activeTab, setActiveTab] = createSignal<'stats' | 'inventory' | 'spells'>('stats');

  // Computed values auto-update when dependencies change
  const armorClass = () => {
    return 10 + props.character.dexMod + props.character.armorBonus;
  };

  return (
    <div class="character-sheet">
      <header>
        <h2>{props.character.name}</h2>
        <p>{props.character.ancestry} {props.character.class}</p>
      </header>

      {/* Tab Navigation */}
      <nav>
        <button
          classList={{ active: activeTab() === 'stats' }}
          onClick={() => setActiveTab('stats')}
        >
          Stats
        </button>
        <button
          classList={{ active: activeTab() === 'inventory' }}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          classList={{ active: activeTab() === 'spells' }}
          onClick={() => setActiveTab('spells')}
        >
          Spells
        </button>
      </nav>

      {/* Conditional Tab Content */}
      <Show when={activeTab() === 'stats'}>
        <div class="stats-panel">
          <div class="stat">
            <label>HP</label>
            <span>{props.character.hp} / {props.character.maxHp}</span>
          </div>
          <div class="stat">
            <label>AC</label>
            <span>{armorClass()}</span>
          </div>
          {/* More stats... */}
        </div>
      </Show>

      <Show when={activeTab() === 'inventory'}>
        <For each={props.character.inventory}>
          {(item) => <InventoryItem item={item} />}
        </For>
      </Show>

      <Show when={activeTab() === 'spells'}>
        <For each={props.character.spells}>
          {(spell) => <SpellListItem spell={spell} />}
        </For>
      </Show>

      <button onClick={props.onClose}>Close</button>
    </div>
  );
}
```

### Pattern 2: Nested Combat Menu (State Machine)

```typescript
import { createSignal, Switch, Match, For } from 'solid-js';

type MenuState =
  | { type: 'root' }
  | { type: 'cast-spell' }
  | { type: 'select-target'; spell: Spell }
  | { type: 'move' };

interface CombatAction {
  type: 'attack' | 'cast-spell' | 'move' | 'defend';
  spell?: Spell;
  target?: { x: number; y: number };
}

function CombatMenu(props: {
  character: Character;
  onAction: (action: CombatAction) => void;
}) {
  const [menuState, setMenuState] = createSignal<MenuState>({ type: 'root' });
  const [selectedSpell, setSelectedSpell] = createSignal<Spell | null>(null);

  // Navigation helpers
  const goBack = () => setMenuState({ type: 'root' });

  const selectCastSpell = () => {
    setMenuState({ type: 'cast-spell' });
  };

  const selectSpell = (spell: Spell) => {
    setSelectedSpell(spell);
    setMenuState({ type: 'select-target', spell });
  };

  const executeAction = (action: CombatAction) => {
    props.onAction(action);
    setMenuState({ type: 'root' });
  };

  return (
    <div class="combat-menu">
      <h3>{props.character.name}'s Turn</h3>

      {/* Switch between menu states - state machine pattern */}
      <Switch>
        <Match when={menuState().type === 'root'}>
          <div class="menu-list">
            <button
              class="menu-item"
              onClick={() => executeAction({ type: 'attack' })}
            >
              Attack
            </button>
            <button
              class="menu-item"
              onClick={selectCastSpell}
            >
              Cast Spell
            </button>
            <button
              class="menu-item"
              onClick={() => setMenuState({ type: 'move' })}
            >
              Move
            </button>
            <button
              class="menu-item"
              onClick={() => executeAction({ type: 'defend' })}
            >
              Defend
            </button>
          </div>
        </Match>

        <Match when={menuState().type === 'cast-spell'}>
          <div>
            <button onClick={goBack}>← Back</button>
            <h4>Select Spell</h4>
            <div class="spell-list">
              <For each={props.character.spells}>
                {(spell) => {
                  const hasSlots = () => props.character.currentSpellSlots[spell.level] > 0;

                  return (
                    <button
                      class="menu-item"
                      onClick={() => selectSpell(spell)}
                      disabled={!hasSlots()}
                    >
                      <span class="spell-name">{spell.name}</span>
                      <span class="spell-level">Level {spell.level}</span>
                      <Show when={!hasSlots()}>
                        <span class="depleted"> - No slots</span>
                      </Show>
                    </button>
                  );
                }}
              </For>
            </div>
          </div>
        </Match>

        <Match when={menuState().type === 'select-target'}>
          <div>
            <button onClick={() => setMenuState({ type: 'cast-spell' })}>
              ← Back
            </button>
            <h4>Select Target for {selectedSpell()?.name}</h4>
            <p class="instruction">Click enemy to target...</p>
            {/* Target selection integrates with PixiJS rendering */}
          </div>
        </Match>

        <Match when={menuState().type === 'move'}>
          <div>
            <button onClick={goBack}>← Back</button>
            <p class="instruction">Click tile to move...</p>
            {/* Movement integrates with grid rendering */}
          </div>
        </Match>
      </Switch>
    </div>
  );
}
```

### Pattern 3: Party Status HUD (Frequent Updates)

```typescript
import { For, Show } from 'solid-js';

interface PartyMember {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  conditions: string[];
}

function PartyStatusHUD(props: { party: PartyMember[] }) {
  const hpPercentage = (member: PartyMember) => {
    return (member.hp / member.maxHp) * 100;
  };

  const healthClass = (percentage: number) => {
    if (percentage > 66) return 'healthy';
    if (percentage > 33) return 'wounded';
    return 'critical';
  };

  return (
    <div class="party-hud">
      <For each={props.party}>
        {(member) => {
          const percentage = () => hpPercentage(member);

          return (
            <div class="party-member">
              <div class="name">{member.name}</div>

              <div class="hp-bar">
                <div
                  class={`hp-fill ${healthClass(percentage())}`}
                  style={{ width: `${percentage()}%` }}
                />
                <span class="hp-text">
                  {member.hp}/{member.maxHp}
                </span>
              </div>

              {/* Show conditions if any exist */}
              <Show when={member.conditions.length > 0}>
                <div class="conditions">
                  <For each={member.conditions}>
                    {(condition) => (
                      <span class="condition-badge">{condition}</span>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          );
        }}
      </For>
    </div>
  );
}
```

### Pattern 4: Integrating with PixiJS

```typescript
import { onMount, onCleanup } from 'solid-js';
import * as PIXI from 'pixi.js';

function CombatGrid(props: {
  gridSize: number;
  onTileClick: (x: number, y: number) => void;
}) {
  let canvasRef: HTMLCanvasElement;
  let pixiApp: PIXI.Application;

  onMount(() => {
    // Initialize PixiJS when component mounts
    pixiApp = new PIXI.Application({
      view: canvasRef,
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a1a,
    });

    // Create grid graphics
    const grid = new PIXI.Graphics();
    const tileSize = 40;

    for (let x = 0; x < props.gridSize; x++) {
      for (let y = 0; y < props.gridSize; y++) {
        grid.lineStyle(1, 0x333333);
        grid.drawRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }

    pixiApp.stage.addChild(grid);

    // Handle pointer events
    pixiApp.stage.eventMode = 'static';
    pixiApp.stage.on('pointerdown', (event) => {
      const x = Math.floor(event.global.x / tileSize);
      const y = Math.floor(event.global.y / tileSize);
      props.onTileClick(x, y);
    });
  });

  onCleanup(() => {
    // Clean up PixiJS when component unmounts
    pixiApp?.destroy(true, { children: true });
  });

  return <canvas ref={canvasRef} />;
}

// Usage in parent component
function CombatView() {
  const handleTileClick = (x: number, y: number) => {
    console.log(`Tile clicked: ${x}, ${y}`);
    // Update game state, trigger actions, etc.
  };

  return (
    <div class="combat-view">
      <CombatGrid gridSize={20} onTileClick={handleTileClick} />
      <PartyStatusHUD party={partyMembers()} />
      <CombatMenu character={activeCharacter()} onAction={handleAction} />
    </div>
  );
}
```

### Pattern 5: Complex State with Stores

For deeply nested state (like character sheets with many sub-objects), use `createStore`:

```typescript
import { createStore } from 'solid-js/store';

interface Character {
  name: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  inventory: {
    equipped: Item[];
    backpack: Item[];
  };
}

function CharacterManager() {
  const [character, setCharacter] = createStore<Character>({
    name: 'Valeros',
    stats: {
      strength: 16,
      dexterity: 14,
      constitution: 13,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    inventory: {
      equipped: [],
      backpack: [],
    },
  });

  // Fine-grained updates - only affected parts re-render
  const increaseStrength = () => {
    setCharacter('stats', 'strength', str => str + 1);
  };

  const equipItem = (item: Item) => {
    setCharacter('inventory', 'equipped', equipped => [...equipped, item]);
  };

  return (
    <div>
      <h2>{character.name}</h2>
      <div>STR: {character.stats.strength}</div>
      {/* Only this div updates when strength changes */}
    </div>
  );
}
```

---

## TypeScript Setup

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

**Critical**: Set `"jsx": "preserve"` - let Solid's Vite plugin handle JSX transformation.

### Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
  },
});
```

### Component Typing

```typescript
import { Component, JSX } from 'solid-js';

// Method 1: Component type
const Button: Component<{
  label: string;
  onClick: () => void;
}> = (props) => {
  return <button onClick={props.onClick}>{props.label}</button>;
};

// Method 2: Function with typed props (preferred for simplicity)
function Button(props: { label: string; onClick: () => void }) {
  return <button onClick={props.onClick}>{props.label}</button>;
}

// Method 3: With children
function Panel(props: { title: string; children: JSX.Element }) {
  return (
    <div class="panel">
      <h3>{props.title}</h3>
      <div class="content">{props.children}</div>
    </div>
  );
}
```

---

## Learning Resources

### Official Resources

1. **Interactive Tutorial** (Start Here!)
   - https://www.solidjs.com/tutorial
   - 2-3 hours, covers all fundamentals
   - Best way to internalize the mental model

2. **Official Documentation**
   - https://docs.solidjs.com/
   - Comprehensive API reference
   - React comparison guide

3. **Solid Playground**
   - https://playground.solidjs.com/
   - Test code snippets instantly
   - Share examples with team

### Community Resources

4. **"SolidJS for React Developers"** (May 2025)
   - https://marmelab.com/blog/2025/05/28/solidjs-for-react-developper.html
   - Excellent mental model explanation
   - Covers "vanishing components" concept

5. **Solid Discord Community**
   - https://discord.com/invite/solidjs
   - Active community for questions
   - Core team frequently responds

6. **Awesome Solid.js**
   - https://github.com/one-aalam/awesome-solid-js
   - Curated libraries and resources
   - Component libraries, tools, examples

### Video Tutorials

7. **The Net Ninja - SolidJS Tutorial**
   - YouTube series covering fundamentals
   - Practical examples and best practices

---

## Recommended Learning Path

### Day 1-2: Foundation (2-3 hours)
- Complete official interactive tutorial
- Focus on: signals, effects, control flow (`<Show>`, `<For>`)
- Build: Counter and Todo app

### Day 3: Practice (2-4 hours)
- Build a form with validation
- Practice props patterns (no destructuring!)
- Experiment with `createMemo` vs functions

### Day 4-5: Real Application (4-6 hours)
- Recreate one Gold Box menu (character sheet or combat menu)
- Integrate with mock game state
- This surfaces conceptual gaps quickly

### Day 6+: Advanced Integration
- Connect Solid UI to PixiJS rendering
- Practice `onMount`/`onCleanup` lifecycle
- Build out full UI system

**Estimated Time to Productivity**: 3-5 days for React developers

---

## Key Mental Model Shifts

### React Thinking → Solid Thinking

| React Mental Model | Solid Mental Model |
|-------------------|-------------------|
| "Components re-render" | "Components set up reactive bindings once" |
| "State causes re-renders" | "State updates propagate through reactive graph" |
| "Manage dependencies manually" | "Dependencies tracked automatically" |
| "Virtual DOM diffs and patches" | "Direct DOM updates via fine-grained reactivity" |
| "Avoid expensive renders" | "Renders are cheap - they happen once" |
| "Optimize with useMemo/useCallback" | "Optimize only truly expensive computations" |

### The Core Insight

In React, you're **describing what the UI should look like** for each state, and React figures out how to get there.

In Solid, you're **wiring up reactive relationships once**, and Solid directly updates only what changed.

This is why:
- Solid components run once (they're setup, not render)
- There's no virtual DOM (no need to diff)
- No dependency arrays (tracking is automatic)
- No stale closures (signals are always fresh)
- Performance is near-vanilla JS (minimal overhead)

---

## Common Mistakes and Solutions

### Mistake 1: Forgetting to Call Signals

```typescript
// ❌ Wrong
<div>{count}</div>  // Shows [Function]

// ✅ Correct
<div>{count()}</div>  // Shows value
```

### Mistake 2: Destructuring Props

```typescript
// ❌ Wrong - loses reactivity
function Component(props) {
  const { name } = props;
  return <div>{name}</div>;  // Won't update!
}

// ✅ Correct
function Component(props) {
  return <div>{props.name}</div>;  // Reactive!
}
```

### Mistake 3: Using .map() Instead of <For>

```typescript
// ⚠️ Works but not optimal
<div>{items().map(item => <Item data={item} />)}</div>

// ✅ Preferred - better performance
<For each={items()}>
  {(item) => <Item data={item} />}
</For>
```

### Mistake 4: Conditional Logic Without <Show>

```typescript
// ⚠️ Works but no proper cleanup
{visible() && <Modal />}

// ✅ Preferred - proper lifecycle
<Show when={visible()}>
  <Modal />  {/* Properly cleaned up when hidden */}
</Show>
```

### Mistake 5: Async in createEffect

```typescript
// ❌ Wrong - breaks reactivity tracking
createEffect(async () => {
  const data = await fetchData(id());  // Doesn't track id()!
});

// ✅ Correct - use createResource for async
const [data] = createResource(id, fetchData);
```

---

## Performance Tips

### When to Use createMemo

```typescript
// ✅ Use memo for expensive computations
const sortedList = createMemo(() => {
  return props.items.slice().sort(complexSortFn);  // Expensive
});

// ✅ Skip memo for simple derivations
const doubled = () => count() * 2;  // Cheap, no memo needed
const fullName = () => `${firstName()} ${lastName()}`;  // Cheap
```

### Batching Updates

```typescript
import { batch } from 'solid-js';

// Updates batched automatically in event handlers
const handleClick = () => {
  setCount(c => c + 1);
  setName('New Name');
  setEnabled(true);
  // All updates processed together, UI updates once
};

// Manual batching for external updates
batch(() => {
  setCount(10);
  setName('Batched');
  setEnabled(false);
});
```

### Untrack Dependencies

```typescript
import { untrack } from 'solid-js';

createEffect(() => {
  console.log('Count changed:', count());

  // Don't track name() inside this effect
  untrack(() => {
    console.log('Name (not tracked):', name());
  });
});
// Effect only re-runs when count() changes, not name()
```

---

## Next Steps

After mastering the basics in this guide:

1. **Review the TypeScript setup section** and configure your project
2. **Complete the official tutorial** at solidjs.com/tutorial
3. **Build a character sheet component** using the patterns in this guide
4. **Join the Solid Discord** for questions and community support
5. **Explore integration with PixiJS** for game rendering

Remember: The syntax is 80% familiar if you know React. The key is understanding the mental model shift from "re-render on change" to "setup reactive bindings once."

---

## Questions?

If you encounter issues:
- Check if you're calling signals as functions: `count()` not `count`
- Verify you're not destructuring props
- Use `<Show>` and `<For>` instead of direct conditionals/maps
- Read error messages carefully - Solid's errors are usually helpful

For team discussion or clarification, refer back to specific sections of this guide.
