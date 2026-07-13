# Vendored runtime dependencies

These are the browser ESM builds the game imports at runtime, resolved via the
import map in `index.html`. They are committed so the site is fully self-hosted
and does not depend on a third-party CDN being reachable.

| Import specifier | File | Package | Version | License |
| --- | --- | --- | --- | --- |
| `three` | `three.module.js` | [three](https://www.npmjs.com/package/three) | 0.169.0 (minified build) | MIT |
| `three/addons/` | `three/addons/controls/OrbitControls.js` | three examples/jsm | 0.169.0 | MIT |
| `cannon-es` | `cannon-es.js` | [cannon-es](https://www.npmjs.com/package/cannon-es) | 0.20.0 | MIT |
| `miniplex` | `miniplex.js` | [miniplex](https://www.npmjs.com/package/miniplex) | 2.0.0 (bundled with its deps) | MIT |

## Regenerating

```bash
npm install three@0.169.0 cannon-es@0.20.0 miniplex@2.0.0 esbuild

# three (minified module build) + OrbitControls addon
cp node_modules/three/build/three.module.min.js vendor/three.module.js
mkdir -p vendor/three/addons/controls
cp node_modules/three/examples/jsm/controls/OrbitControls.js \
   vendor/three/addons/controls/OrbitControls.js

# cannon-es (already a single self-contained ESM file)
cp node_modules/cannon-es/dist/cannon-es.js vendor/cannon-es.js

# miniplex depends on @miniplex/bucket, @hmans/id, @hmans/queue and eventery,
# so bundle it into one self-contained ESM file
npx esbuild node_modules/miniplex/dist/miniplex.esm.js \
  --bundle --format=esm --minify --outfile=vendor/miniplex.js
```
