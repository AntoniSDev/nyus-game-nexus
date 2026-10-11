import type { Collection, Game } from "../types";
import type { CatalogArtwork } from "../types/catalog";
import type {
  SteamAchievements,
  SteamLibrary,
  SteamLibraryGame,
} from "../types/steam";
import { validateCollection } from "./collection";
/** Disconnect only the profile/cache; personal games and Steam observations stay intact. */
export function disconnectSteam(collection: Collection): Collection {
  const next = { ...collection };
  delete next.steamProfile;
  delete next.steamLibrary;
  return validateCollection(next);
}
export function cacheSteamLibrary(
  collection: Collection,
  library: SteamLibrary,
): Collection {
  if (!library.libraryVisible)
    throw new Error(
      "Les détails de jeux Steam ne sont pas publics. Vos données enregistrées ont été conservées.",
    );
  return validateCollection({
    ...collection,
    steamProfile: library.profile,
    steamLibrary: library,
  });
}
export function steamGameMetadata(
  library: SteamLibrary,
  game: SteamLibraryGame,
  previous?: Game["steam"],
  achievements?: SteamAchievements,
): NonNullable<Game["steam"]> {
  const sameProfile = previous?.steamId64 === library.profile.steamId64;
  return {
    ...(sameProfile ? previous : {}),
    appId: game.appId,
    steamId64: library.profile.steamId64,
    lastSyncedAt: library.profile.lastSyncedAt,
    ...(game.playtimeMinutes !== undefined
      ? { playtimeMinutes: game.playtimeMinutes }
      : {}),
    ...(game.playtimeTwoWeeksMinutes !== undefined
      ? { playtimeTwoWeeksMinutes: game.playtimeTwoWeeksMinutes }
      : {}),
    ...(game.lastPlayedAt !== undefined
      ? { lastPlayedAt: game.lastPlayedAt }
      : {}),
    ...(achievements ? { achievementsAvailable: achievements.available } : {}),
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
}
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
  const steam = steamGameMetadata(library, game, old?.steam, achievements);
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
    ...cacheSteamLibrary(collection, library),
    games: old
      ? collection.games.map((g) => (g.id === old.id ? next : g))
      : [...collection.games, next],
  });
}
