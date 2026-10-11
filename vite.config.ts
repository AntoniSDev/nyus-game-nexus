import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as { version: string };

function buildId() {
  const cloudflareCommit = process.env.CF_PAGES_COMMIT_SHA;
  if (cloudflareCommit && /^[a-f0-9]{40}$/i.test(cloudflareCommit)) {
    return cloudflareCommit.slice(0, 7);
  }
  try {
    return execFileSync("git", ["rev-parse", "--short=7", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "local";
  }
}

export default defineConfig({
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __BUILD_ID__: JSON.stringify(buildId()),
  },
  plugins: [react(), tailwindcss()],
});
