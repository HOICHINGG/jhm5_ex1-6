// Math Rush Game JavaScript
class MathRushGame {
    constructor() {
        this.gameState = 'setup'; // setup, playing, paused, finished
        this.currentProblem = null;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.timeLeft = 120; // seconds
        this.gameTimer = null;
        this.startTime = null;
        this.difficulty = 'medium';
        this.playerName = '';
        this.gameDuration = 120;
        
        this.difficulties = {
            easy: { range: [1, 50], operations: ['+', '-'], multiplier: 1 },
            medium: { range: [1, 100], operations: ['+', '-', '×'], multiplier: 1.5 },
            hard: { range: [1, 200], operations: ['+', '-', '×', '÷'], multiplier: 2 },
            expert: { range: [1, 500], operations: ['+', '-', '×', '÷'], multiplier: 2.5 }
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLeaderboard();
        this.showScreen('setupScreen');
    }

    setupEventListeners() {
        // Setup screen
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startGame();
        });

        // Game screen
        document.getElementById('answerInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitAnswer();
        });
        document.getElementById('submitAnswer').addEventListener('click', () => this.submitAnswer());
        document.getElementById('pauseGame').addEventListener('click', () => this.pauseGame());

        // Results screen
        document.getElementById('playAgain').addEventListener('click', () => this.playAgain());
        document.getElementById('viewLeaderboard').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('backToSetup').addEventListener('click', () => this.backToSetup());

        // Leaderboard screen
        document.getElementById('backFromLeaderboard').addEventListener('click', () => this.backFromLeaderboard());
        document.getElementById('clearLeaderboard').addEventListener('click', () => this.clearLeaderboard());
        
        // Difficulty tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchLeaderboardTab(e.target.dataset.difficulty));
        });

        // Pause screen
        document.getElementById('resumeGame').addEventListener('click', () => this.resumeGame());
        document.getElementById('quitGame').addEventListener('click', () => this.quitGame());
    }

    startGame() {
        const nameInput = document.getElementById('playerName');
        const difficultySelect = document.getElementById('difficulty');
        const timeSelect = document.getElementById('gameTime');

        this.playerName = nameInput.value.trim() || 'Anonymous';
        this.difficulty = difficultySelect.value;
        this.gameDuration = parseInt(timeSelect.value);
        this.timeLeft = this.gameDuration;

        // Reset game state
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.startTime = Date.now();

        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.generateProblem();
        this.startTimer();
        this.updateDisplay();

        // Focus on answer input
        document.getElementById('answerInput').focus();
    }

    generateProblem() {
        const config = this.difficulties[this.difficulty];
        const operations = config.operations;
        const [min, max] = config.range;
        
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let num1, num2, answer;

        switch (operation) {
            case '+':
                num1 = AppUtils.randomInt(min, max);
                num2 = AppUtils.randomInt(min, max);
                answer = num1 + num2;
                break;
            case '-':
                num1 = AppUtils.randomInt(min, max);
                num2 = AppUtils.randomInt(min, Math.min(num1, max));
                answer = num1 - num2;
                break;
            case '×':
                num1 = AppUtils.randomInt(min, Math.min(max, 50));
                num2 = AppUtils.randomInt(min, Math.min(max, 50));
                answer = num1 * num2;
                break;
            case '÷':
                answer = AppUtils.randomInt(min, Math.min(max, 100));
                num2 = AppUtils.randomInt(2, Math.min(max, 20));
                num1 = answer * num2;
                break;
        }

        this.currentProblem = {
            text: `${num1} ${operation} ${num2}`,
            answer: answer,
            points: this.calculatePoints(operation)
        };

        document.getElementById('problemText').textContent = `${this.currentProblem.text} = ?`;
        document.getElementById('answerInput').value = '';
        document.getElementById('answerInput').className = 'answer-field';
    }

    calculatePoints(operation) {
        const basePoints = {
            '+': 1,
            '-': 1,
            '×': 2,
            '÷': 3
        };
        
        const multiplier = this.difficulties[this.difficulty].multiplier;
        const streakBonus = Math.floor(this.streak / 5) * 0.5;
        
        return Math.round((basePoints[operation] + streakBonus) * multiplier);
    }

    submitAnswer() {
        if (this.gameState !== 'playing') return;

        const userAnswer = parseInt(document.getElementById('answerInput').value);
        const correct = userAnswer === this.currentProblem.answer;
        
        this.totalAnswers++;
        
        if (correct) {
            this.correctAnswers++;
            this.score += this.currentProblem.points;
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            
            this.showFeedback('Correct! +' + this.currentProblem.points, 'correct');
            document.getElementById('answerInput').className = 'answer-field correct';
            
            // Add bounce animation
            document.querySelector('.problem-container').classList.add('correct-animation');
            setTimeout(() => {
                document.querySelector('.problem-container').classList.remove('correct-animation');
            }, 600);
            
        } else {
            this.streak = 0;
            this.showFeedback(`Wrong! Answer was ${this.currentProblem.answer}`, 'incorrect');
            document.getElementById('answerInput').className = 'answer-field incorrect';
            
            // Add shake animation
            document.querySelector('.problem-container').classList.add('incorrect-animation');
            setTimeout(() => {
                document.querySelector('.problem-container').classList.remove('incorrect-animation');
            }, 600);
        }

        this.updateDisplay();
        
        // Generate new problem after a short delay
        setTimeout(() => {
            this.generateProblem();
            document.getElementById('answerInput').focus();
        }, 1000);
    }

    showFeedback(message, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `feedback ${type}`;
        
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'feedback';
        }, 1000);
    }

    startTimer() {
        this.gameTimer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 10) {
                document.getElementById('timeLeft').classList.add('danger');
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateDisplay() {
        document.getElementById('currentScore').textContent = this.score.toLocaleString();
        document.getElementById('streak').textContent = this.streak;
        document.getElementById('timeLeft').textContent = AppUtils.formatTime(this.timeLeft);
        
        // Update progress bar
        const progress = ((this.gameDuration - this.timeLeft) / this.gameDuration) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            clearInterval(this.gameTimer);
            this.showScreen('pauseScreen');
        }
    }

    resumeGame() {
        if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.startTimer();
            this.showScreen('gameScreen');
            document.getElementById('answerInput').focus();
        }
    }

    quitGame() {
        this.endGame();
    }

    endGame() {
        this.gameState = 'finished';
        clearInterval(this.gameTimer);
        
        // Calculate final stats
        const accuracy = this.totalAnswers > 0 ? Math.round((this.correctAnswers / this.totalAnswers) * 100) : 0;
        const gameTime = Math.round((Date.now() - this.startTime) / 1000);
        
        // Update results display
        document.getElementById('finalScore').textContent = this.score.toLocaleString();
        document.getElementById('correctAnswers').textContent = this.correctAnswers;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('maxStreak').textContent = this.maxStreak;
        
        // Show performance message
        const message = this.getPerformanceMessage(accuracy);
        document.getElementById('performanceMessage').textContent = message;
        
        // Save score to leaderboard
        this.saveScore({
            playerName: this.playerName,
            score: this.score,
            difficulty: this.difficulty,
            correctAnswers: this.correctAnswers,
            accuracy: accuracy,
            maxStreak: this.maxStreak,
            gameTime: gameTime,
            date: new Date().toISOString()
        });
        
        this.showScreen('resultsScreen');
    }

    getPerformanceMessage(accuracy) {
        if (accuracy >= 95) return "🏆 Perfect! You're a math genius!";
        if (accuracy >= 85) return "🌟 Excellent work! Outstanding performance!";
        if (accuracy >= 75) return "👍 Great job! You're getting better!";
        if (accuracy >= 60) return "👌 Good effort! Keep practicing!";
        return "💪 Nice try! Practice makes perfect!";
    }

    saveScore(scoreData) {
        const leaderboard = AppUtils.storage.get('mathRushLeaderboard', []);
        leaderboard.push(scoreData);
        
        // Sort by score (descending)
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep only top 100 scores
        if (leaderboard.length > 100) {
            leaderboard.splice(100);
        }
        
        AppUtils.storage.set('mathRushLeaderboard', leaderboard);
    }

    loadLeaderboard() {
        this.leaderboard = AppUtils.storage.get('mathRushLeaderboard', []);
    }

    showLeaderboard() {
        this.loadLeaderboard();
        this.renderLeaderboard('all');
        this.showScreen('leaderboardScreen');
    }

    switchLeaderboardTab(difficulty) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-difficulty="${difficulty}"]`).classList.add('active');
        
        this.renderLeaderboard(difficulty);
    }

    renderLeaderboard(difficulty) {
        const list = document.getElementById('leaderboardList');
        
        let filteredData = this.leaderboard;
        if (difficulty !== 'all') {
            filteredData = this.leaderboard.filter(entry => entry.difficulty === difficulty);
        }
        
        if (filteredData.length === 0) {
            list.innerHTML = '<div class="no-scores">No scores yet. Be the first!</div>';
            return;
        }
        
        list.innerHTML = filteredData.slice(0, 20).map((entry, index) => {
            const rank = index + 1;
            const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
            const date = new Date(entry.date).toLocaleDateString();
            
            return `
                <div class="leaderboard-entry">
                    <div class="rank ${rankClass}">#${rank}</div>
                    <div class="player-info">
                        <div class="player-name">${entry.playerName}</div>
                        <div class="player-details">
                            ${entry.difficulty} • ${entry.correctAnswers} correct • ${entry.accuracy}% accuracy • ${date}
                        </div>
                    </div>
                    <div class="score-info">
                        <div class="score">${entry.score.toLocaleString()}</div>
                        <div class="score-details">Streak: ${entry.maxStreak}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    clearLeaderboard() {
        if (confirm('Are you sure you want to clear all scores? This cannot be undone.')) {
            AppUtils.storage.remove('mathRushLeaderboard');
            this.leaderboard = [];
            this.renderLeaderboard(document.querySelector('.tab-btn.active').dataset.difficulty);
        }
    }

    playAgain() {
        this.showScreen('gameScreen');
        this.startGame();
    }

    backToSetup() {
        this.showScreen('setupScreen');
    }

    backFromLeaderboard() {
        this.showScreen('resultsScreen');
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
        
        // Reset timer styles
        document.getElementById('timeLeft').classList.remove('danger');
        
        // Focus appropriate elements
        if (screenId === 'setupScreen') {
            document.getElementById('playerName').focus();
        } else if (screenId === 'gameScreen') {
            document.getElementById('answerInput').focus();
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MathRushGame();
});