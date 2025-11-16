# Content Pipeline Design

This document describes the content management system for handling 2000+ Pathfinder 2E Remastered game content entries including spells, feats, items, monsters, and more.

## Table of Contents

- [Overview](#overview)
- [Content Scale](#content-scale)
- [File Format & Schema](#file-format--schema)
- [Content Organization](#content-organization)
- [Loading Strategy](#loading-strategy)
- [Validation System](#validation-system)
- [Build Pipeline](#build-pipeline)
- [Authoring Workflow](#authoring-workflow)
- [Search & Indexing](#search--indexing)
- [Performance Considerations](#performance-considerations)

---

## Overview

### Design Principles

1. **Data-Driven**: Game behavior governed by external data files, not hard-coded logic
2. **Type-Safe**: Zod schemas provide runtime validation + compile-time types
3. **Lazy Loading**: Content loaded on-demand to minimize initial bundle
4. **Cacheable**: IndexedDB caching for offline play and fast subsequent loads
5. **Versionable**: JSON files in git for full version control and diff tracking
6. **Extensible**: Easy to add new content types and fields

### Technology Choices

| Aspect | Technology | Rationale |
|--------|-----------|-----------|
| **Format** | JSON | Lightweight, universal support, tree-shakeable |
| **Validation** | Zod | Runtime + compile-time validation, type inference |
| **Storage** | IndexedDB | Large storage (50MB+), async, offline-capable |
| **Build** | TypeScript + esbuild | Fast builds, ES modules for tree-shaking |
| **Search** | Lunr.js | Full-text search, lightweight, client-side |

---

## Content Scale

### Total Content Estimate

```
~600 Spells           (levels 0-10, 4 traditions)
~400 Feats            (ancestry, class, general, skill)
~20 Ancestries        (with ~60 heritages)
~20 Classes           (with subclass options)
~40 Backgrounds
~500 Items            (weapons, armor, magic items, consumables)
~300 Monsters         (creatures, NPCs)
~40 Conditions
~17 Skills            (with actions)
Maps & Locations      (dungeons, towns, overworld)
Quests & Dialogue     (main story, side quests)

Total: ~2000+ entries
Estimated size: 2-5MB JSON (minified)
```

### Content by Loading Tier

**Tier 1: Critical (50KB)**
- Loaded immediately on app start
- Core constants, UI strings, tutorial content

**Tier 2: Character Creation (200KB)**
- Loaded when entering character creation
- Ancestries, classes, backgrounds, level 1 feats

**Tier 3: Gameplay (2-5MB)**
- Lazy-loaded as needed during gameplay
- Spells, high-level feats, items, monsters, maps

---

## File Format & Schema

### Why JSON Over YAML/XML

- ✅ Native JavaScript support
- ✅ Smaller bundle size
- ✅ Better Vite/rollup integration
- ✅ Tree-shakeable imports
- ✅ Faster parsing
- ❌ Less human-readable (acceptable with tools)

### Zod Schema Approach

```typescript
// packages/content/src/types.ts

import { z } from 'zod';

// Define schema with Zod
export const SpellSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number().min(0).max(10),
  traditions: z.array(z.enum(['arcane', 'divine', 'occult', 'primal'])),
  // ... more fields
});

// Infer TypeScript type from schema
export type Spell = z.infer<typeof SpellSchema>;

// Runtime validation
function validateSpell(data: unknown): Spell {
  return SpellSchema.parse(data);  // Throws if invalid
}
```

**Benefits:**
- Single source of truth for types and validation
- Automatic TypeScript type inference
- Runtime safety for loaded data
- Self-documenting schemas

### Example Content Files

```json
// packages/content/src/data/spells/arcane/level-3.json

[
  {
    "id": "fireball",
    "name": "Fireball",
    "level": 3,
    "traditions": ["arcane", "primal"],
    "rarity": "common",
    "actions": 2,
    "components": ["somatic", "verbal"],
    "range": {
      "value": 500,
      "unit": "feet"
    },
    "area": {
      "shape": "burst",
      "size": 20
    },
    "traits": ["Evocation", "Fire"],
    "savingThrow": {
      "type": "reflex",
      "basic": true
    },
    "effectType": "damage",
    "damageType": "fire",
    "damageDice": "6d6",
    "autoHeighten": "+2d6 per level above 3rd",
    "description": "A roaring blast of fire appears at a spot you designate, dealing 6d6 fire damage.",
    "heightenedDescription": "The damage increases by 2d6 for each spell level above 3rd."
  }
]
```

---

## Content Organization

### Directory Structure

```
packages/content/
├── src/
│   ├── index.ts                    # Main exports
│   ├── types.ts                    # Zod schemas
│   │
│   ├── loader/
│   │   ├── ContentLoader.ts        # Loading orchestration
│   │   ├── ContentCache.ts         # IndexedDB caching
│   │   └── ContentIndex.ts         # Search/filter
│   │
│   └── data/                       # JSON content
│       ├── core/
│       │   ├── constants.json      # Game rules constants
│       │   └── strings.json        # UI text
│       │
│       ├── ancestries/
│       │   ├── index.json          # All ancestries
│       │   ├── human.json
│       │   ├── elf.json
│       │   └── ...
│       │
│       ├── classes/
│       │   ├── index.json
│       │   ├── fighter.json
│       │   └── ...
│       │
│       ├── spells/
│       │   ├── arcane/
│       │   │   ├── level-0.json    # Cantrips
│       │   │   ├── level-1.json
│       │   │   └── ...
│       │   ├── divine/
│       │   ├── occult/
│       │   └── primal/
│       │
│       ├── feats/
│       │   ├── ancestry/
│       │   │   ├── level-1.json
│       │   │   ├── level-5.json
│       │   │   └── ...
│       │   ├── class/
│       │   │   ├── fighter.json
│       │   │   ├── wizard.json
│       │   │   └── ...
│       │   ├── general/
│       │   └── skill/
│       │
│       ├── items/
│       │   ├── weapons/
│       │   │   ├── simple.json
│       │   │   ├── martial.json
│       │   │   └── advanced.json
│       │   ├── armor/
│       │   ├── consumables/
│       │   └── magic-items/
│       │
│       ├── monsters/
│       │   ├── by-level/
│       │   └── by-type/
│       │
│       └── quests/
│
├── dist/                           # Built content
│   ├── spells/                     # Optimized bundles
│   ├── indexes/                    # Search indexes
│   └── manifest.json               # Content manifest
│
└── tools/                          # Build tools
    ├── validate.ts                 # Validation CLI
    ├── build.ts                    # Build pipeline
    ├── new-spell.ts                # Content scaffolding
    └── search.ts                   # Search CLI
```

### Organizational Patterns

1. **Group by Type**: Spells, feats, items in separate directories
2. **Subdivide by Category**: Spells by tradition, feats by type
3. **Further by Level/Tier**: Spells by level for lazy loading
4. **Index Files**: Summary data for quick lookups without loading full content

---

## Loading Strategy

### Three-Tier Loading System

```typescript
// packages/content/src/loader/ContentLoader.ts

class ContentLoader {
  private memoryCache = new Map<string, any>();
  private indexedDBCache: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    // Tier 1: Load critical content immediately
    await this.loadCriticalContent();

    // Initialize IndexedDB for tier 3 caching
    this.indexedDBCache = await this.initIndexedDB();
  }

  // Tier 1: Critical (~50KB, loaded on startup)
  private async loadCriticalContent(): Promise<void> {
    const [constants, strings] = await Promise.all([
      import('../data/core/constants.json'),
      import('../data/core/strings.json')
    ]);

    this.memoryCache.set('constants', constants.default);
    this.memoryCache.set('strings', strings.default);
  }

  // Tier 2: Character Creation (~200KB, on-demand)
  async loadCharacterCreationContent(): Promise<CharCreationData> {
    if (this.memoryCache.has('char-creation')) {
      return this.memoryCache.get('char-creation');
    }

    const [ancestries, classes, backgrounds, feats] = await Promise.all([
      import('../data/ancestries/index.json'),
      import('../data/classes/index.json'),
      import('../data/backgrounds/index.json'),
      import('../data/feats/level-1.json')
    ]);

    const data = {
      ancestries: this.validate(ancestries.default, AncestrySchema),
      classes: this.validate(classes.default, ClassSchema),
      backgrounds: this.validate(backgrounds.default, BackgroundSchema),
      feats: this.validate(feats.default, FeatSchema)
    };

    this.memoryCache.set('char-creation', data);
    return data;
  }

  // Tier 3: Gameplay Content (2-5MB, lazy-loaded in chunks)
  async loadSpells(
    tradition?: MagicTradition,
    level?: number
  ): Promise<Spell[]> {
    const cacheKey = `spells-${tradition ?? 'all'}-${level ?? 'all'}`;

    // 1. Check memory cache
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey);
    }

    // 2. Check IndexedDB cache
    const cached = await this.getFromIndexedDB('spells', cacheKey);
    if (cached) {
      this.memoryCache.set(cacheKey, cached);
      return cached;
    }

    // 3. Load from network/bundle
    const spells = await this.fetchSpells(tradition, level);
    const validated = spells.map(s => SpellSchema.parse(s));

    // 4. Cache in both layers
    this.memoryCache.set(cacheKey, validated);
    await this.storeInIndexedDB('spells', cacheKey, validated);

    return validated;
  }

  private async fetchSpells(
    tradition?: MagicTradition,
    level?: number
  ): Promise<Spell[]> {
    if (tradition && level !== undefined) {
      // Load specific chunk
      const module = await import(
        `../data/spells/${tradition}/level-${level}.json`
      );
      return module.default;
    } else if (tradition) {
      // Load all levels for tradition
      const levels = await Promise.all(
        Array.from({ length: 11 }, (_, i) =>
          import(`../data/spells/${tradition}/level-${i}.json`)
            .catch(() => ({ default: [] }))
        )
      );
      return levels.flatMap(m => m.default);
    } else {
      // Load all spells (avoid if possible!)
      const traditions: MagicTradition[] = [
        'arcane', 'divine', 'occult', 'primal'
      ];
      const all = await Promise.all(
        traditions.map(t => this.fetchSpells(t))
      );
      return all.flat();
    }
  }
}

export const contentLoader = new ContentLoader();
```

### IndexedDB Caching

```typescript
// packages/content/src/loader/ContentCache.ts

class ContentCache {
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('GoldBoxContent', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores for each content type
        ['spells', 'feats', 'items', 'monsters', 'maps'].forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store);
          }
        });
      };
    });
  }

  async get(store: string, key: string): Promise<any> {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async set(store: string, key: string, value: any): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    const stores = ['spells', 'feats', 'items', 'monsters', 'maps'];
    await Promise.all(
      stores.map(store =>
        new Promise<void>((resolve, reject) => {
          const transaction = this.db!.transaction(store, 'readwrite');
          const objectStore = transaction.objectStore(store);
          const request = objectStore.clear();

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        })
      )
    );
  }
}
```

### Loading Performance Targets

| Content | Size | Load Time | Strategy |
|---------|------|-----------|----------|
| Tier 1 (Critical) | 50KB | <100ms | Immediate |
| Tier 2 (Char Creation) | 200KB | <300ms | On-demand |
| Tier 3 Chunk | 20-50KB | <200ms | Lazy + cache |
| Full Content | 2-5MB | N/A | Never load all |

---

## Validation System

### Zod-Based Validation

```typescript
// packages/content/src/validation/ContentValidator.ts

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ValidationError {
  file: string;
  index?: number;
  type: 'validation' | 'file' | 'cross-reference';
  message: string;
}

class ContentValidator {
  private errors: ValidationError[] = [];
  private warnings: ValidationError[] = [];

  async validateAllContent(): Promise<ValidationReport> {
    console.log('🔍 Validating content...\n');

    // Validate each content type
    await this.validateSpells();
    await this.validateFeats();
    await this.validateItems();
    await this.validateAncestries();
    await this.validateClasses();

    // Validate cross-references
    await this.validateCrossReferences();

    return this.generateReport();
  }

  private async validateSpells(): Promise<void> {
    const traditions = ['arcane', 'divine', 'occult', 'primal'];

    for (const tradition of traditions) {
      for (let level = 0; level <= 10; level++) {
        const filePath = path.join(
          __dirname,
          `../../data/spells/${tradition}/level-${level}.json`
        );

        try {
          const content = await fs.readFile(filePath, 'utf-8');
          const spells = JSON.parse(content);

          if (!Array.isArray(spells)) {
            this.errors.push({
              file: filePath,
              type: 'validation',
              message: 'Content must be an array'
            });
            continue;
          }

          spells.forEach((spell: unknown, index: number) => {
            try {
              SpellSchema.parse(spell);
            } catch (error) {
              if (error instanceof z.ZodError) {
                this.errors.push({
                  file: filePath,
                  index,
                  type: 'validation',
                  message: error.errors
                    .map(e => `${e.path.join('.')}: ${e.message}`)
                    .join(', ')
                });
              }
            }
          });

          console.log(`✓ ${tradition} level ${level}: ${spells.length} spells`);
        } catch (error) {
          const err = error as NodeJS.ErrnoException;
          if (err.code !== 'ENOENT') {
            this.errors.push({
              file: filePath,
              type: 'file',
              message: `Failed to load: ${err.message}`
            });
          }
        }
      }
    }
  }

  private async validateCrossReferences(): Promise<void> {
    console.log('\n🔗 Validating cross-references...');

    // Load all content for reference checking
    const conditions = await this.loadAllConditions();
    const conditionIds = new Set(conditions.map(c => c.id));

    const feats = await this.loadAllFeats();
    const featIds = new Set(feats.map(f => f.id));

    // Check spell references to conditions
    const spells = await this.loadAllSpells();
    spells.forEach(spell => {
      // Extract condition references from description
      const mentionedConditions = this.extractConditionReferences(
        spell.description
      );

      mentionedConditions.forEach(condId => {
        if (!conditionIds.has(condId)) {
          this.warnings.push({
            file: `spells/${spell.id}`,
            type: 'cross-reference',
            message: `References unknown condition: ${condId}`
          });
        }
      });
    });

    // Check feat prerequisites
    feats.forEach(feat => {
      feat.prerequisites?.forEach(prereq => {
        const featRef = this.extractFeatReference(prereq);
        if (featRef && !featIds.has(featRef)) {
          this.warnings.push({
            file: `feats/${feat.id}`,
            type: 'cross-reference',
            message: `Prerequisite references unknown feat: ${featRef}`
          });
        }
      });
    });
  }

  private generateReport(): ValidationReport {
    const hasErrors = this.errors.length > 0;
    const hasWarnings = this.warnings.length > 0;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Validation Report');
    console.log('='.repeat(60));

    if (hasErrors) {
      console.log(`\n❌ ${this.errors.length} Error(s):\n`);
      this.errors.forEach(error => {
        console.log(`  ${error.file}${error.index !== undefined ? `:${error.index}` : ''}`);
        console.log(`    ${error.message}\n`);
      });
    }

    if (hasWarnings) {
      console.log(`\n⚠️  ${this.warnings.length} Warning(s):\n`);
      this.warnings.forEach(warning => {
        console.log(`  ${warning.file}`);
        console.log(`    ${warning.message}\n`);
      });
    }

    if (!hasErrors && !hasWarnings) {
      console.log('\n✅ All content validated successfully!');
    }

    console.log('='.repeat(60));

    return {
      success: !hasErrors,
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      errors: this.errors,
      warnings: this.warnings
    };
  }
}

// CLI usage
if (require.main === module) {
  const validator = new ContentValidator();
  validator.validateAllContent().then(report => {
    process.exit(report.success ? 0 : 1);
  });
}
```

### Running Validation

```bash
# Validate all content
pnpm --filter @gold-box/content validate

# Output:
🔍 Validating content...

✓ arcane level 0: 8 spells
✓ arcane level 1: 24 spells
✓ arcane level 2: 31 spells
...
✓ divine level 10: 12 spells

✓ ancestry feats level 1: 45 feats
✓ class feats (fighter): 38 feats
...

🔗 Validating cross-references...
✓ Spell condition references: 0 issues
✓ Feat prerequisites: 0 issues

============================================================
📊 Validation Report
============================================================

✅ All content validated successfully!
============================================================
```

---

## Build Pipeline

### Build Process Flow

```
Source Content (JSON)
        ↓
   Validation (Zod)
        ↓
  Type Generation
        ↓
   Optimization
   - Minification
   - Tree-shaking
   - Code splitting
        ↓
  Index Generation
   - Search indexes
   - ID lookups
   - Metadata
        ↓
   Manifest Creation
        ↓
  Output to dist/
```

### Build Implementation

```typescript
// tools/content-pipeline/src/build.ts

class ContentBuilder {
  async build(): Promise<void> {
    console.log('🏗️  Building content...\n');

    // Step 1: Validate
    const validator = new ContentValidator();
    const report = await validator.validateAllContent();

    if (!report.success) {
      throw new Error(`Validation failed: ${report.errorCount} errors`);
    }

    // Step 2: Generate types
    await this.generateTypes();

    // Step 3: Build bundles
    await this.buildBundles();

    // Step 4: Generate indexes
    await this.generateIndexes();

    // Step 5: Create manifest
    await this.createManifest();

    console.log('\n✅ Content build complete!');
  }

  private async buildBundles(): Promise<void> {
    // Use esbuild for fast bundling
    const esbuild = require('esbuild');

    // Bundle each content category separately for code-splitting
    const categories = [
      'spells/arcane',
      'spells/divine',
      'spells/occult',
      'spells/primal',
      'feats',
      'items',
      'ancestries',
      'classes'
    ];

    for (const category of categories) {
      await esbuild.build({
        entryPoints: [`src/data/${category}/index.json`],
        bundle: true,
        minify: true,
        format: 'esm',
        outfile: `dist/${category}/bundle.js`,
        loader: { '.json': 'json' }
      });
    }
  }

  private async generateIndexes(): Promise<void> {
    // Create search indexes for fast lookups

    // Spell index
    const allSpells = await this.loadAllSpells();
    const spellIndex = {
      byId: Object.fromEntries(allSpells.map(s => [s.id, s])),
      byLevel: this.groupBy(allSpells, 'level'),
      byTradition: this.groupBy(allSpells, 'traditions'),
      byTrait: this.indexByTrait(allSpells)
    };

    await fs.writeFile(
      'dist/indexes/spells.json',
      JSON.stringify(spellIndex, null, 2)
    );

    // Full-text search index
    const searchIndex = this.buildSearchIndex(allSpells);
    await fs.writeFile(
      'dist/indexes/spell-search.json',
      JSON.stringify(searchIndex)
    );
  }

  private buildSearchIndex(items: any[]): any {
    // Use lunr.js for full-text search
    const lunr = require('lunr');

    const idx = lunr(function() {
      this.ref('id');
      this.field('name', { boost: 10 });
      this.field('description');
      this.field('traits');

      items.forEach(item => this.add(item));
    });

    return idx.toJSON();
  }

  private async createManifest(): Promise<void> {
    const manifest = {
      version: process.env.npm_package_version,
      buildDate: new Date().toISOString(),
      contentCounts: {
        spells: await this.countFiles('spells'),
        feats: await this.countFiles('feats'),
        items: await this.countFiles('items'),
        ancestries: await this.countFiles('ancestries'),
        classes: await this.countFiles('classes'),
        monsters: await this.countFiles('monsters')
      },
      fileHashes: await this.generateFileHashes()
    };

    await fs.writeFile(
      'dist/manifest.json',
      JSON.stringify(manifest, null, 2)
    );
  }
}
```

### Build Commands

```json
// packages/content/package.json
{
  "scripts": {
    "validate": "tsx tools/validate.ts",
    "build": "tsx tools/build.ts",
    "build:prod": "NODE_ENV=production tsx tools/build.ts",
    "watch": "tsx tools/build.ts --watch"
  }
}
```

---

## Authoring Workflow

### Adding New Content

#### Interactive CLI Tool

```typescript
// tools/content-tools/src/new-spell.ts

import inquirer from 'inquirer';
import * as fs from 'fs/promises';

async function createNewSpell() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Spell name:',
      validate: input => input.length > 0
    },
    {
      type: 'number',
      name: 'level',
      message: 'Spell level (0-10):',
      validate: input => input >= 0 && input <= 10
    },
    {
      type: 'checkbox',
      name: 'traditions',
      message: 'Traditions:',
      choices: ['arcane', 'divine', 'occult', 'primal']
    },
    {
      type: 'list',
      name: 'actions',
      message: 'Casting time:',
      choices: [
        { name: 'Free Action', value: 0 },
        { name: '1 Action', value: 1 },
        { name: '2 Actions', value: 2 },
        { name: '3 Actions', value: 3 },
        { name: 'Reaction', value: -1 }
      ]
    },
    {
      type: 'checkbox',
      name: 'components',
      message: 'Components:',
      choices: ['somatic', 'verbal', 'material', 'focus']
    },
    {
      type: 'number',
      name: 'range',
      message: 'Range (feet):',
      default: 30
    },
    {
      type: 'list',
      name: 'effectType',
      message: 'Effect type:',
      choices: [
        'damage',
        'healing',
        'condition',
        'buff',
        'debuff',
        'summon',
        'utility'
      ]
    }
  ]);

  const spell = {
    id: answers.name.toLowerCase().replace(/\s+/g, '-'),
    name: answers.name,
    level: answers.level,
    traditions: answers.traditions,
    rarity: 'common',
    actions: answers.actions,
    components: answers.components,
    range: {
      value: answers.range,
      unit: 'feet'
    },
    traits: [],
    effectType: answers.effectType,
    description: '// TODO: Add description'
  };

  // Add to each tradition file
  for (const tradition of answers.traditions) {
    const filePath = path.join(
      __dirname,
      `../../packages/content/src/data/spells/${tradition}/level-${answers.level}.json`
    );

    let spells = [];
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      spells = JSON.parse(content);
    } catch (error) {
      // File doesn't exist yet
    }

    spells.push(spell);
    spells.sort((a, b) => a.name.localeCompare(b.name));

    await fs.writeFile(filePath, JSON.stringify(spells, null, 2));
    console.log(`✓ Added to ${tradition}/level-${answers.level}.json`);
  }

  console.log(`\n✅ Created spell: ${spell.name}`);
  console.log(`→ Edit the files to complete the description and details`);
}

createNewSpell();
```

#### Usage

```bash
# Create new spell
pnpm --filter @gold-box/content new:spell

? Spell name: Lightning Bolt
? Spell level (0-10): 3
? Traditions: ◉ arcane ◉ primal
? Casting time: 2 Actions
? Components: ◉ somatic ◉ verbal
? Range (feet): 120
? Effect type: damage

✓ Added to arcane/level-3.json
✓ Added to primal/level-3.json

✅ Created spell: Lightning Bolt
→ Edit the files to complete the description and details
```

### Content Review Process

#### Git Workflow

```bash
# 1. Create feature branch
git checkout -b content/add-lightning-bolt

# 2. Add content using CLI tool
pnpm --filter @gold-box/content new:spell

# 3. Edit generated files
code packages/content/src/data/spells/arcane/level-3.json

# 4. Validate
pnpm --filter @gold-box/content validate

# 5. Commit
git add packages/content/src/data/spells/
git commit -m "feat(content): add Lightning Bolt spell"

# 6. Push and create PR
git push origin content/add-lightning-bolt
```

#### Automated PR Checks

```yaml
# .github/workflows/content-validation.yml

name: Content Validation

on:
  pull_request:
    paths:
      - 'packages/content/src/data/**'

jobs:
  validate-content:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Validate content
        run: pnpm --filter @gold-box/content validate

      - name: Build content
        run: pnpm --filter @gold-box/content build

      - name: Generate stats
        run: |
          pnpm --filter @gold-box/content stats > /tmp/stats.txt

      - name: Comment PR with stats
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const stats = fs.readFileSync('/tmp/stats.txt', 'utf8');

            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.name,
              body: `## Content Validation Results\n\n\`\`\`\n${stats}\n\`\`\``
            });
```

---

## Search & Indexing

### Search Index Structure

```typescript
// packages/content/src/loader/ContentIndex.ts

import lunr from 'lunr';

class ContentIndex {
  private indexes = new Map<string, lunr.Index>();
  private documents = new Map<string, any[]>();

  async buildIndex(contentType: string, items: any[]): Promise<void> {
    // Build full-text search index
    const idx = lunr(function() {
      this.ref('id');
      this.field('name', { boost: 10 });
      this.field('description');
      this.field('traits');

      items.forEach(item => this.add(item));
    });

    this.indexes.set(contentType, idx);
    this.documents.set(contentType, items);
  }

  search(
    contentType: string,
    query: string,
    filters?: SearchFilters
  ): SearchResult[] {
    const index = this.indexes.get(contentType);
    const docs = this.documents.get(contentType);

    if (!index || !docs) return [];

    // Perform search
    const results = index.search(query);

    // Get full documents
    let matches = results.map(result => {
      const doc = docs.find(d => d.id === result.ref);
      return {
        ...doc,
        score: result.score
      };
    });

    // Apply filters
    if (filters) {
      matches = this.applyFilters(matches, filters);
    }

    return matches;
  }

  private applyFilters(items: any[], filters: SearchFilters): any[] {
    let filtered = items;

    // Level filter
    if (filters.level !== undefined) {
      filtered = filtered.filter(item => item.level === filters.level);
    }

    // Tradition filter
    if (filters.traditions && filters.traditions.length > 0) {
      filtered = filtered.filter(item =>
        item.traditions?.some((t: string) => filters.traditions!.includes(t))
      );
    }

    // Trait filter
    if (filters.traits && filters.traits.length > 0) {
      filtered = filtered.filter(item =>
        item.traits?.some((t: string) => filters.traits!.includes(t))
      );
    }

    return filtered;
  }
}

// Usage
const index = new ContentIndex();
await index.buildIndex('spells', allSpells);

// Search: "fire damage level 3"
const results = index.search('spells', 'fire damage', {
  level: 3,
  traditions: ['arcane', 'primal']
});
```

### Pre-built Indexes

```json
// dist/indexes/spell-index.json
{
  "byId": {
    "fireball": {
      "name": "Fireball",
      "level": 3,
      "traditions": ["arcane", "primal"]
    }
  },
  "byLevel": {
    "0": [...],
    "1": [...],
    "3": [...]
  },
  "byTradition": {
    "arcane": [...],
    "divine": [...]
  }
}
```

---

## Performance Considerations

### Bundle Size Optimization

**Techniques:**
1. **Code Splitting**: Separate bundles per content category
2. **Tree Shaking**: ES modules enable unused content removal
3. **Minification**: JSON minification removes whitespace
4. **Compression**: Gzip/Brotli at CDN level

**Target Sizes:**
```
Tier 1 (Critical):        50KB gzipped
Tier 2 (Char Creation):   200KB gzipped
Tier 3 Chunk:             20-50KB each
Total (all content):      2-5MB (never loaded at once)
```

### Loading Performance

**Strategies:**
1. **Preload Critical**: `<link rel="preload">` for tier 1
2. **Prefetch Next**: Predict and prefetch likely next content
3. **IndexedDB Cache**: Persistent cache for repeat loads
4. **Memory Cache**: In-memory Map for session caching
5. **Lazy Loading**: Dynamic imports for on-demand loading

**Metrics:**
- Initial load: <100ms (tier 1)
- Character creation: <300ms (tier 2)
- Spell list load: <200ms (cached) / <500ms (network)

### Memory Management

```typescript
class ContentMemoryManager {
  private maxCacheSize = 10 * 1024 * 1024;  // 10MB
  private currentCacheSize = 0;
  private lruCache: LRUCache;

  add(key: string, data: any): void {
    const size = this.estimateSize(data);

    // Evict if needed
    while (this.currentCacheSize + size > this.maxCacheSize) {
      const evicted = this.lruCache.evictLRU();
      this.currentCacheSize -= evicted.size;
    }

    this.lruCache.set(key, { data, size });
    this.currentCacheSize += size;
  }

  private estimateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }
}
```

---

## Summary

### Key Decisions

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| **Format** | JSON | Lightweight, tree-shakeable, native support |
| **Validation** | Zod | Runtime + compile-time, type inference |
| **Organization** | By type → category → level | Natural hierarchy, lazy loading |
| **Loading** | 3-tier lazy system | Optimize initial load, on-demand gameplay |
| **Caching** | Memory + IndexedDB | Fast repeat access, offline support |
| **Build** | TypeScript + esbuild | Fast builds, ES modules |
| **Search** | Lunr.js | Client-side full-text search |

### Benefits

✅ **Type Safety**: Zod schemas ensure runtime validation
✅ **Performance**: Lazy loading minimizes initial bundle
✅ **Offline**: IndexedDB enables offline gameplay
✅ **Maintainable**: JSON in git with validation
✅ **Extensible**: Easy to add new content types
✅ **Searchable**: Full-text search for all content
✅ **Scalable**: Supports 2000+ entries efficiently

---

## Next Steps

With content pipeline designed, next areas:

1. **Start Implementation** - Set up initial project structure
2. **Graphics Pipeline** - PixiJS + Three.js rendering details
3. **Gold Box UI** - Specific menu patterns and interfaces
4. **AI System** - Enemy behavior and tactics

See also:
- [Architecture](./ARCHITECTURE.md)
- [Pathfinder 2E Rules](./PATHFINDER_2E_RULES.md)
- [Solid.js Migration Guide](./SOLIDJS_MIGRATION_GUIDE.md)
