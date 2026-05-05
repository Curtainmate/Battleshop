import { rollItem } from "../data/items";
import { monsters } from "../data/monsters";
import { stages } from "../data/stages";
import { getPlayerStats } from "../state/gameState";
import type { BattleState, Enemy, GameState, GroundLoot, Vec2 } from "../types";

const fieldSize = { width: 760, height: 460 };
const center = { x: fieldSize.width / 2, y: fieldSize.height / 2 };

export function startBattle(state: GameState, stageId: number): GameState {
  const battle: BattleState = {
    stageId,
    waveIndex: 0,
    enemies: spawnWave(stageId, 0),
    groundLoot: [],
    player: {
      hp: getPlayerStats(state).maxHp,
      pos: { ...center },
      attackCooldown: 0,
    },
    result: "running",
  };

  return {
    ...state,
    selectedStage: stageId,
    screen: "battle",
    battle,
  };
}

export function updateBattle(state: GameState, delta: number): GameState {
  const battle = state.battle;
  if (!battle || battle.result !== "running") return state;

  const stats = getPlayerStats(state);
  let player = { ...battle.player, attackCooldown: Math.max(0, battle.player.attackCooldown - delta) };
  let enemies = battle.enemies.map((enemy) => ({
    ...enemy,
    pos: { ...enemy.pos },
    attackCooldown: Math.max(0, enemy.attackCooldown - delta),
  }));
  let groundLoot = battle.groundLoot;

  const nearest = findNearest(player.pos, enemies);
  if (nearest) {
    const distanceToEnemy = distance(player.pos, nearest.pos);
    if (distanceToEnemy > stats.attackRange) {
      player.pos = moveToward(player.pos, nearest.pos, stats.moveSpeed * delta);
      player.pos = clampToField(player.pos);
    } else if (player.attackCooldown <= 0) {
      const enemyIndex = enemies.findIndex((enemy) => enemy.id === nearest.id);
      const crit = Math.random() * 100 < stats.critChance;
      enemies[enemyIndex] = {
        ...enemies[enemyIndex],
        hp: enemies[enemyIndex].hp - stats.damage * (crit ? 1.8 : 1),
      };
      player.attackCooldown = 1 / stats.attackSpeed;
    }
  }

  enemies = enemies.map((enemy) => (enemy.hp > 0 ? updateEnemy(enemy, player, delta) : enemy));
  enemies.forEach((enemy) => {
    if (enemy.hp > 0 && distance(enemy.pos, player.pos) <= enemy.attackRange && enemy.attackCooldown <= 0) {
      player.hp -= enemy.damage;
      enemy.attackCooldown = 1 / enemy.attackSpeed;
    }
  });

  const defeated = enemies.filter((enemy) => enemy.hp <= 0);
  if (defeated.length > 0) {
    groundLoot = [...groundLoot, ...defeated.flatMap(createDrops)];
  }

  enemies = enemies.filter((enemy) => enemy.hp > 0);

  let nextBattle: BattleState = {
    ...battle,
    player,
    enemies,
    groundLoot,
  };

  if (player.hp <= 0) {
    nextBattle = { ...nextBattle, result: "defeat" };
  } else if (enemies.length === 0) {
    nextBattle = advanceWave(nextBattle);
  }

  return {
    ...state,
    battle: nextBattle,
    unlockedStage:
      nextBattle.result === "victory"
        ? Math.min(Math.max(state.unlockedStage, battle.stageId + 1), stages.length)
        : state.unlockedStage,
  };
}

export function collectLoot(state: GameState, lootId: string): GameState {
  const battle = state.battle;
  if (!battle) return state;

  const loot = battle.groundLoot.find((entry) => entry.id === lootId);
  if (!loot) return state;

  if (loot.kind === "gold") {
    return removeLoot({ ...state, gold: state.gold + (loot.amount ?? 0) }, lootId);
  }

  const emptyIndex = state.inventory.findIndex((slot) => slot === null);
  if (emptyIndex === -1 || !loot.item) return state;

  const inventory = [...state.inventory];
  inventory[emptyIndex] = loot.item;
  return removeLoot({ ...state, inventory }, lootId);
}

export function leaveBattle(state: GameState): GameState {
  return {
    ...state,
    screen: "shop",
    battle: null,
  };
}

function spawnWave(stageId: number, waveIndex: number): Enemy[] {
  const stage = stages.find((entry) => entry.id === stageId) ?? stages[0];
  const regularWave = stage.waves[waveIndex];
  const groups = regularWave?.monsters ?? (stage.boss ? [stage.boss] : []);
  const isBossWave = !regularWave;

  return groups.flatMap((group, groupIndex) =>
    Array.from({ length: group.count }).map((_, index) => {
      const monster = monsters[group.monsterId];
      const angle = ((index + groupIndex * 2) / group.count) * Math.PI * 2 + Math.random() * 0.5;
      const radius = 180 + Math.random() * 90;
      return {
        id: `enemy-${stageId}-${waveIndex}-${group.monsterId}-${index}-${Math.random().toString(36).slice(2, 6)}`,
        monsterId: monster.id,
        name: monster.name,
        hp: monster.hp * (isBossWave ? 1.15 : 1),
        maxHp: monster.hp * (isBossWave ? 1.15 : 1),
        damage: monster.damage,
        attackSpeed: monster.attackSpeed,
        moveSpeed: monster.moveSpeed,
        attackRange: monster.attackRange,
        pos: clampToField({
          x: center.x + Math.cos(angle) * radius,
          y: center.y + Math.sin(angle) * radius,
        }),
        attackCooldown: Math.random() * 0.7,
        isBoss: isBossWave || group.monsterId.includes("Boss"),
      };
    }),
  );
}

function advanceWave(battle: BattleState): BattleState {
  const stage = stages.find((entry) => entry.id === battle.stageId) ?? stages[0];
  const nextWaveIndex = battle.waveIndex + 1;
  const hasRegularWave = nextWaveIndex < stage.waves.length;
  const shouldSpawnBoss = nextWaveIndex === stage.waves.length && Boolean(stage.boss);

  if (!hasRegularWave && !shouldSpawnBoss) {
    return { ...battle, result: "victory" };
  }

  return {
    ...battle,
    waveIndex: nextWaveIndex,
    enemies: spawnWave(battle.stageId, nextWaveIndex),
  };
}

function updateEnemy(enemy: Enemy, player: { pos: Vec2 }, delta: number): Enemy {
  if (distance(enemy.pos, player.pos) <= enemy.attackRange) return enemy;
  return {
    ...enemy,
    pos: moveToward(enemy.pos, player.pos, enemy.moveSpeed * delta),
  };
}

function createDrops(enemy: Enemy): GroundLoot[] {
  const monster = monsters[enemy.monsterId];
  const gold = randomInt(monster.goldDrop[0], monster.goldDrop[1]);
  const drops: GroundLoot[] = [
    {
      id: `gold-${enemy.id}`,
      kind: "gold",
      amount: gold,
      pos: jitter(enemy.pos, 18),
    },
  ];

  if (Math.random() < monster.itemDropChance) {
    drops.push({
      id: `loot-${enemy.id}`,
      kind: "item",
      item: rollItem(Date.now()),
      pos: jitter(enemy.pos, 28),
    });
  }

  return drops;
}

function removeLoot(state: GameState, lootId: string): GameState {
  if (!state.battle) return state;
  return {
    ...state,
    battle: {
      ...state.battle,
      groundLoot: state.battle.groundLoot.filter((loot) => loot.id !== lootId),
    },
  };
}

function findNearest(pos: Vec2, enemies: Enemy[]): Enemy | null {
  return enemies.reduce<Enemy | null>((nearest, enemy) => {
    if (!nearest) return enemy;
    return distance(pos, enemy.pos) < distance(pos, nearest.pos) ? enemy : nearest;
  }, null);
}

function moveToward(from: Vec2, to: Vec2, amount: number): Vec2 {
  const totalDistance = distance(from, to);
  if (totalDistance === 0 || totalDistance <= amount) return { ...to };
  return {
    x: from.x + ((to.x - from.x) / totalDistance) * amount,
    y: from.y + ((to.y - from.y) / totalDistance) * amount,
  };
}

function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function clampToField(pos: Vec2): Vec2 {
  return {
    x: Math.max(24, Math.min(fieldSize.width - 24, pos.x)),
    y: Math.max(24, Math.min(fieldSize.height - 24, pos.y)),
  };
}

function jitter(pos: Vec2, amount: number): Vec2 {
  return clampToField({
    x: pos.x + randomInt(-amount, amount),
    y: pos.y + randomInt(-amount, amount),
  });
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
