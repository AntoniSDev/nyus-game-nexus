# Conventions — Nyu’s Game Nexus

- React + TypeScript strict, Vite, Tailwind CSS, Lucide. Keep dependencies minimal.
- French UI, accessible keyboard navigation, responsive dark theme. Centralize colors in `src/styles/theme.css`.
- Preserve the personal magical sanctuary identity: original moon familiar, gentle cyan/pink/violet light, illustrated genre worlds, warm copy. Keep SVG art local and decorative; never confuse it with official game covers. Respect reduced-motion preferences.
- Keep GameCover image-first: real covers take priority, portrait and landscape images stay uncropped, and SVG worlds appear only for missing or broken covers. The card identity lives in frames, badges and surrounding accents, independently of its fallback artwork.
- Separate components, sections, hooks, types, data and utilities. No backend or authentication.
- Preserve the exact initial roster and never invent covers, progress or play time.
- Seed only when the storage key is absent. Never replace invalid or future-version saves silently.
- Validate JSON before import; require confirmation before replacing data or deleting records.
- Bump and migrate the schema deliberately when data structures change. Keep stable IDs.
- Multiple games per category are allowed. Block deletion of occupied categories.
- Run `npm test` and `npm run build` before delivering changes. Test meaningful persistence and validation behavior.
- Keep Vite base `/nyus-game-nexus/`. Deploy through the GitHub Pages workflow on main.
- Do not commit secrets, generated build output, or node_modules.
