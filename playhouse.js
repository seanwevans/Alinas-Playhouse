// Ownership: app entrypoint only; all domain logic lives in src/* modules.
import { Game } from "./src/game/game-bootstrap.js";

new Game();
