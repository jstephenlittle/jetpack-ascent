import { SCENES, GAME_STATE } from "../constants.js";

export function mainMenuScene(k) {
    k.scene(SCENES.MAIN_MENU, () => {
        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(16, 20, 31),
            k.pos(0, 0),
        ]);

        // Title
        k.add([
            k.text("JETPACK ASCENT", {
                size: 64,
            }),
            k.pos(k.center().x, 100),
            k.anchor("center"),
            k.color(100, 200, 255),
        ]);

        // Subtitle
        k.add([
            k.text("Navigate the tower, avoid hazards, reach the top", {
                size: 20,
            }),
            k.pos(k.center().x, 180),
            k.anchor("center"),
            k.color(150, 150, 150),
        ]);

        // Difficulty selection
        k.add([
            k.text("SELECT DIFFICULTY:", {
                size: 24,
            }),
            k.pos(k.center().x, 280),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Easy button
        const easyButton = k.add([
            k.rect(200, 50),
            k.pos(k.center().x, 340),
            k.anchor("center"),
            k.area(),
            k.color(50, 150, 50),
            "button",
            "easy",
        ]);

        k.add([
            k.text("EASY", { size: 24 }),
            k.pos(k.center().x, 340),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Medium button
        const mediumButton = k.add([
            k.rect(200, 50),
            k.pos(k.center().x, 410),
            k.anchor("center"),
            k.area(),
            k.color(150, 150, 50),
            "button",
            "medium",
        ]);

        k.add([
            k.text("MEDIUM", { size: 24 }),
            k.pos(k.center().x, 410),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Hard button
        const hardButton = k.add([
            k.rect(200, 50),
            k.pos(k.center().x, 480),
            k.anchor("center"),
            k.area(),
            k.color(150, 50, 50),
            "button",
            "hard",
        ]);

        k.add([
            k.text("HARD", { size: 24 }),
            k.pos(k.center().x, 480),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Instructions
        k.add([
            k.text("Click a difficulty to start", {
                size: 16,
            }),
            k.pos(k.center().x, 550),
            k.anchor("center"),
            k.color(150, 150, 150),
        ]);

        // Button interactions
        easyButton.onClick(() => {
            GAME_STATE.difficulty = "easy";
            GAME_STATE.lives = 4; // +1 bonus life
            k.go(SCENES.LEVEL_1);
        });

        mediumButton.onClick(() => {
            GAME_STATE.difficulty = "medium";
            GAME_STATE.lives = 3;
            k.go(SCENES.LEVEL_1);
        });

        hardButton.onClick(() => {
            GAME_STATE.difficulty = "hard";
            GAME_STATE.lives = 3;
            k.go(SCENES.LEVEL_1);
        });

        // Hover effects
        k.onUpdate(() => {
            [easyButton, mediumButton, hardButton].forEach((btn) => {
                if (btn.isHovering()) {
                    btn.scale = k.vec2(1.05, 1.05);
                } else {
                    btn.scale = k.vec2(1, 1);
                }
            });
        });
    });
}
