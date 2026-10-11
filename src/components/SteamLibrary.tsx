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
import {
  steamLibrary,
  steamAchievements,
  steamAchievementBatch,
} from "../utils/steamClient";
import { catalogRequest } from "../utils/catalogClient";
import { mergeSteamGame, steamGameMatch } from "../utils/steamCollection";
import { synchronizeSteam } from "../utils/steamSync";
import { SteamData } from "./SteamData";
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
  const [library, setLibrary] = useState<Library | undefined>(
    collection.steamLibrary,
  );
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
      const sync = await synchronizeSteam(collection, data, signal);
      if (!onUpdate(sync.collection))
        throw new Error(
          "Le profil n’a pas pu être sauvegardé. Votre collection a été conservée.",
        );
      setLibrary(data);
      setSelected([]);
      setAchievements({});
      setMessage(
        `${data.games.length} jeux accessibles. ${sync.updated} ${sync.updated === 1 ? "jeu lié synchronisé" : "jeux liés synchronisés"}. Choisissez ceux à accueillir dans le Nexus.${sync.failed ? " Certains succès n’ont pas pu être actualisés ; les observations précédentes sont conservées." : ""}`,
      );
    } catch (e) {
      if (!signal.aborted) {
        setError(
          `${(e as Error).message} La bibliothèque et les jeux déjà enregistrés restent disponibles.`,
        );
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
        const old = steamGameMatch(collection, game);
        if (
          old?.steam?.steamId64 === library.profile.steamId64 &&
          !onUpdate(
            mergeSteamGame(
              collection,
              library,
              game,
              old.categoryId,
              undefined,
              data,
            ),
          )
        )
          throw new Error("Les succès n’ont pas pu être sauvegardés.");
        setAchievements((values) => ({ ...values, [game.appId]: data }));
        setMessage(
          data.available
            ? `Succès récupérés pour ${game.name}.${old?.steam?.steamId64 === library.profile.steamId64 ? " Observation sauvegardée." : " Ajoutez ou associez ce jeu pour les conserver."}`
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
    let missingStats = 0;
    let currentAchievements = achievements;
    try {
      if (refresh) {
        snapshot = await steamLibrary(library.profile.steamId64, signal);
        const sync = await synchronizeSteam(collection, snapshot, signal);
        if (!onUpdate(sync.collection))
          throw new Error("La synchronisation n’a pas pu être sauvegardée.");
        setLibrary(snapshot);
        setSelected([]);
        setMessage(
          `${sync.updated} jeux liés synchronisés : heures, activité et succès. Vos notes, statuts et jaquettes sont conservés.${sync.failed ? " Certains succès sont temporairement indisponibles ; leurs dernières observations sont conservées." : ""}`,
        );
        return;
      }
      if (games.length) {
        try {
          const stats = await steamAchievementBatch(
            snapshot.profile.steamId64,
            games.map((g) => g.appId),
            signal,
          );
          currentAchievements = { ...achievements, ...stats.results };
          missingStats = stats.failedAppIds.length;
        } catch {
          signal.throwIfAborted();
          missingStats = games.length;
        }
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
          currentAchievements[game.appId],
        );
      }
      if (!onUpdate(next))
        throw new Error(
          "Sauvegarde impossible. La sélection n’a pas été appliquée.",
        );
      setSelected([]);
      setMessage(
        `${games.length} ${games.length === 1 ? "jeu ajouté ou associé" : "jeux ajoutés ou associés"}. Vos catégories, statuts et notes ont été conservés.${missingArt ? " Certaines jaquettes sont indisponibles ; les décors restent visibles." : ""}${missingStats ? " Certains succès restent à consulter." : ""}`,
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
            disabled={busy}
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            placeholder="https://steamcommunity.com/id/…"
          />
        </label>
        <button type="submit" className="primary" disabled={busy}>
          {busy
            ? "Synchronisation en cours…"
            : collection.steamProfile
              ? "Synchroniser ma bibliothèque"
              : "Charger la bibliothèque"}
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
              Bibliothèque synchronisée le{" "}
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
                  const linked =
                    old?.steam?.steamId64 === library.profile.steamId64
                      ? old.steam
                      : undefined;
                  const observation = stats
                    ? {
                        ...(stats.available &&
                        stats.unlocked !== undefined &&
                        stats.total !== undefined
                          ? {
                              achievements: {
                                unlocked: stats.unlocked,
                                total: stats.total,
                              },
                              achievementsSyncedAt: stats.lastSyncedAt,
                            }
                          : {}),
                        achievementsAvailable: stats.available,
                      }
                    : linked;
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
                            {old ? "Déjà dans le Nexus" : "Possédé sur Steam"}
                          </small>
                        </span>
                      </label>
                      <SteamData
                        compact
                        steam={{
                          ...observation,
                          appId: game.appId,
                          playtimeMinutes: game.playtimeMinutes,
                          playtimeTwoWeeksMinutes: game.playtimeTwoWeeksMinutes,
                          lastPlayedAt: game.lastPlayedAt,
                        }}
                      />
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
