import { test } from "node:test";
import assert from "node:assert/strict";
import { initialCollection } from "../data/initial";
import { loadCollection, validateCollection } from "./collection";
import { mergeSteamGame } from "./steamCollection";
import { parseSteamProfile } from "./steamProfile";
import type { SteamLibrary } from "../types/steam";
const library: SteamLibrary = {
  profile: {
    steamId64: "76561198000000000",
    displayName: "Test user",
    profileUrl: "https://steamcommunity.com/profiles/76561198000000000/",
    lastSyncedAt: "2026-10-11T10:00:00.000Z",
  },
  libraryVisible: true,
  games: [],
};
test("Steam association and refresh preserve every personal field and prevent duplicate games", () => {
  const old = initialCollection();
  const game = { appId: 892970, name: "Valheim", playtimeMinutes: 180 };
  const linked = mergeSteamGame(
    old,
    library,
    game,
    "category-3",
    {
      id: 1,
      url: "https://cdn2.steamgriddb.com/grid/test.png",
      thumbnail: "https://cdn2.steamgriddb.com/thumb/test.png",
      author: "Test",
    },
    {
      available: true,
      unlocked: 2,
      total: 5,
      lastSyncedAt: library.profile.lastSyncedAt,
    },
  );
  assert.equal(linked.games.length, old.games.length);
  const { steam, ...personal } = linked.games[0];
  assert.deepEqual(personal, old.games[0]);
  assert.equal(steam?.playtimeMinutes, 180);
  assert.equal(steam?.achievements?.unlocked, 2);
  const refreshed = mergeSteamGame(
    linked,
    library,
    { ...game, name: "Different public name", playtimeMinutes: 300 },
    "category-5",
  );
  const { steam: refreshedSteam, ...refreshedPersonal } = refreshed.games[0];
  assert.deepEqual(refreshedPersonal, old.games[0]);
  assert.equal(refreshedSteam?.playtimeMinutes, 300);
  assert.deepEqual(refreshedSteam?.achievements, steam?.achievements);
  assert.deepEqual(
    validateCollection(JSON.parse(JSON.stringify(refreshed))),
    refreshed,
  );
  const newGame = mergeSteamGame(
    refreshed,
    library,
    { appId: 42, name: "New Steam game" },
    "category-0",
  );
  assert.equal(newGame.games.length, 9);
  assert.equal(newGame.games[8].steam?.playtimeMinutes, undefined);
  assert.equal(
    mergeSteamGame(
      newGame,
      library,
      { appId: 42, name: "New Steam game" },
      "category-1",
    ).games.length,
    9,
  );
});
test("V5 never seeds games or rewrites existing empty or legacy collections", () => {
  assert.equal(loadCollection({ getItem: () => null }).games.length, 0);
  for (const games of [[], initialCollection().games]) {
    const raw = JSON.stringify({ ...initialCollection(), games });
    assert.deepEqual(loadCollection({ getItem: () => raw }), JSON.parse(raw));
  }
});
test("Steam target parser accepts canonical IDs and rejects credentials, ports and injected URLs", () => {
  assert.equal(
    parseSteamProfile(library.profile.steamId64).url,
    library.profile.profileUrl,
  );
  assert.equal(
    parseSteamProfile("https://steamcommunity.com/id/nyunyaa/").kind,
    "vanity",
  );
  for (const input of [
    "javascript:alert(1)",
    "https://steamcommunity.com:444/id/test",
    "https://user:secret@steamcommunity.com/id/test",
    "https://steamcommunity.com/id/a/../b",
    "76561190000000000",
  ])
    assert.throws(() => parseSteamProfile(input));
});
