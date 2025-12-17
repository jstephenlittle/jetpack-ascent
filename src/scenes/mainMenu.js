import { SCENES, GAME_STATE } from "../constants.js";

export function mainMenuScene(k) {
    k.scene(SCENES.MAIN_MENU, () => {
        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(16, 20, 31),
            k.pos(0, 0),
        ]);

        // Animated background stars
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * k.width();
            const y = Math.random() * k.height();
            const size = Math.random() * 2 + 0.5;
            const baseOpacity = 0.3 + Math.random() * 0.5;

            k.add([
                k.circle(size),
                k.pos(x, y),
                k.color(200, 220, 255),
                k.opacity(baseOpacity),
                {
                    twinkleTime: Math.random() * Math.PI * 2,
                    twinkleSpeed: 1 + Math.random() * 2,
                    baseOpacity: baseOpacity,
                    update() {
                        this.twinkleTime += k.dt() * this.twinkleSpeed;
                        this.opacity = this.baseOpacity * (0.5 + Math.sin(this.twinkleTime) * 0.5);
                    }
                }
            ]);
        }

        // Jetty character preview (floating animation)
        const jettyX = 150;
        const jettyY = k.center().y;

        // Jetty container for animation
        const jettyContainer = k.add([
            k.pos(jettyX, jettyY),
            k.anchor("center"),
            {
                floatTime: 0,
                update() {
                    this.floatTime += k.dt();
                    this.pos.y = jettyY + Math.sin(this.floatTime * 1.5) * 8;
                }
            }
        ]);

        // Jetpack
        jettyContainer.add([
            k.rect(12, 24, { radius: 3 }),
            k.pos(-14, -6),
            k.anchor("center"),
            k.color(140, 150, 165),
        ]);

        // Jetpack flame (always on for menu)
        const flameOuter = jettyContainer.add([
            k.rect(14, 22, { radius: 4 }),
            k.pos(-14, 20),
            k.anchor("top"),
            k.color(255, 150, 50),
            k.opacity(0.8),
            {
                flameTime: 0,
                update() {
                    this.flameTime += k.dt() * 15;
                    this.opacity = 0.6 + Math.sin(this.flameTime) * 0.3;
                    this.scale = k.vec2(1 + Math.sin(this.flameTime * 1.3) * 0.2);
                }
            }
        ]);

        jettyContainer.add([
            k.rect(8, 16, { radius: 3 }),
            k.pos(-14, 18),
            k.anchor("top"),
            k.color(255, 220, 100),
            k.opacity(0.9),
        ]);

        // Body
        jettyContainer.add([
            k.rect(26, 28, { radius: 4 }),
            k.pos(0, -4),
            k.anchor("center"),
            k.color(70, 150, 220),
        ]);

        // Body highlight
        jettyContainer.add([
            k.rect(16, 10, { radius: 2 }),
            k.pos(2, -10),
            k.anchor("center"),
            k.color(100, 180, 240),
        ]);

        // Belt
        jettyContainer.add([
            k.rect(26, 5),
            k.pos(0, 4),
            k.anchor("center"),
            k.color(60, 65, 75),
        ]);

        // Belt buckle
        jettyContainer.add([
            k.rect(8, 5),
            k.pos(0, 4),
            k.anchor("center"),
            k.color(220, 180, 50),
        ]);

        // Helmet
        jettyContainer.add([
            k.rect(24, 20, { radius: 6 }),
            k.pos(0, -24),
            k.anchor("center"),
            k.color(180, 190, 210),
        ]);

        // Visor
        jettyContainer.add([
            k.rect(16, 10, { radius: 3 }),
            k.pos(2, -24),
            k.anchor("center"),
            k.color(30, 50, 80),
        ]);

        // Visor shine
        jettyContainer.add([
            k.rect(5, 3, { radius: 1 }),
            k.pos(7, -26),
            k.anchor("center"),
            k.color(150, 200, 255),
            k.opacity(0.7),
        ]);

        // Antenna
        jettyContainer.add([
            k.rect(2, 8),
            k.pos(8, -38),
            k.anchor("center"),
            k.color(180, 190, 210),
        ]);

        // Antenna tip (blinking)
        jettyContainer.add([
            k.circle(3),
            k.pos(8, -44),
            k.anchor("center"),
            k.color(255, 100, 100),
            {
                blinkTime: 0,
                update() {
                    this.blinkTime += k.dt() * 4;
                    this.opacity = 0.5 + Math.sin(this.blinkTime) * 0.5;
                }
            }
        ]);

        // Legs
        jettyContainer.add([
            k.rect(10, 12, { radius: 2 }),
            k.pos(-6, 14),
            k.anchor("center"),
            k.color(50, 120, 180),
        ]);
        jettyContainer.add([
            k.rect(10, 12, { radius: 2 }),
            k.pos(6, 14),
            k.anchor("center"),
            k.color(50, 120, 180),
        ]);

        // Boots
        jettyContainer.add([
            k.rect(12, 6, { radius: 2 }),
            k.pos(-6, 22),
            k.anchor("center"),
            k.color(60, 65, 75),
        ]);
        jettyContainer.add([
            k.rect(12, 6, { radius: 2 }),
            k.pos(6, 22),
            k.anchor("center"),
            k.color(60, 65, 75),
        ]);

        // Title
        k.add([
            k.text("JETPACK ASCENT", {
                size: 64,
            }),
            k.pos(k.center().x + 50, 100),
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
            k.rect(200, 50, { radius: 8 }),
            k.pos(k.center().x, 340),
            k.anchor("center"),
            k.area(),
            k.color(50, 150, 50),
            k.outline(3, k.rgb(100, 200, 100)),
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
            k.rect(200, 50, { radius: 8 }),
            k.pos(k.center().x, 410),
            k.anchor("center"),
            k.area(),
            k.color(150, 150, 50),
            k.outline(3, k.rgb(200, 200, 100)),
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
            k.rect(200, 50, { radius: 8 }),
            k.pos(k.center().x, 480),
            k.anchor("center"),
            k.area(),
            k.color(150, 50, 50),
            k.outline(3, k.rgb(200, 100, 100)),
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
        const instructionText = k.add([
            k.text("Click a difficulty to start", {
                size: 16,
            }),
            k.pos(k.center().x, 550),
            k.anchor("center"),
            k.color(150, 150, 150),
        ]);

        // Level selection (hidden initially)
        const levelSelectLabel = k.add([
            k.text("SELECT LEVEL:", { size: 20 }),
            k.pos(k.center().x, 540),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.opacity(0),
        ]);

        const level1Btn = k.add([
            k.rect(120, 40, { radius: 6 }),
            k.pos(k.center().x - 140, 590),
            k.anchor("center"),
            k.area(),
            k.color(60, 100, 150),
            k.outline(2, k.rgb(100, 150, 200)),
            k.opacity(0),
            "levelBtn",
        ]);
        const level1Text = k.add([
            k.text("Level 1", { size: 18 }),
            k.pos(k.center().x - 140, 590),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.opacity(0),
        ]);

        const level2Btn = k.add([
            k.rect(120, 40, { radius: 6 }),
            k.pos(k.center().x, 590),
            k.anchor("center"),
            k.area(),
            k.color(80, 60, 100),
            k.outline(2, k.rgb(120, 100, 150)),
            k.opacity(0),
            "levelBtn",
        ]);
        const level2Text = k.add([
            k.text("Level 2", { size: 18 }),
            k.pos(k.center().x, 590),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.opacity(0),
        ]);

        const level3Btn = k.add([
            k.rect(120, 40, { radius: 6 }),
            k.pos(k.center().x + 140, 590),
            k.anchor("center"),
            k.area(),
            k.color(100, 100, 80),
            k.outline(2, k.rgb(150, 150, 120)),
            k.opacity(0),
            "levelBtn",
        ]);
        const level3Text = k.add([
            k.text("Level 3", { size: 18 }),
            k.pos(k.center().x + 140, 590),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.opacity(0),
        ]);

        const levelButtons = [level1Btn, level2Btn, level3Btn];
        const levelTexts = [level1Text, level2Text, level3Text];
        let levelSelectVisible = false;

        function showLevelSelect() {
            levelSelectVisible = true;
            instructionText.opacity = 0;
            levelSelectLabel.opacity = 1;
            levelButtons.forEach(btn => btn.opacity = 1);
            levelTexts.forEach(txt => txt.opacity = 1);
        }

        level1Btn.onClick(() => {
            if (levelSelectVisible) k.go(SCENES.LEVEL_1);
        });
        level2Btn.onClick(() => {
            if (levelSelectVisible) k.go(SCENES.LEVEL_2);
        });
        level3Btn.onClick(() => {
            if (levelSelectVisible) k.go(SCENES.LEVEL_3);
        });

        // Button interactions
        easyButton.onClick(() => {
            GAME_STATE.difficulty = "easy";
            showLevelSelect();
        });

        mediumButton.onClick(() => {
            GAME_STATE.difficulty = "medium";
            showLevelSelect();
        });

        hardButton.onClick(() => {
            GAME_STATE.difficulty = "hard";
            showLevelSelect();
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

            // Level button hover effects
            if (levelSelectVisible) {
                levelButtons.forEach((btn) => {
                    if (btn.isHovering()) {
                        btn.scale = k.vec2(1.08, 1.08);
                    } else {
                        btn.scale = k.vec2(1, 1);
                    }
                });
            }
        });
    });
}
