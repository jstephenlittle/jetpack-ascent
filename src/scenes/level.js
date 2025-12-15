import { SCENES, GAME_STATE } from "../constants.js";
import { GAME_CONFIG } from "../config.js";
import { createPlayer } from "../entities/player.js";
import { loadLevel } from "../utils/levelLoader.js";

export function levelScene(k, levelNum, levelName, nextScene, levelDataUrl) {
    k.scene(SCENES[`LEVEL_${levelNum}`], async () => {
        console.log(`[LEVEL ${levelNum}] Scene initializing...`);
        console.log(`[LEVEL ${levelNum}] Canvas size: ${k.width()}x${k.height()}`);

        // Background color (placeholder)
        const bgColors = {
            1: [20, 20, 60],  // Space - dark blue
            2: [40, 40, 50],  // Gothic - grey blue
            3: [30, 30, 40],  // Business - dark grey
        };

        k.add([
            k.rect(k.width(), k.height()),
            k.color(...bgColors[levelNum]),
            k.pos(0, 0),
            k.z(-10),
        ]);

        // Add elaborate space background (Level 1 only)
        if (levelNum === 1) {
            // === LAYER 1: Earth/Atmosphere at bottom (y: 600 to -2000) ===

            // Earth curve at very bottom
            k.add([
                k.circle(800),
                k.pos(k.width() / 2, 1200),
                k.anchor("center"),
                k.color(60, 120, 180),
                k.opacity(0.4),
                k.z(-9),
            ]);

            // Atmosphere glow
            k.add([
                k.circle(850),
                k.pos(k.width() / 2, 1250),
                k.anchor("center"),
                k.color(100, 180, 255),
                k.opacity(0.15),
                k.z(-9),
            ]);

            // === LAYER 2: Scattered stars throughout ===
            for (let i = 0; i < 400; i++) {
                const x = Math.random() * k.width();
                const y = Math.random() * 16000 - 15000;
                const size = Math.random() * 2 + 0.5;
                const brightness = Math.random() * 100 + 155;

                k.add([
                    k.circle(size),
                    k.pos(x, y),
                    k.color(brightness, brightness, brightness),
                    k.opacity(0.5 + Math.random() * 0.5),
                    k.z(-8),
                    "star",
                    {
                        twinkleTime: Math.random() * Math.PI * 2,
                        twinkleSpeed: 0.5 + Math.random() * 1.5,
                        baseOpacity: 0.5 + Math.random() * 0.5,
                        update() {
                            this.twinkleTime += k.dt() * this.twinkleSpeed;
                            this.opacity = this.baseOpacity * (0.7 + Math.sin(this.twinkleTime) * 0.3);
                        }
                    }
                ]);
            }

            // === LAYER 3: Nebula clouds at various heights ===
            const nebulaColors = [
                [80, 40, 120],   // Purple
                [40, 80, 120],   // Blue
                [120, 60, 80],   // Pink/red
                [60, 100, 80],   // Teal
            ];

            // Create nebula patches at different heights
            const nebulaPositions = [
                { x: 200, y: -4000, size: 300 },
                { x: 600, y: -4500, size: 250 },
                { x: 150, y: -7000, size: 350 },
                { x: 650, y: -7800, size: 280 },
                { x: 400, y: -10000, size: 400 },
                { x: 100, y: -11500, size: 320 },
                { x: 700, y: -12000, size: 280 },
                { x: 350, y: -13500, size: 350 },
            ];

            nebulaPositions.forEach((nebula, idx) => {
                const color = nebulaColors[idx % nebulaColors.length];
                // Main nebula body
                k.add([
                    k.circle(nebula.size),
                    k.pos(nebula.x, nebula.y),
                    k.anchor("center"),
                    k.color(...color),
                    k.opacity(0.08),
                    k.z(-7),
                ]);
                // Secondary glow
                k.add([
                    k.circle(nebula.size * 0.6),
                    k.pos(nebula.x + 30, nebula.y - 20),
                    k.anchor("center"),
                    k.color(...color),
                    k.opacity(0.12),
                    k.z(-7),
                ]);
            });

            // === LAYER 4: Distant planets/moons ===
            // Small moon mid-level
            k.add([
                k.circle(40),
                k.pos(700, -5500),
                k.anchor("center"),
                k.color(180, 180, 190),
                k.opacity(0.6),
                k.z(-6),
            ]);
            // Moon crater detail
            k.add([
                k.circle(8),
                k.pos(690, -5510),
                k.anchor("center"),
                k.color(140, 140, 150),
                k.opacity(0.4),
                k.z(-6),
            ]);

            // Distant planet upper level
            k.add([
                k.circle(60),
                k.pos(100, -9000),
                k.anchor("center"),
                k.color(180, 120, 100),
                k.opacity(0.5),
                k.z(-6),
            ]);
            // Planet ring
            k.add([
                k.rect(140, 8, { radius: 4 }),
                k.pos(100, -9000),
                k.anchor("center"),
                k.color(200, 160, 140),
                k.opacity(0.3),
                k.z(-6),
                k.rotate(-15),
            ]);

            // === LAYER 5: Space station/satellite elements ===
            // Satellite near bottom
            k.add([
                k.rect(30, 6),
                k.pos(650, -1500),
                k.anchor("center"),
                k.color(150, 150, 160),
                k.opacity(0.7),
                k.z(-5),
                k.rotate(25),
            ]);
            k.add([
                k.rect(6, 20),
                k.pos(650, -1500),
                k.anchor("center"),
                k.color(100, 150, 200),
                k.opacity(0.6),
                k.z(-5),
                k.rotate(25),
            ]);

            // Space debris/asteroids scattered
            const asteroidPositions = [
                { x: 750, y: -3000, size: 12, rot: 30 },
                { x: 50, y: -5000, size: 8, rot: -20 },
                { x: 780, y: -8000, size: 15, rot: 45 },
                { x: 30, y: -10500, size: 10, rot: -35 },
                { x: 770, y: -13000, size: 14, rot: 60 },
            ];

            asteroidPositions.forEach(ast => {
                k.add([
                    k.rect(ast.size, ast.size * 0.7, { radius: 2 }),
                    k.pos(ast.x, ast.y),
                    k.anchor("center"),
                    k.color(100, 90, 80),
                    k.opacity(0.5),
                    k.z(-5),
                    k.rotate(ast.rot),
                ]);
            });

            // === LAYER 6: Destination glow at top ===
            // Bright beacon/portal at the top
            k.add([
                k.circle(150),
                k.pos(k.width() / 2, -14500),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.opacity(0.1),
                k.z(-6),
            ]);
            k.add([
                k.circle(80),
                k.pos(k.width() / 2, -14500),
                k.anchor("center"),
                k.color(200, 255, 255),
                k.opacity(0.2),
                k.z(-6),
                "beacon",
                {
                    pulseTime: 0,
                    update() {
                        this.pulseTime += k.dt();
                        this.opacity = 0.15 + Math.sin(this.pulseTime * 2) * 0.1;
                    }
                }
            ]);
        }

        // Add floating dust/particles for Gothic theme (Level 2 only)
        if (levelNum === 2) {
            for (let i = 0; i < 80; i++) {
                const x = Math.random() * k.width();
                const y = Math.random() * 3500 - 3000; // Spread across level height
                const size = Math.random() * 3 + 1;

                k.add([
                    k.circle(size),
                    k.pos(x, y),
                    k.color(120, 100, 120), // Dusty purple/grey
                    k.opacity(0.2 + Math.random() * 0.3),
                    k.z(-5),
                    k.fixed(),
                    {
                        driftTime: Math.random() * Math.PI * 2,
                        driftSpeed: 0.3 + Math.random() * 0.7,
                        driftAmount: 10 + Math.random() * 20,
                    }
                ]);
            }
        }

        // Add window lights for Business Tower theme (Level 3 only)
        if (levelNum === 3) {
            // Create grid of window lights
            for (let y = 500; y > -3500; y -= 100) {
                for (let x = 50; x < k.width(); x += 80) {
                    const isLit = Math.random() > 0.4; // 60% of windows are lit
                    if (isLit) {
                        const brightness = 180 + Math.random() * 75;
                        k.add([
                            k.rect(20, 30),
                            k.pos(x, y),
                            k.color(brightness, brightness, brightness - 20), // Warm white/yellow
                            k.opacity(0.3 + Math.random() * 0.2),
                            k.z(-6),
                            k.fixed(),
                        ]);
                    }
                }
            }
        }

        // Load level data
        let levelInfo;
        let startPos;

        if (levelDataUrl) {
            console.log(`[LEVEL ${levelNum}] Loading level data from: ${levelDataUrl}`);
            // Load level from JSON
            const response = await fetch(levelDataUrl);
            const levelData = await response.json();
            console.log(`[LEVEL ${levelNum}] Level data loaded:`, levelData);
            levelInfo = await loadLevel(k, levelData);
            startPos = levelInfo.startPos;
            console.log(`[LEVEL ${levelNum}] Start position:`, startPos);
        } else {
            // Fallback for levels without data
            startPos = k.vec2(k.center().x, k.height() - 100);
            console.log(`[LEVEL ${levelNum}] Using fallback start position:`, startPos);
        }

        // Create player
        console.log(`[LEVEL ${levelNum}] Creating player at (${startPos.x}, ${startPos.y})`);
        const player = createPlayer(k, startPos.x, startPos.y);
        console.log(`[LEVEL ${levelNum}] Player created:`, player);

        // Camera follows player
        player.onUpdate(() => {
            k.setCamPos(player.pos);
        });

        // Death handler
        player.on("death", () => {
            // Go to Game Over (health reached 0)
            k.go(SCENES.GAME_OVER);
        });

        // Handle doorway entry
        if (levelInfo && levelInfo.doorway) {
            levelInfo.doorway.onCollide("player", () => {
                if (nextScene === SCENES.VICTORY) {
                    k.go(SCENES.VICTORY);
                } else {
                    k.go(SCENES.TRANSITION, levelNum + 1);
                }
            });
        }

        // Level title (temporary) - fixed position
        k.add([
            k.text(`LEVEL ${levelNum}: ${levelName}`, {
                size: 24,
            }),
            k.pos(k.center().x, 30),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.fixed(),
        ]);

        // Instructions
        k.add([
            k.text("Arrow keys: Move\nSpace: Jetpack\nR: Restart | ESC: Menu", {
                size: 12,
                width: 180,
            }),
            k.pos(k.width() - 20, 20),
            k.anchor("topright"),
            k.color(180, 180, 180),
            k.fixed(),
        ]);

        // Show difficulty
        k.add([
            k.text(`Difficulty: ${GAME_STATE.difficulty.toUpperCase()}`, {
                size: 14,
            }),
            k.pos(20, 20),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Health bar
        k.add([
            k.rect(104, 14),
            k.pos(20, 40),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        k.add([
            k.rect(100, 10),
            k.pos(22, 42),
            k.color(255, 100, 100),
            k.fixed(),
            {
                update() {
                    const healthPercent = GAME_STATE.health / GAME_STATE.maxHealth;
                    this.width = 100 * healthPercent;
                    // Change color based on health level
                    if (healthPercent > 0.6) {
                        this.color = k.rgb(100, 255, 100); // Green - healthy
                    } else if (healthPercent > 0.3) {
                        this.color = k.rgb(255, 200, 100); // Yellow - warning
                    } else {
                        this.color = k.rgb(255, 100, 100); // Red - danger
                    }
                }
            }
        ]);

        k.add([
            k.text("HEALTH", {
                size: 10,
            }),
            k.pos(20, 58),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Fuel meter
        k.add([
            k.rect(104, 14),
            k.pos(20, 75),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        k.add([
            k.rect(100, 10),
            k.pos(22, 77),
            k.color(100, 200, 255),
            k.fixed(),
            {
                update() {
                    const fuelPercent = player.fuel / player.maxFuel;
                    this.width = 100 * fuelPercent;
                    // Change color based on fuel level
                    if (fuelPercent > 0.5) {
                        this.color = k.rgb(100, 200, 255);
                    } else if (fuelPercent > 0.2) {
                        this.color = k.rgb(255, 200, 100);
                    } else {
                        this.color = k.rgb(255, 100, 100);
                    }
                }
            }
        ]);

        k.add([
            k.text("FUEL", {
                size: 10,
            }),
            k.pos(20, 93),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Fall meter
        k.add([
            k.rect(104, 14),
            k.pos(20, 110),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        k.add([
            k.rect(0, 10),
            k.pos(22, 112),
            k.color(100, 255, 100),
            k.fixed(),
            {
                update() {
                    const fallPercent = Math.min(player.fallVelocity / GAME_CONFIG.FALL_DAMAGE_MAX_VELOCITY, 1.0);
                    this.width = 100 * fallPercent;

                    // Color code based on danger level
                    if (fallPercent < 0.4) {
                        this.color = k.rgb(100, 255, 100); // Green - safe
                    } else if (fallPercent < 0.7) {
                        this.color = k.rgb(255, 200, 100); // Yellow - warning
                    } else {
                        this.color = k.rgb(255, 100, 100); // Red - dangerous
                    }
                }
            }
        ]);

        k.add([
            k.text("FALL", {
                size: 10,
            }),
            k.pos(20, 128),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // R key to restart (after death)
        k.onKeyPress("r", () => {
            GAME_STATE.currentLevel = 1;
            GAME_STATE.score = 0;
            k.go(SCENES.MAIN_MENU);
        });

        // Temporary navigation
        k.onKeyPress("n", () => {
            if (nextScene === SCENES.VICTORY) {
                k.go(SCENES.VICTORY);
            } else {
                k.go(SCENES.TRANSITION, levelNum + 1);
            }
        });

        k.onKeyPress("escape", () => {
            k.go(SCENES.MAIN_MENU);
        });
    });
}

// Create all three level scenes
export function initLevelScenes(k) {
    levelScene(k, 1, "Space Tower", SCENES.TRANSITION, "/assets/data/level1_space.json");
    levelScene(k, 2, "Gothic Tower", SCENES.TRANSITION, "/assets/data/level2_gothic.json");
    levelScene(k, 3, "Business Tower", SCENES.VICTORY, "/assets/data/level3_business.json");
}
