import { useState, type FormEvent } from "react";
import { statuses, type Category, type Game, type Collection } from "../types";
import { validCover } from "../utils/collection";
import { Modal } from "./Modal";
import { CatalogPicker } from "./CatalogPicker";
import type { CatalogArtwork, CatalogGame } from "../types/catalog";
import { SteamGamePicker } from "./SteamGamePicker";
import type { SteamLibrary } from "../types/steam";
export function GameForm({
  game,
  categories,
  games,
  initialCategoryId,
  collection,
  onLibrary,
  onConnectSteam,
  onEditExisting,
  onSave,
  onClose,
}: {
  game?: Game;
  categories: Category[];
  games: Game[];
  initialCategoryId?: string;
  collection: Collection;
  onLibrary: (library: SteamLibrary) => boolean;
  onConnectSteam: () => void;
  onEditExisting: (game: Game) => void;
  onSave: (game: Game) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Game>(
    game ?? {
      id: crypto.randomUUID(),
      name: "",
      categoryId: initialCategoryId ?? categories[0]?.id ?? "",
      status: "Sélectionné",
      coverUrl: "",
      notes: "",
      progress: "",
      waitingReason: "",
      updatedAt: new Date().toISOString(),
    },
  );
  const [error, setError] = useState("");
  const [source, setSource] = useState<"steam" | "catalog">(
    game && !game.steam ? "catalog" : "steam",
  );
  function field<K extends keyof Game>(key: K, value: Game[K]) {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "name" && value !== d.name) {
        delete next.catalog;
        delete next.steam;
      }
      if (key === "coverUrl" && value !== d.coverUrl) delete next.coverCredit;
      return next;
    });
  }
  function selectGame(item: CatalogGame) {
    setDraft((d) => {
      const next = {
        ...d,
        name: item.name,
        catalog: { provider: "steamgriddb" as const, id: item.id },
        coverUrl: item.artwork?.url ?? "",
      };
      if (
        d.catalog?.id !== item.id &&
        d.name.trim().toLocaleLowerCase() !==
          item.name.trim().toLocaleLowerCase()
      )
        delete next.steam;
      if (item.artwork)
        next.coverCredit = {
          provider: "steamgriddb",
          id: item.artwork.id,
          author: item.artwork.author,
        };
      else delete next.coverCredit;
      return next;
    });
  }
  function selectArtwork(
    image: CatalogArtwork,
    automatic = false,
    gameId?: number,
  ) {
    setDraft((d) =>
      automatic && (d.coverUrl || d.catalog?.id !== gameId)
        ? d
        : {
            ...d,
            coverUrl: image.url,
            coverCredit: {
              provider: "steamgriddb",
              id: image.id,
              author: image.author,
            },
          },
    );
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    if (
      draft.steam &&
      games.some(
        (g) => g.id !== draft.id && g.steam?.appId === draft.steam?.appId,
      )
    ) {
      setError(
        "Ce jeu Steam est déjà dans votre collection. Modifiez sa carte existante.",
      );
      return;
    }
    if (
      draft.catalog &&
      games.some(
        (g) =>
          g.id !== draft.id &&
          (g.catalog?.id === draft.catalog?.id ||
            g.name.trim().toLocaleLowerCase() ===
              draft.name.trim().toLocaleLowerCase()),
      )
    ) {
      setError(
        "Ce jeu est déjà dans votre collection. Modifiez sa carte existante.",
      );
      return;
    }
    if (
      !draft.name.trim() ||
      !draft.categoryId ||
      !validCover(draft.coverUrl.trim())
    ) {
      setError(
        "Renseignez un nom, une catégorie et une URL http(s) valide si nécessaire.",
      );
      return;
    }
    onSave({
      ...draft,
      name: draft.name.trim(),
      coverUrl: draft.coverUrl.trim(),
      updatedAt: new Date().toISOString(),
    });
  }
  return (
    <Modal
      title={game ? "Modifier le jeu" : "Un nouveau jeu dans le Nexus"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="form">
        <div className="game-source">
          <strong>Choisir parmi mes mondes</strong>
          <div
            className="source-tabs"
            role="group"
            aria-label="Source de recherche"
          >
            <button
              type="button"
              aria-pressed={source === "steam"}
              onClick={() => setSource("steam")}
            >
              Ma bibliothèque Steam
            </button>
            <button
              type="button"
              aria-pressed={source === "catalog"}
              onClick={() => setSource("catalog")}
            >
              Catalogue externe / manuel
            </button>
          </div>
        </div>
        {source === "steam" ? (
          <SteamGamePicker
            key={collection.steamProfile?.steamId64 ?? "none"}
            collection={collection}
            draft={draft}
            onSelect={(selected) =>
              setDraft((current) => ({
                ...current,
                name: selected.name,
                steam: selected.steam,
                coverUrl: selected.coverUrl,
                catalog: selected.catalog,
                coverCredit: selected.coverCredit,
              }))
            }
            onLibrary={onLibrary}
            onConnect={onConnectSteam}
            onEditExisting={onEditExisting}
          />
        ) : (
          <CatalogPicker
            ownedGames={collection.steamLibrary?.games}
            draft={draft}
            games={games}
            onSelect={selectGame}
            onArtwork={selectArtwork}
            onEditExisting={onEditExisting}
          />
        )}
        <label>
          Nom du jeu
          <input
            autoFocus={Boolean(game)}
            required
            maxLength={160}
            value={draft.name}
            onChange={(e) => field("name", e.target.value)}
            placeholder="Quel sera votre prochain univers ?"
          />
        </label>
        <div className="form-row">
          <label>
            Catégorie
            <select
              aria-label="Catégorie"
              required
              value={draft.categoryId}
              onChange={(e) => field("categoryId", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Statut
            <select
              aria-label="Statut"
              value={draft.status}
              onChange={(e) =>
                field("status", e.target.value as Game["status"])
              }
            >
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          URL de la jaquette <span>facultatif</span>
          <input
            type="url"
            maxLength={2048}
            value={draft.coverUrl}
            onChange={(e) => field("coverUrl", e.target.value)}
            placeholder="https://…"
          />
        </label>
        <label>
          Progression <span>texte libre</span>
          <input
            maxLength={10000}
            value={draft.progress}
            onChange={(e) => field("progress", e.target.value)}
            placeholder="Chapitre, objectif, prochaine étape…"
          />
        </label>
        <label>
          Précision sur l’attente
          <input
            maxLength={10000}
            value={draft.waitingReason}
            onChange={(e) => field("waitingReason", e.target.value)}
            placeholder="Par exemple : en attente de tous les DLC"
          />
        </label>
        <label>
          Notes personnelles
          <textarea
            maxLength={10000}
            rows={3}
            value={draft.notes}
            onChange={(e) => field("notes", e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" type="submit">
            Enregistrer le jeu
          </button>
        </div>
      </form>
    </Modal>
  );
}
