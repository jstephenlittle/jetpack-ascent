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

    // Main robot body - single entity to avoid WebGL issues with many enemies
    const bot = k.add([
        k.rect(22, 18),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.body(),
        k.color(180, 50, 50),
        k.outline(2, k.rgb(100, 30, 30)),
        "enemy",
        "rollerBot",
        {
            speed: speed,
            direction: 1,
            glowTime: 0,
            patrolLeft: null,
            patrolRight: null,
            hasLanded: false,
        },
    ]);

    // Just one extra part - the scanning eye (keeps it looking robotic)
    const eye = k.add([
        k.rect(10, 4),
        k.pos(x, y - 4),
        k.anchor("center"),
        k.color(255, 255, 100),
        k.outline(1, k.rgb(200, 200, 50)),
        "robotEye",
    ]);

    // When bot lands on a platform, set patrol bounds
    bot.onCollide("platform", (platform) => {
        if (!bot.hasLanded) {
            bot.hasLanded = true;
            bot.patrolLeft = platform.pos.x + 15;
            bot.patrolRight = platform.pos.x + platform.width - 15;
        }
    });

    bot.onUpdate(() => {
        const dt = k.dt();

        // Only patrol if we've landed and have bounds
        if (bot.hasLanded && bot.patrolLeft !== null) {
            bot.move(bot.speed * bot.direction, 0);

            if (bot.pos.x <= bot.patrolLeft) {
                bot.pos.x = bot.patrolLeft;
                bot.direction = 1;
            } else if (bot.pos.x >= bot.patrolRight) {
                bot.pos.x = bot.patrolRight;
                bot.direction = -1;
            }
        }

        // Eye follows bot and shifts based on direction
        eye.pos.x = bot.pos.x + (bot.direction * 3);
        eye.pos.y = bot.pos.y - 4;

        // Scanning eye effect
        bot.glowTime += dt;
        const eyeGlow = 0.7 + Math.sin(bot.glowTime * 8) * 0.3;
        eye.opacity = eyeGlow;
        eye.color = k.rgb(255, 255 * eyeGlow, 100);

        // Body color pulse (like warning lights)
        const pulse = 0.85 + Math.sin(bot.glowTime * 4) * 0.15;
        bot.color = k.rgb(180 * pulse, 50, 50);
    });

    // Damage player on collision
    bot.onCollide("player", (player) => {
        dealDamageToPlayer(k, player);

        spawnDeathParticles(k, bot.pos.x, bot.pos.y, k.rgb(200, 80, 80));
        k.destroy(eye);
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

    // Invisible collision hitbox
    const drone = k.add([
        k.rect(36, 16),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.opacity(0),
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

    // Main ship body - pointed nose shape
    const body = k.add([
        k.rect(28, 10),
        k.pos(x, y),
        k.anchor("center"),
        k.color(140, 80, 180),
        k.outline(1, k.rgb(100, 50, 140)),
        "droneBody",
    ]);

    // Cockpit/canopy - darker center
    const cockpit = k.add([
        k.rect(10, 6),
        k.pos(x, y),
        k.anchor("center"),
        k.color(60, 30, 80),
        k.outline(1, k.rgb(100, 60, 120)),
        "droneCockpit",
    ]);

    // Left wing
    const wingL = k.add([
        k.rect(8, 16),
        k.pos(x - 10, y),
        k.anchor("center"),
        k.color(160, 90, 200),
        k.outline(1, k.rgb(120, 60, 160)),
        "droneWing",
    ]);

    // Right wing
    const wingR = k.add([
        k.rect(8, 16),
        k.pos(x + 10, y),
        k.anchor("center"),
        k.color(160, 90, 200),
        k.outline(1, k.rgb(120, 60, 160)),
        "droneWing",
    ]);

    // Engine glow (back of ship, changes based on direction)
    const engine = k.add([
        k.rect(6, 6),
        k.pos(x - 14, y),
        k.anchor("center"),
        k.color(255, 150, 50),
        k.opacity(0.9),
        "droneEngine",
    ]);

    const shipParts = [body, cockpit, wingL, wingR, engine];

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

        // Update all ship parts to follow
        const currentX = drone.pos.x;
        const currentY = drone.pos.y;

        body.pos.x = currentX;
        body.pos.y = currentY;
        cockpit.pos.x = currentX + (drone.direction * 4);
        cockpit.pos.y = currentY;
        wingL.pos.x = currentX - 10;
        wingL.pos.y = currentY;
        wingR.pos.x = currentX + 10;
        wingR.pos.y = currentY;

        // Engine at the back (opposite to direction of movement)
        engine.pos.x = currentX - (drone.direction * 16);
        engine.pos.y = currentY;

        // Engine glow effect - flickering
        drone.thrusterTime += dt;
        const flicker = 0.6 + Math.sin(drone.thrusterTime * 20) * 0.4;
        engine.opacity = flicker;
        engine.color = k.rgb(255, 150 + Math.sin(drone.thrusterTime * 15) * 50, 50);

        // Subtle body pulse
        const pulse = 0.85 + Math.sin(drone.thrusterTime * 5) * 0.15;
        body.color = k.rgb(140 * pulse, 80, 180);
    });

    // Damage player on collision
    drone.onCollide("player", (player) => {
        dealDamageToPlayer(k, player);

        // Spawn death particles and destroy all parts
        spawnDeathParticles(k, drone.pos.x, drone.pos.y, k.rgb(150, 100, 200));
        shipParts.forEach(part => k.destroy(part));
        k.destroy(drone);
    });

    return drone;
}

/**
 * Create a DropBot enemy
 * Hangs from ceiling, drops when player passes below - looks like a torpedo
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position (ceiling position)
 * @returns {object} Enemy game object
 */
export function createDropBot(k, x, y) {
    // Torpedo body - elongated metallic shape
    const bot = k.add([
        k.rect(14, 32),
        k.pos(x, y),
        k.anchor("top"),
        k.area(),
        k.color(120, 130, 140),
        k.outline(2, k.rgb(80, 90, 100)),
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

    // Torpedo nose/warhead - red tip (just one extra entity)
    const warhead = k.add([
        k.rect(14, 10),
        k.pos(x, y + 32),
        k.anchor("top"),
        k.color(200, 60, 60),
        k.outline(1, k.rgb(150, 40, 40)),
        "torpedoWarhead",
    ]);

    bot.onUpdate(() => {
        const dt = k.dt();
        bot.pulseTime += dt;

        // Warhead follows torpedo body
        warhead.pos.x = bot.pos.x;
        warhead.pos.y = bot.pos.y + 32;
        warhead.angle = bot.angle;

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

            // Warning phase - warhead blinks red
            if (bot.isWarning) {
                bot.warningTimer += dt;

                const blink = Math.sin(bot.warningTimer * 20) > 0;
                warhead.color = blink ? k.rgb(255, 50, 50) : k.rgb(200, 60, 60);
                bot.color = blink ? k.rgb(150, 160, 170) : k.rgb(120, 130, 140);

                if (bot.warningTimer > GAME_CONFIG.DROPBOT_WARNING_TIME) {
                    // Drop!
                    bot.isHanging = false;
                    bot.isWarning = false;
                    warhead.color = k.rgb(255, 80, 40);
                    bot.use(k.body());
                }
            } else {
                // Idle metallic sheen
                const sheen = 0.95 + Math.sin(bot.pulseTime * 2) * 0.05;
                bot.color = k.rgb(120 * sheen, 130 * sheen, 140);
            }
        } else {
            // Falling - slight wobble, no spin (torpedoes fall straight)
            const wobble = Math.sin(bot.pulseTime * 15) * 3;
            bot.angle = wobble;

            // Engine glow effect on warhead
            const glow = 0.8 + Math.sin(bot.pulseTime * 20) * 0.2;
            warhead.color = k.rgb(255 * glow, 100, 40);
        }
    });

    // Damage player on collision
    bot.onCollide("player", (player) => {
        dealDamageToPlayer(k, player);

        spawnDeathParticles(k, bot.pos.x, bot.pos.y + 20, k.rgb(255, 150, 50));
        k.destroy(warhead);
        k.destroy(bot);
    });

    // Destroy when hitting ground
    bot.onCollide("platform", () => {
        if (!bot.isHanging) {
            spawnDeathParticles(k, bot.pos.x, bot.pos.y + 20, k.rgb(255, 150, 50));
            k.destroy(warhead);
            k.destroy(bot);
        }
    });

    return bot;
}

/**
 * Create a Mine enemy
 * Static floating mine that damages player on contact
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Enemy game object
 */
export function createMine(k, x, y) {
    // Main mine body - spherical with spikes implied by outline
    const mine = k.add([
        k.circle(14),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.color(80, 80, 90),
        k.outline(3, k.rgb(50, 50, 60)),
        "enemy",
        "mine",
        {
            floatTime: Math.random() * Math.PI * 2, // Random start phase
            pulseTime: 0,
        },
    ]);

    // Warning light on top - blinking red
    const light = k.add([
        k.circle(5),
        k.pos(x, y - 8),
        k.anchor("center"),
        k.color(255, 50, 50),
        k.opacity(1),
        "mineLight",
    ]);

    mine.onUpdate(() => {
        const dt = k.dt();
        mine.floatTime += dt;
        mine.pulseTime += dt;

        // Gentle floating motion
        const floatOffset = Math.sin(mine.floatTime * 2) * 4;
        mine.pos.y = y + floatOffset;
        light.pos.y = mine.pos.y - 8;
        light.pos.x = mine.pos.x;

        // Blinking warning light
        const blink = Math.sin(mine.pulseTime * 6) > 0;
        light.color = blink ? k.rgb(255, 50, 50) : k.rgb(100, 20, 20);
        light.opacity = blink ? 1 : 0.4;

        // Subtle body pulse
        const pulse = 0.9 + Math.sin(mine.pulseTime * 3) * 0.1;
        mine.color = k.rgb(80 * pulse, 80 * pulse, 90);
    });

    // Damage player on collision
    mine.onCollide("player", (player) => {
        dealDamageToPlayer(k, player);

        // Explosion particles
        spawnDeathParticles(k, mine.pos.x, mine.pos.y, k.rgb(255, 150, 50));
        k.destroy(light);
        k.destroy(mine);
    });

    return mine;
}
