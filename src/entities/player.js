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
    const difficulty = GAME_STATE.difficulty;

    // Initialize health based on difficulty
    const maxHealth = applyDifficulty(GAME_CONFIG.DEFAULT_HEALTH, "healthRate", difficulty);
    GAME_STATE.maxHealth = maxHealth;
    GAME_STATE.health = maxHealth;

    // Player entity (invisible hitbox)
    const player = k.add([
        k.rect(28, 36),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.body(),
        k.opacity(0), // Invisible - visuals are children
        "player",
        {
            fuel: applyDifficulty(GAME_CONFIG.DEFAULT_FUEL, "fuelRate", difficulty),
            maxFuel: applyDifficulty(GAME_CONFIG.DEFAULT_FUEL, "fuelRate", difficulty),
            isThrusting: false,
            fallVelocity: 0,
            moveSpeed: GAME_CONFIG.PLAYER_MOVE_SPEED,
            lastLandingVelocity: 0,
            idleTime: 0,
            facingRight: true,
        },
    ]);

    // === JETTY'S BODY ===
    // All visuals offset by -8 to fit within hitbox

    // Jetpack (on back) - silver/grey
    const jetpack = player.add([
        k.rect(10, 20, { radius: 3 }),
        k.pos(-12, -6),
        k.anchor("center"),
        k.color(140, 150, 165),
        "jetpack",
    ]);

    // Jetpack detail stripe
    player.add([
        k.rect(6, 3),
        k.pos(-12, -10),
        k.anchor("center"),
        k.color(100, 110, 125),
    ]);

    // Jetpack nozzle
    player.add([
        k.rect(8, 4, { radius: 1 }),
        k.pos(-12, 6),
        k.anchor("center"),
        k.color(80, 85, 95),
    ]);

    // Main body - blue suit
    const body = player.add([
        k.rect(22, 24, { radius: 4 }),
        k.pos(0, -4),
        k.anchor("center"),
        k.color(70, 150, 220),
        "body",
    ]);

    // Body highlight (chest area)
    player.add([
        k.rect(14, 8, { radius: 2 }),
        k.pos(2, -8),
        k.anchor("center"),
        k.color(100, 180, 240),
    ]);

    // Belt
    player.add([
        k.rect(22, 4),
        k.pos(0, 2),
        k.anchor("center"),
        k.color(60, 65, 75),
    ]);

    // Belt buckle
    player.add([
        k.rect(6, 4),
        k.pos(0, 2),
        k.anchor("center"),
        k.color(220, 180, 50),
    ]);

    // === HELMET ===

    // Helmet base - silver
    const helmet = player.add([
        k.rect(20, 16, { radius: 6 }),
        k.pos(0, -20),
        k.anchor("center"),
        k.color(180, 190, 210),
        "helmet",
    ]);

    // Visor - dark blue/black reflective
    const visor = player.add([
        k.rect(14, 8, { radius: 3 }),
        k.pos(2, -20),
        k.anchor("center"),
        k.color(30, 50, 80),
        "visor",
    ]);

    // Visor shine
    player.add([
        k.rect(4, 2, { radius: 1 }),
        k.pos(6, -22),
        k.anchor("center"),
        k.color(150, 200, 255),
        k.opacity(0.7),
    ]);

    // Antenna
    player.add([
        k.rect(2, 6),
        k.pos(6, -30),
        k.anchor("center"),
        k.color(180, 190, 210),
    ]);

    // Antenna tip
    player.add([
        k.circle(2),
        k.pos(6, -34),
        k.anchor("center"),
        k.color(255, 100, 100),
        "antennaTip",
    ]);

    // === LEGS ===

    // Left leg
    player.add([
        k.rect(8, 10, { radius: 2 }),
        k.pos(-5, 10),
        k.anchor("center"),
        k.color(50, 120, 180),
    ]);

    // Left boot
    player.add([
        k.rect(10, 5, { radius: 2 }),
        k.pos(-5, 16),
        k.anchor("center"),
        k.color(60, 65, 75),
    ]);

    // Right leg
    player.add([
        k.rect(8, 10, { radius: 2 }),
        k.pos(5, 10),
        k.anchor("center"),
        k.color(50, 120, 180),
    ]);

    // Right boot
    player.add([
        k.rect(10, 5, { radius: 2 }),
        k.pos(5, 16),
        k.anchor("center"),
        k.color(60, 65, 75),
    ]);

    // === JETPACK FLAMES ===

    // Outer flame (orange)
    const flameOuter = player.add([
        k.rect(12, 20, { radius: 4 }),
        k.pos(-12, 20),
        k.anchor("top"),
        k.color(255, 150, 50),
        k.opacity(0),
        "flameOuter",
    ]);

    // Middle flame (yellow)
    const flameMiddle = player.add([
        k.rect(8, 16, { radius: 3 }),
        k.pos(-12, 18),
        k.anchor("top"),
        k.color(255, 220, 100),
        k.opacity(0),
        "flameMiddle",
    ]);

    // Inner flame (white-hot)
    const flameInner = player.add([
        k.rect(4, 10, { radius: 2 }),
        k.pos(-12, 16),
        k.anchor("top"),
        k.color(255, 255, 220),
        k.opacity(0),
        "flameInner",
    ]);

    // Flame particle time tracker
    let flameTime = 0;

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
            }
        }

        // Reset fall tracking on landing
        player.lastLandingVelocity = 0;
        player.fallVelocity = 0;
    });

    // Movement and jetpack input
    player.onUpdate(() => {
        const dt = k.dt();
        player.idleTime += dt;

        // Horizontal movement
        if (k.isKeyDown("left")) {
            player.move(-player.moveSpeed, 0);
            player.facingRight = false;
        }
        if (k.isKeyDown("right")) {
            player.move(player.moveSpeed, 0);
            player.facingRight = true;
        }

        // Flip character based on facing direction
        const scaleX = player.facingRight ? 1 : -1;
        body.scale = k.vec2(scaleX, 1);
        helmet.scale = k.vec2(scaleX, 1);
        visor.pos.x = 2 * scaleX;
        jetpack.pos.x = -12 * scaleX;

        // Jetpack thrust
        if (k.isKeyDown("space") && player.fuel > 0) {
            const thrustForce = GAME_CONFIG.PLAYER_JETPACK_THRUST * dt;
            player.vel.y -= thrustForce;

            if (player.vel.y < -GAME_CONFIG.PLAYER_MAX_UPWARD_VELOCITY) {
                player.vel.y = -GAME_CONFIG.PLAYER_MAX_UPWARD_VELOCITY;
            }

            player.fuel -= GAME_CONFIG.FUEL_CONSUMPTION_RATE * dt;
            if (player.fuel < 0) player.fuel = 0;

            player.isThrusting = true;

            // Animate flames
            flameTime += dt * 15;
            const flicker = 0.7 + Math.sin(flameTime) * 0.3;
            const sizeFlicker = 1 + Math.sin(flameTime * 1.3) * 0.2;

            flameOuter.opacity = flicker;
            flameMiddle.opacity = flicker;
            flameInner.opacity = 1;

            flameOuter.scale = k.vec2(sizeFlicker, sizeFlicker);
            flameMiddle.scale = k.vec2(sizeFlicker * 0.9, sizeFlicker * 1.1);

            // Position flames based on facing
            const flameX = -12 * scaleX;
            flameOuter.pos.x = flameX;
            flameMiddle.pos.x = flameX;
            flameInner.pos.x = flameX;
        } else {
            player.isThrusting = false;
            flameOuter.opacity = 0;
            flameMiddle.opacity = 0;
            flameInner.opacity = 0;
        }

        // Idle animation - subtle bob
        if (player.isGrounded() && !k.isKeyDown("left") && !k.isKeyDown("right")) {
            const bob = Math.sin(player.idleTime * 2) * 1.5;
            body.pos.y = -4 + bob * 0.3;
            helmet.pos.y = -20 + bob * 0.5;
        } else {
            body.pos.y = -4;
            helmet.pos.y = -20;
        }

        // Antenna tip blink
        const antennaTip = player.get("antennaTip")[0];
        if (antennaTip) {
            antennaTip.opacity = 0.5 + Math.sin(player.idleTime * 4) * 0.5;
        }

        // Track fall velocity for fall damage system
        if (player.vel.y > 0) {
            player.fallVelocity = player.vel.y;
            player.lastLandingVelocity = player.vel.y;
        } else if (player.isGrounded()) {
            player.fallVelocity = 0;
        }
    });

    return player;
}
