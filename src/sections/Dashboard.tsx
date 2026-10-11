import { useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  Clock3,
  FolderHeart,
  Gamepad2,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { statuses, type Collection, type Game } from "../types";
import { GameCard } from "../components/GameCard";
export function Dashboard({
  collection,
  onAdd,
  onEdit,
  onDelete,
  onStatus,
  onCategories,
}: {
  collection: Collection;
  onAdd: () => void;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
  onStatus: (game: Game, status: Game["status"]) => void;
  onCategories: () => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [category, setCategory] = useState("Toutes");
  const filtered = useMemo(
    () =>
      collection.games.filter(
        (g) =>
          g.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
          (status === "Tous" || g.status === status) &&
          (category === "Toutes" || g.categoryId === category),
      ),
    [collection, search, status, category],
  );
  const stats = [
    {
      label: "Catégories",
      value: collection.categories.length,
      icon: FolderHeart,
      color: "pink",
    },
    {
      label: "Jeux actifs",
      value: collection.games.filter((g) =>
        ["Sélectionné", "En cours", "À poursuivre"].includes(g.status),
      ).length,
      icon: Gamepad2,
      color: "teal",
    },
    {
      label: "Jeux terminés",
      value: collection.games.filter((g) => g.status === "Terminé").length,
      icon: CheckCheck,
      color: "purple",
    },
    {
      label: "En attente",
      value: collection.games.filter((g) => g.status === "En attente").length,
      icon: Clock3,
      color: "amber",
    },
  ];
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span /> VOTRE ESPACE GAMING PERSONNEL
          </div>
          <h1>
            Moins de backlog.
            <br />
            <span>Plus d’aventures.</span>
          </h1>
          <p>
            Un jeu principal par genre. Prenez le temps d’explorer
            <br className="desktop-break" /> les univers qui vous attendent
            déjà.
          </p>
          <button className="primary" onClick={onAdd}>
            <Plus size={18} /> Ajouter un jeu
          </button>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-ring ring-a" />
          <div className="hero-ring ring-b" />
          <div className="hero-ring ring-c" />
          <div className="hero-controller">
            <Gamepad2 size={100} strokeWidth={1} />
          </div>
          <span className="floating-star star-a">✦</span>
          <span className="floating-star star-b">✧</span>
          <div className="hero-tag">✦ Le plaisir de jouer, simplement.</div>
        </div>
      </section>
      <section className="stats" aria-label="Statistiques de la collection">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className={`stat-icon ${s.color}`}>
              <s.icon size={21} />
            </div>
            <div>
              <strong>{s.value.toString().padStart(2, "0")}</strong>
              <span>{s.label}</span>
            </div>
          </div>
        ))}
      </section>
      <section className="collection-section" id="collection">
        <div className="section-title">
          <div>
            <div className="eyebrow">VOS PROCHAINS UNIVERS</div>
            <h2>
              Ma collection <span>{collection.games.length}</span>
            </h2>
          </div>
          <button className="secondary" onClick={onCategories}>
            <SlidersHorizontal size={16} /> Gérer les catégories
          </button>
        </div>
        <div className="filters">
          <div className="search">
            <Search size={18} />
            <input
              aria-label="Rechercher un jeu"
              placeholder="Rechercher un jeu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            aria-label="Filtrer par catégorie"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Toutes">Toutes les catégories</option>
            {collection.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrer par statut"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Tous">Tous les statuts</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="quick-filters">
          {[
            "Tous",
            "Sélectionné",
            "En cours",
            "À poursuivre",
            "En attente",
            "Terminé",
          ].map((s) => (
            <button
              key={s}
              className={status === s ? "selected" : ""}
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
            >
              {status === s && <Check size={12} />}{" "}
              {s === "Tous" ? "Tous les jeux" : s}
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="empty">
            <Gamepad2 size={40} />
            <h3>
              {collection.games.length
                ? "Aucun jeu ne correspond"
                : "Votre prochaine aventure commence ici"}
            </h3>
            <p>
              {collection.games.length
                ? "Essayez un autre nom ou ajustez les filtres."
                : "Ajoutez votre premier jeu à la collection."}
            </p>
            <button
              className="secondary"
              onClick={() => {
                setSearch("");
                setStatus("Tous");
                setCategory("Toutes");
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
        <div className="game-grid">
          {collection.categories
            .filter((c) => filtered.some((g) => g.categoryId === c.id))
            .map((c, i) => (
              <section className="category-group" key={c.id}>
                <div className="category-heading">
                  <span className={`category-dot dot-${i % 4}`} />
                  <h3>{c.name}</h3>
                  <span>
                    {filtered
                      .filter((g) => g.categoryId === c.id)
                      .length.toString()
                      .padStart(2, "0")}
                  </span>
                </div>
                {filtered
                  .filter((g) => g.categoryId === c.id)
                  .map((g) => (
                    <GameCard
                      key={g.id}
                      game={g}
                      index={collection.categories.findIndex(
                        (c) => c.id === g.categoryId,
                      )}
                      onEdit={() => onEdit(g)}
                      onDelete={() => onDelete(g)}
                      onStatus={(s) => onStatus(g, s)}
                    />
                  ))}
              </section>
            ))}
        </div>
      </section>
    </>
  );
}
