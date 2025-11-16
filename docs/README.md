# Gold Box CRPG - Technical Documentation

Complete technical design documentation for a modern Progressive Web App (PWA) that modernizes classic Gold Box CRPGs using Pathfinder 2E Remastered rules.

## 📚 Documentation Index

### 1. [Architecture](./ARCHITECTURE.md)
**Complete system architecture and project structure**

- Layered architecture (PWA Shell → UI → Coordination → Game Logic → Data)
- Event-driven communication with EventBus
- PNPM workspaces monorepo structure
- Two-tier state management (Core TypeScript + Solid.js reactive)
- Technology stack decisions
- Build pipeline with Vite

**Key Topics:**
- System layers and responsibilities
- Package structure
- State management patterns
- Event-driven architecture
- Build and deployment

---

### 2. [Solid.js Migration Guide](./SOLIDJS_MIGRATION_GUIDE.md)
**Complete guide for transitioning from React to Solid.js**

- React vs Solid.js comparison
- Key differences (signals, components run once, no destructuring props)
- Gold Box UI patterns in Solid.js
- TypeScript setup
- Learning resources

**Key Topics:**
- Mental model shift from React
- Reactivity primitives (createSignal, createEffect, createMemo)
- Control flow components (Show, For, Switch)
- Props handling best practices
- Performance benefits

**Why Solid.js:** 30x faster than React, 7KB bundle size, ~5% overhead vs vanilla JS

---

### 3. [Pathfinder 2E Rules Engine](./PATHFINDER_2E_RULES.md)
**Complete Pathfinder 2E Remastered rules implementation design**

- Proficiency system (Untrained → Legendary)
- Degrees of success (4-tier outcomes)
- Character system (abilities, saves, HP, AC)
- Combat system (3-action economy, MAP -5/-10 or -4/-8 agile)
- Spell system (slots, focus points restore after combat)
- Conditions (40+ with valued versions)
- Skills and proficiency

**Key Topics:**
- Action economy (3 actions + 1 reaction per turn)
- Multiple Attack Penalty (MAP)
- Proficiency scaling with level
- Spell heightening
- Condition management
- Degrees of success calculation

**Content Scale:** 600+ spells, 400+ feats, 500+ items, 40+ conditions

---

### 4. [Content Pipeline](./CONTENT_PIPELINE.md)
**Content management system for 2000+ game entries**

- JSON format with Zod validation
- Three-tier loading (Critical 50KB, Char Creation 200KB, Gameplay 2-5MB)
- IndexedDB + memory caching
- Content organization by type → category → level
- Build pipeline with validation, minification, search indexing
- Authoring workflow with CLI tools

**Key Topics:**
- Zod schemas for type safety
- Lazy loading strategies
- IndexedDB caching for offline play
- Content validation pipeline
- Search indexing with Lunr.js
- Hot-reloading for development

**Content Types:** Spells, feats, items, ancestries, classes, backgrounds, monsters

---

### 5. [Gold Box UI/UX Design](./GOLD_BOX_UI_DESIGN.md)
**UI/UX patterns for modern Gold Box interface**

- Classic Gold Box analysis (keyboard-driven, menu-based, split-screen)
- Modern adaptations (keyboard-first, mouse-enhanced, touch fallback)
- Main game screen layout (viewport, sidebar, message log, action bar)
- Combat interface (tactical grid, turn order, 3-action economy)
- Character sheets (tabbed interface)
- Party management
- Spellbook interface (spell slots, focus points)
- Inventory interface (equipment slots, bulk tracking)
- Accessibility (keyboard navigation, screen reader, high contrast, UI scaling)
- Visual design (retro-modern aesthetic, typography, CRT effects)

**Key Topics:**
- Menu-driven navigation patterns
- Split-screen information density
- Tactical combat UI
- Keyboard shortcuts
- Accessibility features
- Responsive design

**Design Philosophy:** Preserve classic menu-driven feel, add modern usability

---

### 6. [Graphics Pipeline](./GRAPHICS_PIPELINE.md)
**Complete rendering architecture for 2D and 3D graphics**

- PixiJS v8 for 2D tactical combat (isometric grid, sprites, effects)
- Three.js for 3D first-person exploration (dungeon crawler)
- Hybrid rendering system (mode switching between 2D/3D)
- Asset pipeline (texture atlases, model loading, caching)
- Visual effects (particles, spell effects, animations)
- Performance optimization (culling, pooling, batching)

**Key Topics:**
- PixiJS isometric grid rendering
- Three.js dungeon geometry generation
- Sprite management with z-ordering
- Particle-based spell effects
- First-person camera controller
- Dynamic lighting system
- Asset loading and caching
- Performance monitoring

**Performance Targets:** 60 FPS @ 1920x1080, < 100ms load time, < 16ms frame time

---

## 🎯 Quick Start Guide

### For New Developers

**Recommended reading order:**

1. **Start here:** [Architecture](./ARCHITECTURE.md) - Understand the overall system
2. **UI Framework:** [Solid.js Migration Guide](./SOLIDJS_MIGRATION_GUIDE.md) - Learn the UI framework
3. **Game Rules:** [Pathfinder 2E Rules Engine](./PATHFINDER_2E_RULES.md) - Understand the game mechanics
4. **Pick your focus:**
   - Frontend/UI → [Gold Box UI/UX Design](./GOLD_BOX_UI_DESIGN.md)
   - Graphics/Rendering → [Graphics Pipeline](./GRAPHICS_PIPELINE.md)
   - Content/Data → [Content Pipeline](./CONTENT_PIPELINE.md)

### For Specific Tasks

| Task | Documentation |
|------|---------------|
| **Setting up the project** | [Architecture](./ARCHITECTURE.md) - Monorepo structure |
| **Building UI components** | [Solid.js Guide](./SOLIDJS_MIGRATION_GUIDE.md) + [UI Design](./GOLD_BOX_UI_DESIGN.md) |
| **Implementing combat** | [P2E Rules](./PATHFINDER_2E_RULES.md) + [Graphics Pipeline](./GRAPHICS_PIPELINE.md) |
| **Adding spells/items** | [Content Pipeline](./CONTENT_PIPELINE.md) |
| **Rendering tactical grid** | [Graphics Pipeline](./GRAPHICS_PIPELINE.md) - PixiJS section |
| **Creating 3D dungeons** | [Graphics Pipeline](./GRAPHICS_PIPELINE.md) - Three.js section |
| **Managing game state** | [Architecture](./ARCHITECTURE.md) - State management |

---

## 🏗️ Project Overview

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **UI Framework** | Solid.js | Reactive UI with near-native performance |
| **2D Rendering** | PixiJS v8 | Tactical combat grid, sprites, effects |
| **3D Rendering** | Three.js | First-person dungeon exploration |
| **Animation** | GSAP | Smooth transitions and effects |
| **State Management** | TypeScript + Solid.js | Two-tier state system |
| **Content Validation** | Zod | Runtime type safety for game data |
| **Build Tool** | Vite | Fast builds and HMR |
| **Package Manager** | PNPM | Efficient monorepo management |
| **Testing** | Vitest + Playwright | Unit and E2E tests |

### Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                    PWA Shell                            │
│         (Service Worker, Offline, Manifest)             │
└────────────────────┬────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────────────┐
│                  UI Layer (Solid.js)                    │
│          (Components, Screens, User Input)              │
└────────────────────┬────────────────────────────────────┘
                     │
┌─────────────────────────────────────────────────────────┐
│               Coordination Layer                        │
│      (Event Bus, State Sync, Render Coordination)       │
└──────┬──────────────────────────────┬───────────────────┘
       │                              │
┌──────▼──────────┐          ┌────────▼──────────────────┐
│  Game Logic     │          │  Rendering Engine         │
│  - Party        │          │  - PixiJS (2D Combat)     │
│  - World        │          │  - Three.js (3D Dungeon)  │
│  - Quest        │          │  - Effects & Animation    │
└──────┬──────────┘          └───────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│              Rules Engine (Pathfinder 2E)               │
│    (Combat, Spells, Skills, Conditions, Proficiency)    │
└──────┬──────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│               Data Layer                                │
│  (Content JSON, IndexedDB, Asset Manager)               │
└─────────────────────────────────────────────────────────┘
```

### Monorepo Structure

```
packages/
├── core/                   # Framework-agnostic game logic
├── rules-engine/           # Pathfinder 2E implementation
├── rendering/              # PixiJS + Three.js rendering
├── content/                # JSON game data with Zod schemas
├── ui/                     # Solid.js UI components
└── shared/                 # Common types and utilities

apps/
└── game/                   # Main PWA application
```

---

## 📊 Documentation Statistics

| Document | Lines | Size | Topics Covered |
|----------|-------|------|----------------|
| Architecture | 1,800+ | 68KB | System design, monorepo, state management |
| Solid.js Guide | 1,100+ | 38KB | React migration, reactivity, Gold Box patterns |
| P2E Rules | 1,400+ | 54KB | Combat, spells, conditions, proficiency |
| Content Pipeline | 1,600+ | 60KB | JSON schemas, loading, validation, caching |
| UI/UX Design | 1,000+ | 70KB | Screens, menus, combat UI, accessibility |
| Graphics Pipeline | 1,200+ | 70KB | PixiJS, Three.js, effects, optimization |
| **Total** | **8,100+** | **~360KB** | **Complete technical specification** |

---

## 🎮 Key Features

### Game Features

✅ **Full Pathfinder 2E Remastered Rules**
- 3-action economy combat system
- 600+ spells with heightening
- Proficiency system (Untrained → Legendary)
- 40+ conditions with values
- Degrees of success (Critical Success/Success/Failure/Critical Failure)

✅ **Classic Gold Box Gameplay**
- Menu-driven interface with keyboard shortcuts
- First-person dungeon exploration
- Turn-based tactical combat on isometric grid
- Party management (up to 6 characters)
- Rich text-based storytelling

✅ **Modern Enhancements**
- Progressive Web App (offline play)
- Mouse and touch support
- Smooth animations and visual effects
- High-contrast mode and UI scaling
- Full keyboard and screen reader accessibility

### Technical Features

✅ **Performance**
- 60 FPS target @ 1920x1080
- Lazy loading with < 100ms initial load
- Automatic sprite batching (PixiJS v8)
- Viewport culling and object pooling

✅ **Developer Experience**
- TypeScript throughout for type safety
- Hot module reloading (HMR)
- Zod validation for runtime safety
- Comprehensive error handling
- Performance monitoring tools

✅ **Content Management**
- 2000+ content entries in JSON
- Three-tier lazy loading
- IndexedDB caching for offline
- Full-text search with Lunr.js
- Content validation pipeline

---

## 🔗 External Resources

### Technology Documentation

- [Solid.js Docs](https://www.solidjs.com/docs/latest) - UI framework
- [PixiJS Docs](https://pixijs.com/guides) - 2D rendering
- [Three.js Docs](https://threejs.org/docs/) - 3D rendering
- [Pathfinder 2E Archives](https://2e.aonprd.com/) - Game rules reference
- [Vite Docs](https://vitejs.dev/) - Build tool

### Gold Box Games Reference

- [Gold Box Games on Wikipedia](https://en.wikipedia.org/wiki/Gold_Box)
- Pool of Radiance (1988) - The original
- Curse of the Azure Bonds (1989)
- Secret of the Silver Blades (1990)
- Pools of Darkness (1991)

### Design Inspiration

- **Classic CRPGs:** Pool of Radiance, Eye of the Beholder, Wizardry
- **Modern Interpretations:** Solasta, Pathfinder: Kingmaker, Divinity: Original Sin 2
- **UI/UX:** Classic menu-driven interfaces with modern accessibility

---

## 📝 Document Conventions

### Code Examples

All documents include production-ready TypeScript code examples:
- ✅ Type-safe with explicit types
- ✅ Follow modern best practices
- ✅ Include error handling
- ✅ Documented with comments
- ✅ Designed for real implementation

### Cross-References

Documents extensively cross-reference each other:
- **See Also** sections at the end
- Inline references to related documents
- Consistent terminology across all docs

### Versioning

All documentation reflects the **initial design phase** and should be updated as implementation progresses.

---

## 🚀 Next Steps

### Completed

1. ✅ Overall Architecture
2. ✅ Pathfinder 2E Rules Engine
3. ✅ Content Pipeline Design
4. ✅ Gold Box UI/UX Patterns
5. ✅ Graphics Pipeline
6. ✅ Solid.js Migration Guide

### Remaining Design Work

- [ ] **AI System** - Enemy behavior, tactical decision-making
- [ ] **Audio System** - Sound effects, music, spatial audio
- [ ] **Networking** (Optional) - Multiplayer, cloud saves

### Implementation

Ready to begin implementation with complete technical specifications:

1. **Setup Phase** - Initialize monorepo, install dependencies, configure build
2. **Core Systems** - Event bus, state management, content loader
3. **Rules Engine** - Combat system, character management, spell casting
4. **Rendering** - PixiJS grid, Three.js dungeon, asset pipeline
5. **UI Components** - Screens, menus, dialogs in Solid.js
6. **Content** - Import Pathfinder 2E data, validate schemas
7. **Polish** - Effects, animations, accessibility, testing

---

## 📧 Contributing

When contributing to this documentation:

1. **Consistency** - Follow existing patterns and terminology
2. **Code Examples** - Provide working TypeScript examples
3. **Cross-References** - Link to related documents
4. **Clarity** - Write for developers new to the project
5. **Completeness** - Include both high-level concepts and implementation details

---

## 📄 License

This documentation is part of the Gold Box CRPG project.

Game rules content (Pathfinder 2E Remastered) is licensed under the ORC License.

---

**Last Updated:** November 15, 2025

**Documentation Version:** 1.0 (Initial Design Phase)

**Total Documentation:** ~360KB across 6 comprehensive technical documents
