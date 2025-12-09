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
        fallTolerance: 1.4,
        enemySpeed: 0.7,
        powerUpFrequency: 1.5,
        extraLives: 1, // +1 bonus life
    },
    medium: {
        platformDensity: 1.0,
        hazardRate: 1.0,
        fuelRate: 1.0,
        fallTolerance: 1.0,
        enemySpeed: 1.0,
        powerUpFrequency: 1.0,
        extraLives: 0,
    },
    hard: {
        platformDensity: 0.7,
        hazardRate: 1.5,
        fuelRate: 0.8,
        fallTolerance: 0.7,
        enemySpeed: 1.3,
        powerUpFrequency: 0.7,
        extraLives: 0,
    },
};

// Game constants
export const GAME_CONFIG = {
    // Player
    PLAYER_MOVE_SPEED: 200,
    PLAYER_JETPACK_THRUST: 600,
    PLAYER_MAX_FALL_VELOCITY: 800,
    PLAYER_GRAVITY: 1200,

    // Lives
    DEFAULT_LIVES: 3,

    // Fuel
    DEFAULT_FUEL: 100,
    FUEL_CONSUMPTION_RATE: 20, // per second
    FUEL_RECHARGE_RATE: 30, // per second on recharge station

    // Fall damage threshold (50% of screen height as velocity)
    FALL_DAMAGE_THRESHOLD: 300,

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
