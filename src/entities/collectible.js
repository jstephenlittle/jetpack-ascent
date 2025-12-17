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
    // Single simple star - just a rotated square with glow
    const collectible = k.add([
        k.rect(14, 14),
        k.pos(x, y),
        k.anchor("center"),
        k.area({ scale: 1.2 }), // Slightly larger hitbox for easier collection
        k.color(255, 230, 100),
        k.outline(2, k.rgb(255, 180, 50)),
        k.rotate(45),
        k.opacity(0.9),
        "collectible",
        "star",
        {
            baseY: y,
            phase: Math.random() * Math.PI * 2,
        },
    ]);

    // No per-frame update - stars are static until collected
    // This eliminates 130 update callbacks

    collectible.onCollide("player", () => {
        GAME_STATE.score += 100;
        GAME_STATE.starsCollected = (GAME_STATE.starsCollected || 0) + 1;

        // Quick flash effect at collection point
        const flash = k.add([
            k.rect(20, 20),
            k.pos(collectible.pos.x, collectible.pos.y),
            k.anchor("center"),
            k.color(255, 255, 200),
            k.opacity(0.8),
            k.rotate(45),
            k.lifespan(0.15, { fade: 0.15 }),
        ]);

        k.destroy(collectible);
    });

    return collectible;
}
