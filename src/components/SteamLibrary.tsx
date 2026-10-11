import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Collection } from "../types";
import type {
  SteamAchievements,
  SteamLibrary as Library,
  SteamLibraryGame,
} from "../types/steam";
import type { CatalogArtwork } from "../types/catalog";
import { Modal } from "./Modal";
import { parseSteamProfile } from "../utils/steamProfile";
import { steamLibrary, steamAchievements } from "../utils/steamClient";
import { catalogRequest } from "../utils/catalogClient";
import { mergeSteamGame, steamGameMatch } from "../utils/steamCollection";
export function SteamLibrary({
  collection,
  onUpdate,
  onClose,
}: {
  collection: Collection;
  onUpdate: (c: Collection) => boolean;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState(
    collection.steamProfile?.profileUrl ?? "",
  );
  const [library, setLibrary] = useState<Library>();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState(
    collection.categories[0]?.id ?? "",
  );
  const [selected, setSelected] = useState<number[]>([]);
  const [achievements, setAchievements] = useState<
    Record<number, SteamAchievements>
  >({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  function begin() {
    controller.current?.abort();
    controller.current = new AbortController();
    setBusy(true);
    setMessage("");
    setError("");
    return controller.current.signal;
  }
  async function load(event: FormEvent) {
    event.preventDefault();
    let url: string;
    try {
      url = parseSteamProfile(profile).url;
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    const signal = begin();
    try {
      const data = await steamLibrary(url, signal);
      if (signal.aborted) return;
      if (!onUpdate({ ...collection, steamProfile: data.profile }))
        throw new Error(
          "Le profil n’a pas pu être sauvegardé. Votre collection a été conservée.",
        );
      setLibrary(data);
      setSelected([]);
      setAchievements({});
      setMessage(
        data.libraryVisible
          ? `${data.games.length} jeux accessibles. Choisissez ceux à accueillir dans le Nexus.`
          : "Le profil ou ses détails de jeux sont privés. Rendez-les publics dans les paramètres de confidentialité Steam pour afficher la bibliothèque.",
      );
    } catch (e) {
      if (!signal.aborted) {
        setLibrary(undefined);
        setError((e as Error).message);
      }
    } finally {
      if (!signal.aborted) setBusy(false);
    }
  }
  async function showAchievements(game: SteamLibraryGame) {
    if (!library) return;
    const signal = begin();
    try {
      const data = await steamAchievements(
        library.profile.steamId64,
        game.appId,
        signal,
      );
      if (!signal.aborted) {
        setAchievements((values) => ({ ...values, [game.appId]: data }));
        setMessage(
          data.available
            ? `Succès récupérés pour ${game.name}. Ajoutez ou actualisez ce jeu pour les conserver.`
            : `Les succès de ${game.name} ne sont pas publics ou ce jeu n’en propose pas.`,
        );
      }
    } catch (e) {
      if (!signal.aborted) setError((e as Error).message);
    } finally {
      if (!signal.aborted) setBusy(false);
    }
  }
  async function addSelection(refresh = false) {
    if (!library) return;
    let snapshot = library;
    let games = library.games.filter((g) =>
      refresh
        ? collection.games.some(
            (existing) =>
              existing.steam?.appId === g.appId &&
              existing.steam.steamId64 === library.profile.steamId64,
          )
        : selected.includes(g.appId),
    );
    const signal = begin();
    let next = collection;
    let missingArt = 0;
    try {
      if (refresh) {
        snapshot = await steamLibrary(library.profile.steamId64, signal);
        if (!snapshot.libraryVisible)
          throw new Error(
            "Les détails Steam ne sont plus publics. Les données enregistrées ont été conservées.",
          );
        if (signal.aborted) return;
        setLibrary(snapshot);
        games = snapshot.games.filter((g) =>
          collection.games.some(
            (existing) =>
              existing.steam?.appId === g.appId &&
              existing.steam.steamId64 === snapshot.profile.steamId64,
          ),
        );
      }
      for (const game of games) {
        let image: CatalogArtwork | undefined;
        if (!steamGameMatch(next, game)) {
          try {
            image = (
              await catalogRequest<{ artwork: CatalogArtwork[] }>(
                `steam-artwork?id=${game.appId}`,
                signal,
              )
            ).artwork[0];
          } catch {
            missingArt++;
          }
        }
        if (signal.aborted) return;
        next = mergeSteamGame(
          next,
          snapshot,
          game,
          categoryId,
          image,
          achievements[game.appId],
        );
      }
      if (!onUpdate(next))
        throw new Error(
          "Sauvegarde impossible. La sélection n’a pas été appliquée.",
        );
      setSelected([]);
      setMessage(
        `${games.length} ${games.length === 1 ? "jeu" : "jeux"} ${refresh ? (games.length === 1 ? "actualisé" : "actualisés") : games.length === 1 ? "ajouté ou associé" : "ajoutés ou associés"}. Vos catégories, statuts et notes ont été conservés.${missingArt ? " Certaines jaquettes sont indisponibles ; les décors restent visibles." : ""}`,
      );
    } catch (e) {
      if (!signal.aborted) setError((e as Error).message);
    } finally {
      if (!signal.aborted) setBusy(false);
    }
  }
  const filtered =
    library?.games.filter((g) =>
      g.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
    ) ?? [];
  return (
    <Modal title="Ma bibliothèque Steam" onClose={onClose}>
      <p className="muted steam-intro">
        Vos aventures Steam, à votre rythme. Seules les informations publiques
        sont accessibles ; aucun mot de passe n’est demandé.
      </p>
      <form className="form" onSubmit={load}>
        <label>
          Profil Steam ou SteamID64
          <input
            autoFocus
            maxLength={200}
            required
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="https://steamcommunity.com/id/…"
          />
        </label>
        <button type="submit" className="primary" disabled={busy}>
          {busy ? "Connexion en cours…" : "Charger la bibliothèque"}
        </button>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p role="status" className="steam-message">
        {message}
      </p>
      {library && (
        <div className="steam-library">
          <div className="steam-profile">
            <strong>{library.profile.displayName}</strong>
            <a
              href={library.profile.profileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Voir le profil public ↗
            </a>
            <small>
              Consulté le{" "}
              {new Date(library.profile.lastSyncedAt).toLocaleString("fr-FR")}
            </small>
          </div>
          {library.libraryVisible && (
            <>
              <label className="steam-search">
                Rechercher dans la bibliothèque
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <div className="steam-games">
                {filtered.slice(0, 100).map((game) => {
                  const old = steamGameMatch(collection, game);
                  const stats = achievements[game.appId];
                  return (
                    <div className="steam-game" key={game.appId}>
                      <label>
                        <input
                          type="checkbox"
                          disabled={
                            busy ||
                            (!selected.includes(game.appId) &&
                              selected.length >= 10)
                          }
                          checked={selected.includes(game.appId)}
                          onChange={(e) =>
                            setSelected((values) =>
                              e.target.checked
                                ? [...values, game.appId]
                                : values.filter((id) => id !== game.appId),
                            )
                          }
                        />
                        <span>
                          <strong>{game.name}</strong>
                          <small>
                            {game.playtimeMinutes === undefined
                              ? "Heures non publiques"
                              : `${(game.playtimeMinutes / 60).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} h jouées`}
                            {old ? " · Déjà dans le Nexus" : ""}
                          </small>
                          {stats && (
                            <small>
                              {stats.available
                                ? `${stats.unlocked}/${stats.total} succès`
                                : "Succès indisponibles"}
                            </small>
                          )}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="catalog-toggle"
                        disabled={busy}
                        onClick={() => void showAchievements(game)}
                      >
                        Voir les succès
                      </button>
                    </div>
                  );
                })}
              </div>
              {!filtered.length && <p>Aucun jeu ne correspond.</p>}
              {filtered.length > 100 && (
                <p className="muted">
                  100 jeux affichés. Précisez la recherche pour trouver les
                  autres.
                </p>
              )}
              <label className="steam-search">
                Catégorie des nouveaux jeux
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {collection.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <p className="muted">
                Jusqu’à 10 jeux par sélection. Les jeux déjà présents gardent
                leur organisation personnelle.
              </p>
              <div className="modal-actions">
                <button
                  className="secondary"
                  disabled={
                    busy ||
                    !collection.games.some(
                      (g) => g.steam?.steamId64 === library.profile.steamId64,
                    )
                  }
                  onClick={() => void addSelection(true)}
                >
                  Actualiser les jeux liés
                </button>
                <button
                  className="primary"
                  disabled={busy || !selected.length || !categoryId}
                  onClick={() => void addSelection()}
                >
                  Ajouter / associer {selected.length} jeu
                  {selected.length === 1 ? "" : "x"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
}
