import type { Collection, Game } from "../types";
import type { CatalogArtwork } from "../types/catalog";
import type {
  SteamAchievements,
  SteamLibrary,
  SteamLibraryGame,
} from "../types/steam";
import { validateCollection } from "./collection";
export function steamGameMatch(collection: Collection, game: SteamLibraryGame) {
  return (
    collection.games.find((g) => g.steam?.appId === game.appId) ??
    collection.games.find(
      (g) =>
        !g.steam &&
        g.name.trim().toLocaleLowerCase() ===
          game.name.trim().toLocaleLowerCase(),
    )
  );
}
export function mergeSteamGame(
  collection: Collection,
  library: SteamLibrary,
  game: SteamLibraryGame,
  categoryId: string,
  artwork?: CatalogArtwork,
  achievements?: SteamAchievements,
): Collection {
  const old = steamGameMatch(collection, game);
  const sameProfile = old?.steam?.steamId64 === library.profile.steamId64;
  const steam: Game["steam"] = {
    appId: game.appId,
    steamId64: library.profile.steamId64,
    lastSyncedAt: library.profile.lastSyncedAt,
    ...(game.playtimeMinutes !== undefined
      ? { playtimeMinutes: game.playtimeMinutes }
      : {}),
    ...(sameProfile && old?.steam?.achievements
      ? {
          achievements: old.steam.achievements,
          achievementsSyncedAt: old.steam.achievementsSyncedAt,
        }
      : {}),
    ...(achievements?.available &&
    achievements.unlocked !== undefined &&
    achievements.total !== undefined
      ? {
          achievements: {
            unlocked: achievements.unlocked,
            total: achievements.total,
          },
          achievementsSyncedAt: achievements.lastSyncedAt,
        }
      : {}),
  };
  const next: Game = old
    ? { ...old, steam }
    : {
        id: crypto.randomUUID(),
        name: game.name,
        categoryId,
        status: "Sélectionné",
        notes: "",
        progress: "",
        waitingReason: "",
        updatedAt: new Date().toISOString(),
        coverUrl: artwork?.url ?? "",
        steam,
        ...(artwork
          ? {
              coverCredit: {
                provider: "steamgriddb",
                id: artwork.id,
                author: artwork.author,
              },
            }
          : {}),
      };
  return validateCollection({
    ...collection,
    steamProfile: library.profile,
    games: old
      ? collection.games.map((g) => (g.id === old.id ? next : g))
      : [...collection.games, next],
  });
}
