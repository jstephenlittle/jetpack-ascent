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
    const color = options.color || [80, 120, 160]; // Metallic blue-grey for space theme

    return k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(...color),
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
    const platform = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(120, 80, 140), // Purple-ish for unstable energy platforms
        "platform",
        {
            platformType: "breakaway",
            isBreaking: false,
            breakTimer: 0,
            breakTime: 1.5, // seconds
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

            // Visual feedback - shake and fade
            const shake = Math.sin(platform.breakTimer * 20) * 2;
            platform.pos.x += shake;

            // Change color as it breaks
            const fadePercent = platform.breakTimer / platform.breakTime;
            platform.opacity = 1 - fadePercent * 0.5;

            if (platform.breakTimer >= platform.breakTime) {
                // Platform breaks
                k.destroy(platform);
            }
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
        k.color(255, 200, 50), // Bright yellow/gold for energy boosters
        "platform",
        {
            platformType: "bounce",
            bounceForce: 900,
            isCompressed: false,
        },
    ]);

    platform.onCollide("player", (player) => {
        if (player.vel.y > 0) {
            // Player is falling onto the bounce pad
            player.jump(platform.bounceForce);

            // Visual feedback
            platform.isCompressed = true;
            k.wait(0.1, () => {
                platform.isCompressed = false;
            });
        }
    });

    // Animate compression
    platform.onUpdate(() => {
        if (platform.isCompressed) {
            platform.height = height * 0.7;
        } else {
            platform.height = height;
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
        "platform",
        {
            platformType: "recharge",
        },
    ]);

    // Recharge player fuel while standing
    platform.onCollideUpdate("player", (player) => {
        if (player.fuel < player.maxFuel) {
            player.fuel += GAME_CONFIG.FUEL_RECHARGE_RATE * k.dt();
            if (player.fuel > player.maxFuel) {
                player.fuel = player.maxFuel;
            }
        }
    });

    // Visual glow animation
    platform.onUpdate(() => {
        const pulse = (Math.sin(k.time() * 3) + 1) * 0.5;
        platform.opacity = 0.7 + pulse * 0.3;
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
        k.color(100, 255, 100), // Green for checkpoint
        "platform",
        "checkpoint",
        {
            platformType: "checkpoint",
            activated: false,
        },
    ]);

    // Activate checkpoint when player lands
    platform.onCollide("player", (player) => {
        if (!platform.activated) {
            platform.activated = true;
            platform.color = k.rgb(255, 255, 100); // Change to yellow when activated

            // Save checkpoint position
            player.checkpointPos = k.vec2(platform.pos.x, platform.pos.y - 50);
            console.log(`[CHECKPOINT] Checkpoint saved at y: ${platform.pos.y}`);
        }
    });

    // Visual pulse animation
    platform.onUpdate(() => {
        if (!platform.activated) {
            const pulse = (Math.sin(k.time() * 4) + 1) * 0.5;
            platform.opacity = 0.7 + pulse * 0.3;
        }
    });

    return platform;
}
