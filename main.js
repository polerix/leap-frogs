/**
 * Leap-frogs Game Logic
 */

const gameContainer = document.getElementById('game-container');
const platter = document.getElementById('launcher-platter');
const crank = document.getElementById('crank-handle');
const netContainer = document.getElementById('net-container');
const scoreValue = document.getElementById('score-value');
const frogsContainer = document.getElementById('frogs-container');

let gameState = {
    running: false,
    score: 0,
    platterRotation: 0,
    lastSpawnTime: 0,
    spawnInterval: 1500, // ms
    mouse: { x: 0, y: 0, lastX: 0, lastY: 0, vx: 0, vy: 0 }
};

// --- Initialization ---

function init() {
    setupEventListeners();
    requestAnimationFrame(gameLoop);
}

function setupEventListeners() {
    // Crank click to toggle game
    crank.addEventListener('click', () => {
        gameState.running = !gameState.running;
        console.log("Game state:", gameState.running ? "Running" : "Stopped");
        
        if (gameState.running) {
            crank.classList.add('rotating');
        } else {
            crank.classList.remove('rotating');
        }
    });

    // Net following mouse
    window.addEventListener('mousemove', (e) => {
        const rect = gameContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate velocity for tilting effect
        gameState.mouse.vx = x - gameState.mouse.lastX;
        gameState.mouse.vy = y - gameState.mouse.lastY;
        
        gameState.mouse.x = x;
        gameState.mouse.y = y;
        gameState.mouse.lastX = x;
        gameState.mouse.lastY = y;
    });
}

// --- Game Loop ---

function gameLoop(time) {
    if (gameState.running) {
        updateRotation();
        handleSpawning(time);
    }
    updatePhysics(); // Frogs should fall even if stopped? Or maybe they pause? Let's keep them moving.
    
    updateNetPosition();
    requestAnimationFrame(gameLoop);
}

function updateRotation() {
    gameState.platterRotation += 0.5; // Slower rotation
    platter.style.transform = `rotate(${gameState.platterRotation}deg)`;
}

function handleSpawning(time) {
    if (time - gameState.lastSpawnTime > gameState.spawnInterval) {
        // Show launcher light before spawning
        showLauncherLight();
        
        // Delay spawn slightly after light
        setTimeout(() => {
            if (gameState.running) spawnFrog();
        }, 300);
        
        gameState.lastSpawnTime = time;
        gameState.spawnInterval = 800 + Math.random() * 1200;
    }
}

function showLauncherLight() {
    const light = document.createElement('img');
    light.src = './images-old/LauncherDown.svg';
    light.className = 'launcher-light';
    
    const platterRect = platter.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    
    // Pick same spot as where frog will spawn
    const holeIndex = Math.floor(Math.random() * 8);
    const holeAngle = (holeIndex * 45 + gameState.platterRotation) * (Math.PI / 180);
    const radius = platterRect.width * 0.35;
    
    const x = (platterRect.left - containerRect.left + platterRect.width / 2) + Math.cos(holeAngle) * radius;
    const y = (platterRect.top - containerRect.top + platterRect.height / 2) + Math.sin(holeAngle) * radius;
    
    light.style.left = `${x}px`;
    light.style.top = `${y}px`;
    light.dataset.holeIndex = holeIndex; // For spawning logic consistency
    
    frogsContainer.appendChild(light);
    setTimeout(() => light.remove(), 400);
}

function spawnFrog() {
    const frog = document.createElement('img');
    frog.src = './images/frog-sprite-1.png';
    frog.className = 'frog';
    
    const platterRect = platter.getBoundingClientRect();
    const containerRect = gameContainer.getBoundingClientRect();
    const platterCenterX = platterRect.left - containerRect.left + platterRect.width / 2;
    const platterCenterY = platterRect.top - containerRect.top + platterRect.height / 2;

    const holeAngle = (Math.floor(Math.random() * 8) * 45 + gameState.platterRotation) * (Math.PI / 180);
    const radius = platterRect.width * 0.35;
    
    const startX = platterCenterX + Math.cos(holeAngle) * radius;
    const startY = platterCenterY + Math.sin(holeAngle) * radius;
    
    frog.dataset.x = startX;
    frog.dataset.y = startY;
    frog.dataset.vx = (platterCenterX - startX) * 0.04 + (Math.random() - 0.5) * 4;
    frog.dataset.vy = -16 - Math.random() * 8; 
    frog.dataset.gravity = 0.55;
    frog.dataset.active = "true";

    frog.style.left = `${startX}px`;
    frog.style.top = `${startY}px`;

    frogsContainer.appendChild(frog);
}

function updatePhysics() {
    const frogs = document.querySelectorAll('.frog');
    frogs.forEach(frog => {
        if (frog.dataset.active === "false") return;

        let x = parseFloat(frog.dataset.x);
        let y = parseFloat(frog.dataset.y);
        let vx = parseFloat(frog.dataset.vx);
        let vy = parseFloat(frog.dataset.vy);
        const gravity = parseFloat(frog.dataset.gravity);

        x += vx;
        vy += gravity;
        y += vy;

        frog.dataset.x = x;
        frog.dataset.y = y;
        frog.dataset.vy = vy;

        // Sprite animation based on vertical velocity
        if (vy < -5) {
            frog.src = './images/frog-sprite-1.png';
        } else if (vy < 5) {
            frog.src = './images/frog-sprite-2.png';
        } else {
            frog.src = './images/frog-sprite-3.png';
        }

        frog.style.left = `${x}px`;
        frog.style.top = `${y}px`;

        const height = Math.abs(vy);
        const scale = 0.7 + Math.max(0, (15 - Math.abs(vy)) * 0.03);
        const rotation = vx * 5; // Rotate based on lateral speed
        frog.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;

        if (y > 1000) frog.remove();
        checkCollision(frog, x, y);
    });
}

function updateNetPosition() {
    // Center the net on the mouse
    const x = gameState.mouse.x;
    const y = gameState.mouse.y;
    
    // Tilt based on velocity (smoothed)
    const tiltX = Math.min(Math.max(gameState.mouse.vy * 0.8, -30), 30);
    const tiltY = Math.min(Math.max(gameState.mouse.vx * -0.8, -30), 30);
    
    netContainer.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
}

function checkCollision(frog, fx, fy) {
    const nx = gameState.mouse.x;
    const ny = gameState.mouse.y;
    
    const dx = fx - nx;
    const dy = fy - ny;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist < 80 && frog.dataset.active === "true") {
        catchFrog(frog);
    }
}

function catchFrog(frog) {
    frog.dataset.active = "false";
    gameState.score += 1;
    scoreValue.innerText = gameState.score;
    
    // Pop effect
    frog.style.transition = "all 0.3s ease-out";
    frog.style.transform = "scale(2) opacity(0)";
    setTimeout(() => frog.remove(), 300);
}

// Start Game
init();
