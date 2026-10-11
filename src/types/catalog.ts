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
  steamAppId?: number;
  id: number;
  name: string;
  releaseYear?: number;
  artwork?: CatalogArtwork;
}

// Public Steam observations stay separate from personal collection fields.
export interface SteamGameMetadata {
  appId: number;
  steamId64?: string;
  playtimeMinutes?: number;
  playtimeTwoWeeksMinutes?: number;
  lastPlayedAt?: string;
  achievementsAvailable?: boolean;
  achievements?: { unlocked: number; total: number };
  lastSyncedAt?: string;
  achievementsSyncedAt?: string;
}
export interface SteamProfileMetadata {
  steamId64: string;
  lastSyncedAt?: string;
}
