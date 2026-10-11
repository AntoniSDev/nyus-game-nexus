import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { statuses, type Status } from "../types";
import { WorldArtwork, worldCaptions } from "./WorldArtwork";

/** Permanent genre scenery plus an optional, uncropped game-cover vignette. */
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
  const [orientation, setOrientation] = useState({ url: "", landscape: false });
  const hasCover = Boolean(coverUrl && failedUrl !== coverUrl);
  return (
    <button
      className={`cover ${hasCover ? "has-cover" : "illustrated-cover"} ${orientation.url === coverUrl && orientation.landscape ? "has-landscape-cover" : ""}`}
      aria-label={`Modifier ${name}`}
      onClick={onEdit}
    >
      <span className="cover-art" aria-hidden="true">
        <WorldArtwork theme={theme} />
        <span className="world-caption">{worldCaptions[theme]}</span>
      </span>
      {hasCover && (
        <span
          className={`mini-cover ${orientation.url === coverUrl && orientation.landscape ? "mini-cover-landscape" : "mini-cover-portrait"}`}
        >
          <span className="mini-cover-pin" aria-hidden="true">
            ✦
          </span>
          <img
            className="cover-image"
            src={coverUrl}
            alt={`Jaquette de ${name}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailedUrl(coverUrl)}
            onLoad={(e) =>
              setOrientation({
                url: coverUrl,
                landscape:
                  e.currentTarget.naturalWidth > e.currentTarget.naturalHeight,
              })
            }
          />
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
