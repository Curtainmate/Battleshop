import { upgrades as upgradeDefinitions } from "../data/upgrades";
import { getPlayerStats, resizeContainers, upgradeCost } from "../state/gameState";
import type { EquipmentSlot, GameState, Item } from "../types";

export function updateShop(state: GameState, delta: number): GameState {
  if (state.screen !== "shop") return state;

  if (!state.npc) {
    const shopTimer = state.shopTimer - delta;
    if (shopTimer > 0) return { ...state, shopTimer };
    return {
      ...state,
      npc: { state: "entering", progress: 0 },
      shopTimer: 4 + Math.random() * 2,
    };
  }

  const npc = { ...state.npc, progress: state.npc.progress + delta };

  if (npc.state === "entering" && npc.progress >= 1) {
    return { ...state, npc: { state: "buying", progress: 0 } };
  }

  if (npc.state === "buying" && npc.progress >= 0.8) {
    const purchase = choosePurchase(state.saleSlots);
    if (!purchase) return { ...state, npc: { state: "leaving", progress: 0 } };

    const saleSlots = [...state.saleSlots];
    saleSlots[purchase.index] = null;
    return {
      ...state,
      gold: state.gold + purchase.item.value,
      saleSlots,
      npc: { state: "leaving", progress: 0, itemBought: purchase.item },
    };
  }

  if (npc.state === "leaving" && npc.progress >= 1.2) {
    return { ...state, npc: null };
  }

  return { ...state, npc };
}

export function equipInventoryItem(state: GameState, inventoryIndex: number): GameState {
  const item = state.inventory[inventoryIndex];
  if (!item) return state;

  const inventory = [...state.inventory];
  const equipment = { ...state.equipment };
  inventory[inventoryIndex] = equipment[item.slot];
  equipment[item.slot] = item;

  return { ...state, inventory, equipment };
}

export function moveInventoryToSale(state: GameState, inventoryIndex: number): GameState {
  const item = state.inventory[inventoryIndex];
  if (!item) return state;

  const saleIndex = state.saleSlots.findIndex((slot) => slot === null);
  if (saleIndex === -1) return state;

  const inventory = [...state.inventory];
  const saleSlots = [...state.saleSlots];
  inventory[inventoryIndex] = null;
  saleSlots[saleIndex] = item;

  return { ...state, inventory, saleSlots };
}

export function moveSaleToInventory(state: GameState, saleIndex: number): GameState {
  const item = state.saleSlots[saleIndex];
  if (!item) return state;

  const inventoryIndex = state.inventory.findIndex((slot) => slot === null);
  if (inventoryIndex === -1) return state;

  const inventory = [...state.inventory];
  const saleSlots = [...state.saleSlots];
  saleSlots[saleIndex] = null;
  inventory[inventoryIndex] = item;

  return { ...state, inventory, saleSlots };
}

export function unequipItem(state: GameState, slot: EquipmentSlot): GameState {
  const item = state.equipment[slot];
  if (!item) return state;

  const inventoryIndex = state.inventory.findIndex((entry) => entry === null);
  if (inventoryIndex === -1) return state;

  const inventory = [...state.inventory];
  inventory[inventoryIndex] = item;
  return {
    ...state,
    inventory,
    equipment: { ...state.equipment, [slot]: null },
  };
}

export function buyUpgrade(state: GameState, upgradeId: keyof GameState["upgrades"]): GameState {
  const definition = upgradeDefinitions.find((upgrade) => upgrade.id === upgradeId);
  if (!definition) return state;

  const level = state.upgrades[upgradeId];
  const cost = upgradeCost(upgradeId, level);
  if (level >= definition.maxLevel || state.gold < cost) return state;

  return resizeContainers({
    ...state,
    gold: state.gold - cost,
    upgrades: {
      ...state.upgrades,
      [upgradeId]: level + 1,
    },
  });
}

export function itemScore(item: Item): number {
  const stats = getPlayerStats({
    screen: "shop",
    gold: 0,
    unlockedStage: 1,
    selectedStage: 1,
    inventory: [],
    saleSlots: [],
    equipment: { weapon: item.slot === "weapon" ? item : null, helmet: item.slot === "helmet" ? item : null, chest: item.slot === "chest" ? item : null },
    upgrades: { damage: 0, maxHp: 0, attackSpeed: 0, inventorySize: 0, saleSlots: 0 },
    battle: null,
    npc: null,
    shopTimer: 0,
  });
  return Math.round(stats.damage + stats.maxHp / 10 + stats.attackSpeed * 8 + stats.critChance / 4);
}

function choosePurchase(saleSlots: Array<Item | null>): { item: Item; index: number } | null {
  const candidates = saleSlots
    .map((item, index) => (item ? { item, index } : null))
    .filter((entry): entry is { item: Item; index: number } => Boolean(entry));

  if (candidates.length === 0) return null;

  const shuffled = [...candidates].sort(() => Math.random() - 0.5);
  return shuffled.find(({ item }) => Math.random() < buyChance(item.value)) ?? null;
}

function buyChance(value: number): number {
  return Math.max(0.18, Math.min(0.88, 1 - value / 145));
}
