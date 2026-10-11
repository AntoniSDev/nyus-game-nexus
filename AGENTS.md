# Conventions — Nyu’s Game Nexus

- React + TypeScript strict, Vite, Tailwind CSS, Lucide. Keep dependencies minimal.
- French UI, accessible keyboard navigation, responsive dark theme. Centralize colors in `src/styles/theme.css`.
- Preserve the personal magical sanctuary identity: original moon familiar, gentle cyan/pink/violet light, illustrated genre worlds, warm copy. Keep SVG art local and decorative; never confuse it with official game covers. Respect reduced-motion preferences.
- GameCover always shows genre scenery, independently of the selected game. Add optional real covers as uncropped corner vignettes (portrait or landscape), never replacing the SVG. Missing/broken images leave scenery alone. GenreMotif symbols represent gameplay, never roster titles: automation uses machines/flows, adventure a journey, Soulslike a blade/embers. Keep cover imagery separate from genre identity.
- Separate components, sections, hooks, types, data and utilities. No backend or authentication.
- Preserve the exact initial roster and never invent covers, progress or play time.
- Seed only when the storage key is absent. Never replace invalid or future-version saves silently.
- Validate JSON before import; require confirmation before replacing data or deleting records.
- Bump and migrate the schema deliberately when data structures change. Keep stable IDs.
- Multiple games per category are allowed. Block deletion of occupied categories.
- Run `npm test` and `npm run build` before delivering changes. Test meaningful persistence and validation behavior.
- Keep Vite base `/` for Cloudflare Pages. Pushes to main trigger the connected Cloudflare deployment; build with `npm run build`, output directory `dist`. Do not restore the obsolete GitHub Pages workflow or repository-path asset prefix.
- Do not commit secrets, generated build output, or node_modules.
