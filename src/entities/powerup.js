import { GAME_CONFIG } from "../config.js";
import { GAME_STATE } from "../constants.js";

/**
 * Create a Fuel Cell power-up
 * Refills a chunk of jetpack fuel
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Power-up game object
 */
export function createFuelCell(k, x, y) {
    const powerup = k.add([
        k.rect(16, 16),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(100, 255, 100),
        "powerup",
        "fuelCell",
        {
            floatTime: 0,
            rotateSpeed: 2,
        },
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 5;
        powerup.pos.y = y + floatOffset;

        // Rotate
        powerup.angle += k.dt() * powerup.rotateSpeed;
    });

    powerup.onCollide("player", (player) => {
        // Refill 40% of max fuel
        player.fuel += player.maxFuel * 0.4;
        if (player.fuel > player.maxFuel) {
            player.fuel = player.maxFuel;
        }

        k.destroy(powerup);
    });

    return powerup;
}

/**
 * Create a Shield power-up
 * Temporary invulnerability (absorbs one hit)
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Power-up game object
 */
export function createShield(k, x, y) {
    const powerup = k.add([
        k.circle(8),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(100, 200, 255),
        "powerup",
        "shield",
        {
            floatTime: 0,
            pulseTime: 0,
        },
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 5;
        powerup.pos.y = y + floatOffset;

        // Pulse animation
        powerup.pulseTime += k.dt();
        const scale = 1 + Math.sin(powerup.pulseTime * 4) * 0.2;
        powerup.scale = k.vec2(scale, scale);
    });

    powerup.onCollide("player", (player) => {
        // Grant shield (absorbs one hit or fall)
        player.hasShield = true;

        // Visual indicator on player
        const shield = player.add([
            k.circle(20),
            k.opacity(0.3),
            k.color(100, 200, 255),
            "shieldEffect",
        ]);

        // Shield effect lasts 10 seconds or until hit
        k.wait(10, () => {
            if (player.hasShield) {
                player.hasShield = false;
                k.destroy(shield);
            }
        });

        k.destroy(powerup);
    });

    return powerup;
}

/**
 * Create a Mega Boost power-up
 * Large one-time upward velocity burst
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Power-up game object
 */
export function createMegaBoost(k, x, y) {
    const powerup = k.add([
        k.rect(16, 20),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(255, 200, 50),
        "powerup",
        "megaBoost",
        {
            floatTime: 0,
            rotateSpeed: 3,
        },
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 5;
        powerup.pos.y = y + floatOffset;

        // Rotate
        powerup.angle += k.dt() * powerup.rotateSpeed;
    });

    powerup.onCollide("player", (player) => {
        // Mega boost upward
        player.jump(1200);

        k.destroy(powerup);
    });

    return powerup;
}

/**
 * Create an Extra Life power-up (rare)
 * Adds +1 life
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Power-up game object
 */
export function createExtraLife(k, x, y) {
    const powerup = k.add([
        k.rect(16, 16),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(255, 100, 255),
        "powerup",
        "extraLife",
        {
            floatTime: 0,
            pulseTime: 0,
        },
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 8;
        powerup.pos.y = y + floatOffset;

        // Pulse and glow
        powerup.pulseTime += k.dt();
        const scale = 1 + Math.sin(powerup.pulseTime * 3) * 0.3;
        powerup.scale = k.vec2(scale, scale);

        const glow = 0.7 + Math.sin(powerup.pulseTime * 5) * 0.3;
        powerup.opacity = glow;
    });

    powerup.onCollide("player", (player) => {
        // Add one life
        GAME_STATE.lives += 1;

        k.destroy(powerup);
    });

    return powerup;
}
