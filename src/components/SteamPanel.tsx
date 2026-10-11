import { Gamepad2, Sparkles } from "lucide-react";
import type { Collection } from "../types";
export function SteamPanel({
  collection,
  onOpen,
}: {
  collection: Collection;
  onOpen: () => void;
}) {
  const p = collection.steamProfile;
  const library = collection.steamLibrary;
  return (
    <section className="steam-panel" aria-labelledby="steam-panel-title">
      <div className="steam-panel-icon" aria-hidden="true">
        <Gamepad2 size={28} />
      </div>
      <div className="steam-panel-copy">
        <div className="eyebrow">
          <Sparkles size={12} /> VOS JEUX, VOTRE PROCHAINE AVENTURE
        </div>
        <h2 id="steam-panel-title">Ma bibliothèque Steam</h2>
        <p>
          {p
            ? `Bienvenue, ${p.displayName}. Vos mondes vous attendent.`
            : "Reliez votre profil public et choisissez parmi les jeux qui sont déjà à vous."}
        </p>
        {p && (
          <div className="steam-panel-info">
            <span>
              {library
                ? `${library.games.length} jeux récupérés`
                : "Bibliothèque à synchroniser"}
            </span>
            <span>
              {library ? "Synchronisé" : "Profil consulté"} le{" "}
              {new Date(
                library?.profile.lastSyncedAt ?? p.lastSyncedAt,
              ).toLocaleString("fr-FR")}
            </span>
          </div>
        )}
      </div>
      <button className="primary" onClick={onOpen}>
        {p ? "Gérer ma connexion Steam" : "Relier mon profil Steam"}{" "}
        <span aria-hidden="true">↗</span>
      </button>
    </section>
  );
}
