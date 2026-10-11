# Conventions — Nyu’s Game Nexus

- React + TypeScript strict, Vite, Tailwind CSS, Lucide. Keep dependencies minimal.
- French UI, accessible keyboard navigation, responsive dark theme. Centralize colors in `src/styles/theme.css`.
- Preserve the personal magical sanctuary identity: original Nyu chibi guardian, gentle cyan/pink/violet light, illustrated genre worlds, warm copy. Keep SVG art local and decorative; never confuse it with official game covers. Respect reduced-motion preferences. Use the same original face for hero, logo and favicon.
- GameCover always shows genre scenery, independently of the selected game. Add optional real covers as uncropped corner vignettes (portrait or landscape), never replacing the SVG. Missing/broken images leave scenery alone. GenreMotif symbols represent gameplay, never roster titles: automation uses machines/flows, adventure a journey, Soulslike a blade/embers. Keep cover imagery separate from genre identity.
- Separate components, sections, hooks, types, data, utilities, server helpers and Cloudflare Pages Functions. No database or user authentication.
- New users start with an empty game collection and default genre categories. Preserve existing collections exactly; never invent covers, progress or play time.
- Initialize only when the storage key is absent. Never replace invalid or future-version saves silently.
- SteamGridDB authentication stays in Functions via STEAMGRIDDB_API_KEY. Never expose keys through VITE variables, responses, URLs or logs. Catalog and Steam metadata are optional additions to schema 1, validated on import; do not rewrite old saves on load.
- Steam Web API authentication stays in Functions via STEAM_WEB_API_KEY and the x-webapi-key header. Access only public profiles/game details. Steam refresh changes only Steam fields; preserve IDs, categories, statuses, notes, progress, waiting reason, covers and personal update timestamps. Profile changes and imports are explicit user actions.
- Validate JSON before import; require confirmation before replacing data or deleting records.
- Bump and migrate the schema deliberately when data structures change. Keep stable IDs.
- Multiple games per category are allowed. Block deletion of occupied categories.
- Run `npm test` and `npm run build` before delivering changes. Test meaningful persistence and validation behavior.
- Keep Vite base `/` for Cloudflare Pages. Pushes to main trigger the connected Cloudflare deployment; build with `npm run build`, output directory `dist`. Do not restore the obsolete GitHub Pages workflow or repository-path asset prefix.
- Do not commit secrets, generated build output, or node_modules.
