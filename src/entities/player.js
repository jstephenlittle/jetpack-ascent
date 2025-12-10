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
    console.log(`[PLAYER] Creating player at position (${x}, ${y})`);
    const difficulty = GAME_STATE.difficulty;
    console.log(`[PLAYER] Difficulty: ${difficulty}`);

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
            fallVelocity: 0,
            moveSpeed: GAME_CONFIG.PLAYER_MOVE_SPEED,
            isDangerousFall: false,
            fallDamageThreshold: applyDifficulty(GAME_CONFIG.FALL_DAMAGE_THRESHOLD, "fallTolerance", difficulty),
        },
    ]);

    console.log(`[PLAYER] Player object created:`, {
        pos: player.pos,
        fuel: player.fuel,
        maxFuel: player.maxFuel,
        moveSpeed: player.moveSpeed
    });

    // Jetpack flame visual (hidden by default)
    const flame = player.add([
        k.rect(16, 24),
        k.pos(0, 24),
        k.anchor("top"),
        k.color(255, 150, 0),
        k.opacity(0),
        "flame",
    ]);

    console.log(`[PLAYER] Flame visual added to player`);

    // Collision with platforms - check for fall damage
    player.onCollide("platform", () => {
        if (player.isDangerousFall) {
            // Take fall damage
            GAME_STATE.lives -= 1;
            player.isDangerousFall = false;
            player.fallVelocity = 0;

            if (GAME_STATE.lives <= 0) {
                // Game Over will be handled by scene
                player.trigger("death");
            } else {
                // Flash player to show damage
                const originalColor = player.color.clone();
                player.color = k.rgb(255, 100, 100);
                k.wait(0.2, () => {
                    player.color = originalColor;
                });
            }
        }
    });

    // Movement and jetpack input
    player.onUpdate(() => {
        const dt = k.dt();

        // Horizontal movement
        if (k.isKeyDown("left")) {
            player.move(-player.moveSpeed, 0);
        }
        if (k.isKeyDown("right")) {
            player.move(player.moveSpeed, 0);
        }

        // Jetpack thrust
        if (k.isKeyDown("space") && player.fuel > 0) {
            // Apply upward thrust
            player.jump(GAME_CONFIG.PLAYER_JETPACK_THRUST);

            // Deplete fuel
            player.fuel -= GAME_CONFIG.FUEL_CONSUMPTION_RATE * dt;
            if (player.fuel < 0) player.fuel = 0;

            // Show flame
            player.isThrusting = true;
            flame.opacity = 1;
        } else {
            player.isThrusting = false;
            flame.opacity = 0;
        }

        // Track fall velocity for fall damage system
        if (player.vel.y > 0) {
            player.fallVelocity = player.vel.y;

            // Check if fall is dangerous
            if (player.fallVelocity > player.fallDamageThreshold) {
                player.isDangerousFall = true;
            }
        } else {
            // Reset dangerous fall state when moving upward or on ground
            if (player.isGrounded()) {
                player.isDangerousFall = false;
                player.fallVelocity = 0;
            }
        }
    });

    return player;
}
