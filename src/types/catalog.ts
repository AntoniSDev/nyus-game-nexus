export interface CatalogReference {
  provider: "steamgriddb";
  id: number;
}
export interface CoverCredit extends CatalogReference {
  author: string;
}
export interface CatalogArtwork {
  id: number;
  url: string;
  thumbnail: string;
  author: string;
}
export interface CatalogGame {
  id: number;
  name: string;
  releaseYear?: number;
  artwork?: CatalogArtwork;
}

// Future Steam synchronization is independent of personal collection fields.
export interface SteamGameMetadata {
  appId: number;
  playtimeMinutes?: number;
  achievements?: { unlocked: number; total: number };
  lastSyncedAt?: string;
}
export interface SteamProfileMetadata {
  steamId64: string;
  lastSyncedAt?: string;
}
