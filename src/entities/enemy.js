import { GAME_CONFIG, applyDifficulty, getDifficultyConfig } from "../config.js";
import { GAME_STATE } from "../constants.js";

/**
 * Spawn explosion particles when enemy is destroyed
 */
function spawnDeathParticles(k, x, y, color) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const speed = 100 + Math.random() * 100;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const particle = k.add([
            k.rect(6, 6),
            k.pos(x, y),
            k.color(color),
            k.opacity(1),
            k.anchor("center"),
            "particle",
            {
                vx: vx,
                vy: vy,
                lifetime: 0.5,
                age: 0,
            }
        ]);

        particle.onUpdate(() => {
            particle.age += k.dt();
            particle.pos.x += particle.vx * k.dt();
            particle.pos.y += particle.vy * k.dt();
            particle.opacity = 1 - (particle.age / particle.lifetime);
            particle.angle += k.dt() * 10;

            if (particle.age >= particle.lifetime) {
                k.destroy(particle);
            }
        });
    }
}

/**
 * Flash the player's body to indicate damage or shield
 */
function flashPlayerBody(k, player, color, duration = 0.2) {
    const body = player.get("body")[0];
    if (body) {
        const originalColor = body.color.clone();
        body.color = color;
        k.wait(duration, () => {
            body.color = originalColor;
        });
    }
}

/**
 * Handle player taking damage from enemy collision
 * Returns true if damage was dealt, false if shield absorbed it
 */
function dealDamageToPlayer(k, player) {
    // Check for shield
    if (player.hasShield) {
        player.hasShield = false;
        const shieldEffect = player.get("shieldEffect")[0];
        if (shieldEffect) k.destroy(shieldEffect);
        // Flash blue to show shield absorbed hit
        flashPlayerBody(k, player, k.rgb(100, 200, 255));
        return false;
    }

    // Calculate damage with difficulty modifier
    const config = getDifficultyConfig(GAME_STATE.difficulty);
    const damage = Math.round(GAME_CONFIG.ENEMY_DAMAGE * config.damageTaken);

    GAME_STATE.health -= damage;
    k.shake(8);

    if (GAME_STATE.health <= 0) {
        GAME_STATE.health = 0;
        player.trigger("death");
    } else {
        // Flash player body red
        flashPlayerBody(k, player, k.rgb(255, 100, 100));
    }

    return true;
}

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

    // Spiked wheel enemy - uses circle for round appearance
    const bot = k.add([
        k.circle(12),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.body(),
        k.color(220, 60, 60),
        k.outline(3, k.rgb(80, 80, 90)),
        "enemy",
        "rollerBot",
        {
            speed: speed,
            direction: 1,
            glowTime: 0,
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

        // Pulsing glow effect
        bot.glowTime += k.dt();
        const pulse = 0.8 + Math.sin(bot.glowTime * 6) * 0.2;
        bot.color = k.rgb(220 * pulse, 60, 60);

        // Rotation animation
        bot.angle += k.dt() * bot.speed * 0.5 * bot.direction;
    });

    // Damage player on collision
    bot.onCollide("player", (player) => {
        dealDamageToPlayer(k, player);

        // Spawn death particles and destroy enemy
        spawnDeathParticles(k, bot.pos.x, bot.pos.y, k.rgb(200, 80, 80));
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

    // Flying drone enemy - wide saucer shape
    const drone = k.add([
        k.rect(32, 12),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(180, 100, 220),
        k.outline(2, k.rgb(100, 60, 140)),
        "enemy",
        "hoverDrone",
        {
            speed: speed,
            startX: x,
            startY: y,
            range: range,
            direction: 1,
            bobTime: 0,
            thrusterTime: 0,
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
        drone.pos.y = drone.startY + bobOffset;

        // Thruster glow effect - pulsing purple
        drone.thrusterTime += dt;
        const pulse = 0.7 + Math.sin(drone.thrusterTime * 10) * 0.3;
        drone.color = k.rgb(180 * pulse, 100, 220);
    });

    // Damage player on collision
    drone.onCollide("player", (player) => {
        dealDamageToPlayer(k, player);

        // Spawn death particles and destroy enemy
        spawnDeathParticles(k, drone.pos.x, drone.pos.y, k.rgb(150, 100, 200));
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
    // Ceiling mine enemy - triangular/arrow shape pointing down
    const bot = k.add([
        k.rect(20, 28),
        k.pos(x, y),
        k.anchor("top"),
        k.area(),
        k.color(220, 160, 40),
        k.outline(2, k.rgb(140, 100, 20)),
        "enemy",
        "dropBot",
        {
            isHanging: true,
            isWarning: false,
            warningTimer: 0,
            detectRange: 80,
            pulseTime: 0,
        },
    ]);

    bot.onUpdate(() => {
        if (bot.isHanging) {
            // Idle pulse when hanging
            bot.pulseTime += k.dt();
            const idlePulse = 0.9 + Math.sin(bot.pulseTime * 2) * 0.1;

            // Check for player below
            const player = k.get("player")[0];
            if (player) {
                const horizontalDist = Math.abs(player.pos.x - bot.pos.x);
                const verticalDist = player.pos.y - bot.pos.y;

                if (horizontalDist < bot.detectRange && verticalDist > 0 && verticalDist < 300) {
                    bot.isWarning = true;
                }
            }

            // Warning phase - rapid red blinking
            if (bot.isWarning) {
                bot.warningTimer += k.dt();

                // Rapid blink between red and orange
                const blink = Math.sin(bot.warningTimer * 20) > 0;
                bot.color = blink ? k.rgb(255, 50, 50) : k.rgb(255, 180, 50);

                if (bot.warningTimer > GAME_CONFIG.DROPBOT_WARNING_TIME) {
                    // Drop!
                    bot.isHanging = false;
                    bot.isWarning = false;
                    bot.color = k.rgb(255, 80, 40); // Angry red-orange when falling

                    // Add body for falling
                    bot.use(k.body());
                }
            } else {
                // Normal idle color
                bot.color = k.rgb(220 * idlePulse, 160 * idlePulse, 40);
            }
        } else {
            // Falling - spin rapidly
            bot.angle += k.dt() * 8;
        }
    });

    // Damage player on collision
    bot.onCollide("player", (player) => {
        dealDamageToPlayer(k, player);

        // Spawn death particles and destroy enemy
        spawnDeathParticles(k, bot.pos.x, bot.pos.y, k.rgb(200, 150, 50));
        k.destroy(bot);
    });

    // Destroy when hitting ground
    bot.onCollide("platform", () => {
        if (!bot.isHanging) {
            spawnDeathParticles(k, bot.pos.x, bot.pos.y, k.rgb(200, 150, 50));
            k.destroy(bot);
        }
    });

    return bot;
}
