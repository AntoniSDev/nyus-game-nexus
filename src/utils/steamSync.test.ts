import { test } from "node:test";
import assert from "node:assert/strict";
import { initialCollection } from "../data/initial";
import { loadCollection, validateCollection } from "./collection";
import {
  cacheSteamLibrary,
  mergeSteamGame,
  disconnectSteam,
} from "./steamCollection";
import { synchronizeSteam } from "./steamSync";
import type { SteamLibrary } from "../types/steam";
const library: SteamLibrary = {
  profile: {
    steamId64: "76561198000000000",
    displayName: "User",
    profileUrl: "https://steamcommunity.com/profiles/76561198000000000/",
    lastSyncedAt: "2026-10-11T12:00:00.000Z",
  },
  libraryVisible: true,
  games: [
    {
      appId: 892970,
      name: "Valheim",
      playtimeMinutes: 180,
      playtimeTwoWeeksMinutes: 60,
      lastPlayedAt: "2026-10-10T10:00:00.000Z",
    },
  ],
};
test("disconnect preserves every game and observation; validated optional avatars survive import/export", () => {
  const avatarUrl = "https://avatars.steamstatic.com/abcdef123456_full.jpg";
  const withAvatar = { ...library, profile: { ...library.profile, avatarUrl } };
  const saved = mergeSteamGame(
    initialCollection(),
    withAvatar,
    library.games[0],
    "category-0",
  );
  const before = JSON.stringify(saved);
  const imported = validateCollection(JSON.parse(before));
  assert.equal(imported.steamProfile?.avatarUrl, avatarUrl);
  assert.equal(imported.steamLibrary?.profile.avatarUrl, avatarUrl);
  const disconnected = disconnectSteam(imported);
  assert.deepEqual(disconnected.games, saved.games);
  assert.deepEqual(disconnected.categories, saved.categories);
  assert.equal(disconnected.steamProfile, undefined);
  assert.equal(disconnected.steamLibrary, undefined);
  assert.equal(JSON.stringify(saved), before);
  for (const url of [
    "https://evil.test/avatar.jpg",
    "javascript:alert(1)",
    "https://avatars.steamstatic.com@evil.test/a.jpg",
    "https://avatars.steamstatic.com/abc_full.jpg?key=secret",
  ]) {
    assert.throws(() =>
      validateCollection({
        ...saved,
        steamProfile: { ...withAvatar.profile, avatarUrl: url },
      }),
    );
    assert.throws(() =>
      validateCollection({
        ...saved,
        steamLibrary: {
          ...withAvatar,
          profile: { ...withAvatar.profile, avatarUrl: url },
        },
      }),
    );
  }
});
test("public library cache survives export and old saves remain byte-for-byte unchanged on load", () => {
  const old = initialCollection();
  const raw = JSON.stringify(old);
  assert.deepEqual(loadCollection({ getItem: () => raw }), old);
  assert.equal(JSON.stringify(old), raw);
  const cached = cacheSteamLibrary(old, library);
  assert.deepEqual(
    validateCollection(JSON.parse(JSON.stringify(cached))),
    cached,
  );
  assert.deepEqual(cached.games, old.games);
  assert.throws(() =>
    cacheSteamLibrary(cached, { ...library, libraryVisible: false, games: [] }),
  );
  assert.equal(JSON.stringify(old), raw);
  for (const patch of [
    { games: [...library.games, ...library.games] },
    { games: [{ ...library.games[0], lastPlayedAt: "invalid" }] },
    { games: [{ ...library.games[0], playtimeTwoWeeksMinutes: -1 }] },
    { profile: { ...library.profile, steamId64: "invalid" } },
  ])
    assert.throws(() =>
      validateCollection({ ...cached, steamLibrary: { ...library, ...patch } }),
    );
  assert.throws(() =>
    validateCollection({
      ...cached,
      steamProfile: {
        ...library.profile,
        steamId64: "76561198000000001",
        profileUrl: "https://steamcommunity.com/profiles/76561198000000001/",
      },
    }),
  );
});
test("sync refreshes real Steam metadata and achievements without changing personal fields or adding/removing games", async () => {
  const original = initialCollection();
  original.games[0].notes = "My notes";
  original.games[0].progress = "Chapter 2";
  const linked = mergeSteamGame(
    original,
    library,
    library.games[0],
    "category-4",
    undefined,
    {
      available: true,
      unlocked: 1,
      total: 10,
      lastSyncedAt: library.profile.lastSyncedAt,
    },
  );
  const before = JSON.stringify(linked);
  const fresh = {
    ...library,
    profile: { ...library.profile, lastSyncedAt: "2026-10-11T14:00:00.000Z" },
    games: [{ ...library.games[0], playtimeMinutes: 240 }],
  };
  const result = await synchronizeSteam(
    linked,
    fresh,
    new AbortController().signal,
    async (_profile, ids) => {
      assert.deepEqual(ids, [892970]);
      return {
        results: {
          892970: {
            available: true,
            unlocked: 3,
            total: 10,
            lastSyncedAt: fresh.profile.lastSyncedAt,
          },
        },
        failedAppIds: [],
      };
    },
  );
  const { steam, ...personal } = result.collection.games[0];
  const { steam: oldSteam, ...oldPersonal } = linked.games[0];
  assert.deepEqual(personal, oldPersonal);
  assert.equal(steam?.playtimeMinutes, 240);
  assert.equal(steam?.lastPlayedAt, library.games[0].lastPlayedAt);
  assert.equal(steam?.achievements?.unlocked, 3);
  assert.equal(result.collection.games.length, linked.games.length);
  assert.equal(JSON.stringify(linked), before);
  const absent = await synchronizeSteam(
    linked,
    { ...fresh, games: [] },
    new AbortController().signal,
    async () => {
      throw new Error("must not fetch");
    },
  );
  assert.deepEqual(absent.collection.games, linked.games);
  const other = await synchronizeSteam(
    linked,
    {
      ...fresh,
      profile: {
        ...fresh.profile,
        steamId64: "76561198000000001",
        profileUrl: "https://steamcommunity.com/profiles/76561198000000001/",
      },
    },
    new AbortController().signal,
    async () => {
      throw new Error("must not fetch");
    },
  );
  assert.deepEqual(other.collection.games, linked.games);
});
test("failed or unavailable achievements preserve previous observations and aborted/private sync never destroys saved data", async () => {
  const linked = mergeSteamGame(
    initialCollection(),
    library,
    library.games[0],
    "category-0",
    undefined,
    {
      available: true,
      unlocked: 2,
      total: 10,
      lastSyncedAt: library.profile.lastSyncedAt,
    },
  );
  const raw = JSON.stringify(linked);
  const failure = await synchronizeSteam(
    linked,
    library,
    new AbortController().signal,
    async () => {
      throw new Error("temporary outage");
    },
  );
  assert.equal(failure.failed, 1);
  assert.deepEqual(failure.collection.games, linked.games);
  const unavailable = await synchronizeSteam(
    linked,
    library,
    new AbortController().signal,
    async () => ({
      results: {
        892970: {
          available: false,
          lastSyncedAt: library.profile.lastSyncedAt,
        },
      },
      failedAppIds: [],
    }),
  );
  assert.deepEqual(
    unavailable.collection.games[0].steam?.achievements,
    linked.games[0].steam?.achievements,
  );
  assert.equal(
    unavailable.collection.games[0].steam?.achievementsAvailable,
    false,
  );
  await assert.rejects(
    synchronizeSteam(
      linked,
      { ...library, libraryVisible: false, games: [] },
      new AbortController().signal,
    ),
  );
  const abort = new AbortController();
  abort.abort();
  await assert.rejects(synchronizeSteam(linked, library, abort.signal));
  assert.equal(JSON.stringify(linked), raw);
});
