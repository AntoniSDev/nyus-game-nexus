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
  const c = loadCollection(storage);
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
