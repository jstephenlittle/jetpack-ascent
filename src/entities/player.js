import { GAME_CONFIG, applyDifficulty } from "../config.js";
import { GAME_STATE } from "../constants.js";

/**
 * Create the player character (Jetty)
 * @param {object} k - KAPLAY instance
 * @param {number} x - Starting X position
 * @param {number} y - Starting Y position
 * @returns {object} Player game object
 */
export function createPlayer(k, x, y) {
    const difficulty = GAME_STATE.difficulty;

    // Player entity with placeholder rectangle
    const player = k.add([
        k.rect(32, 32),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.body(),
        k.color(100, 200, 255),
        "player",
        {
            // Player state
            fuel: applyDifficulty(GAME_CONFIG.DEFAULT_FUEL, "fuelRate", difficulty),
            maxFuel: applyDifficulty(GAME_CONFIG.DEFAULT_FUEL, "fuelRate", difficulty),
            isThrusting: false,
            isFalling: false,
            fallVelocity: 0,
            moveSpeed: GAME_CONFIG.PLAYER_MOVE_SPEED,
        },
    ]);

    // Movement input
    player.onUpdate(() => {
        // Horizontal movement
        if (k.isKeyDown("left")) {
            player.move(-player.moveSpeed, 0);
        }
        if (k.isKeyDown("right")) {
            player.move(player.moveSpeed, 0);
        }

        // Track fall velocity for fall damage system
        if (player.vel.y > 0) {
            player.fallVelocity = player.vel.y;
            player.isFalling = true;
        } else {
            player.isFalling = false;
        }
    });

    return player;
}
