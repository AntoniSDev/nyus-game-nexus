import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Collection } from "../types";
import { Modal } from "./Modal";
import { parseSteamProfile } from "../utils/steamProfile";
import { steamLibrary } from "../utils/steamClient";
import { synchronizeSteam } from "../utils/steamSync";
import { disconnectSteam } from "../utils/steamCollection";

export function SteamLibrary({
  collection,
  onUpdate,
  onClose,
}: {
  collection: Collection;
  onUpdate: (c: Collection) => boolean;
  onClose: () => void;
}) {
  const connected = collection.steamProfile;
  const [profile, setProfile] = useState(connected?.profileUrl ?? "");
  const [changing, setChanging] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [failedAvatar, setFailedAvatar] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  async function synchronize(target: string) {
    let url: string;
    try {
      url = parseSteamProfile(target).url;
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    setBusy(true);
    setConfirmDisconnect(false);
    setMessage("");
    setError("");
    try {
      const data = await steamLibrary(url, abort.signal);
      if (!data.libraryVisible)
        throw new Error(
          "Le profil ou ses détails de jeux sont privés ou indisponibles. Rendez-les publics dans Steam pour synchroniser.",
        );
      const sync = await synchronizeSteam(collection, data, abort.signal);
      abort.signal.throwIfAborted();
      if (!onUpdate(sync.collection))
        throw new Error("La synchronisation n’a pas pu être sauvegardée.");
      setProfile(data.profile.profileUrl);
      setChanging(false);
      setMessage(
        `Synchronisation réussie : ${data.games.length} jeux récupérés. ${sync.updated} jeux du Nexus actualisés (heures, activité et succès).${sync.failed ? " Certains succès sont indisponibles ; les observations précédentes sont conservées." : ""}`,
      );
    } catch (e) {
      if (!abort.signal.aborted)
        setError(
          `${(e as Error).message} Vos données enregistrées sont conservées.`,
        );
    } finally {
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  function connect(event: FormEvent) {
    event.preventDefault();
    void synchronize(profile);
  }
  function disconnect() {
    if (!onUpdate(disconnectSteam(collection))) {
      setError("Déconnexion non sauvegardée. Votre profil reste connecté.");
      return;
    }
    setProfile("");
    setChanging(false);
    setConfirmDisconnect(false);
    setError("");
    setMessage(
      "Profil déconnecté. Vos jeux, notes et dernières données Steam sont conservés.",
    );
  }
  return (
    <Modal title="Ma bibliothèque Steam" onClose={onClose}>
      <p className="muted steam-intro">
        Connectez votre profil public pour retrouver vos jeux dans « Ajouter un
        jeu ». Aucun mot de passe n’est demandé.
      </p>
      {connected ? (
        <div className="steam-profile">
          {connected.avatarUrl && failedAvatar !== connected.avatarUrl && (
            <img
              className="steam-avatar"
              src={connected.avatarUrl}
              alt=""
              referrerPolicy="no-referrer"
              onError={() => setFailedAvatar(connected.avatarUrl!)}
            />
          )}
          <strong>{connected.displayName}</strong>
          <span>
            Profil connecté ·{" "}
            {collection.steamLibrary
              ? `${collection.steamLibrary.games.length} jeux récupérés`
              : "Bibliothèque à synchroniser"}
          </span>
          <a href={connected.profileUrl} target="_blank" rel="noreferrer">
            Voir le profil public ↗
          </a>
          <small>
            {collection.steamLibrary
              ? "Dernière synchronisation"
              : "Dernière consultation du profil"}{" "}
            :{" "}
            {new Date(
              collection.steamLibrary?.profile.lastSyncedAt ??
                connected.lastSyncedAt,
            ).toLocaleString("fr-FR")}
          </small>
        </div>
      ) : (
        <p>Votre profil Steam n’est pas encore connecté.</p>
      )}
      {!connected || changing ? (
        <form className="form" onSubmit={connect}>
          {changing && (
            <p className="muted">
              Le nouveau profil remplacera la connexion uniquement après une
              synchronisation réussie. Vos jeux du Nexus seront conservés.
            </p>
          )}
          <label>
            Profil Steam ou SteamID64
            <input
              autoFocus
              maxLength={200}
              required
              disabled={busy}
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              placeholder="https://steamcommunity.com/id/…"
            />
          </label>
          <div className="modal-actions">
            {changing && (
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={() => {
                  setChanging(false);
                  setError("");
                }}
              >
                Annuler le changement
              </button>
            )}
            <button type="submit" className="primary" disabled={busy}>
              {busy ? "Synchronisation en cours…" : "Connecter et synchroniser"}
            </button>
          </div>
        </form>
      ) : (
        <div className="modal-actions steam-connection-actions">
          <button
            className="primary"
            disabled={busy}
            onClick={() => void synchronize(connected.steamId64)}
          >
            {busy ? "Synchronisation en cours…" : "Actualiser ma bibliothèque"}
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => {
              setProfile(connected.profileUrl);
              setChanging(true);
              setConfirmDisconnect(false);
              setMessage("");
              setError("");
            }}
          >
            Changer de profil
          </button>
          <button
            className="secondary"
            disabled={busy}
            onClick={() => setConfirmDisconnect(true)}
          >
            Déconnecter le profil
          </button>
        </div>
      )}
      {confirmDisconnect && (
        <div
          className="steam-disconnect"
          role="group"
          aria-label="Confirmation de déconnexion"
        >
          <p>
            Déconnecter ce profil ? Les jeux du Nexus et leurs dernières
            observations Steam seront conservés.
          </p>
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => setConfirmDisconnect(false)}
            >
              Annuler
            </button>
            <button className="primary" onClick={disconnect}>
              Confirmer la déconnexion
            </button>
          </div>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <p role="status" className="steam-message">
        {busy
          ? "Récupération du profil, de la bibliothèque et des données des jeux liés…"
          : message}
      </p>
    </Modal>
  );
}
