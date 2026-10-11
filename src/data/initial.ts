import type { Collection, Status } from "../types";
const roster: [string, string, Status, string][] = [
  ["Survie", "Valheim", "À poursuivre", ""],
  ["Usine / Automatisation", "Alchemy Factory", "Sélectionné", ""],
  ["Farm / Builds", "Soulstone Survivors", "Sélectionné", ""],
  ["Exploration / Colonie", "Necesse", "À confirmer", ""],
  ["Action / FPS", "DOOM: The Dark Ages", "Sélectionné", ""],
  ["Chill / Détente", "Aniimo ?", "À confirmer", "monétisation P2W gênante"],
  [
    "JRPG / Aventure",
    "Final Fantasy Resonance",
    "En attente",
    "sortie attendue",
  ],
  ["Action-RPG / Soulslike", "Nioh 3", "En attente", "attendre tous les DLC"],
];
export function initialCollection(): Collection {
  return {
    schemaVersion: 1,
    categories: roster.map(([name], i) => ({ id: `category-${i}`, name })),
    games: roster.map(([, name, status, notes], i) => ({
      id: `game-${i}`,
      name,
      categoryId: `category-${i}`,
      status,
      notes,
      coverUrl: "",
      progress: "",
      waitingReason: "",
      updatedAt: new Date().toISOString(),
    })),
  };
}
