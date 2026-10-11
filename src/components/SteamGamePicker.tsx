import { useEffect, useId, useRef, useState } from "react";
import type { Collection, Game } from "../types";
import type { SteamLibrary, SteamLibraryGame } from "../types/steam";
import { steamLibrary, steamAchievements } from "../utils/steamClient";
import { catalogRequest } from "../utils/catalogClient";
import { steamGameMetadata } from "../utils/steamCollection";
import type { CatalogArtwork } from "../types/catalog";
import { SteamData, steamHours } from "./SteamData";
export function SteamGamePicker({
  collection,
  draft,
  onSelect,
  onLibrary,
  onConnect,
}: {
  collection: Collection;
  draft: Game;
  onSelect: (game: Game) => void;
  onLibrary: (library: SteamLibrary) => boolean;
  onConnect: () => void;
}) {
  const [library, setLibrary] = useState(collection.steamLibrary);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const id = useId();
  const controller = useRef<AbortController | null>(null);
  const saveLibrary = useRef(onLibrary);
  saveLibrary.current = onLibrary;
  const profile = collection.steamProfile;
  useEffect(() => {
    if (!profile || library) return;
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setMessage("");
    steamLibrary(profile.steamId64, abort.signal)
      .then((data) => {
        if (abort.signal.aborted) return;
        if (!data.libraryVisible)
          throw new Error(
            "Vos détails de jeux Steam sont privés. Le catalogue externe reste disponible.",
          );
        if (!saveLibrary.current(data))
          throw new Error("La bibliothèque n’a pas pu être sauvegardée.");
        setLibrary(data);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setMessage((e as Error).message);
      })
      .finally(() => {
        if (!abort.signal.aborted) setBusy(false);
      });
    return () => abort.abort();
  }, [profile?.steamId64, library, retry]);
  useEffect(() => () => controller.current?.abort(), []);
  const results = query.trim()
    ? (library?.games
        .filter((g) =>
          g.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
        )
        .slice(0, 8) ?? [])
    : [];
  const duplicate = (g: SteamLibraryGame) =>
    collection.games.some(
      (existing) =>
        existing.id !== draft.id &&
        (existing.steam?.appId === g.appId ||
          existing.name.trim().toLocaleLowerCase() ===
            g.name.trim().toLocaleLowerCase()),
    );
  async function choose(game: SteamLibraryGame) {
    if (!library || busy || duplicate(game)) return;
    const abort = new AbortController();
    controller.current?.abort();
    controller.current = abort;
    setBusy(true);
    setMessage("");
    const sameGame =
      draft.steam?.appId === game.appId ||
      draft.name.trim().toLocaleLowerCase() ===
        game.name.trim().toLocaleLowerCase();
    let artwork: CatalogArtwork | undefined;
    let stats;
    const warnings: string[] = [];
    try {
      const responses = await Promise.allSettled([
        sameGame && draft.coverUrl
          ? Promise.resolve(undefined)
          : catalogRequest<{ artwork: CatalogArtwork[] }>(
              `steam-artwork?id=${game.appId}`,
              abort.signal,
            ),
        steamAchievements(library.profile.steamId64, game.appId, abort.signal),
      ]);
      if (abort.signal.aborted) return;
      if (responses[0].status === "fulfilled")
        artwork = responses[0].value?.artwork[0];
      else warnings.push("Jaquette indisponible : le décor reste visible.");
      if (responses[1].status === "fulfilled") stats = responses[1].value;
      else
        warnings.push(
          "Succès non récupérés. Vous pourrez réessayer dans la bibliothèque.",
        );
      const next: Game = {
        ...draft,
        name: game.name,
        steam: steamGameMetadata(
          library,
          game,
          sameGame ? draft.steam : undefined,
          stats,
        ),
        coverUrl:
          sameGame && draft.coverUrl ? draft.coverUrl : (artwork?.url ?? ""),
      };
      if (!sameGame) {
        delete next.catalog;
        delete next.coverCredit;
      }
      if (artwork && !(sameGame && draft.coverUrl))
        next.coverCredit = {
          provider: "steamgriddb",
          id: artwork.id,
          author: artwork.author,
        };
      onSelect(next);
      setQuery("");
      setActive(-1);
      setMessage(warnings.join(" "));
    } catch (e) {
      if (!abort.signal.aborted) setMessage((e as Error).message);
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  return (
    <section
      className="steam-picker"
      aria-label="Recherche dans ma bibliothèque Steam"
    >
      {!profile ? (
        <>
          <p>
            Vos prochaines aventures sont déjà dans votre bibliothèque. Reliez
            votre profil Steam public pour les retrouver ici.
          </p>
          <button type="button" className="primary" onClick={onConnect}>
            Relier mon profil Steam ↗
          </button>
        </>
      ) : (
        <>
          <p>
            {library
              ? `${library.games.length} jeux de ${library.profile.displayName} · bibliothèque synchronisée le ${new Date(library.profile.lastSyncedAt).toLocaleDateString("fr-FR")}`
              : "Chargement de votre bibliothèque Steam…"}
          </p>
          <label htmlFor={`${id}-search`}>
            Rechercher dans ma bibliothèque Steam
          </label>
          <input
            id={`${id}-search`}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={!!results.length}
            aria-controls={`${id}-results`}
            aria-activedescendant={active >= 0 ? `${id}-${active}` : undefined}
            autoFocus={!draft.name}
            disabled={!library || busy}
            value={query}
            maxLength={160}
            placeholder="Un jeu de votre collection Steam…"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
            }}
            onKeyDown={(e) => {
              if (
                (e.key === "ArrowDown" || e.key === "ArrowUp") &&
                results.length
              ) {
                e.preventDefault();
                setActive(
                  (i) =>
                    (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) %
                    results.length,
                );
              } else if (e.key === "Enter") {
                e.preventDefault();
                if (active >= 0) void choose(results[active]);
              } else if (e.key === "Escape" && query) {
                e.stopPropagation();
                setQuery("");
                setActive(-1);
              }
            }}
          />
          {!!results.length && (
            <div
              id={`${id}-results`}
              role="listbox"
              aria-label="Mes jeux Steam"
              className="steam-picker-results"
            >
              {results.map((g, i) => (
                <button
                  key={g.appId}
                  id={`${id}-${i}`}
                  type="button"
                  role="option"
                  aria-selected={active === i}
                  disabled={busy || duplicate(g)}
                  onClick={() => void choose(g)}
                >
                  <span>
                    <strong>{g.name}</strong>
                    <small>
                      {steamHours(g.playtimeMinutes)} ·{" "}
                      {duplicate(g)
                        ? "Déjà dans le Nexus"
                        : "Possédé sur Steam"}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          )}
          {library && query.trim() && !results.length && (
            <p>
              Aucun jeu de votre bibliothèque ne correspond. Essayez le
              catalogue externe pour un autre jeu.
            </p>
          )}
          {draft.steam && (
            <div className="steam-picker-selection">
              <strong>{draft.name}</strong>
              <SteamData steam={draft.steam} compact />
            </div>
          )}
        </>
      )}
      <p role="status">{busy ? "Récupération des données Steam…" : message}</p>
      {profile && !library && !busy && (
        <button
          type="button"
          className="secondary"
          onClick={() => setRetry((r) => r + 1)}
        >
          Réessayer la bibliothèque
        </button>
      )}
    </section>
  );
}
