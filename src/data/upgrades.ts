import type { UpgradeId } from "../types";

export type UpgradeDefinition = {
  id: UpgradeId;
  name: string;
  baseCost: number;
  maxLevel: number;
  description: string;
};

export const upgrades: UpgradeDefinition[] = [
  { id: "damage", name: "Sharpen Blades", baseCost: 35, maxLevel: 8, description: "+2 damage" },
  { id: "maxHp", name: "Sturdy Training", baseCost: 30, maxLevel: 8, description: "+12 max HP" },
  { id: "attackSpeed", name: "Quick Hands", baseCost: 45, maxLevel: 5, description: "+8% attack speed" },
  { id: "inventorySize", name: "Bigger Pack", baseCost: 70, maxLevel: 2, description: "+3 inventory slots" },
  { id: "saleSlots", name: "Wider Counter", baseCost: 80, maxLevel: 2, description: "+2 sale slots" },
];
