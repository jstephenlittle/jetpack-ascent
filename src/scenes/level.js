import { SCENES, GAME_STATE } from "../constants.js";
import { createPlayer } from "../entities/player.js";

export function levelScene(k, levelNum, levelName, nextScene) {
    k.scene(SCENES[`LEVEL_${levelNum}`], () => {
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

        // Starting position
        const startPos = k.vec2(k.center().x, k.height() - 100);

        // Create player
        const player = createPlayer(k, startPos.x, startPos.y);

        // Camera follows player
        player.onUpdate(() => {
            k.camPos(player.pos);
        });

        // Death handler
        player.on("death", () => {
            if (GAME_STATE.lives <= 0) {
                // Go to Game Over
                k.go(SCENES.GAME_OVER);
            } else {
                // Respawn at start
                player.pos = startPos.clone();
                player.vel = k.vec2(0, 0);
                player.fuel = player.maxFuel;
                player.fallVelocity = 0;
                player.isDangerousFall = false;
            }
        });

        // Temporary ground platform for testing
        k.add([
            k.rect(k.width(), 20),
            k.pos(0, k.height() - 40),
            k.area(),
            k.body({ isStatic: true }),
            k.color(100, 100, 100),
            "platform",
        ]);

        // Add some test platforms above for vertical camera testing
        k.add([
            k.rect(150, 20),
            k.pos(k.center().x - 75, k.height() - 200),
            k.area(),
            k.body({ isStatic: true }),
            k.color(150, 100, 100),
            "platform",
        ]);

        k.add([
            k.rect(150, 20),
            k.pos(k.center().x - 200, k.height() - 350),
            k.area(),
            k.body({ isStatic: true }),
            k.color(100, 150, 100),
            "platform",
        ]);

        k.add([
            k.rect(150, 20),
            k.pos(k.center().x + 50, k.height() - 500),
            k.area(),
            k.body({ isStatic: true }),
            k.color(100, 100, 150),
            "platform",
        ]);

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
            k.text("Arrow keys to move\nPress N to next level\nR to restart\nESC for menu", {
                size: 14,
                width: 200,
            }),
            k.pos(k.width() - 110, 20),
            k.anchor("topright"),
            k.color(200, 200, 200),
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

        // Show lives
        k.add([
            k.text(`Lives: ${GAME_STATE.lives}`, {
                size: 14,
            }),
            k.pos(20, 40),
            k.color(255, 100, 100),
            k.fixed(),
        ]);

        // Fuel meter
        const fuelBarBg = k.add([
            k.rect(104, 14),
            k.pos(20, 60),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        const fuelBar = k.add([
            k.rect(100, 10),
            k.pos(22, 62),
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
            k.pos(20, 78),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Fall meter
        const fallMeterBg = k.add([
            k.rect(104, 14),
            k.pos(20, 95),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        const fallMeter = k.add([
            k.rect(0, 10),
            k.pos(22, 97),
            k.color(100, 255, 100),
            k.fixed(),
            {
                update() {
                    const fallPercent = Math.min(player.fallVelocity / player.fallDamageThreshold, 1.0);
                    this.width = 100 * fallPercent;

                    // Color code based on danger level
                    if (fallPercent < 0.5) {
                        this.color = k.rgb(100, 255, 100); // Green - safe
                    } else if (fallPercent < 0.8) {
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
            k.pos(20, 113),
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
    levelScene(k, 1, "Space Tower", SCENES.TRANSITION);
    levelScene(k, 2, "Gothic Tower", SCENES.TRANSITION);
    levelScene(k, 3, "Business Tower", SCENES.VICTORY);
}
