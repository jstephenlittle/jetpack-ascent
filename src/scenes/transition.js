import { SCENES } from "../constants.js";

export function transitionScene(k) {
    k.scene(SCENES.TRANSITION, (nextLevel) => {
        const levelNames = {
            1: "Space Tower",
            2: "Gothic Tower",
            3: "Business Tower",
        };

        // Background
        k.add([
            k.rect(k.width(), k.height()),
            k.color(10, 10, 20),
            k.pos(0, 0),
        ]);

        // Level complete message
        k.add([
            k.text("LEVEL COMPLETE!", {
                size: 48,
            }),
            k.pos(k.center().x, 150),
            k.anchor("center"),
            k.color(100, 255, 100),
        ]);

        // Next level info
        k.add([
            k.text(`Entering Level ${nextLevel}`, {
                size: 32,
            }),
            k.pos(k.center().x, 250),
            k.anchor("center"),
            k.color(200, 200, 200),
        ]);

        k.add([
            k.text(levelNames[nextLevel], {
                size: 40,
            }),
            k.pos(k.center().x, 320),
            k.anchor("center"),
            k.color(100, 200, 255),
        ]);

        // Auto-transition after 2 seconds
        k.wait(2, () => {
            k.go(SCENES[`LEVEL_${nextLevel}`]);
        });

        // Or press space to skip
        k.add([
            k.text("Press SPACE to continue", {
                size: 18,
            }),
            k.pos(k.center().x, 450),
            k.anchor("center"),
            k.color(150, 150, 150),
        ]);

        k.onKeyPress("space", () => {
            k.go(SCENES[`LEVEL_${nextLevel}`]);
        });
    });
}
