import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import type { Collection } from "../types";
import { removeCategory } from "../utils/collection";
import { Modal } from "./Modal";
export function Categories({
  collection,
  onUpdate,
  onClose,
}: {
  collection: Collection;
  onUpdate: (next: Collection) => boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (
      collection.categories.some(
        (c) =>
          c.id !== editing &&
          c.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
      )
    ) {
      setError("Cette catégorie existe déjà.");
      return;
    }
    if (
      onUpdate({
        ...collection,
        categories: editing
          ? collection.categories.map((c) =>
              c.id === editing ? { ...c, name: trimmed } : c,
            )
          : [
              ...collection.categories,
              { id: crypto.randomUUID(), name: trimmed },
            ],
      })
    ) {
      setEditing(null);
      setName("");
      setError("");
    }
  }
  return (
    <Modal title="Vos catégories" onClose={onClose}>
      <p className="muted">
        Un genre, un jeu principal. Les candidats et les jeux en attente ont
        aussi leur place.
      </p>
      <form
        className="category-form"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          aria-label="Nom de la catégorie"
          autoFocus
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom de la catégorie"
        />
        <button
          className="primary"
          aria-label={editing ? "Renommer" : "Créer la catégorie"}
        >
          {editing ? <Pencil size={18} /> : <Plus size={18} />}
        </button>
        {editing && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setEditing(null);
              setName("");
            }}
          >
            Annuler
          </button>
        )}
      </form>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="category-list">
        {collection.categories.map((c) => (
          <div key={c.id}>
            <span>
              {c.name}
              <small>
                {collection.games.filter((g) => g.categoryId === c.id).length}{" "}
                jeu(x)
              </small>
            </span>
            <button
              className="icon-button"
              aria-label={`Renommer ${c.name}`}
              onClick={() => {
                setEditing(c.id);
                setName(c.name);
              }}
            >
              <Pencil size={16} />
            </button>
            <button
              className="icon-button danger"
              aria-label={`Supprimer ${c.name}`}
              onClick={() => {
                try {
                  const next = removeCategory(collection, c.id);
                  if (
                    window.confirm(`Supprimer la catégorie « ${c.name} » ?`)
                  ) {
                    onUpdate(next);
                    if (editing === c.id) {
                      setEditing(null);
                      setName("");
                    }
                  }
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
