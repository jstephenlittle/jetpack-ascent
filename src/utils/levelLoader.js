import { createPlatform, createBreakawayPlatform, createBouncePad, createRechargeStation, createCheckpoint } from "../entities/platform.js";
import { createRollerBot, createHoverDrone, createDropBot, createMine } from "../entities/enemy.js";
import { createFuelCell, createShield, createHealthPickup } from "../entities/powerup.js";
import { createStar } from "../entities/collectible.js";
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
            case "checkpoint":
                createCheckpoint(k, platform.x, platform.y, platform.width);
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
                // MegaBoost replaced with Mine enemy
                createMine(k, powerup.x, powerup.y);
                break;
            case "healthPickup":
                createHealthPickup(k, powerup.x, powerup.y);
                powerupsCreated++;
                break;
        }
    });
    console.log(`[LEVEL LOADER] Created ${powerupsCreated} power-ups`);

    // Load collectibles (stars, gems, etc.)
    GAME_STATE.totalStars = 0;
    if (levelData.collectibles && levelData.collectibles.length > 0) {
        console.log(`[LEVEL LOADER] Loading ${levelData.collectibles.length} collectibles`);
        let collectiblesCreated = 0;
        levelData.collectibles.forEach(collectible => {
            switch (collectible.type) {
                case "star":
                    createStar(k, collectible.x, collectible.y);
                    collectiblesCreated++;
                    GAME_STATE.totalStars++;
                    break;
            }
        });
        console.log(`[LEVEL LOADER] Created ${collectiblesCreated} collectibles`);
    }

    // Create doorway - grand exit portal
    console.log(`[LEVEL LOADER] Creating doorway at (${levelData.doorwayPosition[0]}, ${levelData.doorwayPosition[1]})`);

    // Outer portal frame/glow
    const portalGlow = k.add([
        k.rect(64, 80),
        k.pos(levelData.doorwayPosition[0], levelData.doorwayPosition[1]),
        k.anchor("center"),
        k.color(80, 200, 255),
        k.opacity(0.3),
        k.outline(3, k.rgb(100, 255, 255)),
        "portalGlow",
        {
            pulseTime: 0,
        },
    ]);

    // Main doorway
    const doorway = k.add([
        k.rect(48, 68),
        k.pos(levelData.doorwayPosition[0], levelData.doorwayPosition[1]),
        k.anchor("center"),
        k.area(),
        k.color(150, 255, 255),
        k.outline(2, k.rgb(200, 255, 255)),
        "doorway",
        {
            glowTime: 0,
            waveTime: 0,
        },
    ]);

    // Inner energy core
    const portalCore = k.add([
        k.rect(32, 52),
        k.pos(levelData.doorwayPosition[0], levelData.doorwayPosition[1]),
        k.anchor("center"),
        k.color(255, 255, 255),
        k.opacity(0.6),
        "portalCore",
        {
            shimmerTime: 0,
        },
    ]);

    // Portal animations
    portalGlow.onUpdate(() => {
        portalGlow.pulseTime += k.dt();
        // Slow outer pulse
        const pulse = 0.2 + Math.sin(portalGlow.pulseTime * 2) * 0.15;
        portalGlow.opacity = pulse;
        // Slight scale breathing
        const scale = 1 + Math.sin(portalGlow.pulseTime * 1.5) * 0.05;
        portalGlow.scale = k.vec2(scale, scale);
    });

    doorway.onUpdate(() => {
        doorway.glowTime += k.dt();
        doorway.waveTime += k.dt();

        // Color shift between cyan and white
        const shift = 0.7 + Math.sin(doorway.glowTime * 3) * 0.3;
        doorway.color = k.rgb(150 + 105 * shift, 255, 255);

        // Energy wave effect
        const wave = Math.sin(doorway.waveTime * 4);
        doorway.opacity = 0.7 + wave * 0.2;
    });

    portalCore.onUpdate(() => {
        portalCore.shimmerTime += k.dt();
        // Rapid shimmer
        const shimmer = 0.4 + Math.sin(portalCore.shimmerTime * 8) * 0.3;
        portalCore.opacity = shimmer;
        // Color flicker
        const flicker = Math.sin(portalCore.shimmerTime * 6) > 0;
        portalCore.color = flicker ? k.rgb(255, 255, 255) : k.rgb(200, 255, 255);
    });

    const startPos = k.vec2(levelData.startPosition[0], levelData.startPosition[1]);
    console.log(`[LEVEL LOADER] Level loading complete. Start position: (${startPos.x}, ${startPos.y})`);

    return {
        startPos: startPos,
        doorway: doorway,
    };
}
