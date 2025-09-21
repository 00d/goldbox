'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

interface Entity {
  id: string;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  speed: number;
  type: 'player' | 'enemy' | 'ally';
  color: string;
  movementRemaining?: number;
}

interface CombatLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'action' | 'damage' | 'movement' | 'status';
}

const GRID_SIZE = 20;
const TILE_SIZE = 40;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function BattleMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [entities, setEntities] = useState<Entity[]>([
    {
      id: '1',
      name: 'Fighter',
      x: 2,
      y: 2,
      hp: 30,
      maxHp: 30,
      ac: 18,
      initiative: 15,
      speed: 30,
      type: 'player',
      color: '#4ade80',
      movementRemaining: 30
    },
    {
      id: '2',
      name: 'Wizard',
      x: 3,
      y: 2,
      hp: 20,
      maxHp: 20,
      ac: 12,
      initiative: 12,
      speed: 30,
      type: 'player',
      color: '#60a5fa',
      movementRemaining: 30
    },
    {
      id: '3',
      name: 'Goblin',
      x: 10,
      y: 8,
      hp: 7,
      maxHp: 7,
      ac: 15,
      initiative: 10,
      speed: 30,
      type: 'enemy',
      color: '#ef4444',
      movementRemaining: 30
    },
    {
      id: '4',
      name: 'Orc',
      x: 11,
      y: 9,
      hp: 15,
      maxHp: 15,
      ac: 13,
      initiative: 8,
      speed: 30,
      type: 'enemy',
      color: '#dc2626',
      movementRemaining: 30
    }
  ]);

  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string>('1');
  const [round, setRound] = useState(1);
  const [combatLog, setCombatLog] = useState<CombatLog[]>([]);
  const [hoveredTile, setHoveredTile] = useState<{x: number, y: number} | null>(null);

  const addLogEntry = (message: string, type: CombatLog['type'] = 'action') => {
    setCombatLog(prev => [{
      id: Date.now().toString(),
      timestamp: new Date(),
      message,
      type
    }, ...prev].slice(0, 50));
  };

  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 1;

    for (let x = 0; x <= CANVAS_WIDTH; x += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= CANVAS_HEIGHT; y += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  }, []);

  const drawEntities = useCallback((ctx: CanvasRenderingContext2D) => {
    entities.forEach(entity => {
      const x = entity.x * TILE_SIZE + TILE_SIZE / 2;
      const y = entity.y * TILE_SIZE + TILE_SIZE / 2;

      // Draw entity circle
      ctx.fillStyle = entity.color;
      ctx.beginPath();
      ctx.arc(x, y, TILE_SIZE * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Draw selection indicator
      if (selectedEntity === entity.id) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw current turn indicator
      if (currentTurn === entity.id) {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, TILE_SIZE * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw entity initial
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(entity.name[0], x, y);
    });
  }, [entities, selectedEntity, currentTurn]);

  const drawHoveredTile = useCallback((ctx: CanvasRenderingContext2D) => {
    if (hoveredTile) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(
        hoveredTile.x * TILE_SIZE,
        hoveredTile.y * TILE_SIZE,
        TILE_SIZE,
        TILE_SIZE
      );
    }
  }, [hoveredTile]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    drawGrid(ctx);
    drawHoveredTile(ctx);
    drawEntities(ctx);
  }, [drawGrid, drawEntities, drawHoveredTile]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    const clickedEntity = entities.find(entity =>
      entity.x === x && entity.y === y
    );

    if (clickedEntity) {
      setSelectedEntity(clickedEntity.id);
      addLogEntry(`Selected ${clickedEntity.name}`, 'status');
    } else if (selectedEntity) {
      const entity = entities.find(e => e.id === selectedEntity);
      if (entity && entity.id === currentTurn) {
        const distance = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        const movementCost = distance * 5;

        if (entity.movementRemaining && entity.movementRemaining >= movementCost) {
          setEntities(prev => prev.map(e =>
            e.id === selectedEntity
              ? { ...e, x, y, movementRemaining: e.movementRemaining! - movementCost }
              : e
          ));
          addLogEntry(`${entity.name} moved ${distance} squares (${movementCost} ft)`, 'movement');
        } else {
          addLogEntry(`${entity.name} doesn't have enough movement remaining`, 'status');
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);

    setHoveredTile({ x, y });
  };

  const nextTurn = () => {
    const sortedEntities = [...entities].sort((a, b) => b.initiative - a.initiative);
    const currentIndex = sortedEntities.findIndex(e => e.id === currentTurn);
    const nextIndex = (currentIndex + 1) % sortedEntities.length;

    if (nextIndex === 0) {
      setRound(round + 1);
      addLogEntry(`--- Round ${round + 1} ---`, 'status');

      setEntities(prev => prev.map(e => ({
        ...e,
        movementRemaining: e.speed
      })));
    }

    setCurrentTurn(sortedEntities[nextIndex].id);
    addLogEntry(`${sortedEntities[nextIndex].name}'s turn`, 'status');
  };

  const currentEntity = entities.find(e => e.id === currentTurn);
  const selected = entities.find(e => e.id === selectedEntity);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-[var(--card-bg)] border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
              >
                ← Back
              </Link>
              <h1 className="text-2xl font-bold">Battle Map Simulator</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Round {round}</span>
              <button
                onClick={nextTurn}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded-lg transition-colors"
              >
                Next Turn
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Combat Info */}
          <div className="w-80 bg-[var(--card-bg)] border-r border-[var(--border)] p-4 overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Initiative Order</h2>
            <div className="space-y-2 mb-6">
              {[...entities].sort((a, b) => b.initiative - a.initiative).map(entity => (
                <div
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    currentTurn === entity.id
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--border)] hover:border-gray-500'
                  } ${selectedEntity === entity.id ? 'ring-2 ring-[var(--primary)]/50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: entity.color }}></div>
                      <span className="font-medium">{entity.name}</span>
                    </div>
                    <span className="text-sm text-gray-400">Init: {entity.initiative}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span>HP: {entity.hp}/{entity.maxHp}</span>
                      <span>AC: {entity.ac}</span>
                    </div>
                    {entity.id === currentTurn && (
                      <div className="mt-1 text-[var(--primary)]">
                        Movement: {entity.movementRemaining}/{entity.speed} ft
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selected && (
              <div className="border-t border-[var(--border)] pt-4">
                <h3 className="font-bold mb-2">Selected: {selected.name}</h3>
                <div className="text-sm space-y-1">
                  <p>Position: ({selected.x}, {selected.y})</p>
                  <p>Hit Points: {selected.hp}/{selected.maxHp}</p>
                  <p>Armor Class: {selected.ac}</p>
                  <p>Speed: {selected.speed} ft</p>
                  {selected.id === currentTurn && (
                    <p className="text-[var(--primary)]">
                      Movement Remaining: {selected.movementRemaining} ft
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoveredTile(null)}
              className="border border-[var(--border)] cursor-crosshair"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>

        {/* Bottom Panel - Combat Log */}
        <div className="h-48 bg-[var(--card-bg)] border-t border-[var(--border)] p-4 overflow-y-auto">
          <h2 className="text-lg font-bold mb-2">Combat Log</h2>
          <div className="space-y-1 text-sm">
            {combatLog.length === 0 ? (
              <p className="text-gray-400">Combat log will appear here...</p>
            ) : (
              combatLog.map(log => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-gray-500">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={
                    log.type === 'damage' ? 'text-red-400' :
                    log.type === 'movement' ? 'text-blue-400' :
                    log.type === 'status' ? 'text-yellow-400' :
                    'text-gray-300'
                  }>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}