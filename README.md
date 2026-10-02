# Steel City Casefile

A character sheet for the *Dresden Files RPG* (Evil Hat, Fate 3.0) with switchable themes: **Steel City** (post-Fall Pittsburgh), **Case File** (a wizard PI's desk), **Modern** (clean, follows light/dark), and **Fey** (Spring, Summer, Autumn or Winter Court), **Illuminated** (a gilded, stained-glass manuscript), and **The Veil** (a candlelit séance). Each theme has its own refresh meter, stress boxes, warnings and phases layout.

- **Phases worksheet:** high concept, trouble, and the five phases, each producing an aspect.
- **Smart sheet:** refresh, skill points, cap and column rule, stress boxes from Endurance/Conviction/Presence, and extra consequence slots are all computed. Rule breaks show as warnings and never block you.
- **Stunts & powers:** a searchable catalog with default refresh costs, plus custom entries.
- **Magic tab:** appears for spellcasters. It covers foci, specializations, effective power/control by element, and rotes.
- **Dice roller:** a Roll button on every tab (or press R) rolls four Fate dice with an animation for each theme: a drop forge in Steel City, dice thrown across the desk in Case File, slot reels in Modern, enchanted dice settling on a fairy ring for each Fey court, stained-glass windows lit by a shaft of light in Illuminated, and a planchette on a spirit board in The Veil. The result is decided before the animation starts, and a tap or Esc skips to it. The chip beside the button shows the last 10 rolls, a "Reroll all four" button, and the animation speed (Instant, Quick or Cinematic). Code is in `src/dice/`.
- **Themes:** picked per browser from the top bar. An "Ambient motion" switch turns off background animation on slow machines. Theme code is in `src/themes/`: the Steel City styles are the base in `styles.css`, and each other theme overrides them in its own CSS file.
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
