import { useState } from "react";
import { ArrowUpRight, Gamepad2, Pencil, Trash2 } from "lucide-react";
import { statuses, type Game } from "../types";
export function GameCard({
  game,
  index,
  onEdit,
  onDelete,
  onStatus,
}: {
  game: Game;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onStatus: (status: Game["status"]) => void;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  return (
    <article className="game-card">
      <div className={`cover cover-${index % 4}`}>
        {game.coverUrl && failedUrl !== game.coverUrl ? (
          <img
            src={game.coverUrl}
            alt={`Jaquette de ${game.name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailedUrl(game.coverUrl)}
          />
        ) : (
          <div className="cover-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <Gamepad2 size={48} strokeWidth={1} />
            <span>NYU’S NEXUS</span>
          </div>
        )}
        <span
          className={`status-badge status-${statuses.indexOf(game.status)}`}
        >
          {game.status}
        </span>
        <button
          className="cover-edit"
          aria-label={`Modifier ${game.name}`}
          onClick={onEdit}
        >
          <ArrowUpRight size={18} />
        </button>
      </div>
      <div className="card-body">
        <h3>{game.name}</h3>
        {game.progress ? (
          <p className="progress">{game.progress}</p>
        ) : (
          <p className="muted">Une aventure à votre rythme.</p>
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
