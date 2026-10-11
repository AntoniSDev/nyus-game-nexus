export type SteamInput = { kind: "id" | "vanity"; value: string; url: string };
export function validSteamId(value: unknown): boolean {
  if (typeof value !== "string" || !/^\d{17}$/.test(value)) return false;
  const id = BigInt(value);
  return (
    id >> 56n === 1n &&
    ((id >> 52n) & 15n) === 1n &&
    ((id >> 32n) & 1048575n) === 1n &&
    (id & 4294967295n) > 0n
  );
}
export function parseSteamProfile(input: string): SteamInput {
  const value = input.trim();
  if (validSteamId(value))
    return {
      kind: "id",
      value,
      url: `https://steamcommunity.com/profiles/${value}/`,
    };
  try {
    if (/\/(?:\.|%2e){1,2}(?:\/|$)/i.test(value) || value.includes("\\"))
      throw new Error();
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !["steamcommunity.com", "www.steamcommunity.com"].includes(
        url.hostname,
      ) ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error();
    const match = url.pathname.match(
      /^\/(profiles|id)\/([a-zA-Z0-9_-]{1,80})\/?$/,
    );
    if (!match || (match[1] === "profiles" && !validSteamId(match[2])))
      throw new Error();
    return {
      kind: match[1] === "profiles" ? "id" : "vanity",
      value: match[2],
      url: `https://steamcommunity.com/${match[1]}/${match[2]}/`,
    };
  } catch {
    throw new Error(
      "Saisissez un SteamID64 valide ou une URL https://steamcommunity.com/id/… ou /profiles/…",
    );
  }
}
