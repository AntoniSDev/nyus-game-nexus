import { test } from "node:test";
import assert from "node:assert/strict";
import { initialCollection } from "../data/initial";
import {
  loadCollection,
  saveCollection,
  validateCollection,
  upsertGame,
  removeCategory,
  STORAGE_KEY,
} from "./collection";
test("exact initial roster without invented progress or covers", () => {
  const c = initialCollection();
  assert.equal(c.games.length, 8);
  assert.equal(c.games[5].name, "Aniimo ?");
  assert.equal(c.games[5].notes, "monétisation P2W gênante");
  assert.equal(c.games[7].notes, "attendre tous les DLC");
  assert.ok(c.games.every((g) => g.progress === "" && g.coverUrl === ""));
  assert.equal(c.games.filter((g) => g.status === "Sélectionné").length, 3);
});
test("persist edits, reload and preserve empty collections", () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  };
  assert.equal(loadCollection(storage).games.length, 0);
  const c = initialCollection();
  const edited = upsertGame(c, {
    ...c.games[0],
    status: "Terminé",
    progress: "Objectif atteint",
  });
  saveCollection(storage, edited);
  assert.deepEqual(loadCollection(storage), edited);
  saveCollection(storage, { schemaVersion: 1, games: [], categories: [] });
  assert.equal(loadCollection(storage).games.length, 0);
});
test("never replace corrupt or future data by sample data", () => {
  for (const raw of ["{", '{"schemaVersion":2,"games":[],"categories":[]}']) {
    assert.throws(() => loadCollection({ getItem: () => raw }));
  }
});
test("reject duplicate IDs, orphan games, unsafe URLs and bad statuses", () => {
  const c = initialCollection();
  assert.throws(() =>
    validateCollection({ ...c, games: [c.games[0], c.games[0]] }),
  );
  for (const patch of [
    { categoryId: "missing" },
    { coverUrl: "javascript:alert(1)" },
    { status: "unknown" },
    { updatedAt: "invalid" },
  ]) {
    assert.throws(() =>
      validateCollection({ ...c, games: [{ ...c.games[0], ...patch }] }),
    );
  }
});
test("allow candidates and prevent deleting occupied genres", () => {
  const c = initialCollection();
  const added = upsertGame(c, {
    ...c.games[0],
    id: "candidate",
    name: "Candidat",
  });
  assert.equal(added.games.length, 9);
  assert.throws(() => removeCategory(added, c.categories[0].id));
  const emptied = {
    ...added,
    games: added.games.filter((g) => g.categoryId !== c.categories[0].id),
  };
  assert.equal(
    removeCategory(emptied, c.categories[0].id).categories.length,
    7,
  );
});
test("surface storage errors and preserve exported data", () => {
  const c = initialCollection();
  assert.deepEqual(validateCollection(JSON.parse(JSON.stringify(c))), c);
  assert.throws(() =>
    saveCollection(
      {
        setItem: () => {
          throw new Error("Quota exceeded");
        },
      },
      c,
    ),
  );
  assert.equal(STORAGE_KEY, "nyus-game-nexus.collection");
});
test("V4 leaves legacy saves byte-for-byte intact on load", () => {
  const previous = initialCollection();
  const raw = JSON.stringify(previous);
  let stored = raw;
  const storage = {
    getItem: () => stored,
    setItem: (_key: string, value: string) => {
      stored = value;
    },
  };
  assert.deepEqual(loadCollection(storage), previous);
  assert.equal(stored, raw);
  assert.equal(loadCollection({ getItem: () => null }).games.length, 0);
});
test("catalog identity, art credits and future Steam data survive export and prevent duplicate additions", () => {
  const c = initialCollection();
  const enriched = {
    ...c.games[0],
    catalog: { provider: "steamgriddb" as const, id: 42 },
    coverCredit: {
      provider: "steamgriddb" as const,
      id: 101,
      author: "Artist",
    },
    steam: {
      appId: 892970,
      playtimeMinutes: 60,
      achievements: { unlocked: 0, total: 5 },
      lastSyncedAt: "2026-10-11T00:00:00.000Z",
    },
  };
  const updated = upsertGame(c, enriched);
  assert.deepEqual(
    validateCollection(JSON.parse(JSON.stringify(updated))),
    updated,
  );
  assert.throws(
    () =>
      upsertGame(updated, {
        ...enriched,
        id: "other",
        name: "Different title",
      }),
    /déjà/,
  );
  assert.equal(
    upsertGame(updated, { ...enriched, notes: "Personal" }).games[0].notes,
    "Personal",
  );
  for (const patch of [
    { catalog: { provider: "steamgriddb", id: -1 } },
    { coverCredit: { provider: "steamgriddb", id: 42, author: 1 } },
    { steam: { appId: 1, playtimeMinutes: -1 } },
    { steam: { appId: 1, achievements: { unlocked: 3, total: 2 } } },
  ])
    assert.throws(() =>
      validateCollection({ ...c, games: [{ ...enriched, ...patch }] }),
    );
});
