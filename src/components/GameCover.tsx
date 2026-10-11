import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { statuses, type Status } from "../types";
import { WorldArtwork, worldCaptions } from "./WorldArtwork";

/** Image-first presentation. A future catalogue only needs to supply coverUrl. */
export function GameCover({
  name,
  coverUrl,
  status,
  theme,
  onEdit,
}: {
  name: string;
  coverUrl: string;
  status: Status;
  theme: number;
  onEdit: () => void;
}) {
  const [failedUrl, setFailedUrl] = useState("");
  const hasCover = Boolean(coverUrl && failedUrl !== coverUrl);
  return (
    <button
      className={`cover ${hasCover ? "has-cover" : "illustrated-cover"}`}
      aria-label={`Modifier ${name}`}
      onClick={onEdit}
    >
      {hasCover ? (
        <>
          <img
            className="cover-ambient"
            src={coverUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <img
            className="cover-image"
            src={coverUrl}
            alt={`Jaquette de ${name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailedUrl(coverUrl)}
          />
        </>
      ) : (
        <span className="cover-art" aria-hidden="true">
          <WorldArtwork theme={theme} />
          <span className="world-caption">{worldCaptions[theme]}</span>
        </span>
      )}
      <span className={`status-badge status-${statuses.indexOf(status)}`}>
        {status}
      </span>
      <span className="cover-edit" aria-hidden="true">
        <ArrowUpRight size={18} />
      </span>
    </button>
  );
}
