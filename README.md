# Steel City Casefile

A character sheet for the *Dresden Files RPG* (Evil Hat, Fate 3.0), styled as a reconstruction-era Pittsburgh casefile.

- **Phases worksheet:** high concept, trouble, and the five phases, each producing an aspect.
- **Smart sheet:** refresh, skill points, cap and column rule, stress boxes from Endurance/Conviction/Presence, and extra consequence slots are all computed. Rule breaks show as warnings and never block you.
- **Stunts & powers:** a searchable catalog with default refresh costs, plus custom entries.
- **Magic tab:** appears for spellcasters. It covers foci, specializations, effective power/control by element, and rotes.
- **Storage:** everything is saved to the browser's localStorage. Export/import uses JSON files.

## Develop

```sh
npm install --os=win32 --cpu=x64   # this machine's ~/.npmrc sets os=linux
npm run dev                         # http://localhost:5173
npm test                            # rules engine tests
npm run build                       # static site in dist/
```

Rules logic is in `src/model/rules.ts` (pure functions, tested in `rules.test.ts`). The catalog is in `src/model/catalog.ts`, which holds names and default costs only. Costs marked `variable` depend on options, so check them against your book.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `main` (set Pages → Source to "GitHub Actions"). `vite.config.ts` uses a relative `base`, so it works at any Pages path.

Unofficial fan tool. Not affiliated with Evil Hat Productions or Jim Butcher.
