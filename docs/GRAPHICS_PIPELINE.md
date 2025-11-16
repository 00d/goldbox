# Graphics Pipeline Design

This document details the complete graphics rendering pipeline for the Gold Box-style CRPG, including PixiJS for 2D rendering, Three.js for 3D dungeon exploration, asset management, visual effects, and performance optimization strategies.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [PixiJS 2D Rendering](#pixijs-2d-rendering)
- [Three.js 3D Rendering](#threejs-3d-rendering)
- [Hybrid Rendering System](#hybrid-rendering-system)
- [Asset Pipeline](#asset-pipeline)
- [Visual Effects](#visual-effects)
- [Performance Optimization](#performance-optimization)
- [Rendering Coordination](#rendering-coordination)

---

## Overview

### Rendering Goals

**Performance Targets:**
- 60 FPS @ 1920x1080 on mid-range hardware (2020+)
- 30 FPS minimum on lower-end devices
- < 100ms initial load time for critical assets
- < 16ms frame time budget

**Visual Quality:**
- Retro-modern aesthetic (pixel art + modern effects)
- Smooth animations (with option to disable)
- High information density without clutter
- Accessibility (high contrast, scalable UI)

### Technology Stack

```typescript
// Rendering libraries
{
  "pixi.js": "^8.5.0",        // 2D WebGL rendering
  "three": "^0.170.0",        // 3D WebGL rendering
  "gsap": "^3.12.0",          // Animation library
  "pixi-filters": "^6.0.0",   // Visual effects
  "pixi-particles": "^5.3.0"  // Particle systems
}
```

### Rendering Modes

The game switches between three rendering modes:

1. **2D Tactical Combat** (PixiJS)
   - Isometric grid-based tactical view
   - Character sprites, spell effects, terrain
   - 60 FPS target

2. **3D First-Person Exploration** (Three.js)
   - Pseudo-3D dungeon crawler
   - Grid-based movement with smooth transitions
   - 60 FPS target

3. **2D UI Overlay** (PixiJS + HTML)
   - Always-on UI elements (party status, menus)
   - Rendered on top of both modes
   - Minimal performance impact

---

## Architecture

### Rendering Layer Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Solid.js UI Layer                    │
│           (HTML/CSS overlays, menus, HUD)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Rendering Coordinator                      │
│  - Mode switching (2D ↔ 3D)                            │
│  - Canvas management                                    │
│  - Event routing                                        │
│  - Frame timing                                         │
└────────────┬────────────────────────┬───────────────────┘
             │                        │
             ▼                        ▼
┌────────────────────────┐  ┌────────────────────────────┐
│   PixiJS 2D Engine     │  │   Three.js 3D Engine       │
│   - Combat grid        │  │   - First-person view      │
│   - UI elements        │  │   - Dungeon geometry       │
│   - Sprites            │  │   - Lighting               │
│   - Effects            │  │   - Raycasting             │
└────────────┬───────────┘  └────────────┬───────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Asset Manager                         │
│  - Texture atlas loading                                │
│  - Sprite caching                                       │
│  - 3D model loading                                     │
│  - Shader management                                    │
└─────────────────────────────────────────────────────────┘
```

### File Structure

```
packages/rendering/
├── src/
│   ├── core/
│   │   ├── RenderingCoordinator.ts    # Main coordinator
│   │   ├── RenderMode.ts              # Mode definitions
│   │   └── FrameTimer.ts              # Frame timing
│   │
│   ├── pixi/
│   │   ├── PixiRenderer.ts            # Main PixiJS setup
│   │   ├── TacticalGrid.ts            # Combat grid rendering
│   │   ├── SpriteManager.ts           # Character/enemy sprites
│   │   ├── EffectsRenderer.ts         # Spell effects, particles
│   │   ├── TerrainRenderer.ts         # Map tiles, obstacles
│   │   └── UIOverlay.ts               # PixiJS UI elements
│   │
│   ├── three/
│   │   ├── ThreeRenderer.ts           # Main Three.js setup
│   │   ├── DungeonGeometry.ts         # Wall/floor generation
│   │   ├── FirstPersonCamera.ts       # Camera controller
│   │   ├── RaycastManager.ts          # Collision detection
│   │   └── DungeonLighting.ts         # Dynamic lighting
│   │
│   ├── assets/
│   │   ├── AssetManager.ts            # Asset loading/caching
│   │   ├── TextureAtlas.ts            # Sprite sheet management
│   │   ├── ModelLoader.ts             # 3D model loading
│   │   └── ShaderLibrary.ts           # Custom shaders
│   │
│   ├── effects/
│   │   ├── ParticleEffects.ts         # Particle systems
│   │   ├── SpellEffects.ts            # Spell animations
│   │   ├── TransitionEffects.ts       # Scene transitions
│   │   └── PostProcessing.ts          # Screen effects
│   │
│   └── utils/
│       ├── CoordinateTransform.ts     # Screen ↔ grid ↔ world
│       ├── CullingManager.ts          # Frustum/viewport culling
│       └── PerformanceMonitor.ts      # FPS tracking
│
└── assets/
    ├── textures/
    │   ├── characters/
    │   ├── enemies/
    │   ├── terrain/
    │   ├── effects/
    │   └── ui/
    │
    ├── models/
    │   ├── dungeon/
    │   └── props/
    │
    └── shaders/
        ├── isometric.vert
        ├── sprite.frag
        └── dungeon.frag
```

---

## PixiJS 2D Rendering

### PixiJS Setup

```typescript
// packages/rendering/src/pixi/PixiRenderer.ts

import * as PIXI from 'pixi.js';
import { EventBus } from '@game/core';

export class PixiRenderer {
  private app: PIXI.Application;
  private stage: PIXI.Container;
  private gridContainer: PIXI.Container;
  private spriteContainer: PIXI.Container;
  private effectsContainer: PIXI.Container;

  constructor(
    private canvas: HTMLCanvasElement,
    private eventBus: EventBus
  ) {}

  async initialize(): Promise<void> {
    // Create PixiJS application with WebGL
    this.app = new PIXI.Application();

    await this.app.init({
      canvas: this.canvas,
      width: 1920,
      height: 1080,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      backgroundColor: 0x0d0d0d,
      antialias: false, // Pixel art - no antialiasing
      powerPreference: 'high-performance',
      // Use WebGL renderer (v8 also supports WebGPU)
      preference: 'webgl'
    });

    // Set up stage hierarchy
    this.stage = this.app.stage;

    // Layered containers for proper z-ordering
    this.gridContainer = new PIXI.Container();
    this.spriteContainer = new PIXI.Container();
    this.effectsContainer = new PIXI.Container();

    this.stage.addChild(this.gridContainer);
    this.stage.addChild(this.spriteContainer);
    this.stage.addChild(this.effectsContainer);

    // Enable interaction
    this.app.stage.eventMode = 'static';
    this.app.stage.hitArea = this.app.screen;

    // Set up render loop
    this.app.ticker.add(this.render.bind(this));

    console.log('[PixiRenderer] Initialized with WebGL renderer');
  }

  private render(ticker: PIXI.Ticker): void {
    // Rendering is handled automatically by PixiJS
    // This is called before each frame

    // Sort sprites by depth for proper isometric layering
    this.spriteContainer.children.sort((a, b) => {
      const aDepth = (a as any).zIndex || 0;
      const bDepth = (b as any).zIndex || 0;
      return aDepth - bDepth;
    });
  }

  resize(width: number, height: number): void {
    this.app.renderer.resize(width, height);
  }

  destroy(): void {
    this.app.destroy(true, { children: true, texture: true });
  }
}
```

### Tactical Combat Grid

**Isometric Grid Rendering:**

```typescript
// packages/rendering/src/pixi/TacticalGrid.ts

import * as PIXI from 'pixi.js';
import { CombatState, GridTile, Position } from '@game/core';

export class TacticalGrid {
  private gridGraphics: PIXI.Graphics;
  private tileSize = 40; // pixels per tile
  private highlightedTiles: Set<string> = new Set();

  constructor(private container: PIXI.Container) {
    this.gridGraphics = new PIXI.Graphics();
    this.container.addChild(this.gridGraphics);
  }

  render(combat: CombatState): void {
    this.gridGraphics.clear();

    const { width, height } = combat.grid;

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tile = combat.grid.getTile(x, y);
        this.drawTile(x, y, tile);
      }
    }
  }

  private drawTile(x: number, y: number, tile: GridTile): void {
    // Convert grid coordinates to isometric screen coordinates
    const iso = this.gridToIso(x, y);

    // Determine tile color based on type and state
    let fillColor = this.getTileColor(tile);
    let fillAlpha = 0.8;

    // Highlight if selected/hovered
    const tileKey = `${x},${y}`;
    if (this.highlightedTiles.has(tileKey)) {
      fillColor = 0x4a9eff;
      fillAlpha = 0.5;
    }

    // Draw isometric diamond
    this.gridGraphics.lineStyle(1, 0x3a3a3a, 1);
    this.gridGraphics.beginFill(fillColor, fillAlpha);

    // Isometric tile is a diamond shape
    const halfTile = this.tileSize / 2;
    const quarterTile = this.tileSize / 4;

    this.gridGraphics.moveTo(iso.x, iso.y);                      // Top
    this.gridGraphics.lineTo(iso.x + halfTile, iso.y + quarterTile);  // Right
    this.gridGraphics.lineTo(iso.x, iso.y + halfTile);           // Bottom
    this.gridGraphics.lineTo(iso.x - halfTile, iso.y + quarterTile);  // Left
    this.gridGraphics.closePath();

    this.gridGraphics.endFill();

    // Draw height indicator for elevated tiles
    if (tile.elevation > 0) {
      this.drawElevation(iso.x, iso.y, tile.elevation);
    }
  }

  private drawElevation(x: number, y: number, elevation: number): void {
    // Draw vertical lines to show elevation
    const elevHeight = elevation * 8; // pixels per elevation level

    this.gridGraphics.lineStyle(1, 0x666666, 0.8);

    // Draw left edge
    this.gridGraphics.moveTo(x - this.tileSize / 2, y + this.tileSize / 4);
    this.gridGraphics.lineTo(x - this.tileSize / 2, y + this.tileSize / 4 - elevHeight);

    // Draw right edge
    this.gridGraphics.moveTo(x + this.tileSize / 2, y + this.tileSize / 4);
    this.gridGraphics.lineTo(x + this.tileSize / 2, y + this.tileSize / 4 - elevHeight);
  }

  /**
   * Convert grid coordinates to isometric screen coordinates
   * Using 2:1 isometric projection
   */
  private gridToIso(gridX: number, gridY: number): Position {
    const halfTile = this.tileSize / 2;
    const quarterTile = this.tileSize / 4;

    return {
      x: (gridX - gridY) * halfTile,
      y: (gridX + gridY) * quarterTile
    };
  }

  /**
   * Convert screen coordinates to grid coordinates
   */
  screenToGrid(screenX: number, screenY: number): Position {
    const halfTile = this.tileSize / 2;
    const quarterTile = this.tileSize / 4;

    const gridX = Math.floor((screenX / halfTile + screenY / quarterTile) / 2);
    const gridY = Math.floor((screenY / quarterTile - screenX / halfTile) / 2);

    return { x: gridX, y: gridY };
  }

  private getTileColor(tile: GridTile): number {
    switch (tile.type) {
      case 'floor': return 0x1a1a1a;
      case 'difficult': return 0x2a2a0a; // Brownish
      case 'impassable': return 0x2a0a0a; // Reddish
      case 'water': return 0x0a1a2a; // Bluish
      default: return 0x1a1a1a;
    }
  }

  highlightTiles(positions: Position[]): void {
    this.highlightedTiles.clear();
    positions.forEach(pos => {
      this.highlightedTiles.add(`${pos.x},${pos.y}`);
    });
  }

  clearHighlights(): void {
    this.highlightedTiles.clear();
  }
}
```

### Sprite Rendering

**Character and Enemy Sprites:**

```typescript
// packages/rendering/src/pixi/SpriteManager.ts

import * as PIXI from 'pixi.js';
import { Character, Enemy, Position } from '@game/core';
import { AssetManager } from '../assets/AssetManager';

interface SpriteData {
  sprite: PIXI.Sprite;
  hpBar: PIXI.Graphics;
  conditionIcons: PIXI.Container;
  shadow: PIXI.Graphics;
}

export class SpriteManager {
  private sprites: Map<string, SpriteData> = new Map();

  constructor(
    private container: PIXI.Container,
    private assets: AssetManager
  ) {}

  async createCharacterSprite(
    char: Character,
    pos: Position
  ): Promise<void> {
    const texture = await this.assets.getTexture(`characters/${char.spriteId}`);
    const sprite = new PIXI.Sprite(texture);

    // Position sprite (isometric)
    const iso = this.gridToIso(pos.x, pos.y);
    sprite.position.set(iso.x, iso.y);
    sprite.anchor.set(0.5, 1); // Bottom-center anchor
    sprite.zIndex = this.calculateZIndex(pos);

    // Add shadow
    const shadow = this.createShadow();
    shadow.position.set(iso.x, iso.y);

    // Add HP bar
    const hpBar = this.createHPBar(char.hp, char.maxHp);
    hpBar.position.set(iso.x - 20, iso.y - 60);

    // Add condition icons
    const conditionIcons = this.createConditionIcons(char.conditions);
    conditionIcons.position.set(iso.x, iso.y - 80);

    // Make interactive
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.on('pointerover', () => this.onSpriteHover(char));
    sprite.on('pointerout', () => this.onSpriteOut());
    sprite.on('click', () => this.onSpriteClick(char));

    // Store sprite data
    this.sprites.set(char.id, {
      sprite,
      hpBar,
      conditionIcons,
      shadow
    });

    // Add to container in correct order
    this.container.addChild(shadow);
    this.container.addChild(sprite);
    this.container.addChild(hpBar);
    this.container.addChild(conditionIcons);
  }

  updateSprite(charId: string, pos: Position): void {
    const spriteData = this.sprites.get(charId);
    if (!spriteData) return;

    const iso = this.gridToIso(pos.x, pos.y);

    // Animate movement with GSAP
    gsap.to(spriteData.sprite.position, {
      x: iso.x,
      y: iso.y,
      duration: 0.3,
      ease: 'power2.out'
    });

    // Update z-index for proper layering
    spriteData.sprite.zIndex = this.calculateZIndex(pos);

    // Update shadow position
    gsap.to(spriteData.shadow.position, {
      x: iso.x,
      y: iso.y,
      duration: 0.3,
      ease: 'power2.out'
    });
  }

  updateHP(charId: string, hp: number, maxHp: number): void {
    const spriteData = this.sprites.get(charId);
    if (!spriteData) return;

    this.redrawHPBar(spriteData.hpBar, hp, maxHp);
  }

  private createHPBar(hp: number, maxHp: number): PIXI.Graphics {
    const hpBar = new PIXI.Graphics();
    this.redrawHPBar(hpBar, hp, maxHp);
    return hpBar;
  }

  private redrawHPBar(hpBar: PIXI.Graphics, hp: number, maxHp: number): void {
    hpBar.clear();

    const width = 40;
    const height = 4;
    const hpPercent = hp / maxHp;

    // Background
    hpBar.lineStyle(1, 0x000000, 1);
    hpBar.beginFill(0x2a2a2a, 0.8);
    hpBar.drawRect(0, 0, width, height);
    hpBar.endFill();

    // HP fill (color based on percentage)
    let fillColor = 0x4aff88; // Healthy
    if (hpPercent < 0.33) fillColor = 0xff4a4a; // Critical
    else if (hpPercent < 0.66) fillColor = 0xffaa4a; // Wounded

    hpBar.beginFill(fillColor, 1);
    hpBar.drawRect(0, 0, width * hpPercent, height);
    hpBar.endFill();
  }

  private createShadow(): PIXI.Graphics {
    const shadow = new PIXI.Graphics();
    shadow.beginFill(0x000000, 0.3);
    shadow.drawEllipse(0, 0, 15, 8);
    shadow.endFill();
    return shadow;
  }

  private createConditionIcons(conditions: Condition[]): PIXI.Container {
    const container = new PIXI.Container();

    conditions.forEach((condition, index) => {
      const icon = this.assets.getTextureSync(`conditions/${condition.type}`);
      const sprite = new PIXI.Sprite(icon);
      sprite.width = 16;
      sprite.height = 16;
      sprite.position.set(index * 18, 0);

      // Add value text if applicable
      if (condition.value && condition.value > 0) {
        const text = new PIXI.Text({
          text: condition.value.toString(),
          style: {
            fontSize: 10,
            fill: 0xffffff,
            stroke: { color: 0x000000, width: 2 }
          }
        });
        text.position.set(sprite.x + 8, sprite.y + 8);
        container.addChild(text);
      }

      container.addChild(sprite);
    });

    return container;
  }

  /**
   * Calculate z-index for proper depth sorting in isometric view
   * Objects further "back" (higher y + x) should render first
   */
  private calculateZIndex(pos: Position): number {
    return (pos.y * 1000) + pos.x;
  }

  private gridToIso(gridX: number, gridY: number): Position {
    const tileSize = 40;
    const halfTile = tileSize / 2;
    const quarterTile = tileSize / 4;

    return {
      x: (gridX - gridY) * halfTile,
      y: (gridX + gridY) * quarterTile
    };
  }

  private onSpriteHover(entity: Character | Enemy): void {
    // Emit hover event for tooltip
    this.eventBus.emit('sprite:hover', entity);
  }

  private onSpriteOut(): void {
    this.eventBus.emit('sprite:out', null);
  }

  private onSpriteClick(entity: Character | Enemy): void {
    this.eventBus.emit('sprite:click', entity);
  }

  removeSprite(id: string): void {
    const spriteData = this.sprites.get(id);
    if (!spriteData) return;

    this.container.removeChild(spriteData.sprite);
    this.container.removeChild(spriteData.hpBar);
    this.container.removeChild(spriteData.conditionIcons);
    this.container.removeChild(spriteData.shadow);

    spriteData.sprite.destroy();
    spriteData.hpBar.destroy();
    spriteData.conditionIcons.destroy();
    spriteData.shadow.destroy();

    this.sprites.delete(id);
  }

  clear(): void {
    this.sprites.forEach((_, id) => this.removeSprite(id));
  }
}
```

### Spell Effects

**Particle-Based Spell Effects:**

```typescript
// packages/rendering/src/pixi/EffectsRenderer.ts

import * as PIXI from 'pixi.js';
import { Emitter, EmitterConfigV3 } from '@pixi/particle-emitter';
import { SpellEffect, Position } from '@game/core';

export class EffectsRenderer {
  private activeEffects: Map<string, Emitter> = new Map();

  constructor(
    private container: PIXI.Container,
    private assets: AssetManager
  ) {}

  playSpellEffect(effect: SpellEffect, position: Position): void {
    switch (effect.type) {
      case 'fireball':
        this.playFireball(position, effect.radius);
        break;
      case 'lightning':
        this.playLightning(effect.start, effect.end);
        break;
      case 'healing':
        this.playHealing(position);
        break;
      case 'buff':
        this.playBuff(position, effect.color);
        break;
      default:
        console.warn(`Unknown spell effect: ${effect.type}`);
    }
  }

  private playFireball(center: Position, radius: number): void {
    const iso = this.gridToIso(center.x, center.y);

    // Create explosion emitter
    const emitterConfig: EmitterConfigV3 = {
      lifetime: {
        min: 0.3,
        max: 0.6
      },
      frequency: 0.001,
      emitterLifetime: 0.3,
      maxParticles: 100,
      addAtBack: false,
      pos: {
        x: iso.x,
        y: iso.y
      },
      behaviors: [
        {
          type: 'alpha',
          config: {
            alpha: {
              list: [
                { time: 0, value: 1 },
                { time: 1, value: 0 }
              ]
            }
          }
        },
        {
          type: 'scale',
          config: {
            scale: {
              list: [
                { time: 0, value: 0.5 },
                { time: 1, value: 2 }
              ]
            }
          }
        },
        {
          type: 'color',
          config: {
            color: {
              list: [
                { time: 0, value: 'ffaa00' },
                { time: 0.5, value: 'ff3300' },
                { time: 1, value: '330000' }
              ]
            }
          }
        },
        {
          type: 'moveSpeed',
          config: {
            speed: {
              list: [
                { time: 0, value: 300 },
                { time: 1, value: 50 }
              ]
            }
          }
        },
        {
          type: 'rotationStatic',
          config: {
            min: 0,
            max: 360
          }
        },
        {
          type: 'spawnShape',
          config: {
            type: 'circle',
            data: {
              x: 0,
              y: 0,
              radius: radius * 20 // Convert grid radius to pixels
            }
          }
        }
      ]
    };

    const particleTexture = this.assets.getTextureSync('effects/particle');
    const emitter = new Emitter(this.container, [particleTexture], emitterConfig);

    // Auto-destroy after effect
    setTimeout(() => {
      emitter.destroy();
    }, 1000);

    emitter.emit = true;
  }

  private playLightning(start: Position, end: Position): void {
    const isoStart = this.gridToIso(start.x, start.y);
    const isoEnd = this.gridToIso(end.x, end.y);

    // Create lightning bolt using Graphics
    const lightning = new PIXI.Graphics();
    this.container.addChild(lightning);

    // Draw jagged lightning path
    this.drawLightningBolt(lightning, isoStart, isoEnd);

    // Flash effect
    gsap.to(lightning, {
      alpha: 0,
      duration: 0.2,
      repeat: 3,
      yoyo: true,
      onComplete: () => {
        this.container.removeChild(lightning);
        lightning.destroy();
      }
    });
  }

  private drawLightningBolt(
    graphics: PIXI.Graphics,
    start: Position,
    end: Position
  ): void {
    graphics.lineStyle(3, 0x4a9eff, 1);

    let currentX = start.x;
    let currentY = start.y;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const segments = 8;

    graphics.moveTo(currentX, currentY);

    for (let i = 1; i < segments; i++) {
      const progress = i / segments;
      const targetX = start.x + dx * progress;
      const targetY = start.y + dy * progress;

      // Add random jitter
      const jitterX = (Math.random() - 0.5) * 20;
      const jitterY = (Math.random() - 0.5) * 20;

      graphics.lineTo(targetX + jitterX, targetY + jitterY);
    }

    graphics.lineTo(end.x, end.y);

    // Add glow
    graphics.lineStyle(8, 0x4a9eff, 0.3);
    graphics.moveTo(start.x, start.y);
    graphics.lineTo(end.x, end.y);
  }

  private playHealing(position: Position): void {
    const iso = this.gridToIso(position.x, position.y);

    // Create floating "+HP" text
    const healText = new PIXI.Text({
      text: '+12',
      style: {
        fontSize: 24,
        fill: 0x4aff88,
        stroke: { color: 0x000000, width: 3 },
        fontWeight: 'bold'
      }
    });

    healText.anchor.set(0.5);
    healText.position.set(iso.x, iso.y - 40);
    this.container.addChild(healText);

    // Animate upward and fade out
    gsap.to(healText.position, {
      y: iso.y - 80,
      duration: 1,
      ease: 'power2.out'
    });

    gsap.to(healText, {
      alpha: 0,
      duration: 1,
      onComplete: () => {
        this.container.removeChild(healText);
        healText.destroy();
      }
    });

    // Add particle sparkles
    this.playSparkles(position, 0x4aff88);
  }

  private playSparkles(position: Position, color: number): void {
    const iso = this.gridToIso(position.x, position.y);

    // Simple sparkle effect with multiple small sprites
    for (let i = 0; i < 10; i++) {
      const sparkle = new PIXI.Graphics();
      sparkle.beginFill(color, 1);
      sparkle.drawStar(0, 0, 4, 4, 4);
      sparkle.endFill();

      sparkle.position.set(iso.x, iso.y - 40);
      this.container.addChild(sparkle);

      const angle = (Math.PI * 2 * i) / 10;
      const distance = 30;

      gsap.to(sparkle.position, {
        x: iso.x + Math.cos(angle) * distance,
        y: iso.y - 40 + Math.sin(angle) * distance,
        duration: 0.5,
        ease: 'power2.out'
      });

      gsap.to(sparkle, {
        alpha: 0,
        duration: 0.5,
        onComplete: () => {
          this.container.removeChild(sparkle);
          sparkle.destroy();
        }
      });
    }
  }

  private gridToIso(gridX: number, gridY: number): Position {
    const tileSize = 40;
    return {
      x: (gridX - gridY) * (tileSize / 2),
      y: (gridX + gridY) * (tileSize / 4)
    };
  }

  update(deltaTime: number): void {
    // Update all active particle emitters
    this.activeEffects.forEach(emitter => {
      emitter.update(deltaTime * 0.001); // Convert to seconds
    });
  }

  clear(): void {
    this.activeEffects.forEach(emitter => emitter.destroy());
    this.activeEffects.clear();
  }
}
```

---

## Three.js 3D Rendering

### Three.js Setup

```typescript
// packages/rendering/src/three/ThreeRenderer.ts

import * as THREE from 'three';
import { EventBus } from '@game/core';
import { DungeonGeometry } from './DungeonGeometry';
import { FirstPersonCamera } from './FirstPersonCamera';
import { DungeonLighting } from './DungeonLighting';

export class ThreeRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private dungeonGeometry: DungeonGeometry;
  private cameraController: FirstPersonCamera;
  private lighting: DungeonLighting;

  constructor(
    private canvas: HTMLCanvasElement,
    private eventBus: EventBus
  ) {}

  initialize(): void {
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0d0d0d);
    this.scene.fog = new THREE.Fog(0x0d0d0d, 1, 20);

    // Create camera (60° FOV for classic dungeon crawler feel)
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      50
    );

    // Create WebGL renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Initialize subsystems
    this.dungeonGeometry = new DungeonGeometry(this.scene);
    this.cameraController = new FirstPersonCamera(this.camera);
    this.lighting = new DungeonLighting(this.scene);

    console.log('[ThreeRenderer] Initialized with WebGL renderer');
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  update(deltaTime: number): void {
    this.cameraController.update(deltaTime);
    this.lighting.update();
  }

  loadDungeon(dungeonData: DungeonData): void {
    this.dungeonGeometry.generate(dungeonData);
    this.lighting.setupForDungeon(dungeonData);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  destroy(): void {
    this.dungeonGeometry.dispose();
    this.renderer.dispose();
  }
}
```

### Dungeon Geometry Generation

**Procedural Dungeon Rendering:**

```typescript
// packages/rendering/src/three/DungeonGeometry.ts

import * as THREE from 'three';
import { DungeonData, DungeonTile } from '@game/core';

export class DungeonGeometry {
  private wallMaterial: THREE.Material;
  private floorMaterial: THREE.Material;
  private ceilingMaterial: THREE.Material;
  private meshes: THREE.Mesh[] = [];

  constructor(private scene: THREE.Scene) {
    this.createMaterials();
  }

  private createMaterials(): void {
    // Stone wall texture
    const wallTexture = new THREE.TextureLoader().load('/assets/textures/wall_stone.png');
    wallTexture.wrapS = THREE.RepeatWrapping;
    wallTexture.wrapT = THREE.RepeatWrapping;
    wallTexture.repeat.set(1, 1);

    this.wallMaterial = new THREE.MeshStandardMaterial({
      map: wallTexture,
      roughness: 0.8,
      metalness: 0.2
    });

    // Stone floor texture
    const floorTexture = new THREE.TextureLoader().load('/assets/textures/floor_stone.png');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(2, 2);

    this.floorMaterial = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.9,
      metalness: 0.1
    });

    // Dark ceiling
    this.ceilingMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 1.0,
      metalness: 0.0
    });
  }

  generate(dungeonData: DungeonData): void {
    // Clear existing geometry
    this.clear();

    const { width, height, tiles } = dungeonData;
    const tileSize = 2; // 2 units per tile
    const wallHeight = 3; // 3 units tall

    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tile = tiles[y][x];

        if (tile.type === 'floor') {
          this.createFloorTile(x, y, tileSize);
          this.createCeilingTile(x, y, tileSize, wallHeight);

          // Check for walls on each side
          if (this.hasWall(tiles, x, y - 1)) {
            this.createWall(x, y, 'north', tileSize, wallHeight);
          }
          if (this.hasWall(tiles, x + 1, y)) {
            this.createWall(x, y, 'east', tileSize, wallHeight);
          }
          if (this.hasWall(tiles, x, y + 1)) {
            this.createWall(x, y, 'south', tileSize, wallHeight);
          }
          if (this.hasWall(tiles, x - 1, y)) {
            this.createWall(x, y, 'west', tileSize, wallHeight);
          }
        }
      }
    }

    console.log(`[DungeonGeometry] Generated ${this.meshes.length} meshes`);
  }

  private createFloorTile(x: number, y: number, size: number): void {
    const geometry = new THREE.PlaneGeometry(size, size);
    const mesh = new THREE.Mesh(geometry, this.floorMaterial);

    mesh.rotation.x = -Math.PI / 2; // Horizontal
    mesh.position.set(x * size, 0, y * size);
    mesh.receiveShadow = true;

    this.scene.add(mesh);
    this.meshes.push(mesh);
  }

  private createCeilingTile(x: number, y: number, size: number, height: number): void {
    const geometry = new THREE.PlaneGeometry(size, size);
    const mesh = new THREE.Mesh(geometry, this.ceilingMaterial);

    mesh.rotation.x = Math.PI / 2; // Horizontal, facing down
    mesh.position.set(x * size, height, y * size);

    this.scene.add(mesh);
    this.meshes.push(mesh);
  }

  private createWall(
    x: number,
    y: number,
    direction: 'north' | 'south' | 'east' | 'west',
    size: number,
    height: number
  ): void {
    const geometry = new THREE.PlaneGeometry(size, height);
    const mesh = new THREE.Mesh(geometry, this.wallMaterial);

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // Position and rotate based on direction
    const halfSize = size / 2;

    switch (direction) {
      case 'north':
        mesh.position.set(x * size, height / 2, y * size - halfSize);
        mesh.rotation.y = 0;
        break;
      case 'south':
        mesh.position.set(x * size, height / 2, y * size + halfSize);
        mesh.rotation.y = Math.PI;
        break;
      case 'east':
        mesh.position.set(x * size + halfSize, height / 2, y * size);
        mesh.rotation.y = -Math.PI / 2;
        break;
      case 'west':
        mesh.position.set(x * size - halfSize, height / 2, y * size);
        mesh.rotation.y = Math.PI / 2;
        break;
    }

    this.scene.add(mesh);
    this.meshes.push(mesh);
  }

  private hasWall(
    tiles: DungeonTile[][],
    x: number,
    y: number
  ): boolean {
    // Out of bounds = wall
    if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[0].length) {
      return true;
    }

    // Solid tile = wall
    return tiles[y][x].type === 'wall';
  }

  clear(): void {
    this.meshes.forEach(mesh => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => mat.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    this.meshes = [];
  }

  dispose(): void {
    this.clear();
    this.wallMaterial.dispose();
    this.floorMaterial.dispose();
    this.ceilingMaterial.dispose();
  }
}
```

### First-Person Camera Controller

```typescript
// packages/rendering/src/three/FirstPersonCamera.ts

import * as THREE from 'three';
import { EventBus } from '@game/core';
import gsap from 'gsap';

export class FirstPersonCamera {
  private targetPosition: THREE.Vector3;
  private targetRotation: number; // Y-axis rotation (facing direction)
  private isAnimating = false;

  constructor(private camera: THREE.PerspectiveCamera) {
    this.targetPosition = new THREE.Vector3();
    this.targetRotation = 0;

    // Start at a reasonable height (eye level)
    this.camera.position.y = 1.6;
  }

  /**
   * Move camera to grid position with smooth animation
   */
  moveTo(gridX: number, gridY: number, facing: Direction): void {
    if (this.isAnimating) return;

    const tileSize = 2;
    this.targetPosition.set(gridX * tileSize, 1.6, gridY * tileSize);
    this.targetRotation = this.directionToRotation(facing);

    this.isAnimating = true;

    // Animate position
    gsap.to(this.camera.position, {
      x: this.targetPosition.x,
      z: this.targetPosition.z,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        this.isAnimating = false;
      }
    });

    // Animate rotation
    gsap.to(this.camera.rotation, {
      y: this.targetRotation,
      duration: 0.2,
      ease: 'power2.inOut'
    });
  }

  /**
   * Rotate camera 90° left or right
   */
  turn(direction: 'left' | 'right'): void {
    if (this.isAnimating) return;

    const rotationChange = direction === 'left' ? Math.PI / 2 : -Math.PI / 2;
    this.targetRotation += rotationChange;

    this.isAnimating = true;

    gsap.to(this.camera.rotation, {
      y: this.targetRotation,
      duration: 0.2,
      ease: 'power2.inOut',
      onComplete: () => {
        this.isAnimating = false;
      }
    });
  }

  /**
   * Apply head bobbing effect during movement
   */
  private applyHeadBob(time: number): void {
    if (!this.isAnimating) return;

    const bobAmount = 0.05;
    const bobSpeed = 10;

    this.camera.position.y = 1.6 + Math.sin(time * bobSpeed) * bobAmount;
  }

  private directionToRotation(direction: Direction): number {
    switch (direction) {
      case 'north': return 0;
      case 'east': return -Math.PI / 2;
      case 'south': return Math.PI;
      case 'west': return Math.PI / 2;
    }
  }

  update(deltaTime: number): void {
    // Optional: smooth camera interpolation
    // this.camera.position.lerp(this.targetPosition, 0.1);
  }

  getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  getFacing(): Direction {
    const rotation = this.camera.rotation.y;
    const normalized = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    if (normalized < Math.PI / 4 || normalized >= 7 * Math.PI / 4) {
      return 'north';
    } else if (normalized < 3 * Math.PI / 4) {
      return 'west';
    } else if (normalized < 5 * Math.PI / 4) {
      return 'south';
    } else {
      return 'east';
    }
  }
}
```

### Dynamic Lighting

```typescript
// packages/rendering/src/three/DungeonLighting.ts

import * as THREE from 'three';
import { DungeonData } from '@game/core';

export class DungeonLighting {
  private ambientLight: THREE.AmbientLight;
  private playerLight: THREE.PointLight;
  private torchLights: THREE.PointLight[] = [];

  constructor(private scene: THREE.Scene) {
    this.setupLights();
  }

  private setupLights(): void {
    // Dim ambient light (dark dungeon)
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(this.ambientLight);

    // Player's torch/light source
    this.playerLight = new THREE.PointLight(0xffa500, 1.5, 10, 2);
    this.playerLight.castShadow = true;
    this.playerLight.shadow.mapSize.width = 512;
    this.playerLight.shadow.mapSize.height = 512;
    this.scene.add(this.playerLight);
  }

  setupForDungeon(dungeonData: DungeonData): void {
    // Clear existing torch lights
    this.torchLights.forEach(light => this.scene.remove(light));
    this.torchLights = [];

    // Add torches at specific locations
    dungeonData.torchPositions?.forEach(pos => {
      const torch = new THREE.PointLight(0xff6600, 1, 8, 2);
      torch.position.set(pos.x * 2, 2, pos.y * 2);
      torch.castShadow = true;

      this.scene.add(torch);
      this.torchLights.push(torch);
    });
  }

  updatePlayerLightPosition(x: number, y: number, z: number): void {
    this.playerLight.position.set(x, y + 1.4, z);
  }

  update(): void {
    // Flicker torches for atmosphere
    this.torchLights.forEach(torch => {
      const flicker = 0.9 + Math.random() * 0.2;
      torch.intensity = flicker;
    });

    // Flicker player light slightly
    this.playerLight.intensity = 1.4 + Math.random() * 0.2;
  }

  dispose(): void {
    this.scene.remove(this.ambientLight);
    this.scene.remove(this.playerLight);
    this.torchLights.forEach(light => this.scene.remove(light));
  }
}
```

---

## Hybrid Rendering System

### Rendering Coordinator

**Manages switching between 2D and 3D modes:**

```typescript
// packages/rendering/src/core/RenderingCoordinator.ts

import { EventBus } from '@game/core';
import { PixiRenderer } from '../pixi/PixiRenderer';
import { ThreeRenderer } from '../three/ThreeRenderer';

export enum RenderMode {
  Combat2D = '2d_combat',
  Exploration3D = '3d_exploration',
  Menu = 'menu'
}

export class RenderingCoordinator {
  private currentMode: RenderMode;
  private pixiRenderer: PixiRenderer;
  private threeRenderer: ThreeRenderer;
  private canvas2D: HTMLCanvasElement;
  private canvas3D: HTMLCanvasElement;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  constructor(
    private container: HTMLElement,
    private eventBus: EventBus
  ) {
    this.createCanvases();
  }

  private createCanvases(): void {
    // Create 2D canvas for PixiJS
    this.canvas2D = document.createElement('canvas');
    this.canvas2D.id = 'pixi-canvas';
    this.canvas2D.style.position = 'absolute';
    this.canvas2D.style.top = '0';
    this.canvas2D.style.left = '0';
    this.canvas2D.style.display = 'none';
    this.container.appendChild(this.canvas2D);

    // Create 3D canvas for Three.js
    this.canvas3D = document.createElement('canvas');
    this.canvas3D.id = 'three-canvas';
    this.canvas3D.style.position = 'absolute';
    this.canvas3D.style.top = '0';
    this.canvas3D.style.left = '0';
    this.canvas3D.style.display = 'none';
    this.container.appendChild(this.canvas3D);
  }

  async initialize(): Promise<void> {
    // Initialize PixiJS renderer
    this.pixiRenderer = new PixiRenderer(this.canvas2D, this.eventBus);
    await this.pixiRenderer.initialize();

    // Initialize Three.js renderer
    this.threeRenderer = new ThreeRenderer(this.canvas3D, this.eventBus);
    this.threeRenderer.initialize();

    // Listen for mode switch events
    this.eventBus.on('combat:start', () => this.switchMode(RenderMode.Combat2D));
    this.eventBus.on('combat:end', () => this.switchMode(RenderMode.Exploration3D));

    // Start with exploration mode
    this.switchMode(RenderMode.Exploration3D);

    // Start render loop
    this.startRenderLoop();

    console.log('[RenderingCoordinator] Initialized');
  }

  switchMode(mode: RenderMode): void {
    if (this.currentMode === mode) return;

    console.log(`[RenderingCoordinator] Switching to ${mode}`);

    // Hide all canvases
    this.canvas2D.style.display = 'none';
    this.canvas3D.style.display = 'none';

    // Show appropriate canvas
    switch (mode) {
      case RenderMode.Combat2D:
        this.canvas2D.style.display = 'block';
        this.eventBus.emit('render:mode:2d');
        break;

      case RenderMode.Exploration3D:
        this.canvas3D.style.display = 'block';
        this.eventBus.emit('render:mode:3d');
        break;

      case RenderMode.Menu:
        // Menu is pure HTML/CSS, no canvas needed
        this.eventBus.emit('render:mode:menu');
        break;
    }

    this.currentMode = mode;
  }

  private startRenderLoop(): void {
    const render = (timestamp: number) => {
      const deltaTime = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      // Render based on current mode
      switch (this.currentMode) {
        case RenderMode.Combat2D:
          // PixiJS renders automatically via ticker
          break;

        case RenderMode.Exploration3D:
          this.threeRenderer.update(deltaTime);
          this.threeRenderer.render();
          break;
      }

      this.animationFrameId = requestAnimationFrame(render);
    };

    this.animationFrameId = requestAnimationFrame(render);
  }

  resize(width: number, height: number): void {
    this.pixiRenderer.resize(width, height);
    this.threeRenderer.resize(width, height);
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.pixiRenderer.destroy();
    this.threeRenderer.destroy();

    this.container.removeChild(this.canvas2D);
    this.container.removeChild(this.canvas3D);
  }
}
```

---

## Asset Pipeline

### Asset Manager

**Centralized asset loading and caching:**

```typescript
// packages/rendering/src/assets/AssetManager.ts

import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface AssetManifest {
  textures: string[];
  spritesheets: string[];
  models: string[];
}

export class AssetManager {
  private textures: Map<string, PIXI.Texture> = new Map();
  private models: Map<string, THREE.Group> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  constructor() {}

  /**
   * Load critical assets needed for game start
   */
  async loadCriticalAssets(): Promise<void> {
    const manifest: AssetManifest = await fetch('/assets/manifest.json')
      .then(res => res.json());

    const promises: Promise<void>[] = [];

    // Load critical textures
    manifest.textures
      .filter(path => path.includes('/critical/'))
      .forEach(path => {
        promises.push(this.loadTexture(path));
      });

    await Promise.all(promises);

    console.log(`[AssetManager] Loaded ${this.textures.size} critical assets`);
  }

  /**
   * Load texture and cache it
   */
  async loadTexture(path: string): Promise<PIXI.Texture> {
    // Check cache
    if (this.textures.has(path)) {
      return this.textures.get(path)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(path)) {
      return this.loadingPromises.get(path)!;
    }

    // Load texture
    const promise = PIXI.Assets.load(`/assets/textures/${path}.png`)
      .then((texture: PIXI.Texture) => {
        this.textures.set(path, texture);
        this.loadingPromises.delete(path);
        return texture;
      });

    this.loadingPromises.set(path, promise);
    return promise;
  }

  /**
   * Get texture synchronously (must be preloaded)
   */
  getTextureSync(path: string): PIXI.Texture {
    const texture = this.textures.get(path);
    if (!texture) {
      console.warn(`[AssetManager] Texture not loaded: ${path}`);
      return PIXI.Texture.WHITE; // Fallback
    }
    return texture;
  }

  /**
   * Get texture (async, loads if needed)
   */
  async getTexture(path: string): Promise<PIXI.Texture> {
    if (this.textures.has(path)) {
      return this.textures.get(path)!;
    }
    return this.loadTexture(path);
  }

  /**
   * Load 3D model
   */
  async loadModel(path: string): Promise<THREE.Group> {
    if (this.models.has(path)) {
      return this.models.get(path)!.clone();
    }

    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(`/assets/models/${path}.glb`);

    this.models.set(path, gltf.scene);
    return gltf.scene.clone();
  }

  /**
   * Preload asset pack (character creation, specific dungeon, etc.)
   */
  async loadAssetPack(packName: string): Promise<void> {
    const manifest: AssetManifest = await fetch(`/assets/packs/${packName}.json`)
      .then(res => res.json());

    const promises: Promise<void>[] = [];

    manifest.textures.forEach(path => {
      promises.push(this.loadTexture(path));
    });

    manifest.models?.forEach(path => {
      promises.push(this.loadModel(path).then(() => {}));
    });

    await Promise.all(promises);

    console.log(`[AssetManager] Loaded asset pack: ${packName}`);
  }

  /**
   * Get memory usage stats
   */
  getStats(): { textures: number; models: number } {
    return {
      textures: this.textures.size,
      models: this.models.size
    };
  }

  /**
   * Clear unused assets (call when switching scenes)
   */
  clearUnused(): void {
    // TODO: Implement reference counting and cleanup
    console.log('[AssetManager] Clearing unused assets');
  }
}
```

### Texture Atlas Management

```typescript
// packages/rendering/src/assets/TextureAtlas.ts

import * as PIXI from 'pixi.js';

/**
 * Manages sprite sheets and texture atlases
 */
export class TextureAtlas {
  private atlases: Map<string, PIXI.Spritesheet> = new Map();

  async loadAtlas(name: string): Promise<void> {
    if (this.atlases.has(name)) return;

    const spritesheet = await PIXI.Assets.load(`/assets/atlases/${name}.json`);
    this.atlases.set(name, spritesheet);

    console.log(`[TextureAtlas] Loaded ${name} with ${Object.keys(spritesheet.textures).length} textures`);
  }

  getTexture(atlasName: string, textureName: string): PIXI.Texture | null {
    const atlas = this.atlases.get(atlasName);
    if (!atlas) {
      console.warn(`[TextureAtlas] Atlas not loaded: ${atlasName}`);
      return null;
    }

    const texture = atlas.textures[textureName];
    if (!texture) {
      console.warn(`[TextureAtlas] Texture not found in ${atlasName}: ${textureName}`);
      return null;
    }

    return texture;
  }

  getAnimation(atlasName: string, animName: string): PIXI.Texture[] {
    const atlas = this.atlases.get(atlasName);
    if (!atlas) return [];

    return atlas.animations[animName] || [];
  }
}
```

---

## Visual Effects

### Post-Processing Effects

```typescript
// packages/rendering/src/effects/PostProcessing.ts

import * as PIXI from 'pixi.js';
import { CRTFilter, OldFilmFilter } from 'pixi-filters';

export class PostProcessing {
  private filters: PIXI.Filter[] = [];
  private crtFilter: CRTFilter;
  private enabled = true;

  constructor(private stage: PIXI.Container) {
    this.setupFilters();
  }

  private setupFilters(): void {
    // Optional CRT effect
    this.crtFilter = new CRTFilter({
      curvature: 1.0,
      lineWidth: 1.0,
      lineContrast: 0.15,
      verticalLine: false,
      noise: 0.1,
      noiseSize: 1.0,
      seed: Math.random(),
      vignetting: 0.2,
      vignettingAlpha: 0.5,
      vignettingBlur: 0.3,
      time: 0
    });

    // Disabled by default (user can enable in settings)
    // this.filters.push(this.crtFilter);
  }

  enableCRTEffect(enable: boolean): void {
    if (enable && !this.filters.includes(this.crtFilter)) {
      this.filters.push(this.crtFilter);
    } else if (!enable) {
      this.filters = this.filters.filter(f => f !== this.crtFilter);
    }

    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.enabled && this.filters.length > 0) {
      this.stage.filters = this.filters;
    } else {
      this.stage.filters = null;
    }
  }

  update(deltaTime: number): void {
    if (this.filters.includes(this.crtFilter)) {
      this.crtFilter.time += deltaTime * 0.001;
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.applyFilters();
  }
}
```

---

## Performance Optimization

### Culling Manager

```typescript
// packages/rendering/src/utils/CullingManager.ts

import * as PIXI from 'pixi.js';
import { Position } from '@game/core';

/**
 * Manages viewport culling to skip rendering off-screen objects
 */
export class CullingManager {
  constructor(
    private viewport: { x: number; y: number; width: number; height: number }
  ) {}

  updateViewport(x: number, y: number, width: number, height: number): void {
    this.viewport = { x, y, width, height };
  }

  isVisible(sprite: PIXI.Sprite): boolean {
    const bounds = sprite.getBounds();

    return !(
      bounds.x + bounds.width < this.viewport.x ||
      bounds.x > this.viewport.x + this.viewport.width ||
      bounds.y + bounds.height < this.viewport.y ||
      bounds.y > this.viewport.y + this.viewport.height
    );
  }

  cullSprites(sprites: PIXI.Sprite[]): void {
    sprites.forEach(sprite => {
      sprite.visible = this.isVisible(sprite);
    });
  }
}
```

### Performance Monitor

```typescript
// packages/rendering/src/utils/PerformanceMonitor.ts

export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxSamples = 60;
  private lastTime = performance.now();

  update(): void {
    const now = performance.now();
    const frameTime = now - this.lastTime;
    this.lastTime = now;

    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 60;

    const avgFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return Math.round(1000 / avgFrameTime);
  }

  getFrameTime(): number {
    return this.frameTimes[this.frameTimes.length - 1] || 16.67;
  }

  isPerformanceGood(): boolean {
    return this.getAverageFPS() >= 55; // Allow some margin below 60
  }

  getStats(): { fps: number; frameTime: number; good: boolean } {
    return {
      fps: this.getAverageFPS(),
      frameTime: this.getFrameTime(),
      good: this.isPerformanceGood()
    };
  }
}
```

### Optimization Strategies

**Key Performance Techniques:**

1. **Object Pooling** - Reuse sprites and objects instead of creating/destroying
2. **Texture Atlasing** - Combine multiple textures into single atlas to reduce draw calls
3. **Batching** - PixiJS automatically batches, but keep sprites with same texture together
4. **Culling** - Don't render off-screen objects
5. **LOD (Level of Detail)** - Reduce detail for distant objects in 3D
6. **Lazy Loading** - Load assets only when needed
7. **Canvas Sizing** - Use lower resolution on low-end devices

```typescript
// Example: Object pooling for particles
class ParticlePool {
  private pool: PIXI.Sprite[] = [];
  private active: PIXI.Sprite[] = [];

  acquire(): PIXI.Sprite {
    let sprite = this.pool.pop();
    if (!sprite) {
      sprite = new PIXI.Sprite();
    }
    this.active.push(sprite);
    return sprite;
  }

  release(sprite: PIXI.Sprite): void {
    const index = this.active.indexOf(sprite);
    if (index >= 0) {
      this.active.splice(index, 1);
      sprite.visible = false;
      this.pool.push(sprite);
    }
  }

  releaseAll(): void {
    this.active.forEach(sprite => {
      sprite.visible = false;
      this.pool.push(sprite);
    });
    this.active = [];
  }
}
```

---

## Rendering Coordination

### Solid.js Integration

**Connecting Solid.js UI to renderers:**

```typescript
// apps/game/src/components/GameCanvas.tsx

import { onMount, onCleanup } from 'solid-js';
import { RenderingCoordinator } from '@game/rendering';
import { useGameState } from '../state/GameState';

export function GameCanvas() {
  let containerRef: HTMLDivElement;
  let coordinator: RenderingCoordinator;

  const gameState = useGameState();

  onMount(async () => {
    // Initialize rendering system
    coordinator = new RenderingCoordinator(
      containerRef,
      gameState.eventBus
    );

    await coordinator.initialize();

    // Handle window resize
    const handleResize = () => {
      coordinator.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    onCleanup(() => {
      window.removeEventListener('resize', handleResize);
      coordinator.destroy();
    });
  });

  return (
    <div
      ref={containerRef!}
      class="game-canvas-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    />
  );
}
```

---

## Summary

### Graphics Pipeline Architecture

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **2D Combat** | PixiJS v8 + WebGL | Isometric tactical grid, sprites, effects |
| **3D Exploration** | Three.js + WebGL | First-person dungeon crawler |
| **Coordination** | Custom TypeScript | Mode switching, canvas management |
| **Assets** | Texture atlases, GLB models | Efficient loading and caching |
| **Effects** | GSAP + Particle emitters | Spell effects, animations |
| **Optimization** | Culling, pooling, batching | 60 FPS @ 1920x1080 |

### Performance Targets

✅ **60 FPS** on mid-range hardware (2020+)
✅ **< 100ms** initial asset load
✅ **< 16ms** frame time budget
✅ **Automatic batching** via PixiJS v8
✅ **Texture atlasing** to minimize draw calls
✅ **Viewport culling** for off-screen objects

### Key Technical Decisions

1. **PixiJS v8** for 2D (30x performance improvement over React)
2. **Three.js** for 3D (mature, well-documented, performant)
3. **Separate canvases** for 2D/3D (clean separation, easy mode switching)
4. **Isometric 2:1 projection** for tactical combat (classic Gold Box style)
5. **Grid-based movement** in 3D (traditional dungeon crawler feel)
6. **Dynamic lighting** with shadows (atmospheric dungeons)
7. **GSAP** for smooth animations (performant, flexible)
8. **Asset manifest** with lazy loading (fast startup, efficient memory)

### Next Steps

With graphics pipeline complete, remaining design areas:

1. ✅ Overall Architecture
2. ✅ Pathfinder 2E Rules Engine
3. ✅ Content Pipeline
4. ✅ Gold Box UI/UX
5. ✅ Graphics Pipeline
6. **AI System** - Enemy behavior and tactics
7. **Implementation** - Start building the actual project

---

## See Also

- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [Pathfinder 2E Rules](./PATHFINDER_2E_RULES.md) - Game rules implementation
- [Content Pipeline](./CONTENT_PIPELINE.md) - Content management
- [Gold Box UI Design](./GOLD_BOX_UI_DESIGN.md) - UI/UX patterns
- [Solid.js Migration Guide](./SOLIDJS_MIGRATION_GUIDE.md) - React to Solid.js
