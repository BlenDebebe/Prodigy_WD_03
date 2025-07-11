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

// Theme toggle
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");
};

// Handle round selection & show name inputs
document.querySelectorAll(".round-btn").forEach(btn =>
  btn.onclick = (e) => {
    const modeButton = e.target.closest(".mode-wrapper").querySelector(".mode-btn");
    mode = modeButton.dataset.mode;
    maxRounds = parseInt(btn.dataset.rounds);
    nameInputs.classList.remove("hidden");
    player1Input.value = "";
    player2Input.value = "";
    startBtn.classList.add("hidden");
  }
);

// Show start button when both names are entered
[nameInputs].forEach(group => {
  group.addEventListener("input", () => {
    const p1 = player1Input.value.trim();
    const p2 = player2Input.value.trim();
    if (p1 && p2) {
      startBtn.classList.remove("hidden");
    } else {
      startBtn.classList.add("hidden");
    }
  });
});

// Start the game
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
  scoreX.textContent = `${players.X || 'X'}: ${scores.X}`;
  scoreO.textContent = `${players.O || 'O'}: ${scores.O}`;
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
}

function handleClick(e) {
  const index = e.target.dataset.index;
  if (gameBoard[index] || isGameOver) return;

  gameBoard[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  if (checkWinner()) {
    scores[currentPlayer]++;
    updateScoreboard();
    status.textContent = `${players[currentPlayer]} wins this round!`;
    isGameOver = true;
    setTimeout(nextRound, 1500);
  } else if (gameBoard.every(cell => cell)) {
    status.textContent = "It's a draw!";
    isGameOver = true;
    setTimeout(nextRound, 1500);
  } else {
    switchPlayer();
    if (mode === "ai" && currentPlayer === "O") {
      setTimeout(aiMove, 500);
    }
  }
}

function aiMove() {
  let empty = gameBoard.map((v, i) => v === "" ? i : null).filter(i => i !== null);
  let move = empty[Math.floor(Math.random() * empty.length)];
  document.querySelector(`.cell[data-index="${move}"]`).click();
}

function switchPlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
  status.textContent = `${players[currentPlayer]}'s turn`;
}

function checkWinner() {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) =>
    gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]
  );
}

function nextRound() {
  round++;
  if (round > maxRounds) {
    const winner = scores.X > scores.O ? players.X :
                   scores.X < scores.O ? players.O :
                   "No one";
    status.textContent = `Game over! Winner: ${winner}`;
  } else {
    startRound();
  }
}

resetBtn.onclick = () => location.reload();
