import { SCENES, GAME_STATE } from "../constants.js";

export function victoryScene(k) {
    k.scene(SCENES.VICTORY, () => {
        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(10, 30, 10),
            k.pos(0, 0),
        ]);

        // Victory title
        k.add([
            k.text("VICTORY!", {
                size: 80,
            }),
            k.pos(k.center().x, 120),
            k.anchor("center"),
            k.color(100, 255, 100),
        ]);

        // Congratulations message
        k.add([
            k.text("You've reached the top of the tower!", {
                size: 28,
            }),
            k.pos(k.center().x, 220),
            k.anchor("center"),
            k.color(200, 255, 200),
        ]);

        // Stats (placeholder for now)
        k.add([
            k.text(`Difficulty: ${GAME_STATE.difficulty.toUpperCase()}`, {
                size: 24,
            }),
            k.pos(k.center().x, 300),
            k.anchor("center"),
            k.color(200, 200, 200),
        ]);

        k.add([
            k.text(`Lives Remaining: ${GAME_STATE.lives}`, {
                size: 24,
            }),
            k.pos(k.center().x, 340),
            k.anchor("center"),
            k.color(200, 200, 200),
        ]);

        // Play again button
        const playButton = k.add([
            k.rect(220, 50),
            k.pos(k.center().x, 440),
            k.anchor("center"),
            k.area(),
            k.color(100, 200, 100),
            "button",
        ]);

        k.add([
            k.text("PLAY AGAIN", { size: 24 }),
            k.pos(k.center().x, 440),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Menu button
        const menuButton = k.add([
            k.rect(220, 50),
            k.pos(k.center().x, 510),
            k.anchor("center"),
            k.area(),
            k.color(80, 80, 80),
            "button",
        ]);

        k.add([
            k.text("MAIN MENU", { size: 24 }),
            k.pos(k.center().x, 510),
            k.anchor("center"),
            k.color(255, 255, 255),
        ]);

        // Button interactions
        playButton.onClick(() => {
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
            [playButton, menuButton].forEach((btn) => {
                if (btn.isHovering()) {
                    btn.scale = k.vec2(1.05, 1.05);
                } else {
                    btn.scale = k.vec2(1, 1);
                }
            });
        });

        // Keyboard shortcuts
        k.onKeyPress("space", () => {
            GAME_STATE.currentLevel = 1;
            GAME_STATE.score = 0;
            k.go(SCENES.MAIN_MENU);
        });

        k.onKeyPress("escape", () => {
            k.go(SCENES.MAIN_MENU);
        });
    });
}
