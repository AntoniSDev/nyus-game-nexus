import type { Collection } from "../types";
export function newCollection(): Collection {
  return {
    schemaVersion: 1,
    categories: [
      "Survie",
      "Usine / Automatisation",
      "Farm / Builds",
      "Exploration / Colonie",
      "Action / FPS",
      "Chill / Détente",
      "JRPG / Aventure",
      "Action-RPG / Soulslike",
    ].map((name, i) => ({ id: `category-${i}`, name })),
    games: [],
  };
}
