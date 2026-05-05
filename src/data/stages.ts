export type StageWave = {
  monsters: Array<{ monsterId: string; count: number }>;
};

export type StageDefinition = {
  id: number;
  name: string;
  waves: StageWave[];
  boss?: { monsterId: string; count: number };
};

export const stages: StageDefinition[] = [
  {
    id: 1,
    name: "Meadow Edge",
    waves: [{ monsters: [{ monsterId: "slime", count: 3 }] }],
  },
  {
    id: 2,
    name: "Goblin Path",
    waves: [
      { monsters: [{ monsterId: "slime", count: 4 }] },
      { monsters: [{ monsterId: "goblin", count: 3 }] },
    ],
  },
  {
    id: 3,
    name: "Broken Camp",
    waves: [
      { monsters: [{ monsterId: "slime", count: 4 }] },
      { monsters: [{ monsterId: "goblin", count: 4 }] },
      { monsters: [{ monsterId: "slime", count: 3 }, { monsterId: "goblin", count: 2 }] },
    ],
    boss: { monsterId: "ogreBoss", count: 1 },
  },
];
