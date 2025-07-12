const setupScreen = document.getElementById("setupScreen");
const gameScreen = document.getElementById("gameScreen");
const startBtn = document.getElementById("startBtn");
const board = document.getElementById("board");
const status = document.getElementById("status");
const playerNames = document.getElementById("playerNames");
const resetBtn = document.getElementById("resetBtn");
const roundDisplay = document.getElementById("roundDisplay");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const nameInputs = document.getElementById("nameInputs");
const themeBtn = document.getElementById("themeBtn");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");

let currentPlayer = "X";
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let isGameOver = false;
let round = 1;
let maxRounds = 1;
let mode = null;
let players = { X: "", O: "" };
let scores = { X: 0, O: 0 };


themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};


document.querySelectorAll(".round-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    const modeWrapper = e.target.closest(".mode-wrapper");
    const modeButton = modeWrapper.querySelector(".mode-btn");
    mode = modeButton.dataset.mode;
    maxRounds = parseInt(btn.dataset.rounds);

    nameInputs.classList.remove("hidden");
    player1Input.value = "";
    player2Input.value = "";

    if (mode === "ai") {
      player2Input.style.display = "none";
    } else {
      player2Input.style.display = "inline-block";
    }

    startBtn.classList.add("hidden");
  });
});

// Show start button if names valid
nameInputs.addEventListener("input", () => {
  const p1 = player1Input.value.trim();
  const p2 = player2Input.style.display === "none" ? "AI" : player2Input.value.trim();
  startBtn.classList.toggle("hidden", !(p1 && p2));
});

// Start game
startBtn.onclick = () => {
  const p1 = player1Input.value.trim() || "Player 1";
  const p2 = player2Input.value.trim() || (mode === "ai" ? "Computer" : "Player 2");

  players = { X: p1, O: p2 };
  setupScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  resetBtn.classList.remove("hidden");

  scores = { X: 0, O: 0 };
  round = 1;

  updateScoreboard();
  startRound();
};

function updateScoreboard() {
  scoreX.textContent = `${players.X}: ${scores.X}`;
  scoreO.textContent = `${players.O}: ${scores.O}`;
}

function startRound() {
  gameBoard = ["", "", "", "", "", "", "", "", ""];
  isGameOver = false;
  currentPlayer = "X";
  board.innerHTML = "";
  roundDisplay.textContent = `Round ${round} of ${maxRounds}`;
  playerNames.textContent = `${players.X} (X) vs ${players.O} (O)`;
  status.textContent = `${players[currentPlayer]}'s turn`;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleClick);
    board.appendChild(cell);
  }

  if (mode === "ai" && currentPlayer === "O") {
    setTimeout(aiMove, 500);
  }
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (gameBoard[index] || isGameOver || (mode === "ai" && currentPlayer === "O")) return;
  makeMove(index, currentPlayer);

  if (!isGameOver && mode === "ai" && currentPlayer === "O") {
    setTimeout(aiMove, 500);
  }
}

function makeMove(index, player) {
  gameBoard[index] = player;
  document.querySelector(`.cell[data-index="${index}"]`).textContent = player;

  if (checkWinner(gameBoard, player)) {
    scores[player]++;
    updateScoreboard();
    status.textContent = `${players[player]} wins this round!`;
    isGameOver = true;
    setTimeout(nextRound, 1500);
  } else if (gameBoard.every(cell => cell)) {
    status.textContent = "It's a draw!";
    isGameOver = true;
    setTimeout(nextRound, 1500);
  } else {
    switchPlayer();
  }
}

function aiMove() {
  const bestIndex = getBestMove(gameBoard, "O");
  if (bestIndex !== undefined && !isGameOver) {
    makeMove(bestIndex, "O");
  }
}

function getBestMove(board, player) {
  const opponent = player === "X" ? "O" : "X";

  if (checkWinner(board, "X")) return { score: -10 };
  if (checkWinner(board, "O")) return { score: 10 };
  if (board.every(cell => cell)) return { score: 0 };

  const moves = [];

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      const newBoard = [...board];
      newBoard[i] = player;
      const result = getBestMove(newBoard, opponent);
      const score = typeof result === "object" ? result.score : result;
      moves.push({ index: i, score });
    }
  }

  if (player === "O") {
    let max = -Infinity;
    let best = 0;
    for (let move of moves) {
      if (move.score > max) {
        max = move.score;
        best = move.index;
      }
    }
    return best;
  } else {
    let min = Infinity;
    let best = 0;
    for (let move of moves) {
      if (move.score < min) {
        min = move.score;
        best = move.index;
      }
    }
    return { score: min };
  }
}

function checkWinner(board, player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  status.textContent = `${players[currentPlayer]}'s turn`;
}

function nextRound() {
  round++;
  if (round > maxRounds) {
    const winner = scores.X > scores.O ? players.X :
                   scores.X < scores.O ? players.O : "No one";
    status.textContent = `Game over! Winner: ${winner}`;
  } else {
    startRound();
  }
}

resetBtn.onclick = () => location.reload();
