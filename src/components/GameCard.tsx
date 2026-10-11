import { Pencil, Trash2, Sparkles } from "lucide-react";
import { statuses, type Game } from "../types";
import { worldTheme } from "./WorldArtwork";
import { GameCover } from "./GameCover";
export function GameCard({
  game,
  categoryName,
  onEdit,
  onDelete,
  onStatus,
}: {
  game: Game;
  categoryName: string;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (status: Game["status"]) => void;
}) {
  const theme = worldTheme(categoryName);
  return (
    <article className={`game-card world-${theme}`}>
      <GameCover
        name={game.name}
        coverUrl={game.coverUrl}
        status={game.status}
        theme={theme}
        onEdit={onEdit}
      />
      <div className="card-body">
        <h3>{game.name}</h3>
        {game.coverCredit && (
          <a
            className="cover-credit"
            href={`https://www.steamgriddb.com/grid/${game.coverCredit.id}`}
            target="_blank"
            rel="noreferrer"
          >
            Jaquette : {game.coverCredit.author} · SteamGridDB ↗
          </a>
        )}
        {game.progress ? (
          <p className="progress">{game.progress}</p>
        ) : (
          <p className="muted">
            <Sparkles size={11} aria-hidden="true" />
            {game.status === "Terminé"
              ? "Un précieux souvenir de plus."
              : "Chaque aventure a son rythme."}
          </p>
        )}
        {game.notes && <p className="game-note">{game.notes}</p>}
        {game.waitingReason && (
          <p className="game-note">{game.waitingReason}</p>
        )}
        <div className="card-footer">
          <select
            aria-label={`Statut de ${game.name}`}
            value={game.status}
            onChange={(e) => onStatus(e.target.value as Game["status"])}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="icon-button"
            aria-label={`Modifier ${game.name}`}
            onClick={onEdit}
          >
            <Pencil size={15} />
          </button>
          <button
            className="icon-button danger"
            aria-label={`Supprimer ${game.name}`}
            onClick={onDelete}
          >
            <Trash2 size={15} />
          </button>
        </div>
        <time className="updated" dateTime={game.updatedAt}>
          Mis à jour le {new Date(game.updatedAt).toLocaleDateString("fr-FR")}
        </time>
      </div>
    </article>
  );
}
