import { useEffect, useState } from "react";
import type { Collection } from "../types";
import {
  loadCollection,
  saveCollection,
  STORAGE_KEY,
} from "../utils/collection";
export function useCollection() {
  const [initial] = useState(() => {
    try {
      return { data: loadCollection(localStorage), error: "" };
    } catch {
      return {
        data: null,
        error:
          "La sauvegarde locale est inaccessible ou invalide. Elle a été conservée. Importez une sauvegarde valide pour reprendre.",
      };
    }
  });
  const [collection, setCollection] = useState<Collection | null>(initial.data);
  const [error, setError] = useState(initial.error);
  useEffect(() => {
    if (!initial.data) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === null)
        saveCollection(localStorage, initial.data);
    } catch {
      setError(
        "La collection initiale ne peut pas être sauvegardée. Exportez vos données ou autorisez le stockage du navigateur.",
      );
    }
  }, [initial]);
  function update(next: Collection): boolean {
    try {
      saveCollection(localStorage, next);
      setCollection(next);
      setError("");
      return true;
    } catch {
      setError(
        "Sauvegarde impossible. Vérifiez l’espace disponible et les autorisations de stockage de votre navigateur. Vos dernières modifications n’ont pas été enregistrées.",
      );
      return false;
    }
  }
  return { collection, update, error, setError };
}
