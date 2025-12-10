import { createPlatform, createBreakawayPlatform, createBouncePad, createRechargeStation } from "../entities/platform.js";
import { createRollerBot, createHoverDrone, createDropBot } from "../entities/enemy.js";
import { createFuelCell, createShield, createMegaBoost, createExtraLife } from "../entities/powerup.js";
import { GAME_STATE } from "../constants.js";
import { getDifficultyConfig } from "../config.js";

/**
 * Load and create level from JSON data
 * @param {object} k - KAPLAY instance
 * @param {object} levelData - Level JSON data
 */
export async function loadLevel(k, levelData) {
    console.log(`[LEVEL LOADER] Loading level: ${levelData.name}`);
    const difficulty = getDifficultyConfig(GAME_STATE.difficulty);
    console.log(`[LEVEL LOADER] Difficulty config:`, difficulty);

    // Load platforms
    console.log(`[LEVEL LOADER] Loading ${levelData.platforms.length} platforms`);
    let platformsCreated = 0;
    levelData.platforms.forEach(platform => {
        const adjustedCount = Math.random() < difficulty.platformDensity;

        // Skip some platforms on hard difficulty
        if (GAME_STATE.difficulty === "hard" && !adjustedCount && Math.random() > 0.7) {
            return;
        }

        switch (platform.type) {
            case "static":
                createPlatform(k, platform.x, platform.y, platform.width);
                platformsCreated++;
                break;
            case "breakaway":
                createBreakawayPlatform(k, platform.x, platform.y, platform.width);
                platformsCreated++;
                break;
            case "bounce":
                createBouncePad(k, platform.x, platform.y, platform.width);
                platformsCreated++;
                break;
            case "recharge":
                createRechargeStation(k, platform.x, platform.y, platform.width);
                platformsCreated++;
                break;
        }
    });
    console.log(`[LEVEL LOADER] Created ${platformsCreated} platforms`);

    // Load enemies (adjusted by difficulty hazardRate)
    console.log(`[LEVEL LOADER] Loading ${levelData.enemies.length} enemies`);
    let enemiesCreated = 0;
    levelData.enemies.forEach(enemy => {
        // Spawn more enemies on hard, fewer on easy
        const spawnChance = difficulty.hazardRate;
        if (Math.random() > spawnChance && GAME_STATE.difficulty !== "medium") {
            return;
        }

        switch (enemy.type) {
            case "rollerBot":
                createRollerBot(k, enemy.x, enemy.y);
                enemiesCreated++;
                break;
            case "hoverDrone":
                createHoverDrone(k, enemy.x, enemy.y, enemy.range || 150);
                enemiesCreated++;
                break;
            case "dropBot":
                createDropBot(k, enemy.x, enemy.y);
                enemiesCreated++;
                break;
        }
    });
    console.log(`[LEVEL LOADER] Created ${enemiesCreated} enemies`);

    // Load power-ups (adjusted by difficulty powerUpFrequency)
    console.log(`[LEVEL LOADER] Loading ${levelData.powerups.length} power-ups`);
    let powerupsCreated = 0;
    levelData.powerups.forEach(powerup => {
        const spawnChance = difficulty.powerUpFrequency;
        if (Math.random() > spawnChance && GAME_STATE.difficulty !== "medium") {
            return;
        }

        switch (powerup.type) {
            case "fuelCell":
                createFuelCell(k, powerup.x, powerup.y);
                powerupsCreated++;
                break;
            case "shield":
                createShield(k, powerup.x, powerup.y);
                powerupsCreated++;
                break;
            case "megaBoost":
                createMegaBoost(k, powerup.x, powerup.y);
                powerupsCreated++;
                break;
            case "extraLife":
                createExtraLife(k, powerup.x, powerup.y);
                powerupsCreated++;
                break;
        }
    });
    console.log(`[LEVEL LOADER] Created ${powerupsCreated} power-ups`);

    // Create doorway
    console.log(`[LEVEL LOADER] Creating doorway at (${levelData.doorwayPosition[0]}, ${levelData.doorwayPosition[1]})`);
    const doorway = k.add([
        k.rect(48, 64),
        k.pos(levelData.doorwayPosition[0], levelData.doorwayPosition[1]),
        k.anchor("center"),
        k.area(),
        k.color(100, 255, 255),
        k.opacity(0.8),
        "doorway",
        {
            glowTime: 0,
        },
    ]);

    // Doorway glow animation
    doorway.onUpdate(() => {
        doorway.glowTime += k.dt();
        const glow = (Math.sin(doorway.glowTime * 3) + 1) * 0.5;
        doorway.opacity = 0.5 + glow * 0.3;
    });

    const startPos = k.vec2(levelData.startPosition[0], levelData.startPosition[1]);
    console.log(`[LEVEL LOADER] Level loading complete. Start position: (${startPos.x}, ${startPos.y})`);

    return {
        startPos: startPos,
        doorway: doorway,
    };
}
