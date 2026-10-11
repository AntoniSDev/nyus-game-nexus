import { useState, type FormEvent } from "react";
import { statuses, type Category, type Game } from "../types";
import { validCover } from "../utils/collection";
import { Modal } from "./Modal";
export function GameForm({
  game,
  categories,
  onSave,
  onClose,
}: {
  game?: Game;
  categories: Category[];
  onSave: (game: Game) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Game>(
    game ?? {
      id: crypto.randomUUID(),
      name: "",
      categoryId: categories[0]?.id ?? "",
      status: "Sélectionné",
      coverUrl: "",
      notes: "",
      progress: "",
      waitingReason: "",
      updatedAt: new Date().toISOString(),
    },
  );
  const [error, setError] = useState("");
  function field<K extends keyof Game>(key: K, value: Game[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function submit(e: FormEvent) {
    e.preventDefault();
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
        <label>
          Nom du jeu
          <input
            autoFocus
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
