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
  MoonStar,
  Sparkles,
  Heart,
} from "lucide-react";
import { statuses, type Collection, type Game } from "../types";
import { GameCard } from "../components/GameCard";
import { SanctuaryArt } from "../components/SanctuaryArt";
import { worldTheme } from "../components/WorldArtwork";
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
      caption: "autant de portes à ouvrir",
    },
    {
      label: "Jeux actifs",
      value: collection.games.filter((g) =>
        ["Sélectionné", "En cours", "À poursuivre"].includes(g.status),
      ).length,
      icon: Gamepad2,
      color: "teal",
      caption: "vos aventures du moment",
    },
    {
      label: "Jeux terminés",
      value: collection.games.filter((g) => g.status === "Terminé").length,
      icon: CheckCheck,
      color: "purple",
      caption: "de précieux souvenirs",
    },
    {
      label: "En attente",
      value: collection.games.filter((g) => g.status === "En attente").length,
      icon: Clock3,
      color: "amber",
      caption: "chaque monde a son heure",
    },
  ];
  return (
    <>
      <div className="welcome-line">
        <span>
          <MoonStar size={16} /> Un petit refuge, rien qu’à vous.
        </span>
        <span>✧ Faites une place à la magie</span>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={13} /> NYU’S PERSONAL GAMING SANCTUARY
          </div>
          <h1>
            Bienvenue dans
            <br />
            <span>votre petit univers.</span>
          </h1>
          <p>
            Vos mondes préférés, une aventure à la fois.
            <br className="desktop-break" /> Ici, on joue pour le plaisir. Le
            reste peut attendre.
          </p>
          <div className="hero-actions">
            <button className="primary" onClick={onAdd}>
              <Plus size={18} /> Ajouter un jeu <Sparkles size={15} />
            </button>
            <a className="hero-link" href="#collection">
              Explorer mes mondes <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-whisper">
            <Heart size={12} /> Un jeu par genre. Tout le temps pour en
            profiter.
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <SanctuaryArt />
          <span className="hero-art-caption">
            votre gardien des petites aventures ✧
          </span>
        </div>
      </section>
      <section className="stats" aria-label="Statistiques de la collection">
        {stats.map((s) => (
          <div className={`stat stat-${s.color}`} key={s.label}>
            <span className="stat-spark" aria-hidden="true">
              ✧
            </span>
            <div className={`stat-icon ${s.color}`}>
              <s.icon size={21} />
            </div>
            <div>
              <strong>{s.value.toString().padStart(2, "0")}</strong>
              <span>{s.label}</span>
              <small>{s.caption}</small>
            </div>
          </div>
        ))}
      </section>
      <section className="collection-section" id="collection">
        <div className="section-title">
          <div>
            <div className="eyebrow">
              <Sparkles size={13} /> UNE COLLECTION DE PETITS MONDES
            </div>
            <h2>
              Ma collection <span>{collection.games.length}</span>
            </h2>
          </div>
          <button className="secondary" onClick={onCategories}>
            <SlidersHorizontal size={16} /> Gérer les catégories
          </button>
        </div>
        <p className="collection-intro">
          Des univers à retrouver, des souvenirs à créer. Choisissez la porte
          qui vous appelle.
        </p>
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
            .map((c) => (
              <section
                className={`category-group world-${worldTheme(c.name)}`}
                key={c.id}
              >
                <div className="category-heading">
                  <span className="category-gem" aria-hidden="true">
                    ✦
                  </span>
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
                      categoryName={c.name}
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
