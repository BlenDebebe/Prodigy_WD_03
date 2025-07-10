let board = Array(9).fill("");
let currentPlayer = "X";
let gameActive = false;
let gameMode = "human";
let totalRounds = 1;
let currentRound = 1;
let score = { X: 0, O: 0 };

const boardContainer = document.getElementById("board");
const statusDisplay = document.getElementById("status");
const scoreboard = document.getElementById("scoreboard");

const winningCombinations = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function renderBoard() {
  boardContainer.innerHTML = "";
  board.forEach((cell, index) => {
    const cellDiv = document.createElement("div");
    cellDiv.classList.add("cell");
    cellDiv.dataset.index = index;
    cellDiv.textContent = cell;
    cellDiv.addEventListener("click", handleClick);
    boardContainer.appendChild(cellDiv);
  });
}

function handleClick(event) {
  const index = event.target.dataset.index;
  if (board[index] !== "" || !gameActive) return;

  makeMove(index);
}

function makeMove(index) {
  board[index] = currentPlayer;
  renderBoard();

  if (checkWin(currentPlayer)) {
    score[currentPlayer]++;
    updateScoreboard();
    statusDisplay.textContent = `${currentPlayer} wins Round ${currentRound}`;
    gameActive = false;
    nextRoundOrEnd();
  } else if (board.every(cell => cell !== "")) {
    statusDisplay.textContent = `Draw in Round ${currentRound}`;
    gameActive = false;
    nextRoundOrEnd();
  } else {
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    statusDisplay.textContent = `Turn: ${currentPlayer}`;

    if (gameMode === "ai" && currentPlayer === "O") {
      setTimeout(aiMove, 300);
    }
  }
}

function aiMove() {
  const index = getBestMove();
  if (index !== undefined) {
    makeMove(index);
  }
}

function getBestMove() {
  let bestScore = -Infinity;
  let move;
  board.forEach((cell, index) => {
    if (cell === "") {
      board[index] = "O";
      let score = minimax(board, 0, false);
      board[index] = "";
      if (score > bestScore) {
        bestScore = score;
        move = index;
      }
    }
  });
  return move;
}

function minimax(boardState, depth, isMaximizing) {
  const result = getWinner();
  if (result !== null) {
    const scores = { X: -1, O: 1, draw: 0 };
    return scores[result];
  }

  if (isMaximizing) {
    let best = -Infinity;
    boardState.forEach((cell, index) => {
      if (cell === "") {
        boardState[index] = "O";
        best = Math.max(best, minimax(boardState, depth + 1, false));
        boardState[index] = "";
      }
    });
    return best;
  } else {
    let best = Infinity;
    boardState.forEach((cell, index) => {
      if (cell === "") {
        boardState[index] = "X";
        best = Math.min(best, minimax(boardState, depth + 1, true));
        boardState[index] = "";
      }
    });
    return best;
  }
}

function getWinner() {
  for (const combo of winningCombinations) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== "")) return "draw";
  return null;
}

function checkWin(player) {
  return winningCombinations.some(combo =>
    combo.every(i => board[i] === player)
  );
}

function startGame(mode, rounds) {
  gameMode = mode;
  totalRounds = rounds;
  currentRound = 1;
  score = { X: 0, O: 0 };
  currentPlayer = "X";
  gameActive = true;
  board = Array(9).fill("");
  updateScoreboard();
  renderBoard();
  statusDisplay.textContent = `Round 1 - Turn: ${currentPlayer}`;
}

function resetGame() {
  board = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  renderBoard();
  statusDisplay.textContent = `Round ${currentRound} - Turn: ${currentPlayer}`;
}

function nextRoundOrEnd() {
  if (currentRound >= totalRounds) {
    let winner =
      score.X > score.O ? "Player X" :
      score.O > score.X ? "Player O" :
      "No one";
    setTimeout(() => {
      statusDisplay.textContent = `Game Over: ${winner} wins the match!`;
    }, 500);
    gameActive = false;
  } else {
    currentRound++;
    setTimeout(() => {
      resetGame();
    }, 1000);
  }
}

function updateScoreboard() {
  scoreboard.textContent = `Score - X: ${score.X} | O: ${score.O}`;
}
