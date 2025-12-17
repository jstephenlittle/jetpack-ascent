import { GAME_CONFIG } from "../config.js";
import { GAME_STATE } from "../constants.js";

/**
 * Create a Fuel Cell power-up
 * Refills a chunk of jetpack fuel - looks like 2-cylinder fuel pack
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Power-up game object
 */
export function createFuelCell(k, x, y) {
    // Invisible collision box for pickup detection
    const powerup = k.add([
        k.rect(24, 22),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.opacity(0), // Invisible - just for collision
        "powerup",
        "fuelCell",
        {
            floatTime: 0,
            glowTime: 0,
            baseX: x,
        },
    ]);

    // Left cylinder (visual only)
    const cylinder1 = k.add([
        k.rect(10, 22),
        k.pos(x - 6, y),
        k.anchor("center"),
        k.color(60, 180, 80),
        k.outline(2, k.rgb(40, 120, 50)),
        "fuelCylinder",
    ]);

    // Right cylinder (visual only)
    const cylinder2 = k.add([
        k.rect(10, 22),
        k.pos(x + 6, y),
        k.anchor("center"),
        k.color(60, 180, 80),
        k.outline(2, k.rgb(40, 120, 50)),
        "fuelCylinder",
    ]);

    // Connecting band (top)
    const bandTop = k.add([
        k.rect(16, 4),
        k.pos(x, y - 7),
        k.anchor("center"),
        k.color(80, 80, 90),
        k.outline(1, k.rgb(50, 50, 60)),
        "fuelBand",
    ]);

    // Connecting band (bottom)
    const bandBottom = k.add([
        k.rect(16, 4),
        k.pos(x, y + 7),
        k.anchor("center"),
        k.color(80, 80, 90),
        k.outline(1, k.rgb(50, 50, 60)),
        "fuelBand",
    ]);

    // Energy glow indicator on each cylinder
    const glow1 = k.add([
        k.rect(4, 10),
        k.pos(x - 6, y),
        k.anchor("center"),
        k.color(120, 255, 140),
        k.opacity(0.8),
        "fuelGlow",
    ]);

    const glow2 = k.add([
        k.rect(4, 10),
        k.pos(x + 6, y),
        k.anchor("center"),
        k.color(120, 255, 140),
        k.opacity(0.8),
        "fuelGlow",
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 4;
        const currentY = y + floatOffset;

        // Update all parts to follow
        powerup.pos.y = currentY;
        cylinder1.pos.y = currentY;
        cylinder2.pos.y = currentY;
        bandTop.pos.y = currentY - 7;
        bandBottom.pos.y = currentY + 7;
        glow1.pos.y = currentY;
        glow2.pos.y = currentY;

        // Keep x positions synced
        powerup.pos.x = powerup.baseX;
        cylinder1.pos.x = powerup.baseX - 6;
        cylinder2.pos.x = powerup.baseX + 6;
        bandTop.pos.x = powerup.baseX;
        bandBottom.pos.x = powerup.baseX;
        glow1.pos.x = powerup.baseX - 6;
        glow2.pos.x = powerup.baseX + 6;

        // Pulsing energy glow
        powerup.glowTime += k.dt();
        const pulse = 0.6 + Math.sin(powerup.glowTime * 5) * 0.4;
        glow1.opacity = pulse;
        glow2.opacity = pulse;

        // Cylinder color pulse
        const colorPulse = 0.85 + Math.sin(powerup.glowTime * 3) * 0.15;
        cylinder1.color = k.rgb(60, 180 * colorPulse, 80);
        cylinder2.color = k.rgb(60, 180 * colorPulse, 80);
    });

    powerup.onCollide("player", (player) => {
        // Refill 40% of max fuel
        player.fuel += player.maxFuel * 0.4;
        if (player.fuel > player.maxFuel) {
            player.fuel = player.maxFuel;
        }

        // Destroy all parts
        k.destroy(cylinder1);
        k.destroy(cylinder2);
        k.destroy(bandTop);
        k.destroy(bandBottom);
        k.destroy(glow1);
        k.destroy(glow2);
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
 * Restores health to the player - looks like a first-aid kit
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Power-up game object
 */
export function createHealthPickup(k, x, y) {
    // First-aid kit - white body with red cross
    // Main kit body (white/cream colored)
    const powerup = k.add([
        k.rect(24, 20),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(245, 245, 240),
        k.outline(2, k.rgb(180, 180, 175)),
        "powerup",
        "healthPickup",
        {
            floatTime: 0,
            pulseTime: 0,
        },
    ]);

    // Red cross - horizontal bar (separate entity to avoid child object issues)
    const crossH = k.add([
        k.rect(14, 4),
        k.pos(x, y),
        k.anchor("center"),
        k.color(220, 50, 50),
        "healthCross",
    ]);

    // Red cross - vertical bar
    const crossV = k.add([
        k.rect(4, 14),
        k.pos(x, y),
        k.anchor("center"),
        k.color(220, 50, 50),
        "healthCross",
    ]);

    powerup.onUpdate(() => {
        // Float animation
        powerup.floatTime += k.dt();
        const floatOffset = Math.sin(powerup.floatTime * 2) * 4;
        powerup.pos.y = y + floatOffset;

        // Cross follows the kit
        crossH.pos.x = powerup.pos.x;
        crossH.pos.y = powerup.pos.y;
        crossV.pos.x = powerup.pos.x;
        crossV.pos.y = powerup.pos.y;

        // Gentle pulse effect
        powerup.pulseTime += k.dt();
        const pulse = 0.95 + Math.sin(powerup.pulseTime * 3) * 0.05;
        powerup.scale = k.vec2(pulse, pulse);
        crossH.scale = k.vec2(pulse, pulse);
        crossV.scale = k.vec2(pulse, pulse);

        // Cross color pulse (red glow)
        const glow = 0.9 + Math.sin(powerup.pulseTime * 4) * 0.1;
        crossH.color = k.rgb(220, 50 * glow, 50 * glow);
        crossV.color = k.rgb(220, 50 * glow, 50 * glow);
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

        // Destroy cross parts and powerup
        k.destroy(crossH);
        k.destroy(crossV);
        k.destroy(powerup);
    });

    return powerup;
}
