import { test } from "node:test";
import assert from "node:assert/strict";
import { handleCatalog, type CatalogContext } from "./catalog";
const context = (
  path: string,
  key: string | undefined = "test-only-private-token",
): CatalogContext => ({
  request: new Request(`https://nexus.test/api/catalog/${path}`),
  env: { STEAMGRIDDB_API_KEY: key },
});
const image = {
  id: 101,
  url: "https://cdn2.steamgriddb.com/grid/test.png",
  thumb: "https://cdn2.steamgriddb.com/thumb/test.png",
  author: { name: "Test artist", steam64: "private-upstream-field" },
};
test("catalog ownership hints require official app-to-catalog ID mappings, never matching titles", async () => {
  const response = await handleCatalog(
    context("search?q=Valheim&steamAppIds=892970,42,43"),
    "search",
    async (input, init) => {
      const url = String(input);
      assert.equal(
        new Headers(init?.headers).get("Authorization"),
        "Bearer test-only-private-token",
      );
      assert.equal(new URL(url).hostname, "www.steamgriddb.com");
      if (url.includes("games/steam/43")) throw new Error("private-test-only");
      return Response.json({
        success: true,
        data: url.includes("search/autocomplete")
          ? [
              { id: 100, name: "Valheim" },
              { id: 101, name: "Valheim similarly named" },
              { id: 102, name: "Other" },
            ]
          : url.includes("games/steam/892970")
            ? { id: 100, name: "Catalog alias" }
            : url.includes("games/steam/42")
              ? { id: 999, name: "Valheim similarly named" }
              : [image],
      });
    },
  );
  const body = (await response.json()) as {
    games: { id: number; steamAppId?: number }[];
  };
  assert.equal(body.games.find((g) => g.id === 100)?.steamAppId, 892970);
  assert.equal(body.games.find((g) => g.id === 101)?.steamAppId, undefined);
  assert.equal(body.games.find((g) => g.id === 102)?.steamAppId, undefined);
  for (const ids of [
    "",
    "0",
    "1,1",
    "4294967296",
    "1,2,3,4,5,6,7,8,9,10,11",
    "1/evil",
  ]) {
    assert.equal(
      (
        await handleCatalog(
          context(`search?q=test&steamAppIds=${encodeURIComponent(ids)}`),
          "search",
          async () => {
            throw new Error("must not fetch");
          },
        )
      ).status,
      400,
    );
  }
});
test("catalog search authenticates server-side and returns only normalized public fields", async () => {
  const requests: string[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input);
    requests.push(url);
    assert.equal(
      new Headers(init?.headers).get("Authorization"),
      "Bearer test-only-private-token",
    );
    assert.ok(!url.includes("test-only-private-token"));
    assert.equal(init?.redirect, "manual");
    return Response.json({
      success: true,
      data: url.includes("search/autocomplete")
        ? [
            {
              id: 42,
              name: "Test game",
              release_date: 1609459200,
              ignored: "private",
            },
            { id: 42, name: "Duplicate" },
            { id: -1, name: "Invalid" },
          ]
        : [image],
    });
  };
  const response = await handleCatalog(
    context("search?q=Test%20game"),
    "search",
    fetcher,
  );
  assert.equal(response.status, 200);
  const raw = await response.text();
  assert.ok(!raw.includes("private"));
  assert.deepEqual(JSON.parse(raw), {
    games: [
      {
        id: 42,
        name: "Test game",
        releaseYear: 2021,
        artwork: {
          id: 101,
          url: image.url,
          thumbnail: image.thumb,
          author: "Test artist",
        },
      },
    ],
  });
  assert.equal(requests.length, 2);
  assert.ok(requests[0].endsWith("Test%20game"));
});
test("invalid requests and missing secrets never reach the provider", async () => {
  const never: typeof fetch = async () => {
    throw new Error("Should not fetch");
  };
  for (const path of [
    "search?q=x",
    "search?q=" + "x".repeat(161),
    "search?q=%00ab",
  ])
    assert.equal(
      (await handleCatalog(context(path), "search", never)).status,
      400,
    );
  for (const id of ["0", "-1", "42/evil", "1e2", "1.5", ""])
    assert.equal(
      (
        await handleCatalog(
          context(`artwork?id=${encodeURIComponent(id)}`),
          "artwork",
          never,
        )
      ).status,
      400,
    );
  const missing = context("search?q=test");
  missing.env = {};
  assert.equal((await handleCatalog(missing, "search", never)).status, 503);
  const post = {
    ...context("search?q=test"),
    request: new Request("https://nexus.test/api/catalog/search?q=test", {
      method: "POST",
    }),
  };
  assert.equal((await handleCatalog(post, "search", never)).status, 405);
});
test("provider redirects are rejected without forwarding the authentication header", async () => {
  let calls = 0;
  const response = await handleCatalog(
    context("search?q=test"),
    "search",
    async (_input, init) => {
      calls++;
      assert.equal(init?.redirect, "manual");
      return new Response(null, {
        status: 302,
        headers: { Location: "https://other.test" },
      });
    },
  );
  assert.equal(response.status, 502);
  assert.equal(calls, 1);
});
test("upstream auth, quota, network and malformed responses are handled without disclosure", async () => {
  for (const [status, expected] of [
    [401, 503],
    [403, 503],
    [429, 429],
    [500, 502],
  ]) {
    const response = await handleCatalog(
      context("search?q=test"),
      "search",
      async () => new Response("test-only-private-token", { status }),
    );
    assert.equal(response.status, expected);
    assert.ok(!(await response.text()).includes("test-only-private-token"));
    if (expected === 429)
      assert.equal(response.headers.get("Retry-After"), "60");
  }
  assert.equal(
    (
      await handleCatalog(context("search?q=test"), "search", async () => {
        throw new Error("test-only-private-token");
      })
    ).status,
    502,
  );
  assert.equal(
    (
      await handleCatalog(context("search?q=test"), "search", async () =>
        Response.json({ success: true, data: {} }),
      )
    ).status,
    502,
  );
  assert.deepEqual(
    await (
      await handleCatalog(
        context("search?q=test"),
        "search",
        async () => new Response(null, { status: 404 }),
      )
    ).json(),
    { games: [] },
  );
});
test("artwork is limited to trusted HTTPS images and carries creator credits", async () => {
  const response = await handleCatalog(
    context("artwork?id=42"),
    "artwork",
    async () =>
      Response.json({
        success: true,
        data: [
          image,
          { ...image, id: 102, url: "https://evil.test/image" },
          { ...image, id: 103, thumb: "javascript:alert(1)" },
        ],
      }),
  );
  assert.deepEqual(await response.json(), {
    artwork: [
      {
        id: 101,
        url: image.url,
        thumbnail: image.thumb,
        author: "Test artist",
      },
    ],
  });
});
test("search survives missing cover requests and enforces a bounded burst", async () => {
  const response = await handleCatalog(
    context("search?q=test"),
    "search",
    async (input) =>
      String(input).includes("search/")
        ? Response.json({
            success: true,
            data: [{ id: 42, name: "Without art" }],
          })
        : new Response(null, { status: 500 }),
  );
  assert.deepEqual(await response.json(), {
    games: [{ id: 42, name: "Without art" }],
  });
  const request = new Request("https://nexus.test/api/catalog/search?q=test", {
    headers: { "CF-Connecting-IP": "192.0.2.100" },
  });
  for (let i = 0; i < 30; i++)
    assert.equal(
      (await handleCatalog({ request, env: {} }, "search")).status,
      503,
    );
  assert.equal(
    (await handleCatalog({ request, env: {} }, "search")).status,
    429,
  );
});
