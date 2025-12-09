import { GAME_CONFIG, applyDifficulty } from "../config.js";
import { GAME_STATE } from "../constants.js";

/**
 * Create a Roller Bot enemy
 * Rolls along platforms, reverses at edges
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Enemy game object
 */
export function createRollerBot(k, x, y) {
    const speed = applyDifficulty(GAME_CONFIG.ROLLER_BOT_SPEED, "enemySpeed", GAME_STATE.difficulty);

    const bot = k.add([
        k.rect(24, 24),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.body(),
        k.color(200, 50, 50),
        "enemy",
        "rollerBot",
        {
            speed: speed,
            direction: 1, // 1 = right, -1 = left
        },
    ]);

    bot.onUpdate(() => {
        // Move in current direction
        bot.move(bot.speed * bot.direction, 0);

        // Check for platform edges or walls
        const nextX = bot.pos.x + (bot.direction * 20);
        const below = k.get("platform").filter(p => {
            return Math.abs(p.pos.y - (bot.pos.y + 20)) < 5 &&
                   Math.abs(p.pos.x - nextX) < p.width / 2;
        });

        // Reverse if no platform ahead or hit wall
        if (below.length === 0 || bot.pos.x < 50 || bot.pos.x > k.width() - 50) {
            bot.direction *= -1;
        }

        // Simple rotation animation
        bot.angle += k.dt() * bot.speed * 0.5 * bot.direction;
    });

    // Damage player on collision
    bot.onCollide("player", (player) => {
        GAME_STATE.lives -= 1;

        if (GAME_STATE.lives <= 0) {
            player.trigger("death");
        } else {
            // Flash player red
            const originalColor = player.color.clone();
            player.color = k.rgb(255, 100, 100);
            k.wait(0.2, () => {
                player.color = originalColor;
            });
        }

        // Destroy enemy on hit
        k.destroy(bot);
    });

    return bot;
}

/**
 * Create a Hover Drone enemy
 * Moves horizontally in mid-air with bobbing motion
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} range - Horizontal movement range
 * @returns {object} Enemy game object
 */
export function createHoverDrone(k, x, y, range = 150) {
    const speed = applyDifficulty(GAME_CONFIG.HOVER_DRONE_SPEED, "enemySpeed", GAME_STATE.difficulty);

    const drone = k.add([
        k.rect(28, 20),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(150, 100, 200),
        "enemy",
        "hoverDrone",
        {
            speed: speed,
            startX: x,
            range: range,
            direction: 1,
            bobTime: 0,
        },
    ]);

    drone.onUpdate(() => {
        const dt = k.dt();

        // Horizontal movement
        drone.move(drone.speed * drone.direction, 0);

        // Reverse at range limits
        if (Math.abs(drone.pos.x - drone.startX) > drone.range / 2) {
            drone.direction *= -1;
        }

        // Bobbing motion
        drone.bobTime += dt * 2;
        const bobOffset = Math.sin(drone.bobTime) * 5;
        drone.pos.y = y + bobOffset;
    });

    // Damage player on collision
    drone.onCollide("player", (player) => {
        GAME_STATE.lives -= 1;

        if (GAME_STATE.lives <= 0) {
            player.trigger("death");
        } else {
            const originalColor = player.color.clone();
            player.color = k.rgb(255, 100, 100);
            k.wait(0.2, () => {
                player.color = originalColor;
            });
        }

        k.destroy(drone);
    });

    return drone;
}

/**
 * Create a DropBot enemy
 * Hangs from ceiling, drops when player passes below
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position (ceiling position)
 * @returns {object} Enemy game object
 */
export function createDropBot(k, x, y) {
    const bot = k.add([
        k.rect(24, 24),
        k.pos(x, y),
        k.anchor("top"),
        k.area(),
        k.color(200, 150, 50),
        "enemy",
        "dropBot",
        {
            isHanging: true,
            isWarning: false,
            warningTimer: 0,
            detectRange: 80,
        },
    ]);

    bot.onUpdate(() => {
        if (bot.isHanging) {
            // Check for player below
            const player = k.get("player")[0];
            if (player) {
                const horizontalDist = Math.abs(player.pos.x - bot.pos.x);
                const verticalDist = player.pos.y - bot.pos.y;

                if (horizontalDist < bot.detectRange && verticalDist > 0 && verticalDist < 300) {
                    bot.isWarning = true;
                }
            }

            // Warning phase
            if (bot.isWarning) {
                bot.warningTimer += k.dt();

                // Blink red
                const blink = Math.sin(bot.warningTimer * 15) > 0;
                bot.color = blink ? k.rgb(255, 50, 50) : k.rgb(200, 150, 50);

                if (bot.warningTimer > GAME_CONFIG.DROPBOT_WARNING_TIME) {
                    // Drop!
                    bot.isHanging = false;
                    bot.isWarning = false;

                    // Add body for falling
                    bot.use(k.body());
                }
            }
        } else {
            // Falling - rotate
            bot.angle += k.dt() * 5;
        }
    });

    // Damage player on collision
    bot.onCollide("player", (player) => {
        GAME_STATE.lives -= 1;

        if (GAME_STATE.lives <= 0) {
            player.trigger("death");
        } else {
            const originalColor = player.color.clone();
            player.color = k.rgb(255, 100, 100);
            k.wait(0.2, () => {
                player.color = originalColor;
            });
        }

        k.destroy(bot);
    });

    // Destroy when hitting ground
    bot.onCollide("platform", () => {
        if (!bot.isHanging) {
            k.destroy(bot);
        }
    });

    return bot;
}
