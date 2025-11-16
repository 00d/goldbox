# Documentation Directory Structure

## 📁 Complete File Layout

```
docs/
├── README.md                          # 📋 Main documentation index (START HERE)
├── DIRECTORY_STRUCTURE.md             # 📂 This file - directory overview
│
├── ARCHITECTURE.md                    # 🏗️  System Architecture & Design
│   ├── Layered architecture overview
│   ├── Event-driven communication
│   ├── Monorepo structure (PNPM workspaces)
│   ├── State management (Core + Solid.js)
│   ├── Technology stack decisions
│   └── Build pipeline with Vite
│
├── SOLIDJS_MIGRATION_GUIDE.md         # ⚡ UI Framework Guide
│   ├── React vs Solid.js comparison
│   ├── Reactivity system (signals, effects, memos)
│   ├── Component patterns
│   ├── Props handling best practices
│   ├── Gold Box UI examples
│   └── Performance benefits (30x faster than React)
│
├── PATHFINDER_2E_RULES.md             # 🎲 Game Rules Engine
│   ├── Proficiency system (Untrained → Legendary)
│   ├── Combat system (3-action economy, MAP)
│   ├── Spell system (600+ spells, heightening)
│   ├── Character system (abilities, saves, HP, AC)
│   ├── Conditions (40+ with values)
│   ├── Degrees of success (4-tier outcomes)
│   └── Skills and checks
│
├── CONTENT_PIPELINE.md                # 📦 Content Management
│   ├── JSON format with Zod validation
│   ├── Three-tier lazy loading strategy
│   ├── IndexedDB + memory caching
│   ├── Content organization (2000+ entries)
│   ├── Build pipeline and validation
│   ├── Search indexing (Lunr.js)
│   └── Authoring workflow and CLI tools
│
├── GOLD_BOX_UI_DESIGN.md              # 🎨 UI/UX Patterns
│   ├── Classic Gold Box interface analysis
│   ├── Modern adaptations
│   ├── Screen layouts (exploration, combat)
│   ├── Combat interface (tactical grid, actions)
│   ├── Character management (sheets, party)
│   ├── Spell & inventory interfaces
│   ├── Accessibility (keyboard, screen reader)
│   └── Visual design (retro-modern aesthetic)
│
└── GRAPHICS_PIPELINE.md               # 🎮 Rendering Architecture
    ├── PixiJS v8 (2D tactical combat)
    ├── Three.js (3D first-person dungeons)
    ├── Hybrid rendering system
    ├── Asset pipeline (textures, models)
    ├── Visual effects (particles, spells)
    ├── Performance optimization (60 FPS target)
    └── Solid.js integration examples
```

---

## 📊 Documentation Statistics

| File | Size | Lines | Primary Focus |
|------|------|-------|---------------|
| **README.md** | 15KB | 450+ | Index & quick start guide |
| **ARCHITECTURE.md** | 42KB | 1,800+ | System design & structure |
| **SOLIDJS_MIGRATION_GUIDE.md** | 28KB | 1,100+ | UI framework patterns |
| **PATHFINDER_2E_RULES.md** | 37KB | 1,400+ | Game mechanics |
| **CONTENT_PIPELINE.md** | 33KB | 1,600+ | Data management |
| **GOLD_BOX_UI_DESIGN.md** | 36KB | 1,000+ | Interface design |
| **GRAPHICS_PIPELINE.md** | 55KB | 1,200+ | Rendering systems |
| **DIRECTORY_STRUCTURE.md** | 3KB | 150+ | Navigation aid |
| **TOTAL** | **~260KB** | **8,700+** | Complete specification |

---

## 🗺️ Navigation Map

### By Role

#### **Project Manager / Lead**
Start with: `README.md` → `ARCHITECTURE.md`

Understand the complete system, technology stack, and development approach.

#### **Frontend Developer**
1. `SOLIDJS_MIGRATION_GUIDE.md` - Learn the UI framework
2. `GOLD_BOX_UI_DESIGN.md` - Implement screens and components
3. `ARCHITECTURE.md` - Understand state management

#### **Graphics Engineer**
1. `GRAPHICS_PIPELINE.md` - Complete rendering architecture
2. `GOLD_BOX_UI_DESIGN.md` - UI visual requirements
3. `ARCHITECTURE.md` - Integration patterns

#### **Gameplay Programmer**
1. `PATHFINDER_2E_RULES.md` - Game mechanics
2. `ARCHITECTURE.md` - System integration
3. `CONTENT_PIPELINE.md` - Data access patterns

#### **Content Designer**
1. `CONTENT_PIPELINE.md` - Data formats and tools
2. `PATHFINDER_2E_RULES.md` - Rules reference
3. `README.md` - Project overview

---

### By Task

#### **Setting Up Project**
- `ARCHITECTURE.md` → Monorepo Structure section
- `README.md` → Technology Stack table

#### **Building UI Components**
- `SOLIDJS_MIGRATION_GUIDE.md` → Component patterns
- `GOLD_BOX_UI_DESIGN.md` → Screen layouts
- `GRAPHICS_PIPELINE.md` → Solid.js integration

#### **Implementing Combat**
- `PATHFINDER_2E_RULES.md` → Combat System
- `GRAPHICS_PIPELINE.md` → PixiJS Tactical Grid
- `GOLD_BOX_UI_DESIGN.md` → Combat Interface

#### **Creating Spell Effects**
- `GRAPHICS_PIPELINE.md` → Visual Effects section
- `PATHFINDER_2E_RULES.md` → Spell System
- `CONTENT_PIPELINE.md` → Spell data format

#### **Adding New Content**
- `CONTENT_PIPELINE.md` → Content Organization
- `PATHFINDER_2E_RULES.md` → Rules reference
- `ARCHITECTURE.md` → Content loading

#### **3D Dungeon Rendering**
- `GRAPHICS_PIPELINE.md` → Three.js 3D Rendering
- `ARCHITECTURE.md` → Rendering coordination
- `GOLD_BOX_UI_DESIGN.md` → Exploration UI

---

## 🔍 Quick Reference

### Key Concepts

| Concept | Primary Document | Section |
|---------|-----------------|---------|
| **Event-Driven Architecture** | ARCHITECTURE.md | Architecture Layers |
| **3-Action Economy** | PATHFINDER_2E_RULES.md | Combat System |
| **Solid.js Signals** | SOLIDJS_MIGRATION_GUIDE.md | Reactivity System |
| **Isometric Grid** | GRAPHICS_PIPELINE.md | Tactical Combat Grid |
| **Lazy Loading** | CONTENT_PIPELINE.md | Three-Tier Loading |
| **Menu-Driven UI** | GOLD_BOX_UI_DESIGN.md | Design Principles |
| **Spell Heightening** | PATHFINDER_2E_RULES.md | Spell System |
| **Asset Caching** | GRAPHICS_PIPELINE.md | Asset Pipeline |

### Technology Decisions

| Decision | Rationale | Document |
|----------|-----------|----------|
| **Solid.js over React** | 30x performance improvement | SOLIDJS_MIGRATION_GUIDE.md |
| **PixiJS v8** | Automatic batching, WebGL/WebGPU | GRAPHICS_PIPELINE.md |
| **Three.js** | Mature 3D engine, dungeon rendering | GRAPHICS_PIPELINE.md |
| **Zod validation** | Runtime type safety for content | CONTENT_PIPELINE.md |
| **PNPM workspaces** | Efficient monorepo management | ARCHITECTURE.md |
| **IndexedDB** | Offline content caching | CONTENT_PIPELINE.md |
| **GSAP** | Smooth performant animations | GRAPHICS_PIPELINE.md |
| **Vite** | Fast builds and HMR | ARCHITECTURE.md |

---

## 📖 Reading Paths

### Path 1: Complete Overview (2-3 hours)
Read everything in order for comprehensive understanding:

1. README.md (15 min)
2. ARCHITECTURE.md (45 min)
3. SOLIDJS_MIGRATION_GUIDE.md (30 min)
4. PATHFINDER_2E_RULES.md (40 min)
5. CONTENT_PIPELINE.md (35 min)
6. GOLD_BOX_UI_DESIGN.md (30 min)
7. GRAPHICS_PIPELINE.md (40 min)

### Path 2: Quick Start (30 minutes)
Get up to speed quickly:

1. README.md → Overview section
2. ARCHITECTURE.md → Layers + Tech Stack
3. Skim your relevant specialization document

### Path 3: Deep Dive (4-6 hours)
Thorough study with code examples:

1. Read all documents in order
2. Study all code examples
3. Cross-reference between documents
4. Note questions and clarifications

---

## 🔗 Cross-Document References

### Architecture References

| From Document | To Document | What It References |
|---------------|-------------|-------------------|
| ARCHITECTURE | SOLIDJS_MIGRATION_GUIDE | UI layer implementation |
| ARCHITECTURE | PATHFINDER_2E_RULES | Rules engine integration |
| ARCHITECTURE | CONTENT_PIPELINE | Data layer design |
| ARCHITECTURE | GRAPHICS_PIPELINE | Rendering layer |

### Implementation References

| From Document | To Document | What It References |
|---------------|-------------|-------------------|
| SOLIDJS_MIGRATION_GUIDE | GOLD_BOX_UI_DESIGN | Component examples |
| GRAPHICS_PIPELINE | GOLD_BOX_UI_DESIGN | UI rendering requirements |
| CONTENT_PIPELINE | PATHFINDER_2E_RULES | Data schemas |
| PATHFINDER_2E_RULES | CONTENT_PIPELINE | Spell/feat formats |

---

## 💡 Tips for Navigation

### First Time Reading

1. **Start with README.md** - Get the big picture
2. **Read ARCHITECTURE.md** - Understand the system
3. **Pick your focus area** - Go deep on relevant docs
4. **Cross-reference liberally** - Documents link to each other

### Reference Usage

- Use **Ctrl+F / Cmd+F** to search within documents
- Check **Table of Contents** at the top of each document
- Look for **"See Also"** sections at the end
- Follow **inline cross-references** between documents

### Code Examples

- All code examples are **production-ready TypeScript**
- Examples are **fully typed** and follow best practices
- Look for **📝 Note** callouts for important details
- Check **⚠️ Warning** callouts for common pitfalls

---

## 📝 Document Maintenance

### Updating Documentation

When making changes:

1. ✅ Update the primary document
2. ✅ Check cross-references in other documents
3. ✅ Update README.md if adding new sections
4. ✅ Update this DIRECTORY_STRUCTURE.md if adding files
5. ✅ Increment version date at document end

### Adding New Documents

If creating new documentation:

1. Follow existing naming convention (UPPERCASE.md)
2. Add entry to README.md index
3. Add to this DIRECTORY_STRUCTURE.md
4. Add cross-references from related documents
5. Include Table of Contents
6. Add "See Also" section at end

---

## 🎯 Document Purposes Summary

| Document | Primary Audience | When to Read |
|----------|-----------------|--------------|
| **README.md** | Everyone | First, always |
| **ARCHITECTURE.md** | All developers, leads | Project setup, system design |
| **SOLIDJS_MIGRATION_GUIDE.md** | Frontend developers | Before writing UI code |
| **PATHFINDER_2E_RULES.md** | Game programmers | Implementing mechanics |
| **CONTENT_PIPELINE.md** | Content designers, backend | Working with game data |
| **GOLD_BOX_UI_DESIGN.md** | UI/UX designers, frontend | Building interfaces |
| **GRAPHICS_PIPELINE.md** | Graphics engineers | Implementing rendering |
| **DIRECTORY_STRUCTURE.md** | Everyone | Navigation help |

---

## 📦 Output Files Reference

Each document produces insights for specific implementation files:

### ARCHITECTURE.md → Project Structure
```
packages/
├── core/           # Game logic
├── rules-engine/   # P2E rules
├── rendering/      # Graphics
├── content/        # Game data
├── ui/             # Solid.js components
└── shared/         # Common utilities
```

### SOLIDJS_MIGRATION_GUIDE.md → UI Components
```
packages/ui/src/
├── components/     # Reusable UI components
├── screens/        # Full screens
├── state/          # Solid.js stores
└── utils/          # UI helpers
```

### GRAPHICS_PIPELINE.md → Rendering Code
```
packages/rendering/src/
├── pixi/           # 2D combat rendering
├── three/          # 3D dungeon rendering
├── effects/        # Visual effects
└── assets/         # Asset management
```

### PATHFINDER_2E_RULES.md → Rules Engine
```
packages/rules-engine/src/
├── combat/         # Combat mechanics
├── spells/         # Spell system
├── character/      # Character rules
└── conditions/     # Condition management
```

### CONTENT_PIPELINE.md → Game Data
```
packages/content/src/data/
├── spells/         # 600+ spell entries
├── feats/          # 400+ feat entries
├── items/          # 500+ item entries
└── monsters/       # Enemy data
```

---

## 🚀 Getting Started Checklist

- [ ] Read README.md for project overview
- [ ] Read ARCHITECTURE.md to understand system design
- [ ] Read relevant specialization document(s)
- [ ] Review code examples in your focus area
- [ ] Check cross-references to related systems
- [ ] Note any questions or clarifications needed
- [ ] Ready to implement!

---

**Last Updated:** November 15, 2025

**Version:** 1.0

**Total Files:** 8 documentation files (~260KB)
