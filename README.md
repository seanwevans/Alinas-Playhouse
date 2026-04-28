# Alina's Playhouse

A tiny browser game you can run locally or deploy as a static site.

## Architecture

- **Canonical runtime entry:** `playhouse.js` imports `Game` from `src/game/game-bootstrap.js`.
- **Active gameplay modules:**
  - `src/game/` for app composition, lifecycle, render/physics setup, and frame runtime.
  - `src/environment/` for zone composition and world-building logic.
  - `src/entities/` + `src/systems/` for player creation and ECS systems.
- **Legacy modules:**
  - `src/world/` is retained only for older low-level/world-builder artifacts and is not the canonical environment entry path.

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

## Play

1. Open the deployed URL (or `http://localhost:8080` when running locally).
2. Use your keyboard to control the game.
3. Refresh the page to restart quickly.
