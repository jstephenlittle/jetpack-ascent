/**
 * Game configuration and difficulty settings
 * Based on PRD Section 7
 */

// Difficulty multipliers per PRD
export const DIFFICULTY = {
    easy: {
        platformDensity: 1.3,
        hazardRate: 0.6,
        fuelRate: 1.4,
        healthRate: 1.3, // More health
        damageTaken: 0.7, // Less damage
        fallTolerance: 1.4,
        enemySpeed: 0.7,
        powerUpFrequency: 1.5,
    },
    medium: {
        platformDensity: 1.0,
        hazardRate: 1.0,
        fuelRate: 1.0,
        healthRate: 1.0,
        damageTaken: 1.0,
        fallTolerance: 1.0,
        enemySpeed: 1.0,
        powerUpFrequency: 1.0,
    },
    hard: {
        platformDensity: 0.7,
        hazardRate: 1.5,
        fuelRate: 0.8,
        healthRate: 0.8, // Less health
        damageTaken: 1.3, // More damage
        fallTolerance: 0.7,
        enemySpeed: 1.3,
        powerUpFrequency: 0.7,
    },
};

// Game constants
export const GAME_CONFIG = {
    // Player
    PLAYER_MOVE_SPEED: 140, // Slower horizontal movement
    PLAYER_JETPACK_THRUST: 2000, // Gentler thrust (still > gravity)
    PLAYER_MAX_UPWARD_VELOCITY: 400, // Lower max upward speed
    PLAYER_MAX_FALL_VELOCITY: 500, // Slower terminal velocity
    PLAYER_GRAVITY: 800, // Much slower fall acceleration

    // Health system
    DEFAULT_HEALTH: 100,
    ENEMY_DAMAGE: 20, // Base damage from enemy collision
    FALL_DAMAGE_MIN_VELOCITY: 380, // Start taking damage above this speed (higher = more forgiving)
    FALL_DAMAGE_MAX_VELOCITY: 500, // Max damage at this speed
    FALL_DAMAGE_MIN: 10, // Minimum fall damage
    FALL_DAMAGE_MAX: 35, // Maximum fall damage
    HEALTH_PICKUP_AMOUNT: 25, // Health restored per pickup

    // Fuel
    DEFAULT_FUEL: 150, // More fuel for exploration
    FUEL_CONSUMPTION_RATE: 18, // per second
    FUEL_RECHARGE_RATE: 60, // per second on recharge station

    // Platform sizes
    PLATFORM_HEIGHT: 20,
    PLATFORM_MIN_WIDTH: 64,
    PLATFORM_MAX_WIDTH: 256,

    // Enemy
    ROLLER_BOT_SPEED: 100,
    HOVER_DRONE_SPEED: 80,
    DROPBOT_FALL_SPEED: 400,
    DROPBOT_WARNING_TIME: 0.5, // seconds
};

/**
 * Get difficulty configuration
 * @param {string} difficultyLevel - "easy", "medium", or "hard"
 * @returns {object} Difficulty multipliers
 */
export function getDifficultyConfig(difficultyLevel) {
    return DIFFICULTY[difficultyLevel] || DIFFICULTY.medium;
}

/**
 * Apply difficulty multiplier to a base value
 * @param {number} baseValue - The base value
 * @param {string} multiplierKey - The difficulty key (e.g., "fuelRate")
 * @param {string} difficultyLevel - Current difficulty
 * @returns {number} Modified value
 */
export function applyDifficulty(baseValue, multiplierKey, difficultyLevel) {
    const config = getDifficultyConfig(difficultyLevel);
    return baseValue * (config[multiplierKey] || 1.0);
}
