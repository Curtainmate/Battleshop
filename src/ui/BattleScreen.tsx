import { rarityConfig } from "../data/items";
import { stages } from "../data/stages";
import type { GameState, GroundLoot, PlayerStats } from "../types";

type Props = {
  game: GameState;
  stats: PlayerStats;
  onCollectLoot: (lootId: string) => void;
  onLeave: () => void;
  onNextStage: () => void;
  onReturn: () => void;
};

export function BattleScreen({ game, stats, onCollectLoot, onLeave, onNextStage, onReturn }: Props) {
  const battle = game.battle;
  if (!battle) return null;

  const stage = stages.find((entry) => entry.id === battle.stageId) ?? stages[0];
  const playerHpPercent = Math.max(0, (battle.player.hp / stats.maxHp) * 100);
  const totalWaves = stage.waves.length + (stage.boss ? 1 : 0);
  const collectedText = `${filled(game.inventory)} / ${game.inventory.length}`;

  return (
    <main className="game-screen field-world">
      <aside className="pixel-hud">
        <span>HP {Math.ceil(Math.max(0, battle.player.hp))}/{Math.round(stats.maxHp)}</span>
        <div className="hud-hp"><i style={{ width: `${playerHpPercent}%` }} /></div>
        <b>Gold {game.gold}</b>
      </aside>

      <button className="leave-button" onClick={onLeave}>Leave</button>

      <section className="pixel-map field-map" aria-label="Top-down grass battle field">
        <div className="field-details" />
        <div className="tree tree-c" />
        <div className="tree tree-d" />
        <div className="bush bush-a" />
        <div className="bush bush-b" />
        <div className="stone stone-a" />
        <div className="stone stone-b" />
        <div className="stone stone-c" />

        <div
          className="hero-sprite battle-hero"
          style={{ left: battle.player.pos.x, top: battle.player.pos.y }}
          title="Player"
        >
          <span />
        </div>

        {battle.enemies.map((enemy) => (
          <div
            key={enemy.id}
            className={`monster-sprite ${enemy.isBoss ? "boss" : ""}`}
            style={{ left: enemy.pos.x, top: enemy.pos.y }}
            title={enemy.name}
          >
            <div className="mini-hp">
              <span style={{ width: `${Math.max(0, (enemy.hp / enemy.maxHp) * 100)}%` }} />
            </div>
          </div>
        ))}

        {battle.groundLoot.map((loot) => (
          <button
            key={loot.id}
            className={`loot ${loot.kind === "item" ? loot.item?.rarity : "gold"}`}
            style={{ left: loot.pos.x, top: loot.pos.y }}
            onClick={() => onCollectLoot(loot.id)}
            title={lootTitle(loot)}
          >
            {loot.kind === "gold" ? "$" : "*"}
          </button>
        ))}

        {battle.result !== "running" && (
          <div className="battle-result pixel-panel">
            <h2>{battle.result === "victory" ? "Stage Clear" : "Defeated"}</h2>
            <p>{battle.result === "victory" ? "Collect loot before returning." : "Recover at the shop."}</p>
            <div className="actions">
              {battle.result === "victory" && game.selectedStage < game.unlockedStage && (
                <button className="primary" onClick={onNextStage}>Next Stage</button>
              )}
              <button className="secondary" onClick={onReturn}>Return Shop</button>
            </div>
          </div>
        )}
      </section>

      <footer className="quest-bar">
        Quest: Clear {stage.name}. Wave {Math.min(battle.waveIndex + 1, totalWaves)}/{totalWaves}. Loot {collectedText}.
      </footer>

      <aside className="loot-tip">Loot: click drops</aside>
      <aside className="rarity-strip">
        {Object.entries(rarityConfig).map(([rarity, config]) => (
          <span key={rarity}><i style={{ background: config.color }} />{config.label}</span>
        ))}
      </aside>
    </main>
  );
}

function filled(slots: Array<unknown | null>): number {
  return slots.filter(Boolean).length;
}

function lootTitle(loot: GroundLoot): string {
  if (loot.kind === "gold") return `${loot.amount ?? 0} gold`;
  if (!loot.item) return "Item";
  return `${loot.item.rarity} ${loot.item.name} (${loot.item.value}g)`;
}
