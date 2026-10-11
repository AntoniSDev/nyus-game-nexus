import type { Collection } from "../types";
import type { SteamLibrary } from "../types/steam";
import { cacheSteamLibrary, steamGameMetadata } from "./steamCollection";
import { steamAchievementBatch } from "./steamClient";
import { validateCollection } from "./collection";
export async function synchronizeSteam(
  collection: Collection,
  library: SteamLibrary,
  signal: AbortSignal,
  batch = steamAchievementBatch,
) {
  let next = cacheSteamLibrary(collection, library);
  const owned = new Map(library.games.map((g) => [g.appId, g]));
  const linked = collection.games.filter(
    (g) =>
      g.steam?.steamId64 === library.profile.steamId64 &&
      owned.has(g.steam.appId),
  );
  let failed = 0;
  const stats: Awaited<ReturnType<typeof steamAchievementBatch>>["results"] =
    {};
  for (let i = 0; i < linked.length; i += 10) {
    signal.throwIfAborted();
    const slice = linked.slice(i, i + 10);
    try {
      const data = await batch(
        library.profile.steamId64,
        slice.map((g) => g.steam!.appId),
        signal,
      );
      Object.assign(stats, data.results);
      failed += data.failedAppIds.length;
    } catch {
      signal.throwIfAborted();
      failed += linked.length - i;
      break;
    }
  }
  signal.throwIfAborted();
  const ids = new Set(linked.map((g) => g.id));
  next = validateCollection({
    ...next,
    games: next.games.map((g) =>
      ids.has(g.id)
        ? {
            ...g,
            steam: steamGameMetadata(
              library,
              owned.get(g.steam!.appId)!,
              g.steam,
              stats[g.steam!.appId],
            ),
          }
        : g,
    ),
  });
  return { collection: next, updated: linked.length, failed };
}
