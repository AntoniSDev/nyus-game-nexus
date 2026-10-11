import { parseSteamProfile, validSteamId } from "../src/utils/steamProfile";
import { steamAvatarUrl } from "../src/utils/steamValidation";
import type { SteamLibraryGame } from "../src/types/steam";
import { allowRequest } from "./catalog";
export interface SteamContext {
  request: Request;
  env: { STEAM_WEB_API_KEY?: string };
}
const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
class SteamError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function api(
  path: string,
  params: Record<string, string>,
  key: string,
  fetcher: typeof fetch,
): Promise<Record<string, unknown>> {
  const url = new URL(`https://api.steampowered.com/${path}/`);
  for (const [name, value] of Object.entries(params))
    url.searchParams.set(name, value);
  const response = await fetcher(url, {
    headers: { "x-webapi-key": key, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
    redirect: "manual",
  });
  if (response.status === 429)
    throw new SteamError(
      429,
      "Steam est très sollicité. Réessayez dans une minute.",
    );
  const unavailableStats =
    path === "ISteamUserStats/GetPlayerAchievements/v1" &&
    [400, 403].includes(response.status);
  if (response.status === 401 || (response.status === 403 && !unavailableStats))
    throw new SteamError(
      503,
      "La connexion Steam est temporairement indisponible.",
    );
  if (!response.ok && !unavailableStats)
    throw new SteamError(
      502,
      "Steam ne répond pas correctement. Réessayez plus tard.",
    );
  const data: unknown = await response.json();
  if (!record(data))
    throw new SteamError(502, "La réponse Steam est invalide.");
  return data;
}
async function achievementStats(
  steamId: string,
  appId: string,
  key: string,
  fetcher: typeof fetch,
) {
  const body = await api(
    "ISteamUserStats/GetPlayerAchievements/v1",
    { steamid: steamId, appid: appId, l: "french" },
    key,
    fetcher,
  );
  const lastSyncedAt = new Date().toISOString();
  const stats = body.playerstats;
  if (
    !record(stats) ||
    stats.success !== true ||
    !Array.isArray(stats.achievements)
  )
    return { available: false, lastSyncedAt };
  const achievements = stats.achievements.filter(
    (a) =>
      record(a) &&
      typeof a.apiname === "string" &&
      (a.achieved === 0 || a.achieved === 1),
  );
  if (achievements.length !== stats.achievements.length)
    throw new SteamError(502, "La réponse des succès Steam est invalide.");
  return {
    available: true,
    unlocked: achievements.filter((a) => a.achieved === 1).length,
    total: achievements.length,
    lastSyncedAt,
  };
}
export async function handleSteam(
  context: SteamContext,
  kind: "library" | "achievements" | "achievement-batch",
  fetcher: typeof fetch = fetch,
): Promise<Response> {
  const respond = (data: unknown, status = 200) =>
    Response.json(data, {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    });
  try {
    if (context.request.method !== "GET")
      return new Response(null, { status: 405, headers: { Allow: "GET" } });
    const params = new URL(context.request.url).searchParams;
    let input;
    try {
      input = parseSteamProfile(params.get("profile") ?? "");
    } catch (e) {
      return respond({ error: (e as Error).message }, 400);
    }
    const rawApp = params.get("appId") ?? "";
    const validApp = (v: string) =>
      /^[1-9]\d{0,9}$/.test(v) && Number(v) <= 4294967295;
    const appIds = (params.get("appIds") ?? "").split(",");
    if (
      kind === "achievement-batch" &&
      (input.kind !== "id" ||
        appIds.length > 10 ||
        new Set(appIds).size !== appIds.length ||
        !appIds.every(validApp))
    )
      return respond(
        { error: "Choisissez de 1 à 10 jeux Steam valides." },
        400,
      );
    if (
      kind === "achievements" &&
      (input.kind !== "id" ||
        !/^[1-9]\d{0,9}$/.test(rawApp) ||
        Number(rawApp) > 4294967295)
    )
      return respond({ error: "Identifiants Steam invalides." }, 400);
    if (!allowRequest(context.request))
      return respond(
        { error: "Trop de demandes rapprochées. Réessayez dans une minute." },
        429,
      );
    const key = context.env.STEAM_WEB_API_KEY;
    if (!key)
      return respond(
        {
          error:
            "La connexion Steam n’est pas disponible dans cet environnement.",
        },
        503,
      );
    let steamId = input.value;
    if (input.kind === "vanity") {
      const body = await api(
        "ISteamUser/ResolveVanityURL/v1",
        { vanityurl: input.value },
        key,
        fetcher,
      );
      if (
        !record(body.response) ||
        body.response.success !== 1 ||
        typeof body.response.steamid !== "string" ||
        !validSteamId(body.response.steamid)
      )
        throw new SteamError(404, "Ce profil Steam est introuvable.");
      steamId = body.response.steamid;
    }
    const lastSyncedAt = new Date().toISOString();
    if (kind === "achievement-batch") {
      const entries = await Promise.all(
        appIds.map(async (appId) => {
          try {
            return {
              appId,
              data: await achievementStats(steamId, appId, key, fetcher),
            };
          } catch {
            return { appId, data: undefined };
          }
        }),
      );
      return respond({
        results: Object.fromEntries(
          entries.filter((e) => e.data).map((e) => [e.appId, e.data]),
        ),
        failedAppIds: entries
          .filter((e) => !e.data)
          .map((e) => Number(e.appId)),
      });
    }
    if (kind === "achievements") {
      return respond(await achievementStats(steamId, rawApp, key, fetcher));
    }
    const summary = await api(
      "ISteamUser/GetPlayerSummaries/v2",
      { steamids: steamId },
      key,
      fetcher,
    );
    const player =
      record(summary.response) && Array.isArray(summary.response.players)
        ? summary.response.players.find(
            (p) => record(p) && p.steamid === steamId,
          )
        : undefined;
    if (!record(player) || typeof player.personaname !== "string")
      throw new SteamError(404, "Ce profil Steam est introuvable.");
    const avatarUrl =
      steamAvatarUrl(player.avatarfull) ??
      steamAvatarUrl(player.avatarmedium) ??
      steamAvatarUrl(player.avatar);
    const profile = {
      steamId64: steamId,
      displayName: player.personaname.slice(0, 160),
      profileUrl: `https://steamcommunity.com/profiles/${steamId}/`,
      lastSyncedAt,
      ...(avatarUrl ? { avatarUrl } : {}),
    };
    if (player.communityvisibilitystate !== 3)
      return respond({ profile, games: [], libraryVisible: false });
    const owned = await api(
      "IPlayerService/GetOwnedGames/v1",
      {
        steamid: steamId,
        include_appinfo: "true",
        include_played_free_games: "true",
      },
      key,
      fetcher,
    );
    const library = owned.response;
    if (
      !record(library) ||
      (!Array.isArray(library.games) && library.game_count !== 0)
    )
      return respond({ profile, games: [], libraryVisible: false });
    const seenApps = new Set<number>();
    const games: SteamLibraryGame[] = (
      Array.isArray(library.games) ? library.games : []
    )
      .flatMap((item) => {
        if (
          !record(item) ||
          typeof item.appid !== "number" ||
          !Number.isSafeInteger(item.appid) ||
          item.appid <= 0 ||
          item.appid > 4294967295 ||
          typeof item.name !== "string" ||
          !item.name.trim() ||
          item.name.length > 160
        )
          return [];
        const minutes = item.playtime_forever;
        const recent = item.playtime_2weeks;
        const lastPlayed = item.rtime_last_played;
        return [
          {
            appId: item.appid,
            name: item.name,
            ...(typeof recent === "number" &&
            Number.isSafeInteger(recent) &&
            recent >= 0
              ? { playtimeTwoWeeksMinutes: recent }
              : {}),
            ...(typeof lastPlayed === "number" &&
            Number.isSafeInteger(lastPlayed) &&
            lastPlayed > 0 &&
            lastPlayed <= Date.now() / 1000 + 300
              ? { lastPlayedAt: new Date(lastPlayed * 1000).toISOString() }
              : {}),
            ...(typeof minutes === "number" &&
            Number.isSafeInteger(minutes) &&
            minutes >= 0
              ? { playtimeMinutes: minutes }
              : {}),
          },
        ];
      })
      .filter((g) => {
        if (seenApps.has(g.appId)) return false;
        seenApps.add(g.appId);
        return true;
      })
      .slice(0, 10000);
    return respond({ profile, games, libraryVisible: true });
  } catch (e) {
    return e instanceof SteamError
      ? respond({ error: e.message }, e.status)
      : respond(
          {
            error:
              "Impossible de joindre Steam. Votre collection a été conservée.",
          },
          502,
        );
  }
}
