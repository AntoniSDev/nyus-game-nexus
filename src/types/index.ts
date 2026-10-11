import type {
  CatalogReference,
  CoverCredit,
  SteamGameMetadata,
} from "./catalog";
import type { SteamProfile } from "./steam";
export const statuses = [
  "Sélectionné",
  "En cours",
  "À poursuivre",
  "À confirmer",
  "En attente",
  "En pause",
  "Terminé",
  "Abandonné",
] as const;
export type Status = (typeof statuses)[number];
export interface Category {
  id: string;
  name: string;
}
export interface Game {
  id: string;
  name: string;
  categoryId: string;
  status: Status;
  coverUrl: string;
  notes: string;
  progress: string;
  waitingReason: string;
  updatedAt: string;
  catalog?: CatalogReference;
  coverCredit?: CoverCredit;
  steam?: SteamGameMetadata;
}
export interface Collection {
  schemaVersion: 1;
  categories: Category[];
  games: Game[];
  steamProfile?: SteamProfile;
}
