# Alina's Playhouse
<img alt="Screenshot of Alina's Playhouse 2028-04-28T1441" src="https://github.com/user-attachments/assets/a4429710-1a6d-4de9-8606-d60dbdd239f3" />

A browser game you can run locally or deploy as a static site.

## Deploy

This project is fully static (`index.html`, `playhouse.js`, and `src/`), so you can deploy it on any static hosting service.

### Option 1: Quick local deploy (for testing)

From the project root:

```bash
python3 -m http.server 8080
```

Then open: <http://localhost:8080>

### Option 2: Static host (GitHub Pages / Netlify / Vercel / Cloudflare Pages)

1. Push this folder to a Git repository.
2. Create a new site in your host of choice.
3. Set the publish directory to the repository root.
4. Deploy.

No build command is required.

## Architecture

- Canonical game composition entry: `playhouse.js` imports `Game` from `src/game/game-bootstrap.js`.
- Runtime loop and per-frame updates live in `src/game/game-runtime.js`.
- Lifecycle/event wiring lives in `src/game/game-lifecycle.js`.
- Render and physics setup is modularized via `src/game/create-render-context.js` and `src/game/create-physics-world.js`.
- Environment composition is canonical in `src/environment/` (zones + specs + builders).
- `src/world/` is retained only for legacy artifacts and should not be used for new composition paths.

## Play

1. Open the deployed URL (or `http://localhost:8080` when running locally).
2. Use your keyboard to control the game.
3. Refresh the page to restart quickly.
