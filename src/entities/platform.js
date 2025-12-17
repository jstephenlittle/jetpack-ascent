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

    const platform = k.add([
        k.rect(width, height),
        k.pos(x, y),
        k.area(),
        k.body({ isStatic: true }),
        k.color(...color),
        k.outline(2, k.rgb(50, 80, 110)),
        "platform",
        {
            platformType: "static",
        },
    ]);

    // Add industrial panel lines/rivets for metallic look
    const numPanels = Math.floor(width / 40);
    for (let i = 1; i < numPanels; i++) {
        // Vertical panel divider
        k.add([
            k.rect(2, height - 4),
            k.pos(x + i * 40, y + 2),
            k.color(45, 70, 100),
            k.opacity(0.6),
            "platformDecor",
        ]);
    }

    // Top highlight strip (metallic sheen)
    k.add([
        k.rect(width - 4, 3),
        k.pos(x + 2, y + 2),
        k.color(100, 150, 190),
        k.opacity(0.5),
        "platformDecor",
    ]);

    return platform;
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

    // Add warning stripes (yellow/black diagonal pattern)
    const stripeDecor = [];
    const stripeWidth = 8;
    const numStripes = Math.floor(width / (stripeWidth * 2));
    for (let i = 0; i < numStripes; i++) {
        const stripe = k.add([
            k.rect(stripeWidth, height - 2),
            k.pos(x + 4 + i * stripeWidth * 2, y + 1),
            k.color(220, 180, 40),
            k.opacity(0.7),
            "platformDecor",
            "breakawayStripe",
        ]);
        stripeDecor.push(stripe);
    }

    // Crack lines overlay
    const crack1 = k.add([
        k.rect(width * 0.6, 2),
        k.pos(x + width * 0.2, y + height / 2 - 1),
        k.color(60, 30, 70),
        k.opacity(0.5),
        "platformDecor",
        "breakawayCrack",
    ]);
    const crack2 = k.add([
        k.rect(2, height * 0.5),
        k.pos(x + width * 0.4, y + height * 0.25),
        k.color(60, 30, 70),
        k.opacity(0.5),
        "platformDecor",
        "breakawayCrack",
    ]);
    stripeDecor.push(crack1, crack2);

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

            // Move decor with platform
            stripeDecor.forEach((decor, i) => {
                if (decor.exists()) {
                    decor.opacity = 1 - intensity * 0.8;
                }
            });

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
                // Destroy decorations
                stripeDecor.forEach(decor => {
                    if (decor.exists()) k.destroy(decor);
                });
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

    // Add upward chevron arrows to indicate bounce
    const centerX = x + width / 2;
    const arrowDecor = [];

    // Three chevron arrows pointing up
    for (let i = 0; i < 3; i++) {
        const arrowY = y + 3 + i * 5;
        // Left part of chevron
        const leftArm = k.add([
            k.rect(8, 3),
            k.pos(centerX - 8, arrowY),
            k.anchor("center"),
            k.color(255, 100, 30),
            k.opacity(0.8 - i * 0.2),
            k.rotate(-35),
            "platformDecor",
            "bounceArrow",
        ]);
        // Right part of chevron
        const rightArm = k.add([
            k.rect(8, 3),
            k.pos(centerX + 8, arrowY),
            k.anchor("center"),
            k.color(255, 100, 30),
            k.opacity(0.8 - i * 0.2),
            k.rotate(35),
            "platformDecor",
            "bounceArrow",
        ]);
        arrowDecor.push(leftArm, rightArm);
    }

    // Spring coil sides
    const springLeft = k.add([
        k.rect(4, height - 2),
        k.pos(x + 3, y + 1),
        k.color(200, 120, 20),
        k.opacity(0.7),
        "platformDecor",
    ]);
    const springRight = k.add([
        k.rect(4, height - 2),
        k.pos(x + width - 7, y + 1),
        k.color(200, 120, 20),
        k.opacity(0.7),
        "platformDecor",
    ]);
    arrowDecor.push(springLeft, springRight);

    platform.onCollide("player", (player) => {
        // Always bounce when landing on pad (vel.y >= 0 means falling or stationary)
        if (player.vel.y >= 0) {
            // Direct velocity set for reliable bounce
            player.vel.y = -platform.bounceForce;

            // Visual feedback - compress and flash bright
            platform.isCompressed = true;
            platform.color = k.rgb(255, 255, 150); // Bright flash

            // Flash arrows bright
            arrowDecor.forEach(arrow => {
                if (arrow.is("bounceArrow")) {
                    arrow.color = k.rgb(255, 255, 200);
                }
            });

            k.wait(0.1, () => {
                platform.isCompressed = false;
                // Reset arrow colors
                arrowDecor.forEach(arrow => {
                    if (arrow.is("bounceArrow")) {
                        arrow.color = k.rgb(255, 100, 30);
                    }
                });
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

            // Animate arrows (bob up slightly)
            const arrowBob = Math.sin(platform.pulseTime * 6) * 2;
            arrowDecor.forEach((arrow, i) => {
                if (arrow.is("bounceArrow")) {
                    const baseOpacity = 0.8 - Math.floor(i / 2) * 0.2;
                    arrow.opacity = baseOpacity + Math.sin(platform.pulseTime * 8 + i) * 0.2;
                }
            });
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

    // Energy bars across the platform
    const energyDecor = [];
    const numBars = Math.floor(width / 20);
    for (let i = 0; i < numBars; i++) {
        const bar = k.add([
            k.rect(4, height - 6),
            k.pos(x + 8 + i * 20, y + 3),
            k.color(150, 255, 255),
            k.opacity(0.6),
            "platformDecor",
            "energyBar",
            { barIndex: i },
        ]);
        energyDecor.push(bar);
    }

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

            // Animate energy bars - wave effect
            energyDecor.forEach((bar, i) => {
                if (bar.is("energyBar")) {
                    const wave = Math.sin(platform.glowTime * 15 + i * 0.5);
                    bar.opacity = 0.5 + wave * 0.5;
                    bar.color = k.rgb(200, 255, 255);
                }
            });

            platform.isCharging = false; // Reset each frame
        } else {
            // Calm idle pulse
            const pulse = 0.7 + Math.sin(platform.glowTime * 2) * 0.3;
            platform.color = k.rgb(50, 200 * pulse, 255 * pulse);

            // Subtle bar animation
            energyDecor.forEach((bar, i) => {
                if (bar.is("energyBar")) {
                    const wave = Math.sin(platform.glowTime * 3 + i * 0.3);
                    bar.opacity = 0.4 + wave * 0.2;
                    bar.color = k.rgb(150, 255, 255);
                }
            });
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

    // Flag pole on left side
    const centerX = x + width / 2;
    const flagPole = k.add([
        k.rect(4, 40),
        k.pos(centerX - 2, y - 40),
        k.color(120, 100, 80),
        k.outline(1, k.rgb(80, 60, 50)),
        "platformDecor",
        "flagPole",
    ]);

    // Flag banner (triangular effect using rectangle)
    const flagBanner = k.add([
        k.rect(24, 16),
        k.pos(centerX + 2, y - 38),
        k.color(80, 200, 100),
        k.outline(1, k.rgb(50, 150, 70)),
        "platformDecor",
        "flagBanner",
    ]);

    // Star/diamond marker on flag
    const flagStar = k.add([
        k.rect(8, 8),
        k.pos(centerX + 12, y - 32),
        k.anchor("center"),
        k.color(255, 255, 200),
        k.opacity(0.9),
        k.rotate(45),
        "platformDecor",
        "flagStar",
    ]);

    // Decorative lines on platform
    const lineDecor = [];
    const numLines = 4;
    for (let i = 0; i < numLines; i++) {
        const line = k.add([
            k.rect(width / (numLines + 1) - 10, 3),
            k.pos(x + 10 + i * (width / numLines), y + height / 2 - 1),
            k.color(50, 180, 80),
            k.opacity(0.5),
            "platformDecor",
            "checkpointLine",
        ]);
        lineDecor.push(line);
    }

    const decorElements = [flagPole, flagBanner, flagStar, ...lineDecor];

    // Activate checkpoint when player lands
    platform.onCollide("player", (player) => {
        if (!platform.activated) {
            platform.activated = true;

            // Save checkpoint position
            player.checkpointPos = k.vec2(platform.pos.x, platform.pos.y - 50);
            console.log(`[CHECKPOINT] Checkpoint saved at y: ${platform.pos.y}`);

            // Change flag to gold
            flagBanner.color = k.rgb(255, 200, 50);
            flagBanner.outline = { width: 1, color: k.rgb(200, 150, 30) };
        }
    });

    // Visual pulse animation
    platform.onUpdate(() => {
        platform.pulseTime += k.dt();

        if (platform.activated) {
            // Golden glow when activated
            const glow = 0.85 + Math.sin(platform.pulseTime * 3) * 0.15;
            platform.color = k.rgb(255 * glow, 220 * glow, 80);

            // Animate flag wave
            const wave = Math.sin(platform.pulseTime * 4) * 3;
            flagBanner.pos.x = centerX + 2 + wave;

            // Star sparkle
            flagStar.opacity = 0.7 + Math.sin(platform.pulseTime * 8) * 0.3;
            flagStar.angle = 45 + Math.sin(platform.pulseTime * 2) * 10;

            // Lines glow gold
            lineDecor.forEach((line, i) => {
                const lineGlow = 0.5 + Math.sin(platform.pulseTime * 5 + i * 0.5) * 0.3;
                line.color = k.rgb(255 * lineGlow, 200 * lineGlow, 50);
            });
        } else {
            // Green pulse when not yet activated
            const pulse = 0.7 + Math.sin(platform.pulseTime * 4) * 0.3;
            platform.color = k.rgb(80, 220 * pulse, 100);

            // Subtle flag wave
            const wave = Math.sin(platform.pulseTime * 2) * 2;
            flagBanner.pos.x = centerX + 2 + wave;

            // Star gentle pulse
            flagStar.opacity = 0.6 + Math.sin(platform.pulseTime * 3) * 0.3;

            // Lines subtle pulse
            lineDecor.forEach((line, i) => {
                const linePulse = 0.4 + Math.sin(platform.pulseTime * 3 + i * 0.3) * 0.2;
                line.opacity = linePulse;
            });
        }
    });

    return platform;
}
