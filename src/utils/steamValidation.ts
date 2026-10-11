import type {
  SteamLibrary,
  SteamLibraryGame,
  SteamProfile,
} from "../types/steam";
import { validSteamId } from "./steamProfile";
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
export const steamDate = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 100 && Number.isFinite(Date.parse(v));
export const steamMinutes = (v: unknown): v is number =>
  typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
export function validateSteamProfile(p: unknown): SteamProfile {
  if (
    !record(p) ||
    typeof p.steamId64 !== "string" ||
    !validSteamId(p.steamId64) ||
    typeof p.displayName !== "string" ||
    !p.displayName.trim() ||
    p.displayName.length > 160 ||
    p.profileUrl !== `https://steamcommunity.com/profiles/${p.steamId64}/` ||
    !steamDate(p.lastSyncedAt)
  )
    throw new Error("Profil Steam invalide.");
  return {
    steamId64: p.steamId64,
    displayName: p.displayName,
    profileUrl: p.profileUrl,
    lastSyncedAt: p.lastSyncedAt,
  };
}
export function validateSteamLibrary(v: unknown): SteamLibrary {
  if (
    !record(v) ||
    typeof v.libraryVisible !== "boolean" ||
    !Array.isArray(v.games) ||
    v.games.length > 10000
  )
    throw new Error("Bibliothèque Steam invalide.");
  const ids = new Set<number>();
  const games: SteamLibraryGame[] = v.games.map((g) => {
    if (
      !record(g) ||
      typeof g.appId !== "number" ||
      !Number.isSafeInteger(g.appId) ||
      g.appId <= 0 ||
      g.appId > 4294967295 ||
      ids.has(g.appId) ||
      typeof g.name !== "string" ||
      !g.name.trim() ||
      g.name.length > 160 ||
      (g.playtimeMinutes !== undefined && !steamMinutes(g.playtimeMinutes)) ||
      (g.playtimeTwoWeeksMinutes !== undefined &&
        !steamMinutes(g.playtimeTwoWeeksMinutes)) ||
      (g.lastPlayedAt !== undefined && !steamDate(g.lastPlayedAt))
    )
      throw new Error("Jeu de bibliothèque Steam invalide.");
    ids.add(g.appId);
    return {
      appId: g.appId,
      name: g.name,
      ...(g.playtimeMinutes !== undefined
        ? { playtimeMinutes: g.playtimeMinutes }
        : {}),
      ...(g.playtimeTwoWeeksMinutes !== undefined
        ? { playtimeTwoWeeksMinutes: g.playtimeTwoWeeksMinutes }
        : {}),
      ...(g.lastPlayedAt !== undefined ? { lastPlayedAt: g.lastPlayedAt } : {}),
    };
  });
  if (!v.libraryVisible && games.length)
    throw new Error("Bibliothèque privée incohérente.");
  return {
    profile: validateSteamProfile(v.profile),
    libraryVisible: v.libraryVisible,
    games,
  };
}
