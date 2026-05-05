import { rarityConfig } from "../../data/items";
import type { Item } from "../../types";

export function ItemCard({ item }: { item: Item }) {
  return (
    <div className="item-card">
      <div className="item-pixel" style={{ background: rarityConfig[item.rarity].color }} />
      <strong>{item.name}</strong>
      <small>{rarityConfig[item.rarity].label} {item.slot}</small>
      <small>{formatStats(item)}</small>
      <b>{item.value}g</b>
    </div>
  );
}

function formatStats(item: Item): string {
  return Object.entries(item.stats)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${labelStat(key)} +${value}`)
    .join(", ");
}

function labelStat(key: string): string {
  const labels: Record<string, string> = {
    damage: "Dmg",
    critChance: "Crit",
    attackSpeed: "Spd",
    maxHp: "HP",
  };
  return labels[key] ?? key;
}
