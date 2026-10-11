import type { SteamAchievements, SteamLibrary } from "../types/steam";
async function request<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(`/api/steam/${path}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.any([signal, AbortSignal.timeout(35000)]),
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error("La connexion Steam n’est pas disponible ici.");
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.error || "La connexion Steam est momentanément indisponible.",
    );
  return data as T;
}
export const steamLibrary = (profile: string, signal: AbortSignal) =>
  request<SteamLibrary>(
    `library?profile=${encodeURIComponent(profile)}`,
    signal,
  );
export const steamAchievements = (
  profile: string,
  appId: number,
  signal: AbortSignal,
) =>
  request<SteamAchievements>(
    `achievements?profile=${encodeURIComponent(profile)}&appId=${appId}`,
    signal,
  );
