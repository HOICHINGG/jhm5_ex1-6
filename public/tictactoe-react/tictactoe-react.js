// TicTacToe React Application
const { useState, useEffect, useCallback, useMemo } = React;

// Custom hooks
const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};

const useGameLogic = () => {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];

    const checkWinner = useCallback((board) => {
        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return { winner: board[a], combination };
            }
        }
        return null;
    }, []);

    const isBoardFull = useCallback((board) => {
        return board.every(cell => cell !== '');
    }, []);

    const getAvailableMoves = useCallback((board) => {
        return board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    }, []);

    const minimax = useCallback((board, depth, isMaximizing) => {
        const result = checkWinner(board);
        
        if (result?.winner === 'O') return 10 - depth;
        if (result?.winner === 'X') return depth - 10;
        if (isBoardFull(board)) return 0;
        
        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = 'O';
                    let score = minimax(board, depth + 1, false);
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
                    let score = minimax(board, depth + 1, true);
                    board[i] = '';
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }, [checkWinner, isBoardFull]);

    const getBestMove = useCallback((board) => {
        let bestScore = -Infinity;
        let bestMove = -1;
        
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                let score = minimax([...board], 0, false);
                board[i] = '';
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        
        return bestMove;
    }, [minimax]);

    const getRandomMove = useCallback((board) => {
        const availableMoves = getAvailableMoves(board);
        return availableMoves.length > 0 ? 
            availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }, [getAvailableMoves]);

    const getMediumMove = useCallback((board) => {
        // Try to win
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                if (checkWinner(board)?.winner === 'O') {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // Try to block
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                if (checkWinner(board)?.winner === 'X') {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }
        
        // Take center
        if (board[4] === '') return 4;
        
        // Take random corner
        const corners = [0, 2, 6, 8].filter(i => board[i] === '');
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }
        
        return getRandomMove(board);
    }, [checkWinner, getRandomMove]);

    return {
        checkWinner,
        isBoardFull,
        getAvailableMoves,
        getBestMove,
        getRandomMove,
        getMediumMove
    };
};

// Components
const GameSetup = ({ onStartGame }) => {
    const [gameMode, setGameMode] = useState('pvp');
    const [difficulty, setDifficulty] = useState('medium');
    const [player1Name, setPlayer1Name] = useState('');
    const [player2Name, setPlayer2Name] = useState('');

    const handleStartGame = () => {
        const settings = {
            gameMode,
            difficulty,
            players: {
                X: player1Name.trim() || 'Player 1',
                O: gameMode === 'pvc' ? `Computer (${difficulty})` : (player2Name.trim() || 'Player 2')
            }
        };
        onStartGame(settings);
    };

    return (
        <div className="setup-screen">
            <div className="app-title">
                <i className="fab fa-react"></i>
                <h2>TicTacToe React</h2>
                <p>Enhanced with React hooks and localStorage</p>
            </div>

            <div className="setup-form">
                <div className="form-group">
                    <label className="form-label">Game Mode:</label>
                    <div className="mode-selection">
                        <button 
                            className={`mode-btn ${gameMode === 'pvp' ? 'active' : ''}`}
                            onClick={() => setGameMode('pvp')}
                        >
                            <i className="fas fa-users"></i>
                            <span>Player vs Player</span>
                        </button>
                        <button 
                            className={`mode-btn ${gameMode === 'pvc' ? 'active' : ''}`}
                            onClick={() => setGameMode('pvc')}
                        >
                            <i className="fas fa-robot"></i>
                            <span>Player vs Computer</span>
                        </button>
                    </div>
                </div>

                {gameMode === 'pvc' && (
                    <div className="form-group">
                        <label className="form-label">AI Difficulty:</label>
                        <select 
                            className="form-select" 
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                        >
                            <option value="easy">Easy (Random moves)</option>
                            <option value="medium">Medium (Smart moves)</option>
                            <option value="hard">Hard (Minimax AI)</option>
                        </select>
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Player 1 (X):</label>
                    <input 
                        type="text"
                        className="form-input"
                        placeholder="Player 1"
                        value={player1Name}
                        onChange={(e) => setPlayer1Name(e.target.value)}
                        maxLength={15}
                    />
                </div>

                {gameMode === 'pvp' && (
                    <div className="form-group">
                        <label className="form-label">Player 2 (O):</label>
                        <input 
                            type="text"
                            className="form-input"
                            placeholder="Player 2"
                            value={player2Name}
                            onChange={(e) => setPlayer2Name(e.target.value)}
                            maxLength={15}
                        />
                    </div>
                )}

                <button 
                    className="btn btn-primary btn-large"
                    onClick={handleStartGame}
                >
                    <i className="fas fa-play"></i> Start Game
                </button>
            </div>

            <div className="features-list">
                <h3>React Features:</h3>
                <ul>
                    <li>Game history with replay functionality</li>
                    <li>Move timeline with step navigation</li>
                    <li>Persistent statistics using localStorage</li>
                    <li>Undo/redo moves with state management</li>
                    <li>Advanced AI with multiple difficulty levels</li>
                    <li>Real-time game analysis and statistics</li>
                </ul>
            </div>
        </div>
    );
};

const GameBoard = ({ board, onCellClick, winningCombination, currentPlayer, gameMode }) => {
    const [previewCell, setPreviewCell] = useState(null);

    const handleCellHover = (index) => {
        if (board[index] === '' && (gameMode !== 'pvc' || currentPlayer === 'X')) {
            setPreviewCell(index);
        }
    };

    const handleCellLeave = () => {
        setPreviewCell(null);
    };

    return (
        <div className="game-board-container">
            <div className="game-board">
                {board.map((cell, index) => {
                    const isWinning = winningCombination && winningCombination.includes(index);
                    const isPreview = previewCell === index;
                    
                    return (
                        <button
                            key={index}
                            className={`game-cell ${cell ? 'occupied' : ''} ${cell.toLowerCase()} ${isWinning ? 'winning' : ''} ${isPreview ? 'preview' : ''}`}
                            onClick={() => onCellClick(index)}
                            onMouseEnter={() => handleCellHover(index)}
                            onMouseLeave={handleCellLeave}
                            disabled={cell !== '' || (gameMode === 'pvc' && currentPlayer === 'O')}
                        >
                            {cell || (isPreview ? currentPlayer : '')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const GameInfo = ({ gameState, players, onNewGame, onBackToSetup, onUndo, canUndo }) => {
    const { currentPlayer, scores, gameMode, isGameOver, winner } = gameState;

    return (
        <div className="sidebar game-info">
            <h3><i className="fas fa-info-circle"></i> Game Info</h3>
            
            <div className="current-game">
                <div className="turn-indicator">
                    {isGameOver 
                        ? (winner ? `${players[winner]} Wins!` : "It's a Draw!")
                        : `${players[currentPlayer]}'s Turn`
                    }
                </div>
                <div className="game-mode">
                    {gameMode === 'pvc' ? 'Player vs Computer' : 'Player vs Player'}
                </div>
            </div>

            <div className="score-section">
                <div className="player-score">
                    <div className="score-value">{scores.X}</div>
                    <div className="score-label">{players.X}</div>
                </div>
                <div className="player-score">
                    <div className="score-value">{scores.O}</div>
                    <div className="score-label">{players.O}</div>
                </div>
            </div>

            <div className="controls-section">
                <button 
                    className="btn btn-primary"
                    onClick={onNewGame}
                >
                    <i className="fas fa-redo"></i> New Game
                </button>
                
                <button 
                    className="btn btn-secondary"
                    onClick={onUndo}
                    disabled={!canUndo}
                >
                    <i className="fas fa-undo"></i> Undo Move
                </button>
                
                <button 
                    className="btn btn-secondary"
                    onClick={onBackToSetup}
                >
                    <i className="fas fa-cog"></i> Settings
                </button>
            </div>
        </div>
    );
};

const GameHistory = ({ history, currentGameIndex, onSelectGame, onClearHistory }) => {
    return (
        <div className="sidebar">
            <h3><i className="fas fa-history"></i> Game History</h3>
            
            <div className="history-panel">
                {history.length === 0 ? (
                    <p>No games played yet.</p>
                ) : (
                    <ul className="history-list">
                        {history.map((game, index) => (
                            <li
                                key={index}
                                className={`history-item ${index === currentGameIndex ? 'current' : ''}`}
                                onClick={() => onSelectGame(index)}
                            >
                                <div className="history-header">
                                    <span className="game-number">Game {index + 1}</span>
                                    <span className={`game-result ${game.winner ? `win-${game.winner.toLowerCase()}` : 'draw'}`}>
                                        {game.winner ? `${game.winner} Wins` : 'Draw'}
                                    </span>
                                </div>
                                <div className="game-details">
                                    <span>{game.moves.length} moves</span>
                                    <span>{new Date(game.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {history.length > 0 && (
                <div className="history-controls">
                    <button 
                        className="btn btn-secondary"
                        onClick={onClearHistory}
                    >
                        <i className="fas fa-trash"></i> Clear History
                    </button>
                </div>
            )}
        </div>
    );
};

const Statistics = ({ stats, onResetStats }) => {
    const totalGames = stats.totalGames || 0;
    const winRate = totalGames > 0 ? Math.round((stats.player1Wins / totalGames) * 100) : 0;

    return (
        <div className="sidebar">
            <h3><i className="fas fa-chart-bar"></i> Statistics</h3>
            
            <div className="stats-grid">
                <div className="stat-item">
                    <div className="stat-value">{totalGames}</div>
                    <div className="stat-label">Total Games</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{stats.player1Wins || 0}</div>
                    <div className="stat-label">X Wins</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{stats.player2Wins || 0}</div>
                    <div className="stat-label">O Wins</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{stats.draws || 0}</div>
                    <div className="stat-label">Draws</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{winRate}%</div>
                    <div className="stat-label">X Win Rate</div>
                </div>
                <div className="stat-item">
                    <div className="stat-value">{stats.averageMoves || 0}</div>
                    <div className="stat-label">Avg Moves</div>
                </div>
            </div>

            <button 
                className="btn btn-secondary"
                onClick={onResetStats}
            >
                <i className="fas fa-refresh"></i> Reset Stats
            </button>
        </div>
    );
};

const MoveTimeline = ({ moves, currentMoveIndex, onSelectMove }) => {
    if (moves.length === 0) return null;

    return (
        <div className="move-timeline">
            <h4>Move History</h4>
            <div className="timeline-moves">
                {moves.map((move, index) => (
                    <button
                        key={index}
                        className={`move-step ${move.player.toLowerCase()} ${index === currentMoveIndex ? 'current' : ''}`}
                        onClick={() => onSelectMove(index)}
                        title={`Move ${index + 1}: ${move.player} at position ${move.position + 1}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Main App Component
const TicTacToeApp = () => {
    const [gameSettings, setGameSettings] = useState(null);
    const [gameHistory, setGameHistory] = useLocalStorage('tictactoeReactHistory', []);
    const [currentGameIndex, setCurrentGameIndex] = useState(-1);
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [stats, setStats] = useLocalStorage('tictactoeReactStats', {
        totalGames: 0,
        player1Wins: 0,
        player2Wins: 0,
        draws: 0,
        averageMoves: 0
    });

    const gameLogic = useGameLogic();

    // Current game state
    const currentGame = useMemo(() => {
        if (currentGameIndex >= 0 && currentGameIndex < gameHistory.length) {
            return gameHistory[currentGameIndex];
        }
        return null;
    }, [gameHistory, currentGameIndex]);

    // Current board state based on move index
    const currentBoard = useMemo(() => {
        if (!currentGame) return Array(9).fill('');
        
        const board = Array(9).fill('');
        const movesToShow = currentMoveIndex >= 0 ? currentMoveIndex + 1 : currentGame.moves.length;
        
        for (let i = 0; i < movesToShow && i < currentGame.moves.length; i++) {
            const move = currentGame.moves[i];
            board[move.position] = move.player;
        }
        
        return board;
    }, [currentGame, currentMoveIndex]);

    // Game state
    const gameState = useMemo(() => {
        if (!currentGame) {
            return {
                currentPlayer: 'X',
                scores: { X: 0, O: 0 },
                gameMode: 'pvp',
                isGameOver: false,
                winner: null,
                winningCombination: null
            };
        }

        const isReplayMode = currentMoveIndex >= 0 && currentMoveIndex < currentGame.moves.length - 1;
        const movesPlayed = currentMoveIndex >= 0 ? currentMoveIndex + 1 : currentGame.moves.length;
        const nextPlayer = movesPlayed % 2 === 0 ? 'X' : 'O';
        
        const result = gameLogic.checkWinner(currentBoard);
        const isGameComplete = result || gameLogic.isBoardFull(currentBoard);
        
        // Calculate session scores
        const sessionScores = { X: 0, O: 0 };
        gameHistory.forEach(game => {
            if (game.winner) {
                sessionScores[game.winner]++;
            }
        });

        return {
            currentPlayer: isGameComplete ? null : nextPlayer,
            scores: sessionScores,
            gameMode: gameSettings?.gameMode || 'pvp',
            isGameOver: isGameComplete && !isReplayMode,
            winner: result?.winner || null,
            winningCombination: result?.combination || null,
            isReplayMode
        };
    }, [currentGame, currentBoard, currentMoveIndex, gameHistory, gameSettings, gameLogic]);

    const startNewGame = (settings) => {
        setGameSettings(settings);
        
        const newGame = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            moves: [],
            winner: null,
            gameMode: settings.gameMode,
            difficulty: settings.difficulty,
            players: settings.players
        };
        // Append the new game and set the current index based on the updated history
        setGameHistory(prev => {
            const newHist = [...prev, newGame];
            setCurrentGameIndex(newHist.length - 1);
            setCurrentMoveIndex(-1);
            return newHist;
        });
    };

    const makeMove = (position) => {
        if (!currentGame || gameState.isGameOver || gameState.isReplayMode || 
            currentBoard[position] !== '' || 
            (gameSettings.gameMode === 'pvc' && gameState.currentPlayer === 'O')) {
            return;
        }

        const newMove = {
            position,
            player: gameState.currentPlayer,
            timestamp: Date.now()
        };

        // If we're in the middle of move history, truncate future moves
        const currentMoves = currentMoveIndex >= 0 
            ? currentGame.moves.slice(0, currentMoveIndex + 1)
            : currentGame.moves;

        const updatedMoves = [...currentMoves, newMove];
        
        // Check if game ends with this move
        const newBoard = [...currentBoard];
        newBoard[position] = gameState.currentPlayer;
        
        const result = gameLogic.checkWinner(newBoard);
        const winner = result?.winner || (gameLogic.isBoardFull(newBoard) ? 'draw' : null);

        const updatedGame = {
            ...currentGame,
            moves: updatedMoves,
            winner: winner === 'draw' ? null : winner
        };

        const updatedHistory = [...gameHistory];
        updatedHistory[currentGameIndex] = updatedGame;

        // Update history atomically and then recalculate stats using the fresh history
        setGameHistory(updatedHistory);
        setCurrentMoveIndex(-1);

        // Update stats if game is complete (pass the updated history for accurate calculation)
        if (winner !== null) {
            updateStatsWithHistory(updatedHistory);
        }

        // Computer move in PvC mode
        if (gameSettings.gameMode === 'pvc' && !winner && gameState.currentPlayer === 'X') {
            setTimeout(() => makeComputerMove(newBoard), 500);
        }
    };

    const makeComputerMove = (board) => {
        let move = -1;
        
        switch (gameSettings.difficulty) {
            case 'easy':
                move = gameLogic.getRandomMove(board);
                break;
            case 'medium':
                move = gameLogic.getMediumMove([...board]);
                break;
            case 'hard':
                move = gameLogic.getBestMove([...board]);
                break;
        }

        if (move >= 0) {
            makeMove(move);
        }
    };

    const updateStats = (game) => {
        // Recalculate statistics based on the full, updated history
        setStats(prevStats => {
            // Try to derive authoritative stats from gameHistory (caller should ensure history was updated before calling)
            const allGames = gameHistory;
            const completedGames = allGames.filter(g => g.moves && g.moves.length > 0);

            const totalGames = completedGames.length;
            const player1Wins = completedGames.filter(g => g.winner === 'X').length;
            const player2Wins = completedGames.filter(g => g.winner === 'O').length;
            const draws = completedGames.filter(g => !g.winner && g.moves.length > 0 && g.moves.length % 1 === 0 && g.moves.length <= 9 && (g.moves.length === 9 || !g.winner)).length;
            const totalMoves = completedGames.reduce((s, g) => s + (g.moves ? g.moves.length : 0), 0);
            const averageMoves = totalGames > 0 ? Math.round(totalMoves / totalGames) : 0;

            return {
                totalGames,
                player1Wins,
                player2Wins,
                draws,
                averageMoves
            };
        });
    };

    const updateStatsWithHistory = (historyArray) => {
        const allGames = historyArray || [];
        const completedGames = allGames.filter(g => g.moves && g.moves.length > 0);

        const totalGames = completedGames.length;
        const player1Wins = completedGames.filter(g => g.winner === 'X').length;
        const player2Wins = completedGames.filter(g => g.winner === 'O').length;
        const draws = completedGames.filter(g => !g.winner && g.moves.length > 0 && (g.moves.length === 9 || !g.winner)).length;
        const totalMoves = completedGames.reduce((s, g) => s + (g.moves ? g.moves.length : 0), 0);
        const averageMoves = totalGames > 0 ? Math.round(totalMoves / totalGames) : 0;

        setStats({
            totalGames,
            player1Wins,
            player2Wins,
            draws,
            averageMoves
        });
    };

    const newGame = () => {
        const newGameData = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            moves: [],
            winner: null,
            gameMode: gameSettings.gameMode,
            difficulty: gameSettings.difficulty,
            players: gameSettings.players
        };
        setGameHistory(prev => {
            const newHist = [...prev, newGameData];
            setCurrentGameIndex(newHist.length - 1);
            setCurrentMoveIndex(-1);
            return newHist;
        });
    };

    const undoMove = () => {
        if (!currentGame || currentGame.moves.length === 0) return;
        
        let movesToRemove = 1;
        
        // In PvC mode, remove computer move too if it exists
        if (gameSettings.gameMode === 'pvc' && currentGame.moves.length >= 2 &&
            currentGame.moves[currentGame.moves.length - 1].player === 'O') {
            movesToRemove = 2;
        }

        const updatedMoves = currentGame.moves.slice(0, -movesToRemove);
        const updatedGame = { ...currentGame, moves: updatedMoves, winner: null };
        
        const updatedHistory = [...gameHistory];
        updatedHistory[currentGameIndex] = updatedGame;
        setGameHistory(updatedHistory);
        setCurrentMoveIndex(-1);
    };

    const selectGame = (gameIndex) => {
        setCurrentGameIndex(gameIndex);
        setCurrentMoveIndex(-1);
    };

    const selectMove = (moveIndex) => {
        setCurrentMoveIndex(moveIndex);
    };

    const clearHistory = () => {
        if (confirm('Are you sure you want to clear all game history?')) {
            setGameHistory([]);
            setCurrentGameIndex(-1);
            setCurrentMoveIndex(-1);
        }
    };

    const resetStats = () => {
        if (confirm('Are you sure you want to reset all statistics?')) {
            setStats({
                totalGames: 0,
                player1Wins: 0,
                player2Wins: 0,
                draws: 0,
                averageMoves: 0
            });
        }
    };

    const backToSetup = () => {
        setGameSettings(null);
        setCurrentGameIndex(-1);
        setCurrentMoveIndex(-1);
    };

    if (!gameSettings) {
        return (
            <div className="react-app">
                <GameSetup onStartGame={startNewGame} />
            </div>
        );
    }

    return (
        <div className="react-app">
            <div className="game-layout">
                <GameInfo 
                    gameState={gameState}
                    players={gameSettings.players}
                    onNewGame={newGame}
                    onBackToSetup={backToSetup}
                    onUndo={undoMove}
                    canUndo={currentGame && currentGame.moves.length > 0 && !gameState.isReplayMode}
                />
                
                <div className="game-area">
                    <GameBoard
                        board={currentBoard}
                        onCellClick={makeMove}
                        winningCombination={gameState.winningCombination}
                        currentPlayer={gameState.currentPlayer}
                        gameMode={gameState.gameMode}
                    />
                    
                    {currentGame && (
                        <MoveTimeline
                            moves={currentGame.moves}
                            currentMoveIndex={currentMoveIndex}
                            onSelectMove={selectMove}
                        />
                    )}
                </div>
                
                <div>
                    <GameHistory
                        history={gameHistory}
                        currentGameIndex={currentGameIndex}
                        onSelectGame={selectGame}
                        onClearHistory={clearHistory}
                    />
                    
                    <Statistics
                        stats={stats}
                        onResetStats={resetStats}
                    />
                </div>
            </div>
        </div>
    );
};

// Render the app (React 18+ compatibility)
const rootEl = document.getElementById('root');
if (ReactDOM.createRoot) {
    ReactDOM.createRoot(rootEl).render(<TicTacToeApp />);
} else {
    ReactDOM.render(<TicTacToeApp />, rootEl);
}