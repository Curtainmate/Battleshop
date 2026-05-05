import { stages } from "../data/stages";
import type { GameState, PlayerStats, UpgradeId } from "../types";

export const basePlayerStats: PlayerStats = {
  maxHp: 100,
  damage: 8,
  critChance: 5,
  attackSpeed: 1,
  moveSpeed: 88,
  attackRange: 38,
};

export const baseInventorySlots = 12;
export const baseSaleSlots = 6;

export function createInitialGameState(): GameState {
  return {
    screen: "shop",
    gold: 45,
    unlockedStage: 1,
    selectedStage: stages[0].id,
    inventory: Array(baseInventorySlots).fill(null),
    saleSlots: Array(baseSaleSlots).fill(null),
    equipment: {
      weapon: null,
      helmet: null,
      chest: null,
    },
    upgrades: {
      damage: 0,
      maxHp: 0,
      attackSpeed: 0,
      inventorySize: 0,
      saleSlots: 0,
    },
    battle: null,
    npc: null,
    shopTimer: 1.5,
  };
}

export function getInventoryCapacity(state: GameState): number {
  return baseInventorySlots + state.upgrades.inventorySize * 3;
}

export function getSaleSlotCapacity(state: GameState): number {
  return baseSaleSlots + state.upgrades.saleSlots * 2;
}

export function resizeContainers(state: GameState): GameState {
  return {
    ...state,
    inventory: resizeArray(state.inventory, getInventoryCapacity(state)),
    saleSlots: resizeArray(state.saleSlots, getSaleSlotCapacity(state)),
  };
}

export function getPlayerStats(state: GameState): PlayerStats {
  const stats: PlayerStats = {
    ...basePlayerStats,
    damage: basePlayerStats.damage + state.upgrades.damage * 2,
    maxHp: basePlayerStats.maxHp + state.upgrades.maxHp * 12,
    attackSpeed: basePlayerStats.attackSpeed * (1 + state.upgrades.attackSpeed * 0.08),
  };

  Object.values(state.equipment).forEach((item) => {
    if (!item) return;
    stats.damage += item.stats.damage ?? 0;
    stats.critChance += item.stats.critChance ?? 0;
    stats.attackSpeed += item.stats.attackSpeed ?? 0;
    stats.maxHp += item.stats.maxHp ?? 0;
  });

  return stats;
}

export function upgradeCost(id: UpgradeId, level: number): number {
  const baseCosts: Record<UpgradeId, number> = {
    damage: 35,
    maxHp: 30,
    attackSpeed: 45,
    inventorySize: 70,
    saleSlots: 80,
  };
  return Math.round(baseCosts[id] * Math.pow(1.55, level));
}

function resizeArray<T>(items: Array<T | null>, size: number): Array<T | null> {
  if (items.length === size) return items;
  if (items.length > size) return items.slice(0, size);
  return [...items, ...Array(size - items.length).fill(null)];
}
