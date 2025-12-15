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

        // Add stars for space theme (Level 1 only)
        if (levelNum === 1) {
            // Spread stars across the full level height (15000)
            for (let i = 0; i < 300; i++) {
                const x = Math.random() * k.width();
                const y = Math.random() * 16000 - 15000; // Cover full level from bottom to top
                const size = Math.random() * 2 + 1;
                const brightness = Math.random() * 100 + 155;

                k.add([
                    k.circle(size),
                    k.pos(x, y),
                    k.color(brightness, brightness, brightness),
                    k.opacity(0.6 + Math.random() * 0.4),
                    k.z(-5),
                    "star",
                    {
                        twinkleTime: Math.random() * Math.PI * 2,
                        twinkleSpeed: 0.5 + Math.random() * 1.5,
                        baseOpacity: 0.6 + Math.random() * 0.4,
                        update() {
                            this.twinkleTime += k.dt() * this.twinkleSpeed;
                            this.opacity = this.baseOpacity * (0.7 + Math.sin(this.twinkleTime) * 0.3);
                        }
                    }
                ]);
            }
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
            k.camPos(player.pos);
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
