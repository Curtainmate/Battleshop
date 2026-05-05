import { rarityConfig } from "../data/items";
import type { StageDefinition } from "../data/stages";
import { upgrades } from "../data/upgrades";
import { upgradeCost } from "../state/gameState";
import type { EquipmentSlot, GameState, Item, PlayerStats, UpgradeId } from "../types";
import { ItemCard } from "./components/ItemCard";

type Props = {
  game: GameState;
  stats: PlayerStats;
  stages: StageDefinition[];
  onSelectStage: (stageId: number) => void;
  onStartBattle: () => void;
  onEquip: (index: number) => void;
  onSell: (index: number) => void;
  onReturnSale: (index: number) => void;
  onUnequip: (slot: EquipmentSlot) => void;
  onUpgrade: (upgradeId: UpgradeId) => void;
};

export function ShopScreen({
  game,
  stats,
  stages,
  onSelectStage,
  onStartBattle,
  onEquip,
  onSell,
  onReturnSale,
  onUnequip,
  onUpgrade,
}: Props) {
  return (
    <main className="game-screen shop-world">
      <Hud hp={`${Math.round(stats.maxHp)}/${Math.round(stats.maxHp)}`} gold={game.gold} />

      <section className="pixel-map shop-map" aria-label="Top-down tavern shop">
        <div className="outside-grass" />
        <div className="tavern">
          <div className="wall top" />
          <div className="wall right" />
          <div className="wall bottom" />
          <div className="wall left" />
          <div className="shop-sign">SHOP</div>
          <div className="counter-table" />
          <div className="crate crate-a" />
          <div className="crate crate-b" />
          <div className="rug" />
          <div className={`shopkeeper ${game.npc?.state ?? "waiting"}`} />
          <div className="hero-sprite shop-hero"><span /></div>
        </div>
        <div className="tree tree-a" />
        <div className="tree tree-b" />
        <div className="path-exit" />
      </section>

      <section className="pixel-panel shop-board">
        <div className="panel-title">
          <h1>Battleshop</h1>
          <span>{npcText(game)}</span>
        </div>

        <div className="stage-row">
          {stages.map((stage) => (
            <button
              key={stage.id}
              className={stage.id === game.selectedStage ? "selected" : ""}
              disabled={stage.id > game.unlockedStage}
              onClick={() => onSelectStage(stage.id)}
            >
              Stage {stage.id}
            </button>
          ))}
          <button className="primary" onClick={onStartBattle}>Start Battle</button>
        </div>

        <div className="shop-columns">
          <div>
            <div className="section-title">
              <h2>Counter</h2>
              <span>{filled(game.saleSlots)} / {game.saleSlots.length}</span>
            </div>
            <div className="slots sale-slots">
              {game.saleSlots.map((item, index) => (
                <Slot key={index} item={item} emptyLabel="Sale" onClick={() => onReturnSale(index)} />
              ))}
            </div>

            <div className="section-title spaced">
              <h2>Inventory</h2>
              <span>{filled(game.inventory)} / {game.inventory.length}</span>
            </div>
            <div className="slots inventory-slots">
              {game.inventory.map((item, index) => (
                <div key={index} className="inventory-entry">
                  <Slot item={item} emptyLabel="" />
                  {item && (
                    <div className="slot-actions">
                      <button onClick={() => onEquip(index)}>Equip</button>
                      <button onClick={() => onSell(index)}>Sell</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="section-title">
              <h2>Gear</h2>
              <span>Power {Math.round(stats.damage + stats.maxHp / 10)}</span>
            </div>
            <div className="stats-box">
              <Stat label="HP" value={Math.round(stats.maxHp)} />
              <Stat label="DMG" value={Math.round(stats.damage)} />
              <Stat label="SPD" value={stats.attackSpeed.toFixed(2)} />
              <Stat label="CRT" value={`${stats.critChance.toFixed(1)}%`} />
            </div>
            <div className="equipment-grid">
              {(["weapon", "helmet", "chest"] as EquipmentSlot[]).map((slot) => (
                <div key={slot} className="equipment-slot">
                  <span>{slot}</span>
                  <Slot item={game.equipment[slot]} emptyLabel="Empty" onClick={() => onUnequip(slot)} />
                </div>
              ))}
            </div>

            <div className="section-title spaced">
              <h2>Upgrades</h2>
              <span>Gold {game.gold}</span>
            </div>
            <div className="upgrade-list">
              {upgrades.map((upgrade) => {
                const level = game.upgrades[upgrade.id];
                const cost = upgradeCost(upgrade.id, level);
                const maxed = level >= upgrade.maxLevel;
                return (
                  <button
                    key={upgrade.id}
                    className="upgrade-row"
                    disabled={maxed || game.gold < cost}
                    onClick={() => onUpgrade(upgrade.id)}
                  >
                    <span>
                      <strong>{upgrade.name}</strong>
                      <small>{upgrade.description} | Lv {level}/{upgrade.maxLevel}</small>
                    </span>
                    <b>{maxed ? "Max" : `${cost}g`}</b>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <footer className="quest-bar">
        Shop: place loot on the counter, wait for buyers, upgrade, then enter the field.
      </footer>
    </main>
  );
}

function Hud({ hp, gold }: { hp: string; gold: number }) {
  return (
    <aside className="pixel-hud">
      <span>HP {hp}</span>
      <div className="hud-hp"><i style={{ width: "100%" }} /></div>
      <b>Gold {gold}</b>
    </aside>
  );
}

function Slot({ item, emptyLabel, onClick }: { item: Item | null; emptyLabel: string; onClick?: () => void }) {
  if (!item) {
    return <div className="slot empty">{emptyLabel}</div>;
  }

  return (
    <button className="slot item-slot" onClick={onClick} style={{ borderColor: rarityConfig[item.rarity].color }}>
      <ItemCard item={item} />
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function filled(slots: Array<Item | null>): number {
  return slots.filter(Boolean).length;
}

function npcText(game: GameState): string {
  if (!game.npc) return "Waiting for a buyer.";
  if (game.npc.state === "entering") return "A buyer enters.";
  if (game.npc.state === "buying") return "Buyer checks the counter.";
  if (game.npc.itemBought) return `Sold ${game.npc.itemBought.name} for ${game.npc.itemBought.value}g.`;
  return "Buyer leaves empty-handed.";
}
