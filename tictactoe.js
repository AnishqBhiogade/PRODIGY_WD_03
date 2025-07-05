
      let board = ["", "", "", "", "", "", "", "", ""];
      let currentPlayer = "X";
      let gameMode = "pvp";
      let difficulty = "easy";
      let gameActive = true;
      let scores = { X: 0, O: 0, draw: 0 };
      let playerNames = { X: "Player 1", O: "Player 2" };

      const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], // rows
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], // columns
        [0, 4, 8],
        [2, 4, 6], // diagonals
      ];

      function selectMode(mode) {
        gameMode = mode;
        document.getElementById("landingPage").classList.add("hidden");
        document.getElementById("gamePage").classList.add("active");

        if (mode === "pvp") {
          document.getElementById("playerNames").style.display = "flex";
          document.getElementById("difficultySelector").style.display = "none";
        } else {
          document.getElementById("playerNames").style.display = "none";
          document.getElementById("difficultySelector").style.display = "block";
          // Set default difficulty and update buttons
          difficulty = "easy";
          updateDifficultyButtons();
        }
      }

      function goBack() {
        document.getElementById("landingPage").classList.remove("hidden");
        document.getElementById("gamePage").classList.remove("active");
        document.getElementById("gameContent").style.display = "none";
        document.getElementById("startGameBtn").style.display = "block";
        document.getElementById("playerNames").style.display =
          gameMode === "pvp" ? "flex" : "none";
        document.getElementById("difficultySelector").style.display =
          gameMode === "ai" ? "block" : "none";
        resetGame();
        resetScore();
      }

      function setDifficulty(level) {
        difficulty = level;
        updateDifficultyButtons();
      }

      function updateDifficultyButtons() {
        const buttons = document.querySelectorAll(".difficulty-btn");
        buttons.forEach((btn) => {
          btn.classList.remove("active");
          if (btn.getAttribute("data-difficulty") === difficulty) {
            btn.classList.add("active");
          }
        });
      }

      function startGame() {
        if (gameMode === "pvp") {
          const player1 = document.getElementById("player1Name").value.trim();
          const player2 = document.getElementById("player2Name").value.trim();

          playerNames.X = player1 || "Player 1";
          playerNames.O = player2 || "Player 2";

          document.getElementById("player1Label").textContent = playerNames.X;
          document.getElementById("player2Label").textContent = playerNames.O;
        } else {
          playerNames.X = "You";
          playerNames.O = `AI (${
            difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
          })`;

          document.getElementById("player1Label").textContent = playerNames.X;
          document.getElementById("player2Label").textContent = playerNames.O;
        }

        document.getElementById("gameContent").style.display = "block";
        document.getElementById("startGameBtn").style.display = "none";
        document.getElementById("playerNames").style.display = "none";
        document.getElementById("difficultySelector").style.display = "none";

        resetGame();
        updateCurrentPlayerDisplay();
      }

      function makeMove(index) {
        if (
          !gameActive ||
          board[index] !== "" ||
          (gameMode === "ai" && currentPlayer === "O")
        ) {
          return;
        }

        board[index] = currentPlayer;
        updateBoard();

        if (checkWin(currentPlayer)) {
          endGame(`${playerNames[currentPlayer]} wins!`, "winner-message");
          scores[currentPlayer]++;
          updateScores();
          highlightWinningCells();
          return;
        }

        if (checkDraw()) {
          endGame("It's a draw!", "draw-message");
          scores.draw++;
          updateScores();
          return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
        updateCurrentPlayerDisplay();

        if (gameMode === "ai" && currentPlayer === "O") {
          setTimeout(() => {
            makeAIMove();
          }, 500);
        }
      }

      function updateCurrentPlayerDisplay() {
        document.getElementById("currentPlayer").textContent =
          playerNames[currentPlayer];
      }

      function makeAIMove() {
        if (!gameActive) return;

        let move;
        switch (difficulty) {
          case "easy":
            move = getRandomMove();
            break;
          case "medium":
            move = Math.random() < 0.5 ? getBestMove() : getRandomMove();
            break;
          case "hard":
            move = getBestMove();
            break;
        }

        if (move !== -1) {
          board[move] = "O";
          updateBoard();

          if (checkWin("O")) {
            endGame(`${playerNames.O} wins!`, "winner-message");
            scores.O++;
            updateScores();
            highlightWinningCells();
            return;
          }

          if (checkDraw()) {
            endGame("It's a draw!", "draw-message");
            scores.draw++;
            updateScores();
            return;
          }

          currentPlayer = "X";
          updateCurrentPlayerDisplay();
        }
      }

      function getRandomMove() {
        const availableMoves = board
          .map((cell, index) => (cell === "" ? index : null))
          .filter((index) => index !== null);
        return availableMoves.length > 0
          ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
          : -1;
      }

      function getBestMove() {
        // Try to win
        for (let i = 0; i < 9; i++) {
          if (board[i] === "") {
            board[i] = "O";
            if (checkWin("O")) {
              board[i] = "";
              return i;
            }
            board[i] = "";
          }
        }

        // Try to block opponent
        for (let i = 0; i < 9; i++) {
          if (board[i] === "") {
            board[i] = "X";
            if (checkWin("X")) {
              board[i] = "";
              return i;
            }
            board[i] = "";
          }
        }

        // Take center if available
        if (board[4] === "") {
          return 4;
        }

        // Take corners
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
          if (board[corner] === "") {
            return corner;
          }
        }

        // Take any available spot
        return getRandomMove();
      }

      function checkWin(player) {
        return winningCombinations.some((combination) => {
          return combination.every((index) => board[index] === player);
        });
      }

      function checkDraw() {
        return board.every((cell) => cell !== "");
      }

      function highlightWinningCells() {
        const winningCombination = winningCombinations.find((combination) => {
          return combination.every(
            (index) =>
              board[index] === board[combination[0]] && board[index] !== ""
          );
        });

        if (winningCombination) {
          winningCombination.forEach((index) => {
            document.querySelectorAll(".cell")[index].classList.add("winner");
          });
        }
      }

      function updateBoard() {
        const cells = document.querySelectorAll(".cell");
        cells.forEach((cell, index) => {
          cell.textContent = board[index];
          cell.classList.remove("taken", "x", "o");
          if (board[index] !== "") {
            cell.classList.add("taken");
            cell.classList.add(board[index].toLowerCase());
          }
        });
      }

      function endGame(message, className) {
        gameActive = false;
        const gameStatus = document.getElementById("gameStatus");
        gameStatus.textContent = message;
        gameStatus.className = `game-status ${className}`;
      }

      function resetGame() {
        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        gameActive = true;
        updateCurrentPlayerDisplay();
        document.getElementById("gameStatus").textContent = "";
        document.getElementById("gameStatus").className = "game-status";

        const cells = document.querySelectorAll(".cell");
        cells.forEach((cell) => {
          cell.textContent = "";
          cell.classList.remove("taken", "x", "o", "winner");
        });
      }

      function resetScore() {
        scores = { X: 0, O: 0, draw: 0 };
        updateScores();
      }

      function updateScores() {
        document.getElementById("scoreX").textContent = scores.X;
        document.getElementById("scoreO").textContent = scores.O;
        document.getElementById("scoreDraw").textContent = scores.draw;
      }
    