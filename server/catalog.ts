import type { CatalogArtwork, CatalogGame } from "../src/types/catalog";

export interface CatalogContext {
  request: Request;
  env: { STEAMGRIDDB_API_KEY?: string };
}
type Fetcher = typeof fetch;
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const positiveId = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value > 0;

class CatalogError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function imageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 2048) return;
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      url.hostname === "cdn2.steamgriddb.com" &&
      !url.username &&
      !url.password
    )
      return url.href;
  } catch {
    /* Ignore malformed upstream image URLs. */
  }
}
function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(status === 429 ? { "Retry-After": "60" } : {}),
    },
  });
}

// A bounded per-isolate burst guard. Cloudflare WAF can add a global rate limit.
const bursts = new Map<string, { since: number; count: number }>();
export function allowRequest(request: Request) {
  const ip = request.headers.get("CF-Connecting-IP");
  if (!ip) return true;
  const now = Date.now();
  if (bursts.size > 2000) {
    for (const [key, value] of bursts)
      if (now - value.since >= 60000) bursts.delete(key);
    if (bursts.size > 2000) bursts.delete(bursts.keys().next().value!);
  }
  const current = bursts.get(ip);
  if (!current || now - current.since >= 60000) {
    bursts.set(ip, { since: now, count: 1 });
    return true;
  }
  return ++current.count <= 30;
}
async function upstream(
  path: string,
  key: string,
  fetcher: Fetcher,
): Promise<unknown[]> {
  const url = `https://www.steamgriddb.com/api/v2/${path}`;
  const cache = (
    globalThis.caches as (CacheStorage & { default?: Cache }) | undefined
  )?.default;
  const cacheKey = new Request(url);
  const cached = await cache?.match(cacheKey).catch(() => undefined);
  if (cached) return cached.json();
  const response = await fetcher(url, {
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
    redirect: "manual",
  });
  if (response.status === 429)
    throw new CatalogError(
      429,
      "Le catalogue est très sollicité. Réessayez dans une minute.",
    );
  if (response.status === 401 || response.status === 403)
    throw new CatalogError(
      503,
      "Le catalogue est temporairement indisponible. L’ajout manuel reste disponible.",
    );
  if (response.status === 404) return [];
  if (!response.ok)
    throw new CatalogError(
      502,
      "Le catalogue ne répond pas correctement. Réessayez ou ajoutez le jeu manuellement.",
    );
  const body: unknown = await response.json();
  if (!record(body) || body.success !== true || !Array.isArray(body.data))
    throw new CatalogError(502, "La réponse du catalogue est invalide.");
  if (cache)
    await cache
      .put(
        cacheKey,
        Response.json(body.data, {
          headers: { "Cache-Control": "public, max-age=900" },
        }),
      )
      .catch(() => {});
  return body.data;
}
async function artwork(
  id: number,
  key: string,
  fetcher: Fetcher,
  platform: "game" | "steam" = "game",
): Promise<CatalogArtwork[]> {
  const data = await upstream(
    `grids/${platform}/${id}?types=static&mimes=image%2Fpng,image%2Fjpeg,image%2Fwebp&nsfw=false&humor=false&epilepsy=false&limit=12`,
    key,
    fetcher,
  );
  return data
    .flatMap((item) => {
      if (!record(item) || !positiveId(item.id)) return [];
      const url = imageUrl(item.url);
      const thumbnail = imageUrl(item.thumb);
      if (!url || !thumbnail) return [];
      return [
        {
          id: item.id,
          url,
          thumbnail,
          author:
            record(item.author) && typeof item.author.name === "string"
              ? item.author.name.slice(0, 160)
              : "Communauté SteamGridDB",
        },
      ];
    })
    .slice(0, 12);
}
export async function handleCatalog(
  context: CatalogContext,
  kind: "search" | "artwork" | "steam-artwork",
  fetcher: Fetcher = fetch,
): Promise<Response> {
  try {
    if (context.request.method !== "GET")
      return new Response(null, { status: 405, headers: { Allow: "GET" } });
    const params = new URL(context.request.url).searchParams;
    const query = params.get("q")?.trim() ?? "";
    const rawId = params.get("id") ?? "";
    if (
      kind === "search" &&
      (query.length < 2 ||
        query.length > 160 ||
        /[\u0000-\u001f\u007f]/.test(query))
    )
      return json({ error: "Saisissez entre 2 et 160 caractères." }, 400);
    if (
      kind !== "search" &&
      (!/^[1-9]\d{0,9}$/.test(rawId) || !positiveId(Number(rawId)))
    )
      return json({ error: "Identifiant de jeu invalide." }, 400);
    if (!allowRequest(context.request))
      return json(
        { error: "Trop de recherches rapprochées. Réessayez dans une minute." },
        429,
      );
    const key = context.env.STEAMGRIDDB_API_KEY;
    if (!key)
      return json(
        {
          error:
            "Le catalogue n’est pas disponible dans cet environnement. Vous pouvez ajouter un jeu manuellement.",
        },
        503,
      );
    if (kind !== "search")
      return json({
        artwork: await artwork(
          Number(rawId),
          key,
          fetcher,
          kind === "steam-artwork" ? "steam" : "game",
        ),
      });
    const data = await upstream(
      `search/autocomplete/${encodeURIComponent(query)}`,
      key,
      fetcher,
    );
    const games: CatalogGame[] = data
      .flatMap((item) => {
        if (
          !record(item) ||
          !positiveId(item.id) ||
          typeof item.name !== "string" ||
          !item.name.trim() ||
          item.name.length > 160
        )
          return [];
        const year =
          typeof item.release_date === "number" && item.release_date > 0
            ? new Date(item.release_date * 1000).getUTCFullYear()
            : undefined;
        return [
          {
            id: item.id,
            name: item.name,
            ...(year && year >= 1970 && year <= 2100
              ? { releaseYear: year }
              : {}),
          },
        ];
      })
      .filter(
        (game, index, all) =>
          all.findIndex((other) => other.id === game.id) === index,
      )
      .slice(0, 6);
    await Promise.all(
      games.map(async (game) => {
        try {
          game.artwork = (await artwork(game.id, key, fetcher))[0];
        } catch {
          /* Search remains usable when a thumbnail request fails. */
        }
      }),
    );
    return json({ games });
  } catch (error) {
    return error instanceof CatalogError
      ? json({ error: error.message }, error.status)
      : json(
          {
            error:
              "Impossible de joindre le catalogue. Réessayez ou utilisez l’ajout manuel.",
          },
          502,
        );
  }
}
