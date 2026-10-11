import type { CatalogArtwork, CatalogGame } from "../types/catalog";
export async function catalogRequest<T>(
  path: string,
  signal: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/catalog/${path}`, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(25000)]),
    headers: { Accept: "application/json" },
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "Le catalogue n’est pas disponible ici. L’ajout manuel reste possible.",
    );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Le catalogue est momentanément indisponible.",
    );
  return data as T;
}
export const searchCatalog = (query: string, signal: AbortSignal) =>
  catalogRequest<{ games: CatalogGame[] }>(
    `search?q=${encodeURIComponent(query)}`,
    signal,
  );
export const catalogArtwork = (id: number, signal: AbortSignal) =>
  catalogRequest<{ artwork: CatalogArtwork[] }>(`artwork?id=${id}`, signal);
