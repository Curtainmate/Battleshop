import { useEffect, useRef, useState } from "react";
import { stages } from "../data/stages";
import { createInitialGameState, getPlayerStats } from "../state/gameState";
import { collectLoot, leaveBattle, startBattle, updateBattle } from "../systems/battleSystem";
import { buyUpgrade, equipInventoryItem, moveInventoryToSale, moveSaleToInventory, unequipItem, updateShop } from "../systems/shopSystem";
import type { GameState } from "../types";
import { BattleScreen } from "./BattleScreen";
import { ShopScreen } from "./ShopScreen";

export function App() {
  const [game, setGame] = useState<GameState>(() => createInitialGameState());
  const lastFrame = useRef<number | null>(null);

  useEffect(() => {
    let frame = 0;
    const tick = (time: number) => {
      const previous = lastFrame.current ?? time;
      lastFrame.current = time;
      const delta = Math.min(0.05, (time - previous) / 1000);
      setGame((current) => (current.screen === "battle" ? updateBattle(current, delta) : updateShop(current, delta)));
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const stats = getPlayerStats(game);

  if (game.screen === "battle" && game.battle) {
    return (
      <BattleScreen
        game={game}
        stats={stats}
        onCollectLoot={(lootId) => setGame((current) => collectLoot(current, lootId))}
        onLeave={() => setGame((current) => leaveBattle(current))}
        onNextStage={() =>
          setGame((current) => {
            const nextStage = Math.min(current.selectedStage + 1, current.unlockedStage);
            return startBattle(leaveBattle(current), nextStage);
          })
        }
        onReturn={() => setGame((current) => leaveBattle(current))}
      />
    );
  }

  return (
    <ShopScreen
      game={game}
      stats={stats}
      stages={stages}
      onSelectStage={(stageId) => setGame((current) => ({ ...current, selectedStage: stageId }))}
      onStartBattle={() => setGame((current) => startBattle(current, current.selectedStage))}
      onEquip={(index) => setGame((current) => equipInventoryItem(current, index))}
      onSell={(index) => setGame((current) => moveInventoryToSale(current, index))}
      onReturnSale={(index) => setGame((current) => moveSaleToInventory(current, index))}
      onUnequip={(slot) => setGame((current) => unequipItem(current, slot))}
      onUpgrade={(upgradeId) => setGame((current) => buyUpgrade(current, upgradeId))}
    />
  );
}
