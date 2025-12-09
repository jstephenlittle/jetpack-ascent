import { SCENES, GAME_STATE } from "../constants.js";

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
        ]);

        // Level title (temporary)
        k.add([
            k.text(`LEVEL ${levelNum}: ${levelName}`, {
                size: 32,
            }),
            k.pos(k.center().x, 50),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Placeholder text
        k.add([
            k.text("Level scene placeholder\n\nPress SPACE to continue to next scene\nPress ESC for main menu", {
                size: 20,
                width: 700,
            }),
            k.pos(k.center()),
            k.anchor("center"),
            k.color(200, 200, 200),
        ]);

        // Show difficulty
        k.add([
            k.text(`Difficulty: ${GAME_STATE.difficulty.toUpperCase()}`, {
                size: 16,
            }),
            k.pos(20, 20),
            k.color(150, 150, 150),
        ]);

        // Show lives
        k.add([
            k.text(`Lives: ${GAME_STATE.lives}`, {
                size: 16,
            }),
            k.pos(20, 45),
            k.color(255, 100, 100),
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
