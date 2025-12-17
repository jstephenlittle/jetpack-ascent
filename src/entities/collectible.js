import { GAME_STATE } from "../constants.js";

/**
 * Create a Star collectible
 * Simple glowing star that Jetty can collect for points
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Collectible game object
 */
export function createStar(k, x, y) {
    return createCollectible(k, x, y, "star");
}

/**
 * Create a Gold Goblet collectible (Gothic theme)
 * Ornate chalice that Jetty can collect for points
 * @param {object} k - KAPLAY instance
 * @param {number} x - X position
 * @param {number} y - Y position
 * @returns {object} Collectible game object
 */
export function createGoblet(k, x, y) {
    return createCollectible(k, x, y, "goblet");
}

/**
 * Internal function to create collectibles of different types
 */
function createCollectible(k, x, y, type) {
    // Container for the collectible - needs a shape for area() to work
    const collectible = k.add([
        k.rect(20, 24),
        k.pos(x, y),
        k.anchor("center"),
        k.area(),
        k.opacity(0), // Invisible - child shapes provide visuals
        "collectible",
        type,
        {
            baseY: y,
            phase: Math.random() * Math.PI * 2,
        },
    ]);

    if (type === "star") {
        // Simple rotated square star
        collectible.add([
            k.rect(14, 14),
            k.anchor("center"),
            k.color(255, 230, 100),
            k.outline(2, k.rgb(255, 180, 50)),
            k.rotate(45),
            k.opacity(0.9),
        ]);
    } else if (type === "goblet") {
        // Cup/bowl part (wide top)
        collectible.add([
            k.rect(16, 10, { radius: 2 }),
            k.pos(0, -6),
            k.anchor("center"),
            k.color(218, 165, 32), // Gold
            k.outline(1, k.rgb(184, 134, 11)),
        ]);

        // Inner cup shadow
        collectible.add([
            k.rect(12, 4),
            k.pos(0, -9),
            k.anchor("center"),
            k.color(139, 90, 43),
            k.opacity(0.6),
        ]);

        // Stem
        collectible.add([
            k.rect(4, 8),
            k.pos(0, 2),
            k.anchor("center"),
            k.color(218, 165, 32),
            k.outline(1, k.rgb(184, 134, 11)),
        ]);

        // Base
        collectible.add([
            k.rect(14, 4, { radius: 1 }),
            k.pos(0, 8),
            k.anchor("center"),
            k.color(218, 165, 32),
            k.outline(1, k.rgb(184, 134, 11)),
        ]);

        // Gem on cup (ruby)
        collectible.add([
            k.rect(4, 4),
            k.pos(0, -6),
            k.anchor("center"),
            k.color(180, 30, 50),
            k.rotate(45),
        ]);
    }

    collectible.onCollide("player", () => {
        GAME_STATE.score += 100;
        GAME_STATE.starsCollected = (GAME_STATE.starsCollected || 0) + 1;

        // Quick flash effect at collection point
        const flashColor = type === "goblet" ? k.rgb(255, 215, 0) : k.rgb(255, 255, 200);
        k.add([
            k.rect(24, 24),
            k.pos(collectible.pos.x, collectible.pos.y),
            k.anchor("center"),
            k.color(flashColor),
            k.opacity(0.8),
            k.rotate(45),
            k.lifespan(0.15, { fade: 0.15 }),
        ]);

        k.destroy(collectible);
    });

    return collectible;
}

