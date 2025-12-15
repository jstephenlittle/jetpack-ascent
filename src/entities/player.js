import { GAME_CONFIG, applyDifficulty, getDifficultyConfig } from "../config.js";
import { GAME_STATE } from "../constants.js";

/**
 * Calculate fall damage based on velocity
 * Returns 0 if below threshold, scales linearly to max damage
 */
function calculateFallDamage(velocity, difficulty) {
    if (velocity < GAME_CONFIG.FALL_DAMAGE_MIN_VELOCITY) {
        return 0;
    }

    // Scale damage based on velocity
    const velocityRange = GAME_CONFIG.FALL_DAMAGE_MAX_VELOCITY - GAME_CONFIG.FALL_DAMAGE_MIN_VELOCITY;
    const damageRange = GAME_CONFIG.FALL_DAMAGE_MAX - GAME_CONFIG.FALL_DAMAGE_MIN;
    const velocityAboveMin = velocity - GAME_CONFIG.FALL_DAMAGE_MIN_VELOCITY;
    const damagePercent = Math.min(velocityAboveMin / velocityRange, 1.0);

    const baseDamage = GAME_CONFIG.FALL_DAMAGE_MIN + (damageRange * damagePercent);

    // Apply difficulty multiplier
    const config = getDifficultyConfig(difficulty);
    return Math.round(baseDamage * config.damageTaken);
}

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

    // Initialize health based on difficulty
    const maxHealth = applyDifficulty(GAME_CONFIG.DEFAULT_HEALTH, "healthRate", difficulty);
    GAME_STATE.maxHealth = maxHealth;
    GAME_STATE.health = maxHealth;

    // Player entity with placeholder rectangle
    const player = k.add([
        k.rect(32, 32),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.body(),
        k.color(100, 200, 255), // Bright blue for Jetty
        "player",
        {
            // Player state
            fuel: applyDifficulty(GAME_CONFIG.DEFAULT_FUEL, "fuelRate", difficulty),
            maxFuel: applyDifficulty(GAME_CONFIG.DEFAULT_FUEL, "fuelRate", difficulty),
            isThrusting: false,
            fallVelocity: 0,
            moveSpeed: GAME_CONFIG.PLAYER_MOVE_SPEED,
            lastLandingVelocity: 0, // Track velocity at moment of landing
        },
    ]);

    console.log(`[PLAYER] Player object created:`, {
        pos: player.pos,
        fuel: player.fuel,
        maxFuel: player.maxFuel,
        health: GAME_STATE.health,
        maxHealth: GAME_STATE.maxHealth
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
        const fallDamage = calculateFallDamage(player.lastLandingVelocity, difficulty);

        if (fallDamage > 0) {
            // Check for shield
            if (player.hasShield) {
                player.hasShield = false;
                const shieldEffect = player.get("shieldEffect")[0];
                if (shieldEffect) k.destroy(shieldEffect);
                player.lastLandingVelocity = 0;
                // Flash blue to show shield absorbed hit
                const originalColor = player.color.clone();
                player.color = k.rgb(100, 200, 255);
                k.wait(0.2, () => {
                    player.color = originalColor;
                });
                return;
            }

            // Take fall damage
            GAME_STATE.health -= fallDamage;

            // Screen shake proportional to damage
            const shakeAmount = 5 + (fallDamage / GAME_CONFIG.FALL_DAMAGE_MAX) * 10;
            k.shake(shakeAmount);

            if (GAME_STATE.health <= 0) {
                GAME_STATE.health = 0;
                player.trigger("death");
            } else {
                // Flash player red to show damage
                const originalColor = player.color.clone();
                player.color = k.rgb(255, 100, 100);
                k.wait(0.2, () => {
                    player.color = originalColor;
                });
            }
        }

        // Reset fall tracking on landing
        player.lastLandingVelocity = 0;
        player.fallVelocity = 0;
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
            // Apply gradual upward thrust by modifying velocity directly
            // This allows gravity to always work and creates smoother acceleration
            const thrustForce = GAME_CONFIG.PLAYER_JETPACK_THRUST * dt;
            player.vel.y -= thrustForce;

            // Cap maximum upward velocity
            if (player.vel.y < -GAME_CONFIG.PLAYER_MAX_UPWARD_VELOCITY) {
                player.vel.y = -GAME_CONFIG.PLAYER_MAX_UPWARD_VELOCITY;
            }

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
            // Store this as potential landing velocity
            player.lastLandingVelocity = player.vel.y;
        } else if (player.isGrounded()) {
            // Reset when on ground and not falling
            player.fallVelocity = 0;
        }

    });

    return player;
}
