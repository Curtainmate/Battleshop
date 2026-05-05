export type GameScreen = "shop" | "battle";

export type Rarity = "common" | "uncommon" | "rare";
export type EquipmentSlot = "weapon" | "helmet" | "chest";
export type UpgradeId = "damage" | "maxHp" | "attackSpeed" | "inventorySize" | "saleSlots";

export type Vec2 = {
  x: number;
  y: number;
};

export type ItemStats = {
  damage?: number;
  critChance?: number;
  attackSpeed?: number;
  maxHp?: number;
};

export type Item = {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: Rarity;
  stats: ItemStats;
  value: number;
};

export type PlayerStats = {
  maxHp: number;
  damage: number;
  critChance: number;
  attackSpeed: number;
  moveSpeed: number;
  attackRange: number;
};

export type PlayerBattle = {
  hp: number;
  pos: Vec2;
  attackCooldown: number;
};

export type Enemy = {
  id: string;
  monsterId: string;
  name: string;
  hp: number;
  maxHp: number;
  damage: number;
  attackSpeed: number;
  moveSpeed: number;
  attackRange: number;
  pos: Vec2;
  attackCooldown: number;
  isBoss: boolean;
};

export type GroundLoot = {
  id: string;
  kind: "gold" | "item";
  amount?: number;
  item?: Item;
  pos: Vec2;
};

export type BattleState = {
  stageId: number;
  waveIndex: number;
  enemies: Enemy[];
  groundLoot: GroundLoot[];
  player: PlayerBattle;
  result: "running" | "victory" | "defeat";
};

export type ShopNpc = {
  state: "entering" | "buying" | "leaving";
  progress: number;
  itemBought?: Item;
};

export type GameState = {
  screen: GameScreen;
  gold: number;
  unlockedStage: number;
  selectedStage: number;
  inventory: Array<Item | null>;
  saleSlots: Array<Item | null>;
  equipment: Record<EquipmentSlot, Item | null>;
  upgrades: Record<UpgradeId, number>;
  battle: BattleState | null;
  npc: ShopNpc | null;
  shopTimer: number;
};
