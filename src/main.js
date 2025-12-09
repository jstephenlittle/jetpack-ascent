import kaplay from "kaplay";
import { SCENES } from "./constants.js";
import { mainMenuScene } from "./scenes/mainMenu.js";
import { initLevelScenes } from "./scenes/level.js";
import { transitionScene } from "./scenes/transition.js";
import { gameOverScene } from "./scenes/gameOver.js";
import { victoryScene } from "./scenes/victory.js";

// Initialize KAPLAY
const k = kaplay({
    width: 800,
    height: 600,
    letterbox: true,
    background: [16, 20, 31],
    debugKey: "d",
    debug: true,
});

// Initialize all scenes
mainMenuScene(k);
initLevelScenes(k);
transitionScene(k);
gameOverScene(k);
victoryScene(k);

// Start with main menu
k.go(SCENES.MAIN_MENU);
