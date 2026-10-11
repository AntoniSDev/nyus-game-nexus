import { useEffect, useId, useState } from "react";
import type { CatalogArtwork, CatalogGame } from "../types/catalog";
import type { Game } from "../types";
import type { SteamLibraryGame } from "../types/steam";
import { catalogArtwork, searchCatalog } from "../utils/catalogClient";

function CatalogImage({ url, name }: { url?: string; name: string }) {
  const [failed, setFailed] = useState("");
  return url && failed !== url ? (
    <img
      src={url}
      alt={name}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(url)}
    />
  ) : (
    <span className="catalog-placeholder" aria-hidden="true">
      ✧
    </span>
  );
}
export function CatalogPicker({
  draft,
  games,
  onSelect,
  onArtwork,
  onEditExisting,
  ownedGames,
}: {
  draft: Game;
  games: Game[];
  onSelect: (game: CatalogGame) => void;
  onEditExisting: (game: Game) => void;
  ownedGames?: SteamLibraryGame[];
  onArtwork: (
    image: CatalogArtwork,
    automatic?: boolean,
    gameId?: number,
  ) => void;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState(false);
  const [results, setResults] = useState<CatalogGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [active, setActive] = useState(-1);
  const [images, setImages] = useState<CatalogArtwork[]>([]);
  const [artLoading, setArtLoading] = useState(false);
  const [artMessage, setArtMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const [artRetry, setArtRetry] = useState(0);
  const selectedId = draft.catalog?.id;
  useEffect(() => {
    const controller = new AbortController();
    setResults([]);
    setActive(-1);
    setMessage("");
    if (manual || query.trim().length < 2) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      searchCatalog(
        query.trim(),
        controller.signal,
        ownedGames
          ?.filter((g) =>
            g.name
              .toLocaleLowerCase()
              .includes(query.trim().toLocaleLowerCase()),
          )
          .slice(0, 10)
          .map((g) => g.appId),
      )
        .then((data) => {
          if (controller.signal.aborted) return;
          setResults(data.games);
          if (!data.games.length)
            setMessage(
              "Aucun jeu trouvé. Essayez un autre nom ou l’ajout manuel.",
            );
        })
        .catch((error) => {
          if (!controller.signal.aborted)
            setMessage(
              error instanceof Error
                ? error.message
                : "Recherche indisponible.",
            );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 400);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, manual, retry, ownedGames]);
  useEffect(() => {
    const controller = new AbortController();
    setImages([]);
    setArtMessage("");
    if (!selectedId) {
      setArtLoading(false);
      return;
    }
    setArtLoading(true);
    catalogArtwork(selectedId, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return;
        setImages(data.artwork);
        if (data.artwork[0]) onArtwork(data.artwork[0], true, selectedId);
        else
          setArtMessage(
            "Pas de jaquette disponible. Votre monde illustré reste là ; vous pouvez aussi saisir une URL.",
          );
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setArtMessage(
            error instanceof Error ? error.message : "Jaquettes indisponibles.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setArtLoading(false);
      });
    return () => controller.abort();
    // onArtwork uses a functional draft update; changing personal fields must not refetch.
  }, [selectedId, artRetry]);
  const duplicate = (item: CatalogGame) =>
    games.find(
      (g) =>
        g.id !== draft.id &&
        (g.catalog?.id === item.id ||
          g.name.trim().toLocaleLowerCase() ===
            item.name.trim().toLocaleLowerCase()),
    );
  function choose(item: CatalogGame) {
    const existing = duplicate(item);
    if (existing) {
      onEditExisting(existing);
      return;
    }
    onSelect(item);
    setQuery("");
    setResults([]);
    setActive(-1);
    setMessage("");
  }
  return (
    <section className="catalog-picker" aria-label="Catalogue de jeux">
      {draft.name && !draft.catalog && (
        <button
          type="button"
          className="catalog-toggle"
          onClick={() => {
            setManual(false);
            setQuery(draft.name);
          }}
        >
          Trouver une jaquette pour {draft.name}
        </button>
      )}
      <div className="catalog-heading">
        <strong>✧ Trouver votre prochain monde</strong>
        <button
          type="button"
          className="catalog-toggle"
          onClick={() => setManual((value) => !value)}
        >
          {manual ? "Rechercher dans le catalogue" : "Ajouter manuellement"}
        </button>
      </div>
      {!manual && (
        <>
          <label htmlFor={`${listId}-input`}>
            Rechercher dans le catalogue
          </label>
          <input
            id={`${listId}-input`}
            autoFocus={!draft.name}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={
              active >= 0 ? `${listId}-${active}` : undefined
            }
            aria-describedby={`${listId}-status`}
            maxLength={160}
            placeholder="Valheim, Stardew Valley…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (
                (event.key === "ArrowDown" || event.key === "ArrowUp") &&
                results.length
              ) {
                event.preventDefault();
                setActive((index) =>
                  event.key === "ArrowDown"
                    ? (index + 1) % results.length
                    : index <= 0
                      ? results.length - 1
                      : index - 1,
                );
              }
              if (event.key === "Enter") {
                event.preventDefault();
                if (active >= 0 && results[active]) choose(results[active]);
              }
              if (event.key === "Escape" && results.length) {
                event.preventDefault();
                event.stopPropagation();
                setQuery("");
              }
            }}
          />
          <p id={`${listId}-status`} className="catalog-message" role="status">
            {loading
              ? "À la recherche de votre univers…"
              : message ||
                "Deux caractères suffisent. Choisissez un jeu, puis son petit monde."}
          </p>
          {message && !loading && (
            <button
              type="button"
              className="catalog-toggle"
              onClick={() => setRetry((value) => value + 1)}
            >
              Réessayer la recherche
            </button>
          )}
          <div
            id={listId}
            role="listbox"
            aria-label="Résultats du catalogue"
            className="catalog-results"
          >
            {results.map((item, index) => (
              <button
                key={item.id}
                id={`${listId}-${index}`}
                type="button"
                role="option"
                aria-selected={active === index}
                className={active === index ? "active" : ""}
                onClick={() => choose(item)}
              >
                <CatalogImage
                  url={item.artwork?.thumbnail}
                  name={`Aperçu de ${item.name}`}
                />
                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {duplicate(item)
                      ? "Déjà dans mon Nexus · Modifier la carte"
                      : item.releaseYear || "SteamGridDB"}
                    {!duplicate(item) &&
                    item.steamAppId !== undefined &&
                    ownedGames?.some((g) => g.appId === item.steamAppId)
                      ? " · Possédé sur Steam"
                      : ""}
                  </small>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
      {selectedId && (
        <div className="catalog-selected">
          <div className="catalog-selection">
            <CatalogImage
              url={draft.coverUrl}
              name={`Jaquette de ${draft.name}`}
            />
            <span>
              <strong>{draft.name}</strong>
              <a
                href={`https://www.steamgriddb.com/game/${selectedId}`}
                target="_blank"
                rel="noreferrer"
              >
                Voir sur SteamGridDB ↗
              </a>
            </span>
          </div>
          <p className="catalog-message" role="status">
            {artLoading
              ? "Les jaquettes arrivent…"
              : artMessage || "Choisissez la jaquette qui vous plaît."}
          </p>
          {artMessage && (
            <button
              type="button"
              className="catalog-toggle"
              onClick={() => setArtRetry((value) => value + 1)}
            >
              Recharger les jaquettes
            </button>
          )}
          <div className="artwork-options" aria-label="Choisir une jaquette">
            {images.map((image) => (
              <button
                type="button"
                key={image.id}
                aria-label={`Jaquette par ${image.author}, ${image.id}`}
                aria-pressed={draft.coverUrl === image.url}
                onClick={() => onArtwork(image)}
              >
                <CatalogImage
                  url={image.thumbnail}
                  name={`Illustration par ${image.author}`}
                />
              </button>
            ))}
          </div>
          {draft.coverCredit && (
            <a
              className="cover-credit"
              href={`https://www.steamgriddb.com/grid/${draft.coverCredit.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Illustration par {draft.coverCredit.author} · SteamGridDB ↗
            </a>
          )}
        </div>
      )}
      <p className="catalog-credit">
        Catalogue et illustrations :{" "}
        <a href="https://www.steamgriddb.com" target="_blank" rel="noreferrer">
          SteamGridDB
        </a>
        , créés par sa communauté.
      </p>
    </section>
  );
}
