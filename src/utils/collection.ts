import { statuses, type Collection, type Game } from "../types";
import { newCollection } from "../data/newCollection";
import { validSteamId } from "./steamProfile";
import type { SteamProfile } from "../types/steam";
import {
  steamDate,
  steamMinutes,
  validateSteamLibrary,
  validateSteamProfile,
} from "./steamValidation";
import type {
  CatalogReference,
  CoverCredit,
  SteamGameMetadata,
} from "../types/catalog";
export const STORAGE_KEY = "nyus-game-nexus.collection";
const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const text = (v: unknown, max = 10000): v is string =>
  typeof v === "string" && v.length <= max;
const positiveId = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v > 0;
function catalogReference(v: unknown): CatalogReference {
  if (!isRecord(v) || v.provider !== "steamgriddb" || !positiveId(v.id))
    throw new Error("Référence de catalogue invalide.");
  return { provider: "steamgriddb", id: v.id };
}
function coverCredit(v: unknown): CoverCredit {
  const reference = catalogReference(v);
  if (!isRecord(v) || !text(v.author, 160))
    throw new Error("Crédit de jaquette invalide.");
  return { ...reference, author: v.author };
}
function steamMetadata(v: unknown): SteamGameMetadata {
  if (!isRecord(v) || !positiveId(v.appId))
    throw new Error("Métadonnées Steam invalides.");
  const result: SteamGameMetadata = { appId: v.appId };
  if (v.playtimeTwoWeeksMinutes !== undefined) {
    if (!steamMinutes(v.playtimeTwoWeeksMinutes))
      throw new Error("Temps récent Steam invalide.");
    result.playtimeTwoWeeksMinutes = v.playtimeTwoWeeksMinutes;
  }
  if (v.lastPlayedAt !== undefined) {
    if (!steamDate(v.lastPlayedAt))
      throw new Error("Dernière activité Steam invalide.");
    result.lastPlayedAt = v.lastPlayedAt;
  }
  if (v.achievementsAvailable !== undefined) {
    if (typeof v.achievementsAvailable !== "boolean")
      throw new Error("Disponibilité des succès invalide.");
    result.achievementsAvailable = v.achievementsAvailable;
  }
  if (v.steamId64 !== undefined) {
    if (typeof v.steamId64 !== "string" || !validSteamId(v.steamId64))
      throw new Error("Profil Steam invalide.");
    result.steamId64 = v.steamId64;
  }
  if (v.achievementsSyncedAt !== undefined) {
    if (
      !text(v.achievementsSyncedAt, 100) ||
      !Number.isFinite(Date.parse(v.achievementsSyncedAt))
    )
      throw new Error("Date des succès invalide.");
    result.achievementsSyncedAt = v.achievementsSyncedAt;
  }
  if (v.playtimeMinutes !== undefined) {
    if (
      typeof v.playtimeMinutes !== "number" ||
      !Number.isSafeInteger(v.playtimeMinutes) ||
      v.playtimeMinutes < 0
    )
      throw new Error("Temps Steam invalide.");
    result.playtimeMinutes = v.playtimeMinutes;
  }
  if (v.lastSyncedAt !== undefined) {
    if (
      !text(v.lastSyncedAt, 100) ||
      !Number.isFinite(Date.parse(v.lastSyncedAt))
    )
      throw new Error("Date Steam invalide.");
    result.lastSyncedAt = v.lastSyncedAt;
  }
  if (v.achievements !== undefined) {
    const a = v.achievements;
    if (
      !isRecord(a) ||
      typeof a.unlocked !== "number" ||
      typeof a.total !== "number" ||
      !Number.isSafeInteger(a.unlocked) ||
      !Number.isSafeInteger(a.total) ||
      a.unlocked < 0 ||
      a.total < a.unlocked
    )
      throw new Error("Succès Steam invalides.");
    result.achievements = { unlocked: a.unlocked, total: a.total };
  }
  return result;
}
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
  let profile: SteamProfile | undefined;
  if (value.steamProfile !== undefined) {
    profile = validateSteamProfile(value.steamProfile);
  }
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
  const library =
    value.steamLibrary !== undefined
      ? validateSteamLibrary(value.steamLibrary)
      : undefined;
  if (
    library &&
    (!profile ||
      library.profile.steamId64 !== profile.steamId64 ||
      !library.libraryVisible)
  )
    throw new Error("Bibliothèque et profil Steam incohérents.");
  // Keep only schema fields, never carry unknown imported properties forward.
  return {
    schemaVersion: 1,
    ...(profile ? { steamProfile: profile } : {}),
    ...(library ? { steamLibrary: library } : {}),
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
      ...(g.catalog !== undefined
        ? { catalog: catalogReference(g.catalog) }
        : {}),
      ...(g.coverCredit !== undefined
        ? { coverCredit: coverCredit(g.coverCredit) }
        : {}),
      ...(g.steam !== undefined ? { steam: steamMetadata(g.steam) } : {}),
    })),
  };
}
export function loadCollection(storage: Pick<Storage, "getItem">): Collection {
  const raw = storage.getItem(STORAGE_KEY);
  return raw === null ? newCollection() : validateCollection(JSON.parse(raw));
}
export function saveCollection(
  storage: Pick<Storage, "setItem">,
  collection: Collection,
): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(validateCollection(collection)));
}
export function upsertGame(collection: Collection, game: Game): Collection {
  if (
    game.steam &&
    collection.games.some(
      (g) => g.id !== game.id && g.steam?.appId === game.steam?.appId,
    )
  )
    throw new Error("Ce jeu Steam est déjà dans votre collection.");
  if (
    game.catalog &&
    collection.games.some(
      (g) =>
        g.id !== game.id &&
        ((g.catalog?.provider === game.catalog!.provider &&
          g.catalog.id === game.catalog!.id) ||
          g.name.trim().toLocaleLowerCase() ===
            game.name.trim().toLocaleLowerCase()),
    )
  ) {
    throw new Error(
      "Ce jeu est déjà dans votre collection. Modifiez sa carte existante.",
    );
  }
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
