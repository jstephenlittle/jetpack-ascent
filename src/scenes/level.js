import { SCENES, GAME_STATE } from "../constants.js";
import { GAME_CONFIG } from "../config.js";
import { createPlayer } from "../entities/player.js";
import { createRechargeStation } from "../entities/platform.js";
import { loadLevel } from "../utils/levelLoader.js";

export function levelScene(k, levelNum, levelName, nextScene, levelDataUrl) {
    k.scene(SCENES[`LEVEL_${levelNum}`], async () => {
        console.log(`[LEVEL ${levelNum}] Scene initializing...`);
        console.log(`[LEVEL ${levelNum}] Canvas size: ${k.width()}x${k.height()}`);

        // Background color (placeholder)
        const bgColors = {
            1: [20, 20, 60],  // Space - dark blue
            2: [40, 40, 50],  // Gothic - grey blue
            3: [30, 30, 40],  // Business - dark grey
        };

        k.add([
            k.rect(k.width(), k.height()),
            k.color(...bgColors[levelNum]),
            k.pos(0, 0),
            k.z(-10),
        ]);

        // Add elaborate space background (Level 1 only)
        if (levelNum === 1) {
            // === GRADIENT BACKGROUND: Blue at bottom to black at top ===
            const levelBottom = 800;  // Below floor
            const levelTop = -15000;
            const gradientHeight = levelBottom - levelTop;  // ~15800 units
            const numBands = 20;  // Number of gradient bands
            const bandHeight = gradientHeight / numBands;

            for (let i = 0; i < numBands; i++) {
                // Calculate color - blue at bottom (i=0), black at top (i=numBands-1)
                const progress = i / (numBands - 1);  // 0 to 1
                // Start with blue (60, 120, 180) and fade to black (20, 20, 60)
                const r = Math.round(60 - progress * 40);
                const g = Math.round(120 - progress * 100);
                const b = Math.round(180 - progress * 120);

                k.add([
                    k.rect(2000, bandHeight + 50),  // Extra width and overlap to prevent gaps
                    k.pos(-200, levelBottom - (i + 1) * bandHeight),
                    k.color(r, g, b),
                    k.opacity(0.5),
                    k.z(-9),
                    "gradientBand",
                ]);
            }

            // === FLOOR: Full-width platform at bottom ===
            const floorY = 600;
            k.add([
                k.rect(1600, 40),
                k.pos(0, floorY),
                k.area(),
                k.body({ isStatic: true }),
                k.color(50, 70, 100),
                k.outline(2, k.rgb(30, 50, 80)),
                "platform",
                "floor",
            ]);

            // Floor surface detail
            for (let x = 0; x < 1600; x += 80) {
                k.add([
                    k.rect(2, 30),
                    k.pos(x, floorY + 5),
                    k.color(35, 50, 75),
                    k.opacity(0.6),
                    "floorDecor",
                ]);
            }

            // Recharge station on the floor (centered)
            createRechargeStation(k, 700, floorY - 20, 200);

            // === WALLS: Left and right boundaries ===
            const wallHeight = 16000;
            const wallWidth = 30;
            const wallTop = -15000;

            // Left wall (starts at floor level, goes up)
            k.add([
                k.rect(wallWidth, wallHeight),
                k.pos(-wallWidth, wallTop),
                k.area(),
                k.body({ isStatic: true }),
                k.color(40, 55, 80),
                k.outline(2, k.rgb(25, 40, 60)),
                "platform",
                "wall",
            ]);

            // Right wall (starts at floor level, goes up)
            k.add([
                k.rect(wallWidth, wallHeight),
                k.pos(1600, wallTop),
                k.area(),
                k.body({ isStatic: true }),
                k.color(40, 55, 80),
                k.outline(2, k.rgb(25, 40, 60)),
                "platform",
                "wall",
            ]);

            // === LAYER 1: Scattered stars throughout ===
            for (let i = 0; i < 400; i++) {
                const x = Math.random() * k.width();
                const y = Math.random() * 16000 - 15000;
                const size = Math.random() * 2 + 0.5;
                const brightness = Math.random() * 100 + 155;

                k.add([
                    k.circle(size),
                    k.pos(x, y),
                    k.color(brightness, brightness, brightness),
                    k.opacity(0.5 + Math.random() * 0.5),
                    k.z(-8),
                    "star",
                    {
                        twinkleTime: Math.random() * Math.PI * 2,
                        twinkleSpeed: 0.5 + Math.random() * 1.5,
                        baseOpacity: 0.5 + Math.random() * 0.5,
                        update() {
                            this.twinkleTime += k.dt() * this.twinkleSpeed;
                            this.opacity = this.baseOpacity * (0.7 + Math.sin(this.twinkleTime) * 0.3);
                        }
                    }
                ]);
            }

            // === LAYER 3: Nebula clouds at various heights ===
            const nebulaColors = [
                [80, 40, 120],   // Purple
                [40, 80, 120],   // Blue
                [120, 60, 80],   // Pink/red
                [60, 100, 80],   // Teal
            ];

            // Create nebula patches at different heights
            const nebulaPositions = [
                { x: 200, y: -4000, size: 300 },
                { x: 600, y: -4500, size: 250 },
                { x: 150, y: -7000, size: 350 },
                { x: 650, y: -7800, size: 280 },
                { x: 400, y: -10000, size: 400 },
                { x: 100, y: -11500, size: 320 },
                { x: 700, y: -12000, size: 280 },
                { x: 350, y: -13500, size: 350 },
            ];

            nebulaPositions.forEach((nebula, idx) => {
                const color = nebulaColors[idx % nebulaColors.length];
                // Main nebula body
                k.add([
                    k.circle(nebula.size),
                    k.pos(nebula.x, nebula.y),
                    k.anchor("center"),
                    k.color(...color),
                    k.opacity(0.08),
                    k.z(-7),
                ]);
                // Secondary glow
                k.add([
                    k.circle(nebula.size * 0.6),
                    k.pos(nebula.x + 30, nebula.y - 20),
                    k.anchor("center"),
                    k.color(...color),
                    k.opacity(0.12),
                    k.z(-7),
                ]);
            });

            // === LAYER 4: Distant planets/moons ===
            // Small moon mid-level
            k.add([
                k.circle(40),
                k.pos(700, -5500),
                k.anchor("center"),
                k.color(180, 180, 190),
                k.opacity(0.6),
                k.z(-6),
            ]);
            // Moon crater detail
            k.add([
                k.circle(8),
                k.pos(690, -5510),
                k.anchor("center"),
                k.color(140, 140, 150),
                k.opacity(0.4),
                k.z(-6),
            ]);

            // Distant planet upper level
            k.add([
                k.circle(60),
                k.pos(100, -9000),
                k.anchor("center"),
                k.color(180, 120, 100),
                k.opacity(0.5),
                k.z(-6),
            ]);
            // Planet ring
            k.add([
                k.rect(140, 8, { radius: 4 }),
                k.pos(100, -9000),
                k.anchor("center"),
                k.color(200, 160, 140),
                k.opacity(0.3),
                k.z(-6),
                k.rotate(-15),
            ]);

            // === LAYER 5: Space station/satellite elements ===
            // Satellite near bottom
            k.add([
                k.rect(30, 6),
                k.pos(650, -1500),
                k.anchor("center"),
                k.color(150, 150, 160),
                k.opacity(0.7),
                k.z(-5),
                k.rotate(25),
            ]);
            k.add([
                k.rect(6, 20),
                k.pos(650, -1500),
                k.anchor("center"),
                k.color(100, 150, 200),
                k.opacity(0.6),
                k.z(-5),
                k.rotate(25),
            ]);

            // Space debris/asteroids scattered
            const asteroidPositions = [
                { x: 750, y: -3000, size: 12, rot: 30 },
                { x: 50, y: -5000, size: 8, rot: -20 },
                { x: 780, y: -8000, size: 15, rot: 45 },
                { x: 30, y: -10500, size: 10, rot: -35 },
                { x: 770, y: -13000, size: 14, rot: 60 },
            ];

            asteroidPositions.forEach(ast => {
                k.add([
                    k.rect(ast.size, ast.size * 0.7, { radius: 2 }),
                    k.pos(ast.x, ast.y),
                    k.anchor("center"),
                    k.color(100, 90, 80),
                    k.opacity(0.5),
                    k.z(-5),
                    k.rotate(ast.rot),
                ]);
            });

            // === LAYER 6: Destination glow at top ===
            // Bright beacon/portal at the top
            k.add([
                k.circle(150),
                k.pos(k.width() / 2, -14500),
                k.anchor("center"),
                k.color(255, 255, 255),
                k.opacity(0.1),
                k.z(-6),
            ]);
            k.add([
                k.circle(80),
                k.pos(k.width() / 2, -14500),
                k.anchor("center"),
                k.color(200, 255, 255),
                k.opacity(0.2),
                k.z(-6),
                "beacon",
                {
                    pulseTime: 0,
                    update() {
                        this.pulseTime += k.dt();
                        this.opacity = 0.15 + Math.sin(this.pulseTime * 2) * 0.1;
                    }
                }
            ]);
        }

        // Add elaborate Gothic background (Level 2 only)
        if (levelNum === 2) {
            // === GRADIENT BACKGROUND: Purple/black gothic atmosphere ===
            const levelBottom = 800;
            const levelTop = -8000;
            const gradientHeight = levelBottom - levelTop;
            const numBands = 16;
            const bandHeight = gradientHeight / numBands;

            for (let i = 0; i < numBands; i++) {
                const progress = i / (numBands - 1);
                // Dark purple at bottom to black at top
                const r = Math.round(40 - progress * 30);
                const g = Math.round(30 - progress * 25);
                const b = Math.round(60 - progress * 45);

                k.add([
                    k.rect(2000, bandHeight + 50),
                    k.pos(-200, levelBottom - (i + 1) * bandHeight),
                    k.color(r, g, b),
                    k.opacity(0.6),
                    k.z(-9),
                    "gradientBand",
                ]);
            }

            // === FLOOR: Gothic stone floor ===
            const floorY = 600;
            k.add([
                k.rect(1600, 40),
                k.pos(0, floorY),
                k.area(),
                k.body({ isStatic: true }),
                k.color(60, 55, 65),
                k.outline(2, k.rgb(40, 35, 45)),
                "platform",
                "floor",
            ]);

            // Floor stone pattern
            for (let x = 0; x < 1600; x += 60) {
                k.add([
                    k.rect(2, 35),
                    k.pos(x, floorY + 3),
                    k.color(45, 40, 50),
                    k.opacity(0.6),
                    "floorDecor",
                ]);
            }

            // === WALLS: Gothic stone walls ===
            const wallHeight = 9000;
            const wallWidth = 40;
            const wallTop = -8000;

            // Left wall
            k.add([
                k.rect(wallWidth, wallHeight),
                k.pos(-wallWidth, wallTop),
                k.area(),
                k.body({ isStatic: true }),
                k.color(50, 45, 55),
                k.outline(2, k.rgb(35, 30, 40)),
                "platform",
                "wall",
            ]);

            // Right wall
            k.add([
                k.rect(wallWidth, wallHeight),
                k.pos(1600, wallTop),
                k.area(),
                k.body({ isStatic: true }),
                k.color(50, 45, 55),
                k.outline(2, k.rgb(35, 30, 40)),
                "platform",
                "wall",
            ]);

            // === DECORATIVE ELEMENTS ===

            // Flickering torches on walls
            const torchPositions = [
                { x: 30, y: 200 }, { x: 1570, y: 200 },
                { x: 30, y: -500 }, { x: 1570, y: -500 },
                { x: 30, y: -1200 }, { x: 1570, y: -1200 },
                { x: 30, y: -1900 }, { x: 1570, y: -1900 },
                { x: 30, y: -2600 }, { x: 1570, y: -2600 },
                { x: 30, y: -3300 }, { x: 1570, y: -3300 },
                { x: 30, y: -4000 }, { x: 1570, y: -4000 },
                { x: 30, y: -4700 }, { x: 1570, y: -4700 },
                { x: 30, y: -5400 }, { x: 1570, y: -5400 },
                { x: 30, y: -6100 }, { x: 1570, y: -6100 },
                { x: 30, y: -6800 }, { x: 1570, y: -6800 },
            ];

            torchPositions.forEach((torch) => {
                // Torch holder
                k.add([
                    k.rect(8, 16),
                    k.pos(torch.x, torch.y),
                    k.anchor("center"),
                    k.color(80, 60, 40),
                    k.z(-4),
                ]);

                // Flame
                k.add([
                    k.rect(10, 14, { radius: 4 }),
                    k.pos(torch.x, torch.y - 12),
                    k.anchor("center"),
                    k.color(255, 150, 50),
                    k.opacity(0.9),
                    k.z(-4),
                    {
                        flickerTime: Math.random() * Math.PI * 2,
                        update() {
                            this.flickerTime += k.dt() * 10;
                            this.opacity = 0.6 + Math.sin(this.flickerTime) * 0.3;
                            this.scale = k.vec2(
                                0.9 + Math.sin(this.flickerTime * 1.3) * 0.2,
                                0.9 + Math.sin(this.flickerTime * 0.9) * 0.2
                            );
                        }
                    }
                ]);
            });

            // Gothic arched windows (background decoration)
            const windowPositions = [
                { x: 200, y: -1500 }, { x: 1400, y: -1500 },
                { x: 200, y: -3500 }, { x: 1400, y: -3500 },
                { x: 200, y: -5500 }, { x: 1400, y: -5500 },
            ];

            windowPositions.forEach((win) => {
                // Window frame
                k.add([
                    k.rect(60, 100, { radius: 30 }),
                    k.pos(win.x, win.y),
                    k.anchor("center"),
                    k.color(30, 25, 40),
                    k.outline(3, k.rgb(50, 45, 60)),
                    k.z(-7),
                ]);
                // Moon glow through window
                k.add([
                    k.rect(40, 70, { radius: 20 }),
                    k.pos(win.x, win.y + 5),
                    k.anchor("center"),
                    k.color(80, 80, 120),
                    k.opacity(0.3),
                    k.z(-7),
                ]);
            });

            // Flying bats in background
            for (let i = 0; i < 15; i++) {
                const batX = Math.random() * 1400 + 100;
                const batY = Math.random() * 7000 - 7000;

                k.add([
                    k.rect(20, 8),
                    k.pos(batX, batY),
                    k.anchor("center"),
                    k.color(30, 25, 35),
                    k.opacity(0.4),
                    k.z(-6),
                    {
                        startX: batX,
                        startY: batY,
                        flyTime: Math.random() * Math.PI * 2,
                        flySpeed: 0.5 + Math.random() * 1,
                        update() {
                            this.flyTime += k.dt() * this.flySpeed;
                            this.pos.x = this.startX + Math.sin(this.flyTime * 2) * 50;
                            this.pos.y = this.startY + Math.sin(this.flyTime) * 20;
                            // Wing flap
                            this.scale = k.vec2(1, 0.6 + Math.sin(this.flyTime * 8) * 0.4);
                        }
                    }
                ]);
            }

            // Floating dust/particles
            for (let i = 0; i < 60; i++) {
                const x = Math.random() * 1400 + 100;
                const y = Math.random() * 8000 - 7500;
                const size = Math.random() * 2 + 0.5;

                k.add([
                    k.circle(size),
                    k.pos(x, y),
                    k.color(150, 130, 160),
                    k.opacity(0.15 + Math.random() * 0.2),
                    k.z(-5),
                    {
                        startY: y,
                        driftTime: Math.random() * Math.PI * 2,
                        driftSpeed: 0.3 + Math.random() * 0.5,
                        update() {
                            this.driftTime += k.dt() * this.driftSpeed;
                            this.pos.y = this.startY + Math.sin(this.driftTime) * 15;
                        }
                    }
                ]);
            }

            // Moon at top of level
            k.add([
                k.circle(80),
                k.pos(1200, -7200),
                k.anchor("center"),
                k.color(220, 220, 200),
                k.opacity(0.6),
                k.z(-8),
            ]);
            // Moon glow
            k.add([
                k.circle(120),
                k.pos(1200, -7200),
                k.anchor("center"),
                k.color(200, 200, 180),
                k.opacity(0.2),
                k.z(-8),
            ]);
        }

        // Add window lights for Business Tower theme (Level 3 only)
        if (levelNum === 3) {
            // Create grid of window lights
            for (let y = 500; y > -3500; y -= 100) {
                for (let x = 50; x < k.width(); x += 80) {
                    const isLit = Math.random() > 0.4; // 60% of windows are lit
                    if (isLit) {
                        const brightness = 180 + Math.random() * 75;
                        k.add([
                            k.rect(20, 30),
                            k.pos(x, y),
                            k.color(brightness, brightness, brightness - 20), // Warm white/yellow
                            k.opacity(0.3 + Math.random() * 0.2),
                            k.z(-6),
                            k.fixed(),
                        ]);
                    }
                }
            }
        }

        // Load level data
        let levelInfo;
        let startPos;

        if (levelDataUrl) {
            console.log(`[LEVEL ${levelNum}] Loading level data from: ${levelDataUrl}`);
            // Load level from JSON
            const response = await fetch(levelDataUrl);
            const levelData = await response.json();
            console.log(`[LEVEL ${levelNum}] Level data loaded:`, levelData);
            levelInfo = await loadLevel(k, levelData);
            startPos = levelInfo.startPos;
            console.log(`[LEVEL ${levelNum}] Start position:`, startPos);
        } else {
            // Fallback for levels without data
            startPos = k.vec2(k.center().x, k.height() - 100);
            console.log(`[LEVEL ${levelNum}] Using fallback start position:`, startPos);
        }

        // Create player
        console.log(`[LEVEL ${levelNum}] Creating player at (${startPos.x}, ${startPos.y})`);
        const player = createPlayer(k, startPos.x, startPos.y);
        console.log(`[LEVEL ${levelNum}] Player created:`, player);

        // Zoom out camera to show 50% more of the level
        const cameraScale = 0.67;
        k.camScale(cameraScale);

        // Camera follows player with clamping (floor at bottom, tower walls at sides)
        // Effective viewport is larger due to zoom: 800/0.67 x 600/0.67 ≈ 1194x895
        const effectiveViewportWidth = k.width() / cameraScale;
        const effectiveViewportHeight = k.height() / cameraScale;
        const halfViewportWidth = effectiveViewportWidth / 2;
        const halfViewportHeight = effectiveViewportHeight / 2;
        const towerWidth = 1600;
        const floorY = 600;
        const cameraMaxY = floorY - halfViewportHeight;  // Keep floor at bottom of viewport
        const cameraMinX = halfViewportWidth;
        const cameraMaxX = towerWidth - halfViewportWidth;

        player.onUpdate(() => {
            const camX = Math.max(cameraMinX, Math.min(player.pos.x, cameraMaxX));
            const camY = Math.min(player.pos.y, cameraMaxY);
            k.setCamPos(k.vec2(camX, camY));
        });

        // Death handler - respawn at checkpoint or start with dramatic effect
        let isDying = false;
        player.on("death", () => {
            // Prevent multiple death triggers
            if (isDying) return;
            isDying = true;

            // Freeze the player
            player.paused = true;
            player.vel = k.vec2(0, 0);

            // Create full-screen dark overlay (very large to cover all camera positions)
            const deathOverlay = k.add([
                k.rect(4000, 4000),
                k.pos(k.camPos()),
                k.anchor("center"),
                k.color(0, 0, 0),
                k.opacity(0),
                k.z(1000),  // On top of everything
                "deathOverlay",
            ]);

            // Keep overlay centered on camera
            deathOverlay.onUpdate(() => {
                deathOverlay.pos = k.camPos();
            });

            // Fade to black over 0.5 seconds
            k.tween(0, 0.85, 0.5, (val) => {
                deathOverlay.opacity = val;
            }, k.easings.easeInQuad);

            // Show death message after fade completes
            let deathText = null;
            k.wait(0.5, () => {
                deathText = k.add([
                    k.text("Robot Broke - Try Again", {
                        size: 48,
                        font: "sans-serif",
                    }),
                    k.pos(k.camPos()),
                    k.anchor("center"),
                    k.color(255, 255, 255),
                    k.opacity(0),
                    k.z(1001),  // Above the dark overlay
                    "deathText",
                ]);

                // Keep text centered on camera
                deathText.onUpdate(() => {
                    deathText.pos = k.camPos();
                });

                // Fade in the text
                k.tween(0, 1, 0.3, (val) => {
                    deathText.opacity = val;
                }, k.easings.easeOutQuad);
            });

            // After fade, wait 2 seconds, then respawn
            k.wait(2.5, () => {
                // Fade out the death text
                if (deathText) {
                    k.tween(1, 0, 0.3, (val) => {
                        deathText.opacity = val;
                    }, k.easings.easeInQuad).onEnd(() => {
                        k.destroy(deathText);
                    });
                }
                // Determine respawn position
                let respawnPos;
                if (player.checkpointPos) {
                    console.log(`[RESPAWN] Respawning at checkpoint (${player.checkpointPos.x}, ${player.checkpointPos.y})`);
                    respawnPos = player.checkpointPos;
                } else {
                    console.log(`[RESPAWN] No checkpoint - respawning at start (${startPos.x}, ${startPos.y})`);
                    respawnPos = startPos;
                }

                // Move player to respawn position
                player.pos.x = respawnPos.x;
                player.pos.y = respawnPos.y;
                player.vel = k.vec2(0, 0);

                // Reset health and fuel
                GAME_STATE.health = GAME_STATE.maxHealth;
                player.fuel = player.maxFuel;
                player.fallVelocity = 0;

                // Clear any effects
                player.hasShield = false;
                const shieldEffect = player.get("shieldEffect")[0];
                if (shieldEffect) k.destroy(shieldEffect);

                // Snap camera to new position (using pre-calculated bounds)
                const camX = Math.max(cameraMinX, Math.min(player.pos.x, cameraMaxX));
                const camY = Math.min(player.pos.y, cameraMaxY);
                k.setCamPos(k.vec2(camX, camY));

                // Fade back in over 0.5 seconds
                k.tween(0.85, 0, 0.5, (val) => {
                    deathOverlay.opacity = val;
                }, k.easings.easeOutQuad).onEnd(() => {
                    // Resume player control and cleanup
                    player.paused = false;
                    isDying = false;
                    k.destroy(deathOverlay);

                    // Brief invulnerability flash
                    const body = player.get("body")[0];
                    if (body) {
                        body.color = k.rgb(255, 255, 255);
                        k.wait(0.2, () => {
                            body.color = k.rgb(100, 160, 255);
                        });
                    }
                });
            });
        });

        // Handle doorway entry
        if (levelInfo && levelInfo.doorway) {
            levelInfo.doorway.onCollide("player", () => {
                if (nextScene === SCENES.VICTORY) {
                    k.go(SCENES.VICTORY);
                } else {
                    k.go(SCENES.TRANSITION, levelNum + 1);
                }
            });
        }

        // Level title (fades out after 3 seconds)
        const levelTitle = k.add([
            k.text(`LEVEL ${levelNum}: ${levelName}`, {
                size: 24,
            }),
            k.pos(k.center().x, 30),
            k.anchor("center"),
            k.color(255, 255, 255),
            k.opacity(1),
            k.fixed(),
        ]);

        // Fade out title after 3 seconds
        k.wait(3, () => {
            k.tween(1, 0, 1.5, (val) => {
                levelTitle.opacity = val;
            }, k.easings.easeOutQuad).onEnd(() => {
                k.destroy(levelTitle);
            });
        });

        // Instructions (fades out after 5 seconds)
        const instructions = k.add([
            k.text("Arrow keys: Move | Space: Jetpack | ESC: Menu", {
                size: 12,
            }),
            k.pos(k.width() - 20, 20),
            k.anchor("topright"),
            k.color(180, 180, 180),
            k.opacity(1),
            k.fixed(),
        ]);

        // Fade out instructions after 5 seconds
        k.wait(5, () => {
            k.tween(1, 0, 1, (val) => {
                instructions.opacity = val;
            }, k.easings.easeOutQuad).onEnd(() => {
                k.destroy(instructions);
            });
        });

        // Show difficulty
        k.add([
            k.text(`Difficulty: ${GAME_STATE.difficulty.toUpperCase()}`, {
                size: 14,
            }),
            k.pos(20, 20),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Health bar
        k.add([
            k.rect(104, 14),
            k.pos(20, 40),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        k.add([
            k.rect(100, 10),
            k.pos(22, 42),
            k.color(255, 100, 100),
            k.fixed(),
            {
                update() {
                    const healthPercent = GAME_STATE.health / GAME_STATE.maxHealth;
                    this.width = 100 * healthPercent;
                    // Change color based on health level
                    if (healthPercent > 0.6) {
                        this.color = k.rgb(100, 255, 100); // Green - healthy
                    } else if (healthPercent > 0.3) {
                        this.color = k.rgb(255, 200, 100); // Yellow - warning
                    } else {
                        this.color = k.rgb(255, 100, 100); // Red - danger
                    }
                }
            }
        ]);

        k.add([
            k.text("HEALTH", {
                size: 10,
            }),
            k.pos(20, 58),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Fuel meter
        k.add([
            k.rect(104, 14),
            k.pos(20, 75),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        k.add([
            k.rect(100, 10),
            k.pos(22, 77),
            k.color(100, 200, 255),
            k.fixed(),
            {
                update() {
                    const fuelPercent = player.fuel / player.maxFuel;
                    this.width = 100 * fuelPercent;
                    // Change color based on fuel level
                    if (fuelPercent > 0.5) {
                        this.color = k.rgb(100, 200, 255);
                    } else if (fuelPercent > 0.2) {
                        this.color = k.rgb(255, 200, 100);
                    } else {
                        this.color = k.rgb(255, 100, 100);
                    }
                }
            }
        ]);

        k.add([
            k.text("FUEL", {
                size: 10,
            }),
            k.pos(20, 93),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Fall meter
        k.add([
            k.rect(104, 14),
            k.pos(20, 110),
            k.color(50, 50, 50),
            k.fixed(),
        ]);

        k.add([
            k.rect(0, 10),
            k.pos(22, 112),
            k.color(100, 255, 100),
            k.fixed(),
            {
                update() {
                    const fallPercent = Math.min(player.fallVelocity / GAME_CONFIG.FALL_DAMAGE_MAX_VELOCITY, 1.0);
                    this.width = 100 * fallPercent;

                    // Color code based on danger level
                    if (fallPercent < 0.4) {
                        this.color = k.rgb(100, 255, 100); // Green - safe
                    } else if (fallPercent < 0.7) {
                        this.color = k.rgb(255, 200, 100); // Yellow - warning
                    } else {
                        this.color = k.rgb(255, 100, 100); // Red - dangerous
                    }
                }
            }
        ]);

        k.add([
            k.text("FALL", {
                size: 10,
            }),
            k.pos(20, 128),
            k.color(150, 150, 150),
            k.fixed(),
        ]);

        // Collectible counter
        // Reset collectibles collected at level start
        GAME_STATE.starsCollected = 0;

        // Collectible icon (star for Level 1, goblet for Level 2)
        if (levelNum === 2) {
            // Goblet icon for Gothic level
            // Cup
            k.add([
                k.rect(10, 6, { radius: 1 }),
                k.pos(24, 146),
                k.anchor("center"),
                k.color(218, 165, 32),
                k.outline(1, k.rgb(184, 134, 11)),
                k.fixed(),
            ]);
            // Stem
            k.add([
                k.rect(3, 5),
                k.pos(24, 152),
                k.anchor("center"),
                k.color(218, 165, 32),
                k.fixed(),
            ]);
            // Base
            k.add([
                k.rect(8, 3),
                k.pos(24, 156),
                k.anchor("center"),
                k.color(218, 165, 32),
                k.fixed(),
            ]);
        } else {
            // Star icon (default)
            k.add([
                k.rect(8, 8),
                k.pos(24, 150),
                k.anchor("center"),
                k.color(255, 230, 100),
                k.rotate(45),
                k.fixed(),
            ]);
        }

        // Collectible count text
        const collectibleColor = levelNum === 2 ? k.rgb(218, 165, 32) : k.rgb(255, 230, 100);
        k.add([
            k.text("0 / 0", {
                size: 14,
            }),
            k.pos(36, 150),
            k.anchor("left"),
            k.color(collectibleColor),
            k.fixed(),
            {
                update() {
                    this.text = `${GAME_STATE.starsCollected} / ${GAME_STATE.totalStars}`;
                }
            }
        ]);

        // Temporary navigation (N key for testing)
        k.onKeyPress("n", () => {
            if (nextScene === SCENES.VICTORY) {
                k.go(SCENES.VICTORY);
            } else {
                k.go(SCENES.TRANSITION, levelNum + 1);
            }
        });

        k.onKeyPress("escape", () => {
            k.go(SCENES.MAIN_MENU);
        });
    });
}

// Create all three level scenes
export function initLevelScenes(k) {
    levelScene(k, 1, "Space Tower", SCENES.TRANSITION, "/assets/data/level1_space.json");
    levelScene(k, 2, "Gothic Tower", SCENES.TRANSITION, "/assets/data/level2_gothic.json");
    levelScene(k, 3, "Business Tower", SCENES.VICTORY, "/assets/data/level3_business.json");
}
