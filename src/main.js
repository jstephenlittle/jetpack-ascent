import kaplay from "kaplay";

// Initialize KAPLAY
const k = kaplay({
    width: 800,
    height: 600,
    letterbox: true,
    background: [16, 20, 31],
    debugKey: "d",
    debug: true,
});

// Placeholder scene to verify KAPLAY is working
k.scene("test", () => {
    k.add([
        k.text("KAPLAY is working!\n\nPress SPACE to continue", {
            size: 32,
            width: 700,
        }),
        k.pos(k.center()),
        k.anchor("center"),
        k.color(255, 255, 255),
    ]);

    k.add([
        k.text("Jetpack Ascent", {
            size: 64,
        }),
        k.pos(k.center().x, 100),
        k.anchor("center"),
        k.color(100, 200, 255),
    ]);

    k.onKeyPress("space", () => {
        k.debug.log("Space pressed! KAPLAY is responding to input.");
    });
});

// Start with test scene
k.go("test");
