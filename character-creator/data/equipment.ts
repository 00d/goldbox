import { Weapon, Armor, Shield, Item } from '@/types/character';

export const weapons: Weapon[] = [
  { name: 'Dagger', damage: '1d4', critical: '19-20/x2', range: 10, type: 'Piercing or Slashing' },
  { name: 'Shortsword', damage: '1d6', critical: '19-20/x2', type: 'Piercing' },
  { name: 'Longsword', damage: '1d8', critical: '19-20/x2', type: 'Slashing' },
  { name: 'Greatsword', damage: '2d6', critical: '19-20/x2', type: 'Slashing' },
  { name: 'Rapier', damage: '1d6', critical: '18-20/x2', type: 'Piercing' },
  { name: 'Scimitar', damage: '1d6', critical: '18-20/x2', type: 'Slashing' },
  { name: 'Handaxe', damage: '1d6', critical: 'x3', type: 'Slashing' },
  { name: 'Battleaxe', damage: '1d8', critical: 'x3', type: 'Slashing' },
  { name: 'Greataxe', damage: '1d12', critical: 'x3', type: 'Slashing' },
  { name: 'Warhammer', damage: '1d8', critical: 'x3', type: 'Bludgeoning' },
  { name: 'Club', damage: '1d6', critical: 'x2', range: 10, type: 'Bludgeoning' },
  { name: 'Quarterstaff', damage: '1d6/1d6', critical: 'x2', type: 'Bludgeoning' },
  { name: 'Spear', damage: '1d8', critical: 'x3', range: 20, type: 'Piercing' },
  { name: 'Longspear', damage: '1d8', critical: 'x3', type: 'Piercing' },
  { name: 'Shortbow', damage: '1d6', critical: 'x3', range: 60, type: 'Piercing' },
  { name: 'Longbow', damage: '1d8', critical: 'x3', range: 100, type: 'Piercing' },
  { name: 'Light Crossbow', damage: '1d8', critical: '19-20/x2', range: 80, type: 'Piercing' },
  { name: 'Heavy Crossbow', damage: '1d10', critical: '19-20/x2', range: 120, type: 'Piercing' },
];

export const armors: Armor[] = [
  { name: 'Padded', type: 'light', acBonus: 1, maxDex: 8, checkPenalty: 0, arcaneFailure: 5 },
  { name: 'Leather', type: 'light', acBonus: 2, maxDex: 6, checkPenalty: 0, arcaneFailure: 10 },
  { name: 'Studded Leather', type: 'light', acBonus: 3, maxDex: 5, checkPenalty: -1, arcaneFailure: 15 },
  { name: 'Chain Shirt', type: 'light', acBonus: 4, maxDex: 4, checkPenalty: -2, arcaneFailure: 20 },
  { name: 'Hide', type: 'medium', acBonus: 3, maxDex: 4, checkPenalty: -3, arcaneFailure: 20 },
  { name: 'Scale Mail', type: 'medium', acBonus: 4, maxDex: 3, checkPenalty: -4, arcaneFailure: 25 },
  { name: 'Chainmail', type: 'medium', acBonus: 5, maxDex: 2, checkPenalty: -5, arcaneFailure: 30 },
  { name: 'Breastplate', type: 'medium', acBonus: 5, maxDex: 3, checkPenalty: -4, arcaneFailure: 25 },
  { name: 'Splint Mail', type: 'heavy', acBonus: 6, maxDex: 0, checkPenalty: -7, arcaneFailure: 40 },
  { name: 'Banded Mail', type: 'heavy', acBonus: 6, maxDex: 1, checkPenalty: -6, arcaneFailure: 35 },
  { name: 'Half-Plate', type: 'heavy', acBonus: 7, maxDex: 0, checkPenalty: -7, arcaneFailure: 40 },
  { name: 'Full Plate', type: 'heavy', acBonus: 8, maxDex: 1, checkPenalty: -6, arcaneFailure: 35 },
];

export const shields: Shield[] = [
  { name: 'Buckler', acBonus: 1, checkPenalty: -1, arcaneFailure: 5 },
  { name: 'Light Shield', acBonus: 1, checkPenalty: -1, arcaneFailure: 5 },
  { name: 'Heavy Shield', acBonus: 2, checkPenalty: -2, arcaneFailure: 15 },
  { name: 'Tower Shield', acBonus: 4, checkPenalty: -10, arcaneFailure: 50 },
];

export const commonGear: Item[] = [
  { name: 'Backpack', quantity: 1, weight: 2 },
  { name: 'Bedroll', quantity: 1, weight: 5 },
  { name: 'Waterskin', quantity: 1, weight: 4 },
  { name: 'Rations (1 day)', quantity: 1, weight: 1 },
  { name: 'Rope (50 ft.)', quantity: 1, weight: 10 },
  { name: 'Torches', quantity: 10, weight: 1 },
  { name: 'Flint and Steel', quantity: 1, weight: 0 },
  { name: 'Belt Pouch', quantity: 1, weight: 0.5 },
  { name: 'Chalk', quantity: 1, weight: 0 },
  { name: 'Grappling Hook', quantity: 1, weight: 4 },
  { name: 'Lantern (bullseye)', quantity: 1, weight: 3 },
  { name: 'Oil (1 pint)', quantity: 1, weight: 1 },
  { name: 'Crowbar', quantity: 1, weight: 5 },
  { name: 'Hammer', quantity: 1, weight: 2 },
  { name: 'Pitons (10)', quantity: 1, weight: 5 },
];