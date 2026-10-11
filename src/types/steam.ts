export interface SteamProfile {
  steamId64: string;
  displayName: string;
  profileUrl: string;
  lastSyncedAt: string;
}
export interface SteamLibraryGame {
  appId: number;
  name: string;
  playtimeMinutes?: number;
}
export interface SteamLibrary {
  profile: SteamProfile;
  games: SteamLibraryGame[];
  libraryVisible: boolean;
}
export interface SteamAchievements {
  available: boolean;
  unlocked?: number;
  total?: number;
  lastSyncedAt: string;
}
