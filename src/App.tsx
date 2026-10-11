import { useRef, useState } from "react";
import {
  Download,
  FolderHeart,
  Gamepad2,
  MoonStar,
  Heart,
  Upload,
} from "lucide-react";
import { useCollection } from "./hooks/useCollection";
import { GameForm } from "./components/GameForm";
import { Categories } from "./components/Categories";
import { Modal } from "./components/Modal";
import { Dashboard } from "./sections/Dashboard";
import { upsertGame, validateCollection } from "./utils/collection";
import type { Collection, Game } from "./types";
import { FamiliarMark } from "./components/SanctuaryArt";
export default function App() {
  const { collection, update, error, setError } = useCollection();
  const [form, setForm] = useState<Game | "new" | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<Collection | null>(null);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  function add() {
    if (!collection?.categories.length) {
      setCategoriesOpen(true);
      setNotice("Créez une catégorie avant d’ajouter votre premier jeu.");
    } else setForm("new");
  }
  function exportJSON() {
    if (!collection) return;
    const blob = new Blob([JSON.stringify(collection, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nyus-game-nexus-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Votre collection a été exportée.");
  }
  async function importJSON(file: File) {
    try {
      if (file.size > 10 * 1024 * 1024)
        throw new Error("La taille maximale est de 10 Mo.");
      setPendingImport(validateCollection(JSON.parse(await file.text())));
    } catch (e) {
      setError(`Import refusé : ${(e as Error).message}`);
    }
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Nyu’s Game Nexus, accueil">
          <div className="brand-icon">
            <FamiliarMark />
          </div>
          <span>
            Nyu’s<span className="brand-sub">GAME NEXUS</span>
          </span>
        </a>
        <div className="brand-tagline">a little magic, a lot of games.</div>
        <div className="sidebar-label">✧ VOTRE PETIT UNIVERS</div>
        <nav aria-label="Navigation principale">
          <a className="nav-item active" href="#">
            <MoonStar size={19} /> Mon sanctuaire{" "}
            <span className="nav-dot">✦</span>
          </a>
          <a className="nav-item" href="#collection">
            <Gamepad2 size={19} /> Mes petits mondes
          </a>
          <button
            className="nav-item"
            onClick={() => setCategoriesOpen(true)}
            disabled={!collection}
          >
            <FolderHeart size={19} /> Catégories
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="philosophy">
            <span className="philosophy-moon" aria-hidden="true">
              <MoonStar size={27} />
              <span>✧</span>
            </span>
            <strong>
              Pas de course.
              <br />
              Juste des aventures.
            </strong>
            <p>
              Installez-vous, respirez.
              <br />
              Votre prochain monde vous attend.
            </p>
          </div>
          <span className="version">
            NYU’S NEXUS <span>✧ MADE WITH LOVE</span>
          </span>
        </div>
      </aside>
      <div className="main-wrapper">
        <header className="topbar">
          <div className="breadcrumb">
            <MoonStar size={16} /> Votre Nexus <span>✧</span>{" "}
            <strong>Mon sanctuaire</strong>
          </div>
          <div className="backup-actions">
            <button
              className="text-button"
              onClick={exportJSON}
              disabled={!collection}
            >
              <Download size={16} />
              <span>Exporter</span>
            </button>
            <button
              className="text-button"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={16} />
              <span>Importer</span>
            </button>
            <div className="avatar" aria-label="Collection personnelle">
              <Heart size={15} />
            </div>
          </div>
          <input
            className="sr-only"
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            aria-label="Importer une sauvegarde JSON"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void importJSON(file);
            }}
          />
        </header>
        <main>
          {error && (
            <div className="alert error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="alert notice" role="status">
              {notice}
              <button
                className="text-button"
                onClick={() => setNotice("")}
                aria-label="Fermer la notification"
              >
                ×
              </button>
            </div>
          )}
          {collection ? (
            <Dashboard
              collection={collection}
              onAdd={add}
              onEdit={setForm}
              onCategories={() => setCategoriesOpen(true)}
              onDelete={(g) => {
                if (
                  window.confirm(
                    `Supprimer « ${g.name} » de votre collection ? Cette action est définitive.`,
                  )
                )
                  update({
                    ...collection,
                    games: collection.games.filter((game) => game.id !== g.id),
                  });
              }}
              onStatus={(g, status) =>
                update(
                  upsertGame(collection, {
                    ...g,
                    status,
                    updatedAt: new Date().toISOString(),
                  }),
                )
              }
            />
          ) : (
            <div className="empty">
              <h1>Votre sauvegarde a besoin d’attention</h1>
              <p>
                Les données présentes n’ont pas été écrasées. Vous pouvez
                restaurer un export JSON.
              </p>
              <button
                className="primary"
                onClick={() => fileRef.current?.click()}
              >
                Importer une sauvegarde
              </button>
            </div>
          )}
          <footer>
            <span>
              <span className="local-dot" /> Vos données restent dans ce
              navigateur
            </span>
            <span>Un peu de magie. Beaucoup de petits bonheurs. ✧</span>
          </footer>
        </main>
      </div>
      {form && collection && (
        <GameForm
          game={form === "new" ? undefined : form}
          categories={collection.categories}
          onClose={() => setForm(null)}
          onSave={(g) => {
            try {
              if (update(upsertGame(collection, g))) setForm(null);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      )}
      {categoriesOpen && collection && (
        <Categories
          collection={collection}
          onUpdate={update}
          onClose={() => setCategoriesOpen(false)}
        />
      )}
      {pendingImport && (
        <Modal
          title="Remplacer votre collection ?"
          onClose={() => setPendingImport(null)}
        >
          <p>
            Cette sauvegarde contient{" "}
            <strong>{pendingImport.games.length} jeux</strong> et{" "}
            <strong>{pendingImport.categories.length} catégories</strong>.
            L’import remplacera intégralement la collection de ce navigateur.
          </p>
          <p className="muted">
            Exportez votre collection actuelle si vous souhaitez la conserver.
          </p>
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => setPendingImport(null)}
            >
              Annuler
            </button>
            {collection && (
              <button className="secondary" onClick={exportJSON}>
                Exporter d’abord
              </button>
            )}
            <button
              className="primary"
              onClick={() => {
                if (update(pendingImport)) {
                  setPendingImport(null);
                  setNotice("Collection importée et sauvegardée.");
                }
              }}
            >
              Confirmer le remplacement
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
