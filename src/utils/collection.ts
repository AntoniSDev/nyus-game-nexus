import { statuses, type Collection, type Game } from "../types";
import { initialCollection } from "../data/initial";
export const STORAGE_KEY = "nyus-game-nexus.collection";
const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 10000): v is string =>
  typeof v === "string" && v.length <= max;
export function validCover(url: string): boolean {
  if (!url) return true;
  try {
    return ["https:", "http:"].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}
export function validateCollection(value: unknown): Collection {
  if (
    !isRecord(value) ||
    value.schemaVersion !== 1 ||
    !Array.isArray(value.categories) ||
    !Array.isArray(value.games)
  )
    throw new Error("Format ou version de sauvegarde non pris en charge.");
  if (value.categories.length > 500 || value.games.length > 10000)
    throw new Error("Cette sauvegarde est trop volumineuse.");
  const categoryIds = new Set<string>();
  const gameIds = new Set<string>();
  for (const c of value.categories) {
    if (
      !isRecord(c) ||
      !text(c.id, 200) ||
      !c.id ||
      categoryIds.has(c.id) ||
      !text(c.name, 120) ||
      !c.name.trim()
    )
      throw new Error("Catégorie invalide ou identifiant dupliqué.");
    categoryIds.add(c.id);
  }
  for (const g of value.games) {
    if (
      !isRecord(g) ||
      !text(g.id, 200) ||
      !g.id ||
      gameIds.has(g.id) ||
      !text(g.name, 160) ||
      !g.name.trim() ||
      !text(g.categoryId, 200) ||
      !categoryIds.has(g.categoryId) ||
      !statuses.includes(g.status as Game["status"]) ||
      !text(g.coverUrl, 2048) ||
      !validCover(g.coverUrl) ||
      !text(g.notes) ||
      !text(g.progress) ||
      !text(g.waitingReason) ||
      !text(g.updatedAt, 100) ||
      !Number.isFinite(Date.parse(g.updatedAt))
    )
      throw new Error(
        "Jeu invalide : vérifiez les champs, les statuts et les catégories.",
      );
    gameIds.add(g.id);
  }
  // Keep only schema fields, never carry unknown imported properties forward.
  return {
    schemaVersion: 1,
    categories: value.categories.map((c) => ({ id: c.id, name: c.name })),
    games: value.games.map((g) => ({
      id: g.id,
      name: g.name,
      categoryId: g.categoryId,
      status: g.status,
      coverUrl: g.coverUrl,
      notes: g.notes,
      progress: g.progress,
      waitingReason: g.waitingReason,
      updatedAt: g.updatedAt,
    })),
  };
}
export function loadCollection(storage: Pick<Storage, "getItem">): Collection {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null
    ? initialCollection()
    : validateCollection(JSON.parse(raw));
}
export function saveCollection(
  storage: Pick<Storage, "setItem">,
  collection: Collection,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(validateCollection(collection)));
}
export function upsertGame(collection: Collection, game: Game): Collection {
  return validateCollection({
    ...collection,
    games: collection.games.some((g) => g.id === game.id)
      ? collection.games.map((g) => (g.id === game.id ? game : g))
      : [...collection.games, game],
  });
}
export function removeCategory(collection: Collection, id: string): Collection {
  if (collection.games.some((g) => g.categoryId === id))
    throw new Error(
      "Déplacez ou supprimez les jeux de cette catégorie avant de la supprimer.",
    );
  return {
    ...collection,
    categories: collection.categories.filter((c) => c.id !== id),
  };
}
