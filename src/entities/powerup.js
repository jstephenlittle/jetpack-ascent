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
    // Battery/fuel canister - green energy
    const powerup = k.add([
        k.rect(12, 20),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(80, 220, 100),
        k.outline(2, k.rgb(40, 140, 60)),
        "powerup",
        "fuelCell",
        {
            floatTime: 0,
            glowTime: 0,
        },
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 4;
        powerup.pos.y = y + floatOffset;

        // Pulsing glow
        powerup.glowTime += k.dt();
        const pulse = 0.7 + Math.sin(powerup.glowTime * 4) * 0.3;
        powerup.color = k.rgb(80, 220 * pulse, 100);
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
    // Shield orb - cyan energy sphere
    const powerup = k.add([
        k.circle(10),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(100, 220, 255),
        k.outline(2, k.rgb(60, 160, 220)),
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
        const floatOffset = Math.sin(powerup.floatTime * 2) * 4;
        powerup.pos.y = y + floatOffset;

        // Pulse animation with color shift
        powerup.pulseTime += k.dt();
        const scale = 1 + Math.sin(powerup.pulseTime * 3) * 0.15;
        powerup.scale = k.vec2(scale, scale);

        // Cyan to white shimmer
        const shimmer = 0.8 + Math.sin(powerup.pulseTime * 5) * 0.2;
        powerup.color = k.rgb(100 + 80 * shimmer, 220, 255);
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
    // Rocket boost - orange/yellow energy arrow pointing up
    const powerup = k.add([
        k.rect(14, 22),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(255, 180, 50),
        k.outline(2, k.rgb(200, 120, 30)),
        "powerup",
        "megaBoost",
        {
            floatTime: 0,
            flameTime: 0,
        },
    ]);

    powerup.onUpdate(() => {
        // Hover up and down more dramatically
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 3) * 6;
        powerup.pos.y = y + floatOffset;

        // Flame flicker effect
        powerup.flameTime += k.dt();
        const flicker = 0.7 + Math.sin(powerup.flameTime * 12) * 0.3;
        powerup.color = k.rgb(255, 180 * flicker, 50);
    });

    powerup.onCollide("player", (player) => {
        // Mega boost upward
        player.jump(1200);

        k.destroy(powerup);
    });

    return powerup;
}

/**
 * Create a Health pickup
 * Restores health to the player
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Power-up game object
 */
export function createHealthPickup(k, x, y) {
    // Health kit - red with white cross (no child objects to avoid WebGL issues)
    const powerup = k.add([
        k.rect(18, 18),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(220, 60, 80),
        k.outline(2, k.rgb(160, 40, 60)),
        "powerup",
        "healthPickup",
        {
            floatTime: 0,
            pulseTime: 0,
        },
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 4;
        powerup.pos.y = y + floatOffset;

        // Heartbeat pulse effect
        powerup.pulseTime += k.dt();
        const beat = Math.sin(powerup.pulseTime * 4);
        const scale = beat > 0.7 ? 1.15 : 1 + beat * 0.05;
        powerup.scale = k.vec2(scale, scale);

        // Gentle color pulse
        const pulse = 0.85 + Math.sin(powerup.pulseTime * 3) * 0.15;
        powerup.color = k.rgb(220 * pulse, 60, 80);
    });

    powerup.onCollide("player", (player) => {
        // Restore health
        const healAmount = GAME_CONFIG.HEALTH_PICKUP_AMOUNT;
        GAME_STATE.health = Math.min(GAME_STATE.health + healAmount, GAME_STATE.maxHealth);

        // Flash green to show healing
        const body = player.get("body")[0];
        if (body) {
            const originalColor = body.color.clone();
            body.color = k.rgb(100, 255, 100);
            k.wait(0.2, () => {
                body.color = originalColor;
            });
        }

        k.destroy(powerup);
    });

    return powerup;
}
