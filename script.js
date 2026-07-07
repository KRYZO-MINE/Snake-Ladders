// ========================
// GAME CONSTANTS & DATA
// ========================
const SNAKES = {
    98: 79,
    95: 75,
    92: 88,
    87: 24,
    64: 60,
    62: 19,
    49: 11,
    48: 26,
    16: 6
};

const LADDERS = {
    2: 38,
    7: 14,
    8: 31,
    15: 26,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    78: 98
};

const PLAYER_COLORS = [
    { id: 1, color: '#ff6b6b', name: 'Player 1' },
    { id: 2, color: '#4ecdc4', name: 'Player 2' },
    { id: 3, color: '#f093fb', name: 'Player 3' },
    { id: 4, color: '#4facfe', name: 'Player 4' }
];

const DICE_FACES = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8]
};

// ========================
// GAME STATE
// ========================
let gameState = {
    players: [],
    currentPlayerIndex: 0,
    isRolling: false,
    gameOver: false,
    history: [],
    muted: false,
    selectedPlayerCount: 2
};

// ========================
// DOM ELEMENTS
// ========================
const elements = {
    board: document.getElementById('board'),
    dice: document.getElementById('dice'),
    rollBtn: document.getElementById('rollBtn'),
    restartBtn: document.getElementById('restartBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    instructionsBtn: document.getElementById('instructionsBtn'),
    closeInstructionsBtn: document.getElementById('closeInstructionsBtn'),
    musicBtn: document.getElementById('musicBtn'),
    winnerModal: document.getElementById('winnerModal'),
    instructionsModal: document.getElementById('instructionsModal'),
    playerCountModal: document.getElementById('playerCountModal'),
    winnerText: document.getElementById('winnerText'),
    currentTurn: document.getElementById('currentTurn'),
    lastRoll: document.getElementById('lastRoll'),
    playersContainer: document.getElementById('playersContainer'),
    history: document.getElementById('history'),
    confetti: document.getElementById('confetti'),
    particles: document.getElementById('particles'),
    startGameBtn: document.getElementById('startGameBtn'),
    playerCountBtns: document.querySelectorAll('.player-count-btn'),
    snakesList: document.getElementById('snakesList'),
    laddersList: document.getElementById('laddersList'),
    bgMusic: document.getElementById('bgMusic'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    restartMusicBtn: document.getElementById('restartMusicBtn'),
    volumeSlider: document.getElementById('volumeSlider'),
    volumeValue: document.getElementById('volumeValue')
};

// ========================
// INITIALIZATION
// ========================
function init() {
    createParticles();
    setupPlayerCountSelection();
    setupEventListeners();
    renderDice(1);
    updateMusicUI();
}

// ========================
// PLAYER COUNT SELECTION
// ========================
function selectPlayerCount(count) {
    if (count < 2 || count > 4) return;
    gameState.selectedPlayerCount = count;
    
    // Update button styles
    elements.playerCountBtns.forEach(b => {
        const btnCount = parseInt(b.dataset.count);
        if (btnCount === count) {
            b.classList.remove('btn-secondary');
            b.classList.add('btn-primary');
        } else {
            b.classList.remove('btn-primary');
            b.classList.add('btn-secondary');
        }
    });
    
    elements.startGameBtn.disabled = false;
}

function setupPlayerCountSelection() {
    elements.playerCountBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const count = parseInt(btn.dataset.count);
            selectPlayerCount(count);
        });
    });
    
    elements.startGameBtn.addEventListener('click', startGame);
    
    // Keyboard shortcuts for player count modal
    document.addEventListener('keydown', (e) => {
        // Only handle keys when player count modal is visible
        if (elements.playerCountModal.classList.contains('hidden')) return;
        
        if (e.key === '2' || e.key === '3' || e.key === '4') {
            selectPlayerCount(parseInt(e.key));
        } else if (e.key === 'Enter' && !elements.startGameBtn.disabled) {
            startGame();
        }
    });
}

function startGame() {
    elements.playerCountModal.classList.add('hidden');
    initializeGameState();
    createBoard();
    renderSnakesAndLadders();
    updateUI();
}

function renderSnakesAndLadders() {
    // Render snakes list
    const snakesList = elements.snakesList;
    snakesList.innerHTML = '';
    Object.entries(SNAKES).forEach(([start, end]) => {
        const li = document.createElement('li');
        li.textContent = `${start} → ${end}`;
        snakesList.appendChild(li);
    });
    
    // Render ladders list
    const laddersList = elements.laddersList;
    laddersList.innerHTML = '';
    Object.entries(LADDERS).forEach(([start, end]) => {
        const li = document.createElement('li');
        li.textContent = `${start} → ${end}`;
        laddersList.appendChild(li);
    });
}

function initializeGameState() {
    gameState.players = PLAYER_COLORS.slice(0, gameState.selectedPlayerCount).map(p => ({
        ...p,
        position: 1
    }));
    gameState.currentPlayerIndex = 0;
    gameState.isRolling = false;
    gameState.gameOver = false;
    gameState.history = [];
}

// ========================
// BOARD CREATION
// ========================
function createBoard() {
    elements.board.innerHTML = '';
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            let cellNumber;
            if (row % 2 === 0) {
                cellNumber = 100 - (row * 10) - col;
            } else {
                cellNumber = 100 - (row * 10) - (9 - col);
            }
            
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${cellNumber}`;
            cell.dataset.number = cellNumber;
            
            if ((row + col) % 2 === 0) {
                cell.classList.add('cell-light');
            } else {
                cell.classList.add('cell-dark');
            }
            
            let icon = '';
            if (cellNumber === 1) {
                cell.classList.add('cell-start');
                icon = '🏁';
            } else if (cellNumber === 100) {
                cell.classList.add('cell-finish');
                icon = '🎉';
            } else if (SNAKES[cellNumber]) {
                cell.classList.add('cell-snake-head');
                icon = '🐍';
            } else if (Object.values(SNAKES).includes(cellNumber)) {
                cell.classList.add('cell-snake-tail');
                icon = '🐍';
            } else if (LADDERS[cellNumber]) {
                cell.classList.add('cell-ladder-bottom');
                icon = '🪜';
            } else if (Object.values(LADDERS).includes(cellNumber)) {
                cell.classList.add('cell-ladder-top');
                icon = '🪜';
            }
            
            cell.innerHTML = `
                <span class="cell-number">${cellNumber}</span>
                ${icon ? `<span class="cell-icon">${icon}</span>` : ''}
            `;
            elements.board.appendChild(cell);
        }
    }
    
    renderPlayers();
}

function renderPlayers() {
    // Remove existing tokens from board
    document.querySelectorAll('.player-token').forEach(t => {
        if (t.parentElement && t.parentElement.classList.contains('cell')) {
            t.remove();
        }
    });
    
    gameState.players.forEach(player => {
        const cell = document.getElementById(`cell-${player.position}`);
        if (cell) {
            const token = document.createElement('div');
            token.className = `player-token player-${player.id} token-${player.id}`;
            token.id = `token-${player.id}`;
            token.textContent = player.id;
            if (gameState.currentPlayerIndex === player.id - 1) {
                token.classList.add('pulse');
            }
            cell.appendChild(token);
        }
    });
}

// ========================
// PARTICLES
// ========================
function createParticles() {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${15 + Math.random() * 10}s`;
        elements.particles.appendChild(particle);
    }
}

// ========================
// DICE
// ========================
function renderDice(value) {
    elements.dice.innerHTML = '';
    const positions = DICE_FACES[value];
    
    for (let i = 0; i < 9; i++) {
        const dot = document.createElement('div');
        dot.className = 'dice-dot';
        if (positions.includes(i)) {
            dot.style.visibility = 'visible';
        } else {
            dot.style.visibility = 'hidden';
        }
        elements.dice.appendChild(dot);
    }
}

function animateDice(callback) {
    elements.dice.classList.add('rolling');
    elements.rollBtn.disabled = true;
    
    const duration = 800;
    const interval = 100;
    let elapsed = 0;
    
    const animate = setInterval(() => {
        const randomVal = Math.floor(Math.random() * 6) + 1;
        renderDice(randomVal);
        elapsed += interval;
        
        if (elapsed >= duration) {
            clearInterval(animate);
            elements.dice.classList.remove('rolling');
            if (callback) callback();
        }
    }, interval);
}

function rollDice() {
    if (gameState.isRolling || gameState.gameOver || gameState.players.length === 0) return;
    
    gameState.isRolling = true;
    playSound('dice');
    
    const value = Math.floor(Math.random() * 6) + 1;
    
    animateDice(() => {
        renderDice(value);
        elements.lastRoll.textContent = `Rolled: ${value}`;
        movePlayer(value);
    });
}

// ========================
// PLAYER MOVEMENT
// ========================
async function movePlayer(steps) {
    const player = gameState.players[gameState.currentPlayerIndex];
    const startPos = player.position;
    let targetPos = startPos + steps;
    
    if (targetPos > 100) {
        targetPos = startPos;
        addHistory(player, steps, targetPos, 'exceeded');
    } else {
        await animateMovement(player, startPos, targetPos);
        player.position = targetPos;
        playSound('move');
        
        if (targetPos === 100) {
            showWinner(player);
            return;
        }
        
        if (SNAKES[targetPos]) {
            addHistory(player, steps, targetPos, 'snake');
            await delay(500);
            await animateMovement(player, targetPos, SNAKES[targetPos]);
            player.position = SNAKES[targetPos];
            playSound('snake');
        } else if (LADDERS[targetPos]) {
            addHistory(player, steps, targetPos, 'ladder');
            await delay(500);
            await animateMovement(player, targetPos, LADDERS[targetPos]);
            player.position = LADDERS[targetPos];
            playSound('ladder');
        } else {
            addHistory(player, steps, targetPos, 'normal');
        }
    }
    
    updateUI();
    
    if (steps !== 6 && !gameState.gameOver) {
        switchTurn();
    } else if (!gameState.gameOver) {
        elements.lastRoll.textContent += ' - Extra turn!';
    }
    
    gameState.isRolling = false;
    elements.rollBtn.disabled = false;
}

function animateMovement(player, from, to) {
    return new Promise(resolve => {
        const direction = to > from ? 1 : -1;
        let current = from;
        
        const step = () => {
            if (current === to) {
                resolve();
                return;
            }
            
            current += direction;
            
            const cell = document.getElementById(`cell-${current}`);
            const token = document.getElementById(`token-${player.id}`);
            
            if (cell && token) {
                token.remove();
                token.style.transform = 'scale(0)';
                cell.appendChild(token);
                
                setTimeout(() => {
                    token.style.transform = '';
                }, 50);
            }
            
            setTimeout(step, 180);
        };
        
        step();
    });
}

// ========================
// GAME LOGIC
// ========================
function switchTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    updateUI();
}

function updateUI() {
    if (gameState.players.length === 0) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    elements.currentTurn.innerHTML = `
        <div class="flex items-center justify-center gap-3">
            <div class="w-8 h-8 rounded-full" style="background: ${currentPlayer.color}"></div>
            <span>${currentPlayer.name}'s Turn</span>
        </div>
    `;
    
    // Update players container
    elements.playersContainer.innerHTML = '';
    gameState.players.forEach((player, index) => {
        const card = document.createElement('div');
        card.id = `player${player.id}Card`;
        card.className = `player-card ${index === gameState.currentPlayerIndex ? 'active' : ''}`;
        card.innerHTML = `
            <div class="player-token player-${player.id}" style="position: static; width: 40px; height: 40px; font-size: 1rem;"></div>
            <div class="flex-1">
                <p class="font-semibold text-gray-800">${player.name}</p>
                <p class="text-sm text-gray-600">Position: <span id="player${player.id}Pos">${player.position}</span></p>
            </div>
        `;
        elements.playersContainer.appendChild(card);
    });
    
    renderPlayers();
    renderHistory();
}

function addHistory(player, roll, position, event) {
    const now = new Date();
    const time = now.toLocaleTimeString();
    
    let eventText = '';
    if (event === 'snake') {
        eventText = `🐍 Slid down to ${SNAKES[position]}`;
    } else if (event === 'ladder') {
        eventText = `🪜 Climbed to ${LADDERS[position]}`;
    } else if (event === 'exceeded') {
        eventText = '❌ Too far, stayed put';
    }
    
    gameState.history.unshift({
        player: player.id,
        roll,
        position,
        event: eventText,
        time
    });
}

function renderHistory() {
    elements.history.innerHTML = '';
    
    if (gameState.history.length === 0) {
        elements.history.innerHTML = '<p class="text-gray-500 text-center py-4">No moves yet</p>';
        return;
    }
    
    gameState.history.slice(0, 20).forEach(item => {
        const div = document.createElement('div');
        div.className = `history-item history-item-player${item.player}`;
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold text-gray-800">Player ${item.player}</p>
                    <p class="text-sm text-gray-600">
                        Rolled <span class="font-bold text-purple-600">${item.roll}</span> → Square ${item.position}
                    </p>
                    ${item.event ? `<p class="text-sm text-yellow-600 mt-1">${item.event}</p>` : ''}
                </div>
                <span class="text-xs text-gray-500">${item.time}</span>
            </div>
        `;
        elements.history.appendChild(div);
    });
}

function showWinner(player) {
    gameState.gameOver = true;
    elements.rollBtn.disabled = true;
    playSound('win');
    
    elements.winnerText.textContent = `${player.name} Wins!`;
    elements.winnerModal.classList.remove('hidden');
    
    createConfetti();
}

function createConfetti() {
    elements.confetti.innerHTML = '';
    const colors = ['#ff6b6b', '#4ecdc4', '#a855f7', '#f59e0b', '#10b981'];
    
    for (let i = 0; i < 100; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = `${Math.random() * 0.5}s`;
        piece.style.animationDuration = `${2 + Math.random() * 2}s`;
        elements.confetti.appendChild(piece);
    }
}

function restartGame() {
    // Show player count modal instead of just resetting
    elements.winnerModal.classList.add('hidden');
    elements.lastRoll.textContent = '';
    elements.rollBtn.disabled = false;
    elements.playerCountModal.classList.remove('hidden');
    
    // Reset player count selection UI
    elements.playerCountBtns.forEach((btn, index) => {
        if (index === 0) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        } else {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        }
    });
    elements.startGameBtn.disabled = true;
    gameState.selectedPlayerCount = 2;
}

// ========================
// SOUND (PLACEHOLDERS)
// ========================
function playSound(type) {
    if (gameState.muted) return;
    
    // Placeholder for sound effects
    // In a real implementation, you would play audio files here
    console.log(`Playing sound: ${type}`);
}

function updateMusicUI() {
    if (elements.bgMusic.paused) {
        elements.musicBtn.textContent = '🎵';
        elements.playPauseBtn.textContent = '▶️';
        gameState.muted = true;
    } else {
        elements.musicBtn.textContent = '🔊';
        elements.playPauseBtn.textContent = '⏸️';
        gameState.muted = false;
    }
}

function toggleMusic() {
    if (elements.bgMusic.paused) {
        elements.bgMusic.play().catch(err => console.log('Audio play failed:', err));
    } else {
        elements.bgMusic.pause();
    }
    updateMusicUI();
}

function updateVolume() {
    const volume = parseFloat(elements.volumeSlider.value);
    elements.bgMusic.volume = volume;
    elements.volumeValue.textContent = Math.round(volume * 100);
}

function restartMusic() {
    elements.bgMusic.currentTime = 0;
    if (elements.bgMusic.paused) {
        elements.bgMusic.play().catch(err => console.log('Audio play failed:', err));
        updateMusicUI();
    }
}

function setupMusicControls() {
    elements.playPauseBtn.addEventListener('click', toggleMusic);
    elements.restartMusicBtn.addEventListener('click', restartMusic);
    elements.volumeSlider.addEventListener('input', updateVolume);
    
    // Initialize volume
    updateVolume();
}

// ========================
// EVENT LISTENERS
// ========================
function setupEventListeners() {
    elements.rollBtn.addEventListener('click', rollDice);
    elements.dice.addEventListener('click', rollDice);
    
    elements.restartBtn.addEventListener('click', restartGame);
    elements.newGameBtn.addEventListener('click', restartGame);
    
    elements.instructionsBtn.addEventListener('click', () => {
        elements.instructionsModal.classList.remove('hidden');
    });
    
    elements.closeInstructionsBtn.addEventListener('click', () => {
        elements.instructionsModal.classList.add('hidden');
    });
    
    elements.musicBtn.addEventListener('click', toggleMusic);
    
    // Set up music controls
    setupMusicControls();
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            rollDice();
        } else if (e.code === 'KeyM') {
            toggleMusic();
        } else if (e.code === 'KeyR') {
            restartGame();
        } else if (e.code === 'KeyI') {
            // Toggle instructions modal
            if (elements.instructionsModal.classList.contains('hidden')) {
                elements.instructionsModal.classList.remove('hidden');
            } else {
                elements.instructionsModal.classList.add('hidden');
            }
        } else if (e.code === 'Escape') {
            // Close all modals
            elements.instructionsModal.classList.add('hidden');
            elements.winnerModal.classList.add('hidden');
        }
    });
    
    // Close modals on overlay click
    elements.instructionsModal.querySelector('.modal-overlay').addEventListener('click', () => {
        elements.instructionsModal.classList.add('hidden');
    });
}

// ========================
// UTILITY
// ========================
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start the game
init();
