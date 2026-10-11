import type { SteamGameMetadata } from "../types/catalog";
export const steamHours = (minutes?: number) =>
  minutes === undefined
    ? "Temps de jeu indisponible"
    : `${(minutes / 60).toLocaleString("fr-FR", { maximumFractionDigits: 1 })} h jouées`;
export const steamActivity = (date?: string) =>
  date
    ? `Dernière fois joué : ${new Date(date).toLocaleDateString("fr-FR")}`
    : "Dernière activité non fournie";
export function SteamData({
  steam,
  compact = false,
}: {
  steam: SteamGameMetadata;
  compact?: boolean;
}) {
  const a = steam.achievements;
  const percentage =
    a && a.total > 0 ? Math.round((a.unlocked / a.total) * 100) : undefined;
  return (
    <div className={compact ? "steam-inline-data" : "steam-card-data"}>
      {!compact && <strong>✧ Mes données Steam</strong>}
      <span>{steamHours(steam.playtimeMinutes)}</span>
      {steam.playtimeTwoWeeksMinutes !== undefined && (
        <small>
          {(steam.playtimeTwoWeeksMinutes / 60).toLocaleString("fr-FR", {
            maximumFractionDigits: 1,
          })}{" "}
          h ces 14 derniers jours
        </small>
      )}
      <small>{steamActivity(steam.lastPlayedAt)}</small>
      {a ? (
        <>
          <span>
            {a.unlocked}/{a.total} succès
            {percentage !== undefined ? ` · ${percentage} %` : ""}
            {steam.achievementsAvailable === false
              ? " (dernière observation)"
              : ""}
          </span>
          {percentage !== undefined && (
            <div
              className="steam-progress"
              role="progressbar"
              aria-label="Progression des succès Steam"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percentage}
            >
              <span style={{ width: `${percentage}%` }} />
            </div>
          )}
          {steam.achievementsSyncedAt && (
            <small>
              Succès consultés le{" "}
              {new Date(steam.achievementsSyncedAt).toLocaleDateString("fr-FR")}
            </small>
          )}
        </>
      ) : (
        <small>
          {steam.achievementsAvailable === false
            ? "Succès non accessibles ou non proposés"
            : "Succès à consulter"}
        </small>
      )}
      {steam.lastSyncedAt && !compact && (
        <small>
          Synchronisé le{" "}
          {new Date(steam.lastSyncedAt).toLocaleDateString("fr-FR")}
        </small>
      )}
    </div>
  );
}
