export type MonsterDefinition = {
  id: string;
  name: string;
  hp: number;
  damage: number;
  attackSpeed: number;
  moveSpeed: number;
  attackRange: number;
  goldDrop: [number, number];
  itemDropChance: number;
};

export const monsters: Record<string, MonsterDefinition> = {
  slime: {
    id: "slime",
    name: "Slime",
    hp: 20,
    damage: 4,
    attackSpeed: 0.8,
    moveSpeed: 32,
    attackRange: 30,
    goldDrop: [4, 9],
    itemDropChance: 0.28,
  },
  goblin: {
    id: "goblin",
    name: "Goblin",
    hp: 30,
    damage: 6,
    attackSpeed: 0.72,
    moveSpeed: 38,
    attackRange: 28,
    goldDrop: [7, 13],
    itemDropChance: 0.38,
  },
  ogreBoss: {
    id: "ogreBoss",
    name: "Ogre Boss",
    hp: 115,
    damage: 12,
    attackSpeed: 0.58,
    moveSpeed: 27,
    attackRange: 36,
    goldDrop: [30, 45],
    itemDropChance: 1,
  },
};
