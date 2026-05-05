import type { EquipmentSlot, Item, ItemStats, Rarity } from "../types";

export const rarityConfig: Record<Rarity, { label: string; multiplier: number; color: string }> = {
  common: { label: "Common", multiplier: 1, color: "#cfd5d0" },
  uncommon: { label: "Uncommon", multiplier: 1.45, color: "#58d46c" },
  rare: { label: "Rare", multiplier: 2.15, color: "#4aa3ff" },
};

export const itemBases: Record<EquipmentSlot, { names: string[]; baseValue: number }> = {
  weapon: { names: ["Iron Sword", "Hunter Axe", "Ashen Dagger"], baseValue: 18 },
  helmet: { names: ["Tin Helm", "Scout Hood", "Guard Cap"], baseValue: 14 },
  chest: { names: ["Leather Vest", "Chain Shirt", "Travel Coat"], baseValue: 16 },
};

export function rollItem(seed: number): Item {
  const rarity = rollRarity();
  const slots: EquipmentSlot[] = ["weapon", "helmet", "chest"];
  const slot = slots[randomInt(0, slots.length - 1)];
  const base = itemBases[slot];
  const stats = rollStats(slot, rarity);
  const statTotal = Object.values(stats).reduce((sum, value) => sum + (value ?? 0), 0);
  const value = Math.round((base.baseValue + statTotal * 6) * rarityConfig[rarity].multiplier);

  return {
    id: `item-${seed}-${Math.random().toString(36).slice(2, 8)}`,
    name: base.names[randomInt(0, base.names.length - 1)],
    slot,
    rarity,
    stats,
    value,
  };
}

function rollRarity(): Rarity {
  const roll = Math.random();
  if (roll > 0.9) return "rare";
  if (roll > 0.62) return "uncommon";
  return "common";
}

function rollStats(slot: EquipmentSlot, rarity: Rarity): ItemStats {
  const multiplier = rarityConfig[rarity].multiplier;
  if (slot === "weapon") {
    return {
      damage: randomInt(2, 5) * multiplier,
      critChance: Number((randomInt(2, 7) * multiplier).toFixed(1)),
      attackSpeed: Number((randomInt(2, 6) * 0.03 * multiplier).toFixed(2)),
    };
  }

  return {
    maxHp: Math.round(randomInt(8, 18) * multiplier),
    damage: Math.round(randomInt(0, 2) * multiplier),
  };
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
