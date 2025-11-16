# Gold Box CRPG - System Architecture

This document describes the overall system architecture for a modern Gold Box-style CRPG using Pathfinder 2E Remastered rules, built as a Progressive Web Application (PWA).

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Layer Descriptions](#layer-descriptions)
- [Module Boundaries](#module-boundaries)
- [Project Structure](#project-structure)
- [State Management](#state-management)
- [Communication Patterns](#communication-patterns)
- [Technology Stack](#technology-stack)
- [Build Pipeline](#build-pipeline)
- [Performance Considerations](#performance-considerations)
- [Testing Strategy](#testing-strategy)
- [Design Patterns](#design-patterns)

---

## Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PWA Shell (Service Worker)                │
│  - Offline capability, asset caching, save game sync         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer (Solid.js)              │
│  - Menu system, character sheets, combat UI                  │
│  - Dialogue, journal, inventory screens                      │
│  - HUD overlays, tooltips, notifications                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Application/Coordination Layer                  │
│  - Game loop orchestration                                   │
│  - Input management (keyboard, mouse)                        │
│  - Scene management (combat, exploration, menu)              │
│  - Save/Load system                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────┬────────────────────┬───────────────────┐
│   Game Logic       │   Rules Engine     │  Rendering Engine │
│   (Domain)         │   (Pathfinder 2E)  │  (Graphics)       │
├────────────────────┼────────────────────┼───────────────────┤
│ - Party management │ - Character system │ - PixiJS (2D)     │
│ - World state      │ - Combat resolver  │ - Three.js (3D)   │
│ - Quest system     │ - Spell system     │ - Sprite manager  │
│ - Progression      │ - Skill checks     │ - Animation       │
│ - Inventory        │ - Conditions       │ - Particles       │
└────────────────────┴────────────────────┴───────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Data/Persistence Layer                     │
│  - IndexedDB (save games, settings, cached data)             │
│  - Content database (items, spells, monsters, maps)          │
└─────────────────────────────────────────────────────────────┘
```

### Core Architectural Principles

1. **Separation of Concerns**
   - UI layer handles only presentation
   - Game logic is framework-agnostic
   - Rendering systems are isolated
   - Rules engine is self-contained

2. **Unidirectional Data Flow**
   ```
   User Input → Game Logic → State Update → UI/Rendering
   ```

3. **Event-Driven Communication**
   - Modules communicate via typed events
   - No direct dependencies between layers
   - Testable, extensible, maintainable

4. **Composition Over Inheritance**
   - Component-based architecture
   - Modular, reusable systems
   - Easy to extend and modify

---

## Layer Descriptions

### 1. PWA Shell

**Responsibilities:**
- Service worker management
- Asset caching strategy
- Offline functionality
- Background sync for save games
- App installation and updates

**Key Features:**
- Stale-While-Revalidate for game data
- Cache-First for static assets
- Network-First for save games with background sync
- Automatic version management

### 2. Presentation Layer (Solid.js)

**Responsibilities:**
- All UI components and screens
- User input capture
- Visual feedback and animations
- Accessibility features
- Responsive layout

**Key Components:**
- Main menu and navigation
- Character creation wizard
- Character sheets and party management
- Combat UI and action menus
- Inventory and equipment
- Spellbook interface
- Journal and quest log
- Dialogue trees
- Settings and options

**Technology:** Solid.js with TypeScript

### 3. Application/Coordination Layer

**Responsibilities:**
- Orchestrate game loop
- Manage input routing
- Scene state management
- Save/Load operations
- Asset loading coordination

**Key Modules:**
- `GameCoordinator`: Main orchestration
- `InputManager`: Keyboard/mouse handling
- `SceneManager`: Screen transitions
- `SaveManager`: Persistence operations
- `AssetLoader`: Resource loading

### 4. Game Logic Layer

**Responsibilities:**
- Core game state management
- Party and character management
- World state and exploration
- Quest and dialogue systems
- Inventory management

**Key Modules:**
- `GameState`: Central state container
- `PartyManager`: Party operations
- `WorldState`: Map and location tracking
- `QuestManager`: Quest progression
- `DialogueManager`: Conversation handling

**Technology:** Pure TypeScript, framework-agnostic

### 5. Rules Engine (Pathfinder 2E)

**Responsibilities:**
- Complete P2E rules implementation
- Character creation and progression
- Combat resolution
- Spell casting and effects
- Skill checks and challenges
- Condition management

**Key Modules:**
- `Character`: Character data and methods
- `CombatManager`: Turn-based combat
- `SpellManager`: Spell system
- `SkillManager`: Skill checks
- `DiceRoller`: Random number generation
- `ConditionManager`: Status effects

**Technology:** Pure TypeScript with extensive typing

### 6. Rendering Engine

**Responsibilities:**
- 2D sprite rendering (combat, overworld)
- 3D dungeon crawling (first-person)
- Animations and particle effects
- Camera management
- Visual effects

**Key Modules:**
- `PixiApp`: 2D rendering system
- `CombatRenderer`: Tactical grid display
- `DungeonRenderer`: 3D first-person view
- `SpriteManager`: Sprite loading and caching
- `AnimationController`: Animation sequencing

**Technology:** PixiJS v8 (2D), Three.js (3D)

### 7. Data/Persistence Layer

**Responsibilities:**
- Save game storage
- Content database access
- Settings persistence
- Cached data management

**Technology:** IndexedDB with typed wrappers

---

## Module Boundaries

### Communication Pattern

```
┌─────────────┐
│  UI Layer   │──┐
└─────────────┘  │
                 ├──→ EventBus ←──┐
┌─────────────┐  │                │
│ Game Logic  │──┘                │
└─────────────┘                   │
                                  │
┌─────────────┐                   │
│  Rendering  │───────────────────┘
└─────────────┘
```

### Event System

```typescript
// Core event interface
interface GameEvent {
  type: string;
  payload: unknown;
  timestamp: number;
}

// Central event bus
class EventBus {
  private listeners: Map<string, Set<EventHandler>>;

  emit(type: string, payload: unknown): void;
  on(type: string, handler: EventHandler): Unsubscribe;
  off(type: string, handler: EventHandler): void;
  once(type: string, handler: EventHandler): void;
}
```

### Example Event Flow: Spell Casting

1. **UI Layer**: User clicks "Cast Fireball"
   ```typescript
   eventBus.emit('SPELL_CAST_REQUESTED', {
     casterId: 'char-1',
     spellId: 'fireball',
     targetPosition: { x: 10, y: 5 }
   });
   ```

2. **Game Logic**: Validates action
   ```typescript
   eventBus.on('SPELL_CAST_REQUESTED', (event) => {
     if (canCastSpell(event.payload)) {
       eventBus.emit('SPELL_CAST_VALIDATED', event.payload);
     } else {
       eventBus.emit('ACTION_INVALID', { reason: 'no spell slots' });
     }
   });
   ```

3. **Rules Engine**: Resolves spell effects
   ```typescript
   eventBus.on('SPELL_CAST_VALIDATED', (event) => {
     const result = spellManager.castSpell(event.payload);
     eventBus.emit('SPELL_RESOLVED', result);
   });
   ```

4. **Rendering**: Plays animation
   ```typescript
   eventBus.on('SPELL_RESOLVED', (event) => {
     animationController.play('fireball', event.payload.targetPosition);
     eventBus.emit('ANIMATION_STARTED', { animationId: 'fireball-123' });
   });
   ```

5. **Game Logic**: Updates state
   ```typescript
   eventBus.on('ANIMATION_COMPLETE', (event) => {
     gameState.applySpellEffects(event.payload);
     eventBus.emit('COMBAT_STATE_CHANGED', gameState.combat);
   });
   ```

6. **UI Layer**: Updates display
   ```typescript
   eventBus.on('COMBAT_STATE_CHANGED', (event) => {
     // Solid.js reactive updates automatically refresh UI
   });
   ```

### Benefits of Event-Driven Architecture

- **Loose Coupling**: Modules don't depend directly on each other
- **Extensibility**: Easy to add new features/listeners
- **Testability**: Mock events for unit tests
- **Debugging**: Log all events for replay/debugging
- **Future Multiplayer**: Network layer can intercept/send events

---

## Project Structure

### Monorepo Layout (PNPM Workspaces)

```
gold-box-crpg/
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # Workspace definitions
├── tsconfig.base.json              # Shared TypeScript config
├── .gitignore
├── README.md
│
├── apps/
│   └── game/                       # Main PWA application
│       ├── public/
│       │   ├── assets/             # Static assets
│       │   ├── manifest.json       # PWA manifest
│       │   └── sw.js               # Service worker
│       ├── src/
│       │   ├── main.tsx            # Entry point
│       │   ├── App.tsx             # Root component
│       │   ├── game-coordinator.ts # Game loop orchestrator
│       │   ├── ui/                 # Solid.js components
│       │   ├── rendering/          # Graphics systems
│       │   ├── input/              # Input management
│       │   └── styles/             # CSS
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   ├── core/                       # Core game logic
│   │   ├── src/
│   │   │   ├── GameState.ts
│   │   │   ├── EventBus.ts
│   │   │   ├── party/
│   │   │   ├── world/
│   │   │   ├── quest/
│   │   │   └── persistence/
│   │   └── package.json
│   │
│   ├── rules-engine/               # Pathfinder 2E
│   │   ├── src/
│   │   │   ├── character/
│   │   │   ├── combat/
│   │   │   ├── spells/
│   │   │   ├── conditions/
│   │   │   ├── feats/
│   │   │   ├── skills/
│   │   │   └── items/
│   │   └── package.json
│   │
│   ├── content/                    # Game content data
│   │   ├── src/
│   │   │   ├── ancestries/
│   │   │   ├── classes/
│   │   │   ├── spells/
│   │   │   ├── feats/
│   │   │   ├── items/
│   │   │   ├── monsters/
│   │   │   └── maps/
│   │   └── package.json
│   │
│   ├── shared/                     # Shared utilities/types
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── constants/
│   │   └── package.json
│   │
│   └── test-utils/                 # Testing utilities
│       └── package.json
│
├── docs/
│   ├── ARCHITECTURE.md             # This file
│   ├── SOLIDJS_MIGRATION_GUIDE.md
│   ├── PATHFINDER_2E_RULES.md
│   └── GOLD_BOX_DESIGN.md
│
└── tools/
    ├── content-pipeline/           # Content build tools
    └── asset-pipeline/             # Asset processing
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

```json
// Root package.json
{
  "name": "gold-box-crpg",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter game dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint"
  }
}
```

### Package Dependencies

```json
// apps/game/package.json
{
  "dependencies": {
    "solid-js": "^1.9.0",
    "pixi.js": "^8.0.0",
    "three": "^0.170.0",
    "@gold-box/core": "workspace:*",
    "@gold-box/rules-engine": "workspace:*",
    "@gold-box/content": "workspace:*",
    "@gold-box/shared": "workspace:*"
  }
}
```

---

## State Management

### Two-Tier State System

#### 1. Core Game State (Framework-Agnostic)

```typescript
// packages/core/src/GameState.ts

class GameState {
  party: PartyState;
  world: WorldState;
  combat: CombatState | null;
  quests: QuestState;
  settings: SettingsState;

  private listeners: Set<StateListener> = new Set();

  subscribe(listener: StateListener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach(listener => listener(snapshot));
  }

  getSnapshot(): GameStateSnapshot {
    return {
      party: { ...this.party },
      world: { ...this.world },
      combat: this.combat ? { ...this.combat } : null,
      quests: { ...this.quests },
      settings: { ...this.settings }
    };
  }

  hydrate(snapshot: GameStateSnapshot): void {
    this.party = snapshot.party;
    this.world = snapshot.world;
    this.combat = snapshot.combat;
    this.quests = snapshot.quests;
    this.settings = snapshot.settings;
    this.notify();
  }
}

export const gameState = new GameState();
```

#### 2. UI State (Solid.js Reactive)

```typescript
// apps/game/src/hooks/useGameState.ts

import { createStore } from 'solid-js/store';
import { onMount, onCleanup } from 'solid-js';
import { gameState } from '@gold-box/core';

export function useGameState() {
  const [state, setState] = createStore(gameState.getSnapshot());

  onMount(() => {
    const unsubscribe = gameState.subscribe((snapshot) => {
      setState(snapshot);  // Syncs core state to Solid store
    });

    onCleanup(unsubscribe);
  });

  return state;
}

// Usage in components
function CombatScreen() {
  const gameState = useGameState();
  const combat = () => gameState.combat;  // Reactive accessor

  return (
    <Show when={combat()}>
      {(c) => <CombatGrid grid={c().grid} />}
    </Show>
  );
}
```

### State Update Flow

```
User Action (Click, Keypress)
          ↓
UI Component (Solid.js)
          ↓
Event Emitted → EventBus
          ↓
Game Logic Handler (packages/core)
          ↓
GameState.update()
          ↓
gameState.notify() → Listeners
          ↓
Solid Store Updates (reactive)
          ↓
UI Re-renders (fine-grained, only changed parts)
```

### Combat State Example

```typescript
// packages/core/src/combat/CombatState.ts
interface CombatState {
  id: string;
  turnOrder: CombatantId[];
  currentTurnIndex: number;
  round: number;
  grid: GridState;
  activeEffects: ActiveEffect[];
  combatLog: CombatLogEntry[];
}

interface GridState {
  width: number;
  height: number;
  tiles: Tile[][];
  occupants: Map<Position, CombatantId>;
}

// packages/rules-engine/src/combat/CombatManager.ts
class CombatManager {
  startCombat(participants: Combatant[]): CombatState {
    const initiative = this.rollInitiative(participants);
    return {
      id: generateId(),
      turnOrder: initiative.map(p => p.id),
      currentTurnIndex: 0,
      round: 1,
      grid: this.initializeGrid(),
      activeEffects: [],
      combatLog: []
    };
  }

  endTurn(combatId: string): void {
    const combat = gameState.combat;
    if (!combat || combat.id !== combatId) return;

    combat.currentTurnIndex++;
    if (combat.currentTurnIndex >= combat.turnOrder.length) {
      combat.currentTurnIndex = 0;
      combat.round++;
      this.processEndOfRound(combat);
    }

    gameState.notify();
  }

  resolveAction(action: CombatAction): ActionResult {
    // P2E rules implementation
    const result = this.applyRules(action);
    this.updateCombatState(result);
    gameState.notify();
    return result;
  }
}
```

---

## Communication Patterns

### Event Categories

```typescript
// packages/shared/src/types/Events.ts

// Combat events
type CombatEvent =
  | { type: 'COMBAT_STARTED'; payload: CombatState }
  | { type: 'TURN_STARTED'; payload: { combatantId: string } }
  | { type: 'TURN_ENDED'; payload: { combatantId: string } }
  | { type: 'ACTION_REQUESTED'; payload: CombatAction }
  | { type: 'ACTION_RESOLVED'; payload: ActionResult }
  | { type: 'COMBAT_ENDED'; payload: CombatResult };

// Character events
type CharacterEvent =
  | { type: 'CHARACTER_CREATED'; payload: Character }
  | { type: 'CHARACTER_LEVELED_UP'; payload: { characterId: string; level: number } }
  | { type: 'DAMAGE_TAKEN'; payload: { targetId: string; damage: number } }
  | { type: 'CONDITION_APPLIED'; payload: { targetId: string; condition: Condition } };

// World events
type WorldEvent =
  | { type: 'LOCATION_ENTERED'; payload: { locationId: string } }
  | { type: 'QUEST_STARTED'; payload: Quest }
  | { type: 'QUEST_COMPLETED'; payload: { questId: string } }
  | { type: 'DIALOGUE_STARTED'; payload: { npcId: string } };

// UI events
type UIEvent =
  | { type: 'SCREEN_CHANGED'; payload: { screen: ScreenType } }
  | { type: 'MENU_OPENED'; payload: { menu: MenuType } }
  | { type: 'TOOLTIP_SHOWN'; payload: { content: string; position: Point } };

type GameEvent = CombatEvent | CharacterEvent | WorldEvent | UIEvent;
```

### Event Bus Implementation

```typescript
// packages/core/src/EventBus.ts

type EventHandler = (event: GameEvent) => void;
type Unsubscribe = () => void;

class EventBus {
  private listeners = new Map<string, Set<EventHandler>>();
  private eventLog: GameEvent[] = [];
  private logEnabled = true;

  emit(type: string, payload: unknown): void {
    const event: GameEvent = {
      type,
      payload,
      timestamp: Date.now()
    };

    if (this.logEnabled) {
      this.eventLog.push(event);
    }

    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${type}:`, error);
        }
      });
    }
  }

  on(type: string, handler: EventHandler): Unsubscribe {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler);

    return () => this.off(type, handler);
  }

  off(type: string, handler: EventHandler): void {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  once(type: string, handler: EventHandler): Unsubscribe {
    const wrappedHandler: EventHandler = (event) => {
      handler(event);
      this.off(type, wrappedHandler);
    };
    return this.on(type, wrappedHandler);
  }

  clear(): void {
    this.listeners.clear();
  }

  getEventLog(): GameEvent[] {
    return [...this.eventLog];
  }

  clearLog(): void {
    this.eventLog = [];
  }
}

export const eventBus = new EventBus();
```

---

## Technology Stack

### Complete Stack Overview

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **UI Framework** | Solid.js | ^1.9.0 | Reactive UI with near-vanilla performance |
| **2D Rendering** | PixiJS | ^8.0.0 | High-performance 2D WebGL rendering |
| **3D Rendering** | Three.js | ^0.170.0 | First-person dungeon rendering |
| **Language** | TypeScript | ^5.6.0 | Type safety and developer experience |
| **Build Tool** | Vite | ^6.0.0 | Fast dev server and optimized builds |
| **Package Manager** | PNPM | ^9.0.0 | Efficient monorepo management |
| **PWA** | Vite-Plugin-PWA | ^0.20.0 | Service worker and manifest generation |
| **Database** | IndexedDB | Native | Client-side persistence |
| **Testing** | Vitest | ^2.0.0 | Fast unit and integration testing |
| **E2E Testing** | Playwright | ^1.40.0 | End-to-end testing |

### Why These Choices?

**Solid.js over React:**
- 30x faster initial render than React
- ~5% slower than vanilla JS (vs React's ~3000% overhead)
- Fine-grained reactivity (no virtual DOM)
- 7KB bundle vs React's 45KB
- Perfect for game UIs with frequent updates

**PixiJS over Canvas 2D:**
- WebGL acceleration
- Mature ecosystem (v8 in 2025)
- Excellent sprite batching
- Built-in support for filters, blend modes
- Can handle 1000+ sprites at 60fps

**Three.js for 3D:**
- Industry standard
- Extensive documentation
- Large community
- WebGPU support coming
- Easy integration with PixiJS for hybrid rendering

**PNPM over NPM/Yarn:**
- Efficient disk usage (content-addressable store)
- Fast installs
- Excellent monorepo support
- Strict dependency resolution

**IndexedDB over LocalStorage:**
- Can store 50MB+ (vs 5-10MB for localStorage)
- Asynchronous API (doesn't block UI)
- Structured data with indexes
- Transaction support
- Required for complex save games

---

## Build Pipeline

### Vite Configuration

```typescript
// apps/game/vite.config.ts

import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    solid(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Gold Box CRPG',
        short_name: 'GoldBox',
        description: 'A modern Gold Box-style CRPG with Pathfinder 2E rules',
        theme_color: '#1a1a1a',
        background_color: '#0d0d0d',
        display: 'standalone',
        orientation: 'landscape',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|webp|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:mp3|ogg|wav)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': '/src',
      '@core': '../../../packages/core/src',
      '@rules': '../../../packages/rules-engine/src',
      '@content': '../../../packages/content/src',
      '@shared': '../../../packages/shared/src'
    }
  },

  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-solid': ['solid-js'],
          'vendor-pixi': ['pixi.js'],
          'vendor-three': ['three'],
          'rules-engine': ['@gold-box/rules-engine'],
          'content': ['@gold-box/content']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  server: {
    port: 3000,
    open: true
  }
});
```

### Service Worker Strategy

**Caching Strategies:**

1. **Static Assets** (HTML, CSS, JS, fonts): Cache-First
   - Cached on install
   - Updated on new version deployment

2. **Game Assets** (sprites, tilesets, audio): Cache-First with expiration
   - Cached on first load
   - 30-day expiration
   - 500 image limit, 100 audio limit

3. **Game Data** (content database): Stale-While-Revalidate
   - Serve from cache immediately
   - Update in background
   - User sees updates on next load

4. **Save Games**: Network-First with Background Sync
   - Try server first (for cloud saves)
   - Fall back to IndexedDB
   - Sync when connection restored

```typescript
// Custom service worker additions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-save-game') {
    event.waitUntil(syncSaveToCloud());
  }
});

async function syncSaveToCloud() {
  const saves = await getSavesFromIndexedDB();
  for (const save of saves.filter(s => !s.synced)) {
    try {
      await uploadSave(save);
      await markAsSynced(save.id);
    } catch (err) {
      // Will retry on next sync opportunity
      console.error('Failed to sync save:', err);
    }
  }
}
```

### Build Scripts

```json
// Root package.json scripts
{
  "scripts": {
    "dev": "pnpm --filter game dev",
    "build": "pnpm -r build",
    "build:prod": "pnpm -r build --mode production",
    "test": "pnpm -r test",
    "test:watch": "pnpm -r test:watch",
    "test:e2e": "pnpm --filter game test:e2e",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "clean": "pnpm -r clean && rm -rf node_modules"
  }
}
```

### Deployment Pipeline

```yaml
# .github/workflows/deploy.yml (example)
name: Deploy PWA

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build:prod

      - name: Deploy to hosting
        # Deploy apps/game/dist to hosting provider
```

---

## Performance Considerations

### Optimization Strategies

#### 1. Code Splitting and Lazy Loading

```typescript
// Lazy load content databases
const spellDatabase = lazy(() => import('@gold-box/content/spells'));
const featDatabase = lazy(() => import('@gold-box/content/feats'));
const monsterDatabase = lazy(() => import('@gold-box/content/monsters'));

// Lazy load screens
const CharacterCreation = lazy(() => import('./ui/screens/CharacterCreation'));
const CombatScreen = lazy(() => import('./ui/screens/CombatScreen'));
```

#### 2. Object Pooling

```typescript
// packages/core/src/utils/ObjectPool.ts
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;

    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    return this.pool.pop() || this.factory();
  }

  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// Usage for sprites
const spritePool = new ObjectPool(
  () => new PIXI.Sprite(),
  (sprite) => {
    sprite.texture = PIXI.Texture.EMPTY;
    sprite.position.set(0, 0);
    sprite.visible = false;
  },
  100
);
```

#### 3. Virtual Scrolling for Large Lists

```typescript
// For spell lists, inventory, etc.
function VirtualList<T>(props: {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => JSX.Element;
}) {
  const [scrollTop, setScrollTop] = createSignal(0);
  const containerHeight = 600; // viewport height

  const visibleRange = () => {
    const start = Math.floor(scrollTop() / props.itemHeight);
    const end = Math.ceil((scrollTop() + containerHeight) / props.itemHeight);
    return { start, end };
  };

  const visibleItems = () => {
    const { start, end } = visibleRange();
    return props.items.slice(start, end);
  };

  return (
    <div
      class="virtual-list"
      style={{ height: `${containerHeight}px`, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: `${props.items.length * props.itemHeight}px` }}>
        <div style={{ transform: `translateY(${visibleRange().start * props.itemHeight}px)` }}>
          <For each={visibleItems()}>
            {(item, i) => props.renderItem(item, visibleRange().start + i())}
          </For>
        </div>
      </div>
    </div>
  );
}
```

#### 4. WebAssembly for Critical Paths (Future)

```rust
// packages/wasm/src/pathfinding.rs
// Compile to WASM for performance-critical algorithms

#[wasm_bindgen]
pub fn find_path(
    grid: &[u8],
    width: usize,
    height: usize,
    start: usize,
    end: usize
) -> Vec<usize> {
    // A* pathfinding implementation
    // 10-100x faster than JavaScript for complex maps
}
```

#### 5. Texture Atlases and Sprite Sheets

```typescript
// Batch sprites into texture atlases
const textureAtlas = await Assets.load('characters.json');

// Single draw call for multiple sprites from same atlas
const warrior = new Sprite(textureAtlas.textures['warrior.png']);
const mage = new Sprite(textureAtlas.textures['mage.png']);
```

#### 6. Request Animation Frame Game Loop

```typescript
// apps/game/src/game-coordinator.ts
class GameCoordinator {
  private lastTimestamp = 0;
  private accumulatedTime = 0;
  private readonly fixedTimeStep = 1000 / 60; // 60 FPS

  start(): void {
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private gameLoop(timestamp: number): void {
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.accumulatedTime += deltaTime;

    // Fixed time step for game logic
    while (this.accumulatedTime >= this.fixedTimeStep) {
      this.update(this.fixedTimeStep);
      this.accumulatedTime -= this.fixedTimeStep;
    }

    // Variable time step for rendering
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(deltaTime: number): void {
    // Update game logic at fixed 60 FPS
    eventBus.emit('GAME_UPDATE', { deltaTime });
  }

  private render(): void {
    // Render at display refresh rate
    eventBus.emit('GAME_RENDER', {});
  }
}
```

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Initial Load** | < 3s | First Contentful Paint |
| **Time to Interactive** | < 5s | Lighthouse TTI |
| **Frame Rate** | 60 FPS | Combat and exploration |
| **Bundle Size** | < 500KB | Initial JS bundle (gzipped) |
| **Memory Usage** | < 200MB | Steady state during gameplay |

---

## Testing Strategy

### Testing Pyramid

```
       /\
      /  \     E2E Tests (Playwright)
     /────\    - Full gameplay flows
    /      \   - Critical user journeys
   /────────\  Integration Tests (Vitest)
  /          \ - Cross-module interactions
 /────────────\ Unit Tests (Vitest)
/              \ - Pure functions, rules engine
────────────────
```

### Unit Tests (70% coverage target)

```typescript
// packages/rules-engine/__tests__/combat/AttackResolver.test.ts

import { describe, test, expect } from 'vitest';
import { AttackResolver } from '../../src/combat/AttackResolver';
import { createMockCharacter } from '@gold-box/test-utils';

describe('AttackResolver', () => {
  test('resolves normal hit correctly', () => {
    const attacker = createMockCharacter({ attackBonus: 10 });
    const defender = createMockCharacter({ ac: 15 });

    const resolver = new AttackResolver();
    const result = resolver.resolve(attacker, defender, 18); // Roll of 18

    expect(result.hit).toBe(true);
    expect(result.isCritical).toBe(false);
    expect(result.damage).toBeGreaterThan(0);
  });

  test('resolves critical hit on natural 20', () => {
    const attacker = createMockCharacter({ attackBonus: 5 });
    const defender = createMockCharacter({ ac: 25 }); // Would normally miss

    const resolver = new AttackResolver();
    const result = resolver.resolve(attacker, defender, 20); // Natural 20

    expect(result.hit).toBe(true);
    expect(result.isCritical).toBe(true);
    expect(result.damage).toBeGreaterThan(0);
  });

  test('applies weapon properties correctly', () => {
    const weapon = createMockWeapon({ traits: ['Deadly d10'] });
    const attacker = createMockCharacter({ weapon });
    const defender = createMockCharacter({ ac: 15 });

    const resolver = new AttackResolver();
    const result = resolver.resolve(attacker, defender, 20);

    // Deadly adds extra d10 on crit
    expect(result.damage).toBeGreaterThanOrEqual(attacker.weapon.damage + 10);
  });
});
```

### Integration Tests (20% coverage target)

```typescript
// packages/core/__tests__/integration/combat-flow.test.ts

import { describe, test, expect, beforeEach } from 'vitest';
import { GameState } from '../../src/GameState';
import { CombatManager } from '@gold-box/rules-engine';
import { eventBus } from '../../src/EventBus';

describe('Combat Flow Integration', () => {
  let gameState: GameState;
  let combatManager: CombatManager;

  beforeEach(() => {
    gameState = new GameState();
    combatManager = new CombatManager(gameState);
  });

  test('complete combat turn cycle', async () => {
    const party = createMockParty(4);
    const enemies = createMockEnemies(3);

    // Start combat
    const combat = combatManager.startCombat([...party, ...enemies]);
    gameState.combat = combat;

    const events: string[] = [];
    eventBus.on('*', (event) => events.push(event.type));

    // Execute first turn
    const firstCombatant = combat.turnOrder[0];
    const action = {
      type: 'attack',
      actorId: firstCombatant,
      targetId: enemies[0].id
    };

    const result = await combatManager.resolveAction(action);

    expect(result.success).toBe(true);
    expect(events).toContain('ACTION_RESOLVED');
    expect(events).toContain('COMBAT_STATE_CHANGED');
  });
});
```

### E2E Tests (10% coverage target)

```typescript
// apps/game/__tests__/e2e/character-creation.test.ts

import { test, expect } from '@playwright/test';

test('create new character', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click New Game
  await page.click('text=New Game');

  // Enter character name
  await page.fill('input[name="characterName"]', 'Valeros');

  // Select ancestry
  await page.click('text=Human');

  // Select class
  await page.click('text=Fighter');

  // Assign ability scores
  await page.click('[data-ability="strength"] button[aria-label="increase"]');
  await page.click('[data-ability="strength"] button[aria-label="increase"]');

  // Confirm creation
  await page.click('text=Create Character');

  // Verify character appears in party
  await expect(page.locator('text=Valeros')).toBeVisible();
  await expect(page.locator('text=Human Fighter')).toBeVisible();
});
```

### Test Utilities

```typescript
// packages/test-utils/src/mocks/character.ts

export function createMockCharacter(overrides?: Partial<Character>): Character {
  return {
    id: 'char-test-1',
    name: 'Test Character',
    ancestry: 'Human',
    class: 'Fighter',
    level: 1,
    hp: 20,
    maxHp: 20,
    ac: 15,
    abilities: {
      strength: 16,
      dexterity: 14,
      constitution: 13,
      intelligence: 10,
      wisdom: 12,
      charisma: 8
    },
    ...overrides
  };
}
```

---

## Design Patterns

### Key Patterns Used

#### 1. Observer Pattern (State Management)

```typescript
class GameState {
  private observers: Set<Observer> = new Set();

  subscribe(observer: Observer): Unsubscribe {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  notify(): void {
    this.observers.forEach(observer => observer(this.getSnapshot()));
  }
}
```

#### 2. Command Pattern (Actions)

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class AttackCommand implements Command {
  constructor(
    private attacker: Character,
    private target: Character,
    private previousState: CombatState
  ) {}

  execute(): void {
    // Perform attack
  }

  undo(): void {
    // Restore previous state
  }
}

class CommandHistory {
  private history: Command[] = [];
  private currentIndex = -1;

  execute(command: Command): void {
    command.execute();
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(command);
    this.currentIndex++;
  }

  undo(): void {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }

  redo(): void {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].execute();
    }
  }
}
```

#### 3. Strategy Pattern (AI Behaviors)

```typescript
interface AIStrategy {
  selectAction(combatant: Character, combat: CombatState): CombatAction;
}

class AggressiveAI implements AIStrategy {
  selectAction(combatant: Character, combat: CombatState): CombatAction {
    const nearestEnemy = this.findNearestEnemy(combatant, combat);
    return { type: 'attack', targetId: nearestEnemy.id };
  }
}

class DefensiveAI implements AIStrategy {
  selectAction(combatant: Character, combat: CombatState): CombatAction {
    if (combatant.hp < combatant.maxHp * 0.3) {
      return { type: 'defend' };
    }
    return { type: 'attack', targetId: this.selectWeakTarget(combat) };
  }
}
```

#### 4. Factory Pattern (Content Creation)

```typescript
class CharacterFactory {
  createFromTemplate(template: CharacterTemplate): Character {
    const character = {
      id: generateId(),
      name: template.name,
      ancestry: this.ancestryFactory.create(template.ancestry),
      class: this.classFactory.create(template.class),
      level: 1,
      ...this.calculateDerivedStats(template)
    };
    return character;
  }
}
```

#### 5. State Machine (Game Modes)

```typescript
type GameMode = 'menu' | 'exploration' | 'combat' | 'dialogue' | 'inventory';

class GameModeManager {
  private currentMode: GameMode = 'menu';
  private modeStack: GameMode[] = [];

  transition(newMode: GameMode): void {
    this.exitMode(this.currentMode);
    this.modeStack.push(this.currentMode);
    this.currentMode = newMode;
    this.enterMode(newMode);
  }

  popMode(): void {
    if (this.modeStack.length > 0) {
      this.exitMode(this.currentMode);
      this.currentMode = this.modeStack.pop()!;
      this.enterMode(this.currentMode);
    }
  }

  private enterMode(mode: GameMode): void {
    eventBus.emit('MODE_ENTERED', { mode });
  }

  private exitMode(mode: GameMode): void {
    eventBus.emit('MODE_EXITED', { mode });
  }
}
```

---

## Future Considerations

### Scalability

- **Cloud Saves**: Add backend API for cross-device save sync
- **Multiplayer**: Event system architecture supports adding network layer
- **Modding**: Content packages can be loaded dynamically
- **Localization**: String externalization for multiple languages

### Performance Optimizations

- **WebGPU**: Migrate from WebGL when browser support improves
- **WebAssembly**: Critical path algorithms (pathfinding, combat resolution)
- **Web Workers**: Offload heavy computations (world generation, AI)
- **Streaming**: Stream large content databases on-demand

### Accessibility

- **Keyboard Navigation**: Full keyboard support (Gold Box style!)
- **Screen Reader**: ARIA labels for UI components
- **High Contrast**: Configurable color schemes
- **Difficulty Options**: Adjustable combat difficulty, auto-pause

---

## Conclusion

This architecture provides:

✅ **Separation of Concerns**: Clean layer boundaries
✅ **Testability**: Framework-agnostic core logic
✅ **Performance**: Optimized rendering and state management
✅ **Maintainability**: Modular monorepo structure
✅ **Extensibility**: Event-driven communication
✅ **PWA Benefits**: Offline play, installable, cached assets

The combination of Solid.js for UI, PixiJS/Three.js for rendering, and a pure TypeScript core creates a high-performance, maintainable foundation for a complex CRPG with full Pathfinder 2E rules.

---

**Next Steps:**
1. Set up initial project structure and workspaces
2. Implement core event bus and state management
3. Create basic UI shell with Solid.js
4. Build character creation flow
5. Implement P2E character system
6. Develop combat prototype

See also:
- [Solid.js Migration Guide](./SOLIDJS_MIGRATION_GUIDE.md)
- Pathfinder 2E Rules Implementation (TBD)
- Gold Box Design Principles (TBD)
