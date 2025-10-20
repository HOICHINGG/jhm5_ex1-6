// TicTacToe Classic Game JavaScript
class TicTacToeGame {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'pvp'; // pvp (player vs player) or pvc (player vs computer)
        this.difficulty = 'medium';
        this.gameActive = false;
        this.moveHistory = [];
        this.gameStartTime = null;
        
        // Player info
        this.players = {
            X: { name: 'Player 1', score: 0 },
            O: { name: 'Player 2', score: 0 }
        };
        
        // Game statistics
        this.stats = {
            totalGames: 0,
            player1Wins: 0,
            player2Wins: 0,
            draws: 0
        };
        
        // Winning combinations
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        this.init();
    }

    init() {
        this.loadStats();
        this.setupEventListeners();
        this.updateStatsDisplay();
        this.showScreen('setupScreen');
    }

    setupEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectMode(e.target.closest('.mode-btn').dataset.mode));
        });

        // Setup form
        document.getElementById('startGame').addEventListener('click', () => this.startNewSession());
        document.getElementById('resetStats').addEventListener('click', () => this.resetStats());

        // Game controls
        document.getElementById('newGame').addEventListener('click', () => this.newGame());
        document.getElementById('backToSetup').addEventListener('click', () => this.backToSetup());
        document.getElementById('undoMove').addEventListener('click', () => this.undoMove());

        // Game board
        document.querySelectorAll('.game-cell').forEach(cell => {
            cell.addEventListener('click', (e) => this.makeMove(parseInt(e.target.dataset.index)));
        });

        // Modal actions
        document.getElementById('playAgain').addEventListener('click', () => this.closeModalAndNewGame());
        document.getElementById('backToMenu').addEventListener('click', () => this.closeModalAndBackToSetup());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    selectMode(mode) {
        this.gameMode = mode;
        
        // Update UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Show/hide relevant options
        const difficultyGroup = document.getElementById('difficultyGroup');
        const player2Group = document.getElementById('player2Group');
        
        if (mode === 'pvc') {
            difficultyGroup.style.display = 'block';
            player2Group.style.display = 'none';
        } else {
            difficultyGroup.style.display = 'none';
            player2Group.style.display = 'block';
        }
    }

    startNewSession() {
        // Get player names
        this.players.X.name = document.getElementById('player1Name').value.trim() || 'Player 1';
        
        if (this.gameMode === 'pvc') {
            this.difficulty = document.getElementById('difficulty').value;
            this.players.O.name = `Computer (${this.difficulty})`;
        } else {
            this.players.O.name = document.getElementById('player2Name').value.trim() || 'Player 2';
        }

        // Update game display
        document.getElementById('currentPlayer1Name').textContent = this.players.X.name;
        document.getElementById('currentPlayer2Name').textContent = this.players.O.name;
        
        // Reset scores for new session
        this.players.X.score = 0;
        this.players.O.score = 0;
        this.updateScoreDisplay();
        
        this.showScreen('gameScreen');
        this.newGame();
    }

    newGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.moveHistory = [];
        this.gameStartTime = Date.now();
        
        // Clear board display
        document.querySelectorAll('.game-cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'game-cell';
        });
        
        // Hide winning line
        document.getElementById('winningLine').classList.remove('show');
        
        // Update UI
        this.updateTurnDisplay();
        document.getElementById('undoMove').disabled = true;
        
        // If computer goes first in PvC mode
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            setTimeout(() => this.makeComputerMove(), 500);
        }
    }

    makeMove(index) {
        if (!this.gameActive || this.board[index] !== '' || 
            (this.gameMode === 'pvc' && this.currentPlayer === 'O')) {
            return;
        }

        this.executeMove(index, this.currentPlayer);
    }

    executeMove(index, player) {
        // Record move for undo
        this.moveHistory.push({
            index: index,
            player: player,
            boardState: [...this.board]
        });
        
        // Make the move
        this.board[index] = player;
        
        // Update display
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add('occupied', player.toLowerCase(), 'pop');
        
        // Remove animation class after animation completes
        setTimeout(() => cell.classList.remove('pop'), 300);
        
        // Check for game end
        const winner = this.checkWinner();
        if (winner) {
            this.endGame(winner);
            return;
        }
        
        if (this.board.every(cell => cell !== '')) {
            this.endGame('draw');
            return;
        }
        
        // Switch players
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateTurnDisplay();
        document.getElementById('undoMove').disabled = false;
        
        // Computer move in PvC mode
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O' && this.gameActive) {
            setTimeout(() => this.makeComputerMove(), 500);
        }
    }

    makeComputerMove() {
        if (!this.gameActive) return;
        
        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        if (move !== -1) {
            this.executeMove(move, 'O');
        }
    }

    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 ? 
            availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }

    getMediumMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner() === 'O') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Try to block player
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner() === 'X') {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available move
        return this.getRandomMove();
    }

    getBestMove() {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                let score = this.minimax(this.board, 0, false);
                this.board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }

    minimax(board, depth, isMaximizing) {
        const winner = this.checkWinner();
        
        if (winner === 'O') return 10 - depth;
        if (winner === 'X') return depth - 10;
        if (board.every(cell => cell !== '')) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = this.minimax(board, depth + 1, false);
                    board[i] = '';
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'X';
                    let score = this.minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    checkWinner() {
        for (let combination of this.winningCombinations) {
            const [a, b, c] = combination;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningCombination = combination;
                return this.board[a];
            }
        }
        return null;
    }

    endGame(result) {
        this.gameActive = false;
        
        if (result !== 'draw') {
            // Highlight winning cells
            this.winningCombination.forEach(index => {
                document.querySelector(`[data-index="${index}"]`).classList.add('winning');
            });
            
            // Draw winning line
            this.drawWinningLine();
            
            // Update scores
            this.players[result].score++;
            this.updateScoreDisplay();
        }
        
        // Update statistics
        this.updateStats(result);
        
        // Show result modal after animation
        setTimeout(() => this.showGameOverModal(result), 1000);
    }

    drawWinningLine() {
        if (!this.winningCombination) return;
        
        const line = document.getElementById('winningLine');
        const [a, b, c] = this.winningCombination;
        
        // Calculate line position and rotation
        const cells = document.querySelectorAll('.game-cell');
        const cellA = cells[a].getBoundingClientRect();
        const cellC = cells[c].getBoundingClientRect();
        const board = document.getElementById('gameBoard').getBoundingClientRect();
        
        const centerAX = cellA.left + cellA.width / 2 - board.left;
        const centerAY = cellA.top + cellA.height / 2 - board.top;
        const centerCX = cellC.left + cellC.width / 2 - board.left;
        const centerCY = cellC.top + cellC.height / 2 - board.top;
        
        const length = Math.sqrt(Math.pow(centerCX - centerAX, 2) + Math.pow(centerCY - centerAY, 2));
        const angle = Math.atan2(centerCY - centerAY, centerCX - centerAX) * 180 / Math.PI;
        
        line.style.width = `${length}px`;
        line.style.height = '4px';
        line.style.left = `${centerAX}px`;
        line.style.top = `${centerAY}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 50%';
        
        line.classList.add('show');
    }

    updateTurnDisplay() {
        const turnIndicator = document.getElementById('turnIndicator');
        const player1Card = document.getElementById('player1Card');
        const player2Card = document.getElementById('player2Card');
        
        if (this.currentPlayer === 'X') {
            turnIndicator.textContent = `${this.players.X.name}'s Turn`;
            player1Card.classList.add('active');
            player2Card.classList.remove('active');
        } else {
            turnIndicator.textContent = `${this.players.O.name}'s Turn`;
            player1Card.classList.remove('active');
            player2Card.classList.add('active');
        }
    }

    updateScoreDisplay() {
        document.getElementById('currentPlayer1Score').textContent = this.players.X.score;
        document.getElementById('currentPlayer2Score').textContent = this.players.O.score;
    }

    undoMove() {
        if (this.moveHistory.length === 0 || !this.gameActive) return;
        
        // Get last move
        const lastMove = this.moveHistory.pop();
        
        // Restore board state
        this.board = [...lastMove.boardState];
        this.currentPlayer = lastMove.player;
        
        // Update display
        const cell = document.querySelector(`[data-index="${lastMove.index}"]`);
        cell.textContent = '';
        cell.className = 'game-cell';
        
        this.updateTurnDisplay();
        
        if (this.moveHistory.length === 0) {
            document.getElementById('undoMove').disabled = true;
        }
        
        // If we undid a computer move, undo the player move too
        if (this.gameMode === 'pvc' && lastMove.player === 'O' && this.moveHistory.length > 0) {
            setTimeout(() => this.undoMove(), 100);
        }
    }

    showGameOverModal(result) {
        const modal = document.getElementById('gameOverModal');
        const resultIcon = document.getElementById('resultIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        
        // Set result content
        if (result === 'draw') {
            resultIcon.innerHTML = '<i class="fas fa-handshake"></i>';
            resultIcon.className = 'result-icon draw';
            resultTitle.textContent = "It's a Draw!";
            resultMessage.textContent = "Well played by both sides!";
        } else {
            resultIcon.innerHTML = '<i class="fas fa-trophy"></i>';
            resultIcon.className = 'result-icon win';
            resultTitle.textContent = "We have a winner!";
            resultMessage.textContent = `${this.players[result].name} wins!`;
        }
        
        // Set game summary
        const gameDuration = Math.round((Date.now() - this.gameStartTime) / 1000);
        document.getElementById('movesCount').textContent = this.moveHistory.length;
        document.getElementById('gameDuration').textContent = AppUtils.formatTime(gameDuration);
        
        modal.classList.add('show');
    }

    closeModalAndNewGame() {
        document.getElementById('gameOverModal').classList.remove('show');
        this.newGame();
    }

    closeModalAndBackToSetup() {
        document.getElementById('gameOverModal').classList.remove('show');
        this.backToSetup();
    }

    updateStats(result) {
        this.stats.totalGames++;
        
        if (result === 'X') {
            this.stats.player1Wins++;
        } else if (result === 'O') {
            this.stats.player2Wins++;
        } else {
            this.stats.draws++;
        }
        
        this.saveStats();
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        document.getElementById('totalGames').textContent = this.stats.totalGames;
        document.getElementById('player1Wins').textContent = this.stats.player1Wins;
        document.getElementById('player2Wins').textContent = this.stats.player2Wins;
        document.getElementById('draws').textContent = this.stats.draws;
        
        // Update labels
        document.getElementById('player1Label').textContent = `${this.players.X.name} Wins`;
        document.getElementById('player2Label').textContent = `${this.players.O.name} Wins`;
    }

    resetStats() {
        if (confirm('Are you sure you want to reset all statistics? This cannot be undone.')) {
            this.stats = {
                totalGames: 0,
                player1Wins: 0,
                player2Wins: 0,
                draws: 0
            };
            this.saveStats();
            this.updateStatsDisplay();
        }
    }

    loadStats() {
        this.stats = AppUtils.storage.get('tictactoeVanillaStats', {
            totalGames: 0,
            player1Wins: 0,
            player2Wins: 0,
            draws: 0
        });
    }

    saveStats() {
        AppUtils.storage.set('tictactoeVanillaStats', this.stats);
    }

    backToSetup() {
        this.showScreen('setupScreen');
        this.updateStatsDisplay();
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        // Number keys 1-9 for board positions
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) {
            this.makeMove(num - 1);
        }
        
        // Other shortcuts
        switch (e.key) {
            case 'r':
            case 'R':
                if (this.gameActive) this.newGame();
                break;
            case 'u':
            case 'U':
                this.undoMove();
                break;
            case 'Escape':
                this.backToSetup();
                break;
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToeGame();
});