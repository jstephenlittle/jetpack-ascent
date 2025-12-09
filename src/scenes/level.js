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

        // Create player
        const player = createPlayer(k, k.center().x, k.height() - 100);

        // Temporary ground platform for testing
        k.add([
            k.rect(k.width(), 20),
            k.pos(0, k.height() - 40),
            k.area(),
            k.body({ isStatic: true }),
            k.color(100, 100, 100),
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
            k.text("Arrow keys to move\nPress SPACE to continue\nESC for menu", {
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

        // Temporary navigation
        k.onKeyPress("space", () => {
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
