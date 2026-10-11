import { test } from "node:test";
import assert from "node:assert/strict";
import { handleSteam, type SteamContext } from "./steam";
const id = "76561198000000000";
const ctx = (profile = id, extra = ""): SteamContext => ({ request: new Request(`https://nexus.test/api/steam/library?profile=${encodeURIComponent(profile)}${extra}`), env: { STEAM_WEB_API_KEY: "private-test-steam-key" } });
const player = { steamid: id, personaname: "Test user", communityvisibilitystate: 3, ignored: "private" };
test("Steam resolves a vanity profile and returns public hours without exposing auth or unknown data", async () => {
  const requests: string[] = [];
  const response = await handleSteam(ctx("https://steamcommunity.com/id/test-user/"), "library", async (input, init) => {
    const url = String(input); requests.push(url);
    assert.equal(new Headers(init?.headers).get("x-webapi-key"), "private-test-steam-key");
    assert.ok(!url.includes("private-test-steam-key")); assert.equal(new URL(url).hostname, "api.steampowered.com"); assert.equal(init?.redirect, "manual");
    return Response.json(url.includes("ResolveVanityURL") ? { response: { success: 1, steamid: id } } : url.includes("GetPlayerSummaries") ? { response: { players: [player] } } : { response: { games: [{ appid: 42, name: "Game", playtime_forever: 120 }, { appid: 43, name: "Hours hidden" }] } });
  });
  assert.equal(response.status, 200); const body = await response.text(); assert.ok(!body.includes("private")); const data = JSON.parse(body);
  assert.equal(data.profile.steamId64, id); assert.equal(data.libraryVisible, true); assert.deepEqual(data.games, [{ appId: 42, name: "Game", playtimeMinutes: 120 }, { appId: 43, name: "Hours hidden" }]); assert.equal(requests.length, 3);
});
test("Steam preserves the distinction between private details and an actually empty library", async () => {
  for (const [owned, visible] of [[{}, false], [{ game_count: 0 }, true]] as const) {
    const response = await handleSteam(ctx(), "library", async input => Response.json(String(input).includes("GetPlayerSummaries") ? { response: { players: [player] } } : { response: owned }));
    const data = await response.json() as { games: unknown[]; libraryVisible: boolean };
    assert.equal(data.libraryVisible, visible); assert.deepEqual(data.games, []);
  }
  let calls = 0;
  const response = await handleSteam(ctx(), "library", async () => { calls++; return Response.json({ response: { players: [{ ...player, communityvisibilitystate: 1 }] } }); });
  assert.equal((await response.json() as { libraryVisible: boolean }).libraryVisible, false); assert.equal(calls, 1);
});
test("achievements count real unlocks, distinguish unavailable stats, and normalize errors", async () => {
  const response = await handleSteam(ctx(id, "&appId=42"), "achievements", async () => Response.json({ playerstats: { success: true, achievements: [{ apiname: "a", achieved: 1 }, { apiname: "b", achieved: 0 }] } }));
  const data = await response.json() as { available: boolean; unlocked: number; total: number }; assert.equal(data.available, true); assert.equal(data.unlocked, 1); assert.equal(data.total, 2);
  const unavailable = await handleSteam(ctx(id,"&appId=42"), "achievements", async () => Response.json({ playerstats: { success: false, error: "private-test-steam-key" } }, { status: 400 }));
  assert.equal(unavailable.status, 200); const raw = await unavailable.text(); assert.ok(!raw.includes("private-test-steam-key")); assert.equal(JSON.parse(raw).available, false);
  for (const [status, expected] of [[403,503], [429,429], [302,502], [500,502]]) {
    const failed = await handleSteam(ctx(), "library", async () => new Response("private-test-steam-key", { status })); assert.equal(failed.status, expected); assert.ok(!(await failed.text()).includes("private-test-steam-key"));
  }
});
test("invalid targets and missing keys do not reach Steam", async () => {
  const never: typeof fetch = async () => { throw new Error("must not fetch"); };
  for (const profile of ["1", "https://evil.test/id/x", "https://steamcommunity.com@evil.test/id/x", "https://steamcommunity.com/id/x?key=y", "https://steamcommunity.com/gid/123"]) assert.equal((await handleSteam(ctx(profile),"library",never)).status,400);
  const missing = ctx(); missing.env = {}; assert.equal((await handleSteam(missing,"library",never)).status,503);
  assert.equal((await handleSteam(ctx(id,"&appId=0"),"achievements",never)).status,400);
});
