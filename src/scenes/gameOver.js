import { SCENES, GAME_STATE } from "../constants.js";

export function gameOverScene(k) {
    k.scene(SCENES.GAME_OVER, () => {
        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(20, 10, 10),
            k.pos(0, 0),
        ]);

        // Game Over title
        k.add([
            k.text("GAME OVER", {
                size: 72,
            }),
            k.pos(k.center().x, 150),
            k.anchor("center"),
            k.color(255, 50, 50),
        ]);

        // Stats (placeholder for now)
        k.add([
            k.text(`Level Reached: ${GAME_STATE.currentLevel}`, {
                size: 24,
            }),
            k.pos(k.center().x, 280),
            k.anchor("center"),
            k.color(200, 200, 200),
        ]);

        k.add([
            k.text(`Difficulty: ${GAME_STATE.difficulty.toUpperCase()}`, {
                size: 24,
            }),
            k.pos(k.center().x, 320),
            k.anchor("center"),
            k.color(200, 200, 200),
        ]);

        // Retry button
        const retryButton = k.add([
            k.rect(200, 50),
            k.pos(k.center().x, 420),
            k.anchor("center"),
            k.area(),
            k.color(100, 150, 255),
            "button",
        ]);

        k.add([
            k.text("TRY AGAIN", { size: 24 }),
            k.pos(k.center().x, 420),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Menu button
        const menuButton = k.add([
            k.rect(200, 50),
            k.pos(k.center().x, 490),
            k.anchor("center"),
            k.area(),
            k.color(80, 80, 80),
            "button",
        ]);

        k.add([
            k.text("MAIN MENU", { size: 24 }),
            k.pos(k.center().x, 490),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Button interactions
        retryButton.onClick(() => {
            // Reset game state
            GAME_STATE.currentLevel = 1;
            GAME_STATE.score = 0;
            k.go(SCENES.MAIN_MENU);
        });

        menuButton.onClick(() => {
            k.go(SCENES.MAIN_MENU);
        });

        // Hover effects
        k.onUpdate(() => {
            [retryButton, menuButton].forEach((btn) => {
                if (btn.isHovering()) {
                    btn.scale = k.vec2(1.05, 1.05);
                } else {
                    btn.scale = k.vec2(1, 1);
                }
            });
        });

        // Keyboard shortcuts
        k.onKeyPress("r", () => {
            GAME_STATE.currentLevel = 1;
            GAME_STATE.score = 0;
            k.go(SCENES.MAIN_MENU);
        });

        k.onKeyPress("escape", () => {
            k.go(SCENES.MAIN_MENU);
        });
    });
}
