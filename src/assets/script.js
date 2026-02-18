/** CORE CONSTANTS */
let CANVAS, ctx;
const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#f40e6eff', '#14B8A6', '#4B5563'];
const neutralId = 11;
const playerId = 0;

// Config
const nodeCount = 40;
const minimumDistance = 70;
const maxPopulation = 200;
const growthRate = 1.5;
const troopSpeed = 2.8;
const troopSize = 4;
const nodeRadius = 24;
const aiStartDelay = 5;

const difficultyConfig = {
    easy: { aiInterval: 2000, aiAggression: 0.3, growthMod: 0.4 },
    medium: { aiInterval: 1000, aiAggression: 0.6, growthMod: 1.0 },
    hard: { aiInterval: 400, aiAggression: 0.95, growthMod: 1.2 }
};

// State
let nodes = [];
let troops = [];
let particles = [];
let dragSources = [];
let dragCurrent = { x: 0, y: 0 };
let isDragging = false;
let lastTime = 0;
let aiTimer = 0;
let gameTime = 0;
let gameState = 'MENU'; // MENU, PLAYING, PAUSED, GAMEOVER
let currentDifficulty = 'medium';

/** CLASSES */
class Node {
    constructor(id, x, y, ownerId, pop) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.owner = ownerId;
        this.population = pop;
        this.radius = nodeRadius;
        this.maxPop = maxPopulation;
        this.growthTimer = 0;
        this.pulse = Math.random() * Math.PI;
    }
    update(dt) {
        let rate = growthRate;
        if (this.owner !== playerId && this.owner !== neutralId)
            rate *= difficultyConfig[currentDifficulty].growthMod;
        if (this.owner !== neutralId && this.population < this.maxPop) {
            this.growthTimer += dt;
            if (this.growthTimer > 1 / rate) {
                this.population++;
                this.growthTimer = 0;
            }
        }
        this.pulse += dt * 2;
    }
    draw() {
        ctx.beginPath();
        const r = this.owner === playerId
            ? this.radius + Math.sin(this.pulse) * 1.5
            : this.radius;
        ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
        ctx.fillStyle = colors[this.owner];
        if (this.owner === playerId) { ctx.shadowBlur = 20; ctx.shadowColor = '#60A5FA'; }
        else { ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.3)'; }
        ctx.fill(); ctx.shadowBlur = 0;
        ctx.lineWidth = 3; ctx.strokeStyle = (this.owner === neutralId) ? '#6B7280' : '#ffffff';
        if (this.owner === playerId) ctx.strokeStyle = '#BFDBFE';
        if (dragSources.includes(this)) { ctx.strokeStyle = '#FCD34D'; ctx.lineWidth = 5; }
        ctx.stroke(); ctx.closePath();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(Math.floor(this.population), this.x, this.y);
    }
}

class Troop {
    constructor(owner, startNode, targetNode) {
        this.owner = owner; this.x = startNode.x; this.y = startNode.y; this.target = targetNode;
        this.isPlayer = (owner === playerId);
        const angle = Math.atan2(targetNode.y - startNode.y, targetNode.x - startNode.x);
        const spread = (Math.random() - 0.5) * 0.6;
        this.vx = Math.cos(angle + spread) * troopSpeed; this.vy = Math.sin(angle + spread) * troopSpeed;
        this.dead = false; this.color = colors[this.owner];
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        const dx = this.target.x - this.x; const dy = this.target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 10) {
            this.vx += (dx / dist * 0.15); this.vy += (dy / dist * 0.15);
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            this.vx = (this.vx / speed) * troopSpeed; this.vy = (this.vy / speed) * troopSpeed;
        }
        if (dist < this.target.radius) { this.hitTarget(); this.dead = true; }
    }
    hitTarget() {
        if (this.target.owner === this.owner) this.target.population++;
        else {
            this.target.population--;
            if (this.target.population <= 0) {
                this.target.owner = this.owner; this.target.population = 1;
                createExplosion(this.target.x, this.target.y, colors[this.owner], 15);
            }
        }
    }
    draw() {
        ctx.beginPath(); ctx.arc(this.x, this.y, troopSize, 0, Math.PI * 2);
        ctx.fillStyle = this.color; ctx.fill();
        if (this.isPlayer) { ctx.lineWidth = 1.5; ctx.strokeStyle = '#ffffff'; ctx.stroke(); }
        ctx.closePath();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x; this.y = y; this.color = color;
        const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 3;
        this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
        this.life = 1.0; this.decay = 0.03 + Math.random() * 0.03;
    }
    update() { this.x += this.vx; this.y += this.vy; this.life -= this.decay; }
    draw() {
        ctx.globalAlpha = Math.max(0, this.life); ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;
    }
}

/** UI & FLOW */
function resize() { if (CANVAS) { CANVAS.width = window.innerWidth; CANVAS.height = window.innerHeight; } }
window.addEventListener('resize', resize);

const uiMainMenu = document.getElementById('main-menu');
const uiGame = document.getElementById('game-ui');
const uiPause = document.getElementById('pause-menu');
const uiGameOver = document.getElementById('game-over-screen');

function showScreen(screen) {
    if (uiMainMenu) uiMainMenu.classList.add('hidden');
    if (uiGame) uiGame.classList.add('hidden');
    if (uiPause) uiPause.classList.add('hidden');
    if (uiGameOver) uiGameOver.classList.add('hidden');
    if (screen) screen.classList.remove('hidden');
}

function goToMainMenu() {
    window.location.href = 'index.html';
}

function startGame() {
    if (!document.getElementById('gameCanvas')) {
        //const difficulty = document.getElementById('difficultySelect').value;
        const difficulty = document.querySelector('input[name="value-radio"]:checked').value;
        window.location.href = 'conquer.html?difficulty=' + difficulty;
    } else {
        CANVAS = document.getElementById('gameCanvas');
        ctx = CANVAS.getContext('2d');

        // Add canvas event listeners
        CANVAS.addEventListener('mousedown', e => handleStart(e.clientX, e.clientY));
        CANVAS.addEventListener('dblclick', e => handleDoubleTap(e.clientX, e.clientY));

        // MOBILE FIX: Bind touch listeners specifically to CANVAS so buttons remain clickable
        CANVAS.addEventListener('touchstart', e => {
            if (gameState !== 'PLAYING') return;
            e.preventDefault();
            const pos = getPos(e); const now = new Date().getTime();
            if (now - lastTap < 300) handleDoubleTap(pos.x, pos.y); lastTap = now; handleStart(pos.x, pos.y);
        }, { passive: false });

        CANVAS.addEventListener('touchmove', e => {
            if (gameState !== 'PLAYING') return;
            e.preventDefault();
            const pos = getPos(e); handleMove(pos.x, pos.y);
        }, { passive: false });

        CANVAS.addEventListener('touchend', e => {
            if (gameState !== 'PLAYING') return;
            const touch = e.changedTouches[0];
            const rect = CANVAS.getBoundingClientRect();
            handleEnd(touch.clientX - rect.left, touch.clientY - rect.top);
        });

        // Get difficulty from URL or default
        const urlParams = new URLSearchParams(window.location.search);
        currentDifficulty = urlParams.get('difficulty') || 'medium';

        resize();
        gameState = 'PLAYING';
        nodes = [];
        troops = [];
        particles = [];
        dragSources = [];
        gameTime = 0;
        generateMap();
        showScreen(uiGame);
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }
}

function pauseGame() {
    if (gameState === 'PLAYING') {
        gameState = 'PAUSED';
        showScreen(uiPause);
    }
}
function resumeGame() {
    if (gameState === 'PAUSED') {
        gameState = 'PLAYING';
        showScreen(uiGame);
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }
}
function gameOver(win) {
    gameState = 'GAMEOVER';
    showScreen(uiGameOver);
    const title = document.getElementById('winnerText');
    const sub = document.getElementById('scoreText');
    if (win) {
        title.innerText = "VICTORY!";
        title.className = "text-5xl font-black text-yellow-400 mb-4 drop-shadow-lg";
        sub.innerText = "The world bows to you.";
    }
    else {
        title.innerText = "DEFEAT";
        title.className = "text-5xl font-black text-red-600 mb-4 drop-shadow-lg";
        sub.innerText = "Your empire has fallen.";
    }
}

/** KEYBOARD SHORTCUTS SUPPORT */
window.addEventListener('keydown', e => {
    // Prevent default browser actions for these keys
    if (['Space', 'Backspace', 'Delete'].includes(e.code)) {
        e.preventDefault();
    }

    if (gameState === 'MENU') return;

    switch (e.code) {
        case 'Space':
            handleSpaceKey();
            break;
        case 'Backspace':
            handleBackspaceKey();
            break;
        case 'Delete':
            handleDeleteKey();
            break;
        case 'Escape':
            if (gameState === 'PLAYING') pauseGame();
            else if (gameState === 'PAUSED') resumeGame();
            break;
    }
});

// SPACE BUTTON
function handleSpaceKey() {
    if (gameState === 'PLAYING') {
        pauseGame();
    } else if (gameState === 'PAUSED') {
        resumeGame();
    } else if (gameState === 'GAMEOVER') {
        startGame();
    }
}

// BACKSPACE BUTTON
function handleBackspaceKey() {
    if (gameState === 'PAUSED') {
        resumeGame();
    } else if (gameState === 'PLAYING') {
        pauseGame();
    }
}

// DELETE BUTTON
function handleDeleteKey() {
    if (gameState === 'PAUSED') {
        goToMainMenu();
    }
}

/** LOGIC */
function generateMap() {
    let attempts = 0;
    while (nodes.length < nodeCount && attempts < 2000) {
        attempts++;
        const margin = 60
        const x = margin + Math.random() * (CANVAS.width - margin * 2);
        const y = margin + Math.random() * (CANVAS.height - margin * 2);
        let valid = true;
        for (let n of nodes) { if (Math.hypot(n.x - x, n.y - y) < minimumDistance) { valid = false; break; } }
        if (valid) {
            let owner = neutralId; let pop = 10 + Math.floor(Math.random() * 25);
            if (nodes.length === 0) { owner = playerId; pop = 60; }
            else if (nodes.length <= 10) { owner = nodes.length; pop = 40; }
            nodes.push(new Node(nodes.length, x, y, owner, pop));
        }
    }
}

function loop(timestamp) {
    if (gameState !== 'PLAYING') return;
    const dt = (timestamp - lastTime) / 1000; lastTime = timestamp;
    update(dt); draw(); requestAnimationFrame(loop);
}

function update(dt) {
    gameTime += dt;
    nodes.forEach(n => n.update(dt));
    troops.forEach(t => t.update());
    troops = troops.filter(t => !t.dead);
    for (let i = 0; i < troops.length; i++) {
        let t1 = troops[i]; if (t1.dead) continue;
        for (let j = i + 1; j < troops.length; j++) {
            let t2 = troops[j]; if (t2.dead) continue; if (t1.owner === t2.owner) continue;
            if ((t1.x - t2.x) ** 2 + (t1.y - t2.y) ** 2 < (troopSize * 2) ** 2) {
                t1.dead = true; t2.dead = true; createExplosion((t1.x + t2.x) / 2, (t1.y + t2.y) / 2, '#FFF', 2); break;
            }
        }
    }
    particles.forEach(p => p.update()); particles = particles.filter(p => p.life > 0);
    aiTimer += dt * 1000; const diffSettings = difficultyConfig[currentDifficulty];
    if (gameTime > aiStartDelay && aiTimer > diffSettings.aiInterval) { runSmartAI(diffSettings); aiTimer = 0; }
    checkWinCondition();
}

function createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++)
        particles.push(new Particle(x, y, color));
}
function runSmartAI(settings) {
    const aggression = settings.aiAggression;
    nodes.forEach(node => {
        if (node.owner !== neutralId && node.owner !== playerId) {
            if (node.population < 10) return;
            let targets = [];
            nodes.forEach(other => {
                if (node.id === other.id) return;
                const dist = Math.hypot(node.x - other.x, node.y - other.y);
                if (dist > 350) return;
                let score = 0;
                if (other.owner === neutralId) score += 50 - other.population;
                else if (other.owner !== node.owner) {
                    let popDiff = node.population - other.population; score += popDiff * 2;
                    if (currentDifficulty === 'hard' && other.owner === playerId) score += 120;
                } else { if (other.population < 10) score += 20; }
                score -= dist * 0.1; targets.push({ node: other, score: score });
            });
            targets.sort((a, b) => b.score - a.score);
            if (targets.length > 0 && (targets[0].score > 15 || Math.random() < aggression)) sendTroops(node, targets[0].node, 0.5);
        }
    });
}

function sendTroops(source, target, percent) {
    if (source.population < 2) return;
    let amount = Math.floor(source.population * percent); source.population -= amount;
    for (let i = 0; i < amount; i++) setTimeout(() => { if (gameState === 'PLAYING') troops.push(new Troop(source.owner, source, target)); }, i * 30);
}

function sendGlobalAssault(targetNode) {
    nodes.forEach(n => { if (n.owner === playerId && n !== targetNode) { sendTroops(n, targetNode, 0.5); createExplosion(n.x, n.y, '#3B82F6', 5); } });
    createExplosion(targetNode.x, targetNode.y, '#FF0000', 10);
}

function checkWinCondition() {
    const owners = new Set(nodes.map(n => n.owner));
    if (!owners.has(playerId) && !troops.some(t => t.owner === playerId)) gameOver(false);
    else if (owners.size === 1 && owners.has(playerId)) gameOver(true);
    else if (owners.size === 2 && owners.has(playerId) && owners.has(neutralId) && !troops.some(t => t.owner !== playerId && t.owner !== neutralId)) gameOver(true);
}

function draw() {
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#374151';
    ctx.beginPath();
    for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++) {
            const d = (nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2;
            if (d < 40000) {
                ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y)
            }
        } ctx.stroke();
    nodes.forEach(n => n.draw());
    if (gameTime < 3 && gameState === 'PLAYING') {
        const p = nodes.find(n => n.owner === playerId);
        if (p) {
            ctx.save();
            ctx.translate(p.x, p.y - 50 - Math.sin(gameTime * 5) * 10);
            ctx.fillStyle = '#FCD34D';
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.lineTo(10, 0);
            ctx.lineTo(0, 20);
            ctx.fill();
            ctx.font = "bold 16px sans-serif";
            ctx.fillText("YOU", 0, -10);
            ctx.restore();
        }
    }
    if (isDragging && dragSources.length > 0) {
        ctx.beginPath(); ctx.lineWidth = 4; ctx.strokeStyle = '#FCD34D'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.setLineDash([10, 10]); ctx.moveTo(dragSources[0].x, dragSources[0].y);
        for (let i = 1; i < dragSources.length; i++) ctx.lineTo(dragSources[i].x, dragSources[i].y);
        ctx.lineTo(dragCurrent.x, dragCurrent.y); ctx.stroke(); ctx.setLineDash([]); ctx.closePath();
    }
    troops.forEach(t => t.draw()); particles.forEach(p => p.draw());
}

/** INPUTS */
function getPos(e) {
    if (!CANVAS) return { x: 0, y: 0 };
    const rect = CANVAS.getBoundingClientRect();
    if (e.touches) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
function handleStart(x, y) {
    if (gameState !== 'PLAYING') return;
    for (let n of nodes) if (Math.hypot(n.x - x, n.y - y) < n.radius * 1.2 && n.owner === playerId) {
        isDragging = true; dragSources = [n]; dragCurrent = { x, y }; return;
    }
}
function handleMove(x, y) {
    if (isDragging) {
        dragCurrent = { x, y };
        for (let n of nodes) if (n.owner === playerId && !dragSources.includes(n) && Math.hypot(n.x - x, n.y - y) < n.radius * 1.2) dragSources.push(n);
    }
}
function handleEnd(x, y) {
    if (isDragging && dragSources.length > 0) {
        let target = nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius * 2);
        if (target) dragSources.forEach(source => { if (source !== target) sendTroops(source, target, 0.5); });
    }
    isDragging = false; dragSources = [];
}
function handleDoubleTap(x, y) {
    if (gameState !== 'PLAYING') return;
    const n = nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius * 1.5);
    if (n) { sendGlobalAssault(n); createExplosion(x, y, '#fff', 5); }
}

window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
window.addEventListener('mouseup', e => handleEnd(e.clientX, e.clientY));

let lastTap = 0;

if (document.getElementById('startBtn')) document.getElementById('startBtn').addEventListener('click', startGame);
if (document.getElementById('pauseBtn')) document.getElementById('pauseBtn').addEventListener('click', pauseGame);
if (document.getElementById('resumeBtn')) document.getElementById('resumeBtn').addEventListener('click', resumeGame);
if (document.getElementById('restartInGameBtn')) document.getElementById('restartInGameBtn').addEventListener('click', startGame);
if (document.getElementById('quitBtn')) document.getElementById('quitBtn').addEventListener('click', goToMainMenu);
if (document.getElementById('playAgainBtn')) document.getElementById('playAgainBtn').addEventListener('click', startGame);
if (document.getElementById('menuBtn')) document.getElementById('menuBtn').addEventListener('click', goToMainMenu);

if (!document.getElementById('gameCanvas') && uiMainMenu) {
    showScreen(uiMainMenu);
}

resize();

export { startGame }