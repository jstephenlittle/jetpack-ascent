import { GAME_CONFIG } from "../config.js";

/**
 * Create a static platform
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Platform width
 * @param {object} options - Optional styling
 * @returns {object} Platform game object
 */
export function createPlatform(k, x, y, width = 150, options = {}) {
    const height = options.height || GAME_CONFIG.PLATFORM_HEIGHT;
    const color = options.color || [70, 110, 150]; // Metallic blue-grey for space theme

    return k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(...color),
        k.outline(1, k.rgb(50, 80, 110)),
        "platform",
        {
            platformType: "static",
        },
    ]);
}

/**
 * Create a breakaway platform that crumbles after player contact
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Platform width
 * @returns {object} Platform game object
 */
export function createBreakawayPlatform(k, x, y, width = 150) {
    const height = GAME_CONFIG.PLATFORM_HEIGHT;
    const baseX = x;
    const platform = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(140, 90, 160),
        k.outline(2, k.rgb(100, 60, 120)),
        "platform",
        {
            platformType: "breakaway",
            isBreaking: false,
            breakTimer: 0,
            breakTime: 1.5,
            warningTime: 0,
        },
    ]);

    // Start breaking when player touches
    platform.onCollide("player", () => {
        if (!platform.isBreaking) {
            platform.isBreaking = true;
        }
    });

    // Update break state
    platform.onUpdate(() => {
        if (platform.isBreaking) {
            platform.breakTimer += k.dt();

            // Shake more intensely as it breaks
            const intensity = platform.breakTimer / platform.breakTime;
            const shake = Math.sin(platform.breakTimer * 25) * (2 + intensity * 4);
            platform.pos.x = baseX + shake;

            // Flash between purple and red as warning
            const flash = Math.sin(platform.breakTimer * 15) > 0;
            if (flash) {
                platform.color = k.rgb(200, 80, 100);
            } else {
                platform.color = k.rgb(140, 90, 160);
            }

            // Fade out
            platform.opacity = 1 - intensity * 0.6;

            if (platform.breakTimer >= platform.breakTime) {
                k.destroy(platform);
            }
        } else {
            // Subtle warning pulse when not breaking
            platform.warningTime += k.dt();
            const pulse = 0.9 + Math.sin(platform.warningTime * 2) * 0.1;
            platform.color = k.rgb(140 * pulse, 90 * pulse, 160);
        }
    });

    return platform;
}

/**
 * Create a bounce pad that launches player upward
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Platform width
 * @returns {object} Platform game object
 */
export function createBouncePad(k, x, y, width = 100) {
    const height = GAME_CONFIG.PLATFORM_HEIGHT;
    const platform = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(255, 200, 50),
        k.outline(2, k.rgb(200, 150, 30)),
        "platform",
        {
            platformType: "bounce",
            bounceForce: 900,
            isCompressed: false,
            pulseTime: 0,
        },
    ]);

    platform.onCollide("player", (player) => {
        if (player.vel.y > 0) {
            player.jump(platform.bounceForce);

            // Visual feedback - compress and flash bright
            platform.isCompressed = true;
            platform.color = k.rgb(255, 255, 150); // Bright flash
            k.wait(0.1, () => {
                platform.isCompressed = false;
            });
        }
    });

    // Animate compression and idle pulse
    platform.onUpdate(() => {
        platform.pulseTime += k.dt();

        if (platform.isCompressed) {
            platform.height = height * 0.6;
        } else {
            platform.height = height;
            // Energetic pulse when ready
            const pulse = 0.85 + Math.sin(platform.pulseTime * 5) * 0.15;
            platform.color = k.rgb(255, 200 * pulse, 50);
        }
    });

    return platform;
}

/**
 * Create a recharge station that refills fuel
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Platform width
 * @returns {object} Platform game object
 */
export function createRechargeStation(k, x, y, width = 120) {
    const height = GAME_CONFIG.PLATFORM_HEIGHT;
    const platform = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(50, 200, 255),
        k.outline(2, k.rgb(30, 140, 200)),
        "platform",
        {
            platformType: "recharge",
            glowTime: 0,
            isCharging: false,
        },
    ]);

    // Recharge player fuel while standing
    platform.onCollideUpdate("player", (player) => {
        platform.isCharging = true;
        if (player.fuel < player.maxFuel) {
            player.fuel += GAME_CONFIG.FUEL_RECHARGE_RATE * k.dt();
            if (player.fuel > player.maxFuel) {
                player.fuel = player.maxFuel;
            }
        }
    });

    // Visual glow animation
    platform.onUpdate(() => {
        platform.glowTime += k.dt();

        if (platform.isCharging) {
            // Bright active charging effect
            const charge = 0.8 + Math.sin(platform.glowTime * 10) * 0.2;
            platform.color = k.rgb(100, 255 * charge, 255);
            platform.isCharging = false; // Reset each frame
        } else {
            // Calm idle pulse
            const pulse = 0.7 + Math.sin(platform.glowTime * 2) * 0.3;
            platform.color = k.rgb(50, 200 * pulse, 255 * pulse);
        }
    });

    return platform;
}

/**
 * Create a checkpoint platform that saves player progress
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} width - Platform width
 * @returns {object} Platform game object
 */
export function createCheckpoint(k, x, y, width = 200) {
    const height = GAME_CONFIG.PLATFORM_HEIGHT;
    const platform = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(80, 220, 100),
        k.outline(2, k.rgb(50, 160, 70)),
        "platform",
        "checkpoint",
        {
            platformType: "checkpoint",
            activated: false,
            pulseTime: 0,
        },
    ]);

    // Activate checkpoint when player lands
    platform.onCollide("player", (player) => {
        if (!platform.activated) {
            platform.activated = true;

            // Save checkpoint position
            player.checkpointPos = k.vec2(platform.pos.x, platform.pos.y - 50);
            console.log(`[CHECKPOINT] Checkpoint saved at y: ${platform.pos.y}`);
        }
    });

    // Visual pulse animation
    platform.onUpdate(() => {
        platform.pulseTime += k.dt();

        if (platform.activated) {
            // Golden glow when activated
            const glow = 0.85 + Math.sin(platform.pulseTime * 3) * 0.15;
            platform.color = k.rgb(255 * glow, 220 * glow, 80);
        } else {
            // Green pulse when not yet activated
            const pulse = 0.7 + Math.sin(platform.pulseTime * 4) * 0.3;
            platform.color = k.rgb(80, 220 * pulse, 100);
        }
    });

    return platform;
}
