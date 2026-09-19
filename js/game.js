let gameState = {
  turn: 1,
  currentPlayer: "player",
  phase: "draw",
  gameOver: false,

  players: {
    player: {
      lp: 8000,
      deck: [],
      hand: [],
      field: [],
      graveyard: false,
      normalSummonUsed: false,
    },

    opponent: {
      lp: 8000,
      deck: [],
      hand: [],
      field: [],
      graveyard: false,
      normalSummonUsed: false,
    },
  },
};
let playerCardIndex = 0;
let opponentCardIndex = 0;

const startButton = document.getElementById("start-game-button");
const drawButton = document.getElementById("draw-button");
const mainPhaseButton = document.getElementById("main-phase-button");
const battlePhaseButton = document.getElementById("battle-phase-button");
const endTurnButton = document.getElementById("end-turn-button");
const surrenderButton = document.getElementById("surrender-button");
const opDeck = document.getElementById("opponent-deck");
const plDeck = document.getElementById("player-deck");
const gameMessage = document.getElementById("game-message");
const gameOverModal = document.getElementById("game-over-modal");
const gameOverMessage = document.getElementById("game-over-message");
const finalResult = document.getElementById("final-result");
const newGameButton = document.getElementById("new-game-button");
const modalNewGameButton = document.getElementById("modal-new-game-button");
const backToStartingPageButton = document.getElementById("startingPage-button");

function setGameMessage(message) {
  if (gameMessage) {
    gameMessage.textContent = message;
  }
}

function endGame(loser, reason) {
  if (gameState.gameOver) return;

  gameState.gameOver = true;
  stopBackgroundAudio();
  const playerLost = loser === "player";
  const resultMessage = playerLost ? "You lose." : "You win!";
  const reasonMessage =
    reason === "surrender"
      ? `${loser === "player" ? "You surrendered" : "The opponent surrendered"}.`
      : reason === "deck-out"
        ? `${loser === "player" ? "You have no cards left to draw" : "The opponent has no cards left to draw"}.`
        : `${loser === "player" ? "Your Life Points reached 0" : "The opponent's Life Points reached 0"}.`;

  if (reason === "surrender") {
    playGameAudio("audios/surrender.mp3", 0.8);
  } else {
    playGameAudio(
      playerLost ? "audios/lost.mp3" : "audios/flawless_victory.mp3",
      0.8,
    );
  }

  drawButton.disabled = true;
  mainPhaseButton.disabled = true;
  battlePhaseButton.disabled = true;
  endTurnButton.disabled = true;
  surrenderButton.disabled = true;
  clickable("player", false);
  clickable("opponent", false);
  if (gameOverModal) {
    gameOverModal.hidden = false;
    gameOverModal.classList.remove("is-opening");
    requestAnimationFrame(() => gameOverModal.classList.add("is-opening"));
  }
  if (gameOverMessage) gameOverMessage.textContent = reasonMessage;
  if (finalResult) finalResult.textContent = resultMessage;
  setGameMessage(`${resultMessage} ${reasonMessage}`);
  updateHeader();
}

function checkGameEnd() {
  if (gameState.players.player.lp <= 0) {
    endGame("player", "lp");
  } else if (gameState.players.opponent.lp <= 0) {
    endGame("opponent", "lp");
  }
}

function clickable(player, deckB) {
  let deckElement = player === "player" ? plDeck : opDeck;
  if (deckB) deckElement.style.pointerEvents = "auto";
  else deckElement.style.pointerEvents = "none";
}

async function initializeGame() {
  console.log("[Game] Initializing game");
  let decks = { ...(await buildDecks()) };
  console.log("[Game] Deck data received");
  playerCardIndex = 4;
  opponentCardIndex = 4;

  gameState.players.player = {
    lp: 8000,
    deck: decks.player,
    hand: decks.player.slice(0, 4),
    field: [],
    graveyard: false,
    normalSummonUsed: false,
  };
  gameState.players.opponent = {
    lp: 8000,
    deck: decks.opponent,
    hand: decks.opponent.slice(0, 4),
    field: [],
    graveyard: false,
    normalSummonUsed: false,
  };

  gameState.turn = 1;
  gameState.phase = "draw";
  gameState.gameOver = false;
  if (gameOverModal) gameOverModal.hidden = true;
  if (Math.floor(Math.random() * 10) % 2) {
    gameState.currentPlayer = "opponent";
  } else {
    gameState.currentPlayer = "player";
  }
  console.log(`[Game] Starting player: ${gameState.currentPlayer}`);
  renderHand(gameState.currentPlayer);
  renderHand(gameState.currentPlayer === "player" ? "opponent" : "player");
  renderDeck("player");
  renderDeck("opponent");
  renderGraveYard("player");
  renderGraveYard("opponent");
  renderField("player");
  renderField("opponent");
  clickable("player", false);
  clickable("opponent", false);
  updateLP();
  updateHeader();
  if (gameState.currentPlayer === "player") {
    showPlayerTurnPopup();
  }
  console.log("[Game] Initialization complete");
}

function drawCard(player) {
  console.log(`[Game] Drawing card for ${player}`);
  const cardIndex = player === "player" ? playerCardIndex : opponentCardIndex;
  if (cardIndex >= gameState.players[player].deck.length) {
    setGameMessage(`${player} has no more cards to draw.`);
    console.warn(`[Game] ${player} has no more cards to draw`);
    return;
  }
  if (player === "player") {
    gameState.players.player.hand.push(
      gameState.players.player.deck[playerCardIndex],
    );
    playerCardIndex++;
  } else if (player === "opponent") {
    gameState.players.opponent.hand.push(
      gameState.players.opponent.deck[opponentCardIndex],
    );
    opponentCardIndex++;
  }
  console.log(
    `[Game] ${player} hand size: ${gameState.players[player].hand.length}`,
  );
  setGameMessage(`${player} drew a card.`);
  playGameAudio("audios/dealing-one-card.mp3", 0.45);
  renderHand(player);
  const drawnCard = document.querySelector(`#${player}-hand .card:last-child`);
  if (drawnCard) {
    drawnCard.classList.remove("is-drawing");
    void drawnCard.offsetWidth;
    drawnCard.classList.add("is-drawing");
  }
}
function summonMonster(player, cardId) {
  console.log(`[Game] ${player} attempting to summon card ${cardId}`);
  if (gameState.players[player].normalSummonUsed) {
    console.log(player + " has already used their normal summon this turn.");
    setGameMessage(`${player} already used their normal summon this turn.`);
    return;
  }
  gameState.players[player].normalSummonUsed = true;
  if (gameState.players[player].hand.length === 0) {
    let message = `${player} has no cards in hand to summon.`;
    setGameMessage(message);
    return;
  }
  if (gameState.players[player].field.length >= 4) {
    let message = `${player} has no space on the field to summon a monster.`;
    setGameMessage(message);
    return;
  }
  let index = gameState.players[player].hand.findIndex(
    (card) => card.id === cardId,
  );
  let card = gameState.players[player].hand.splice(index, 1)[0];
  gameState.players[player].field.push(card);
  renderHand(player);
  renderField(player);
  const summonedCard = document.querySelector(
    `#${player}-area .card[data-id='${card.id}']`,
  );
  if (summonedCard) {
    summonedCard.classList.remove("is-summoning");
    void summonedCard.offsetWidth;
    summonedCard.classList.add("is-summoning");
  }
  console.log(`[Game] ${player} summoned ${card.name}`);
  setGameMessage(`${player} summoned ${card.name}.`);
  playGameAudio("audios/summoning.mp3", 0.65);
}
function turnSwitch() {
  if (gameState.currentPlayer === "player") {
    gameState.currentPlayer = "opponent";
  } else {
    gameState.currentPlayer = "player";
  }
  gameState.players[gameState.currentPlayer].normalSummonUsed = false;
  gameState.turn++;
  gameState.phase = "WAITING...";
  console.log(
    `[Game] Turn ${gameState.turn}: ${gameState.currentPlayer}'s draw phase`,
  );
  setGameMessage(`${gameState.currentPlayer}'s turn began.`);
  if (gameState.currentPlayer === "player") {
    showPlayerTurnPopup();
  }
}
function drawPhase() {
  gameState.phase = "draw";
  clickable(gameState.currentPlayer, true);
  clickable(
    gameState.currentPlayer === "player" ? "opponent" : "player",
    false,
  );
  console.log(`[Game] Entering draw phase for ${gameState.currentPlayer}`);
  setGameMessage(`${gameState.currentPlayer} entered the draw phase.`);
  let deck = gameState.currentPlayer === "player" ? plDeck : opDeck;
  deck.onclick = () => {
    drawCard(gameState.currentPlayer);
    deck.onclick = null;
  };
}
function mainPhase() {
  gameState.phase = "main";
  animateMainPhaseHand(gameState.currentPlayer);
  clickable(gameState.currentPlayer, false);
  clickable(
    gameState.currentPlayer === "player" ? "opponent" : "player",
    false,
  );
  console.log(`[Game] Entering main phase for ${gameState.currentPlayer}`);
  setGameMessage(`${gameState.currentPlayer} entered the main phase.`);
  for (
    let i = 0;
    i < gameState.players[gameState.currentPlayer].hand.length;
    i++
  ) {
    let card = gameState.players[gameState.currentPlayer].hand[i];
    let cardElement = document.querySelector(`.card[data-id='${card.id}']`);
    cardElement.addEventListener("click", () => {
      if (gameState.phase !== "main") return;
      summonMonster(gameState.currentPlayer, card.id);
    });
  }
}
function battlePhase() {
  clickable(gameState.currentPlayer, false);
  clickable(
    gameState.currentPlayer === "player" ? "opponent" : "player",
    false,
  );
  gameState.phase = "battle";
  animateBattleZones();
  console.log(`[Game] Entering battle phase for ${gameState.currentPlayer}`);
  setGameMessage(`${gameState.currentPlayer} entered the battle phase.`);
  for (
    let i = 0;
    i < gameState.players[gameState.currentPlayer].field.length;
    i++
  ) {
    let card = gameState.players[gameState.currentPlayer].field[i];
    let cardElement = document.querySelector(`.card[data-id='${card.id}']`);

    cardElement.onclick = () => {
      if (gameState.phase !== "battle") return;
      //turn off clicking
      for (
        let j = 0;
        j < gameState.players[gameState.currentPlayer].field.length;
        j++
      ) {
        let currentCard = gameState.players[gameState.currentPlayer].field[j];
        let currentCardElement = document.querySelector(
          `.card[data-id='${currentCard.id}']`,
        );
        currentCardElement.onclick = null;
      }
      let opponent =
        gameState.currentPlayer === "player" ? "opponent" : "player";
      if (gameState.players[opponent].field.length === 0) {
        animateCard(card.id, "is-direct-attack");
        playGameAudio("audios/attack.mp3", 0.65);
        gameState.players[opponent].lp -= card.atk;
        console.log(
          `${gameState.currentPlayer} attacks directly with ${card.name} for ${card.atk} damage!`,
        );
        setGameMessage(
          `${gameState.currentPlayer} attacked directly with ${card.name} for ${card.atk} damage.`,
        );
        updateLP();
        checkGameEnd();
        return;
      }
      for (let j = 0; j < gameState.players[opponent].field.length; j++) {
        let opponentCard = gameState.players[opponent].field[j];
        let opponentCardElement = document.querySelector(
          `.card[data-id='${opponentCard.id}']`,
        );
        opponentCardElement.onclick = () => {
          if (gameState.phase !== "battle") return;
          //turn off clicking
          for (let j = 0; j < gameState.players[opponent].field.length; j++) {
            let currentCard = gameState.players[opponent].field[j];
            let currentCardElement = document.querySelector(
              `.card[data-id='${currentCard.id}']`,
            );
            currentCardElement.onclick = null;
          }
          let damage = card.atk - opponentCard.atk;
          console.log(
            `[Battle] ${card.name} (${card.atk}) attacks ${opponentCard.name} (${opponentCard.atk}); difference=${damage}`,
          );
          setGameMessage(
            `${gameState.currentPlayer}'s ${card.name} attacked ${opponentCard.name}.`,
          );
          animateCard(card.id, "is-attacking");
          animateCard(opponentCard.id, "targeted");
          playGameAudio("audios/attack.mp3", 0.65);
          setTimeout(() => {
            if (damage >= 0) {
              gameState.players[opponent].field.splice(j, 1);
              gameState.players[opponent].lp -= damage;
              gameState.players[opponent].graveyard = true;
              renderField(opponent);
              renderGraveYard(opponent);
            } else {
              gameState.players[gameState.currentPlayer].field.splice(i, 1);
              gameState.players[gameState.currentPlayer].lp -= Math.abs(damage);
              gameState.players[gameState.currentPlayer].graveyard = true;
              renderField(gameState.currentPlayer);
              renderGraveYard(gameState.currentPlayer);
            }
            updateLP();
            checkGameEnd();
          }, 420);
          return;
        };
      }
    };
  }
}
function endPhase() {
  gameState.phase = "end";
  setGameMessage(`${gameState.currentPlayer} ended the turn.`);
  turnSwitch();
}
async function startGame() {
  if (
    !startButton ||
    !drawButton ||
    !mainPhaseButton ||
    !battlePhaseButton ||
    !endTurnButton ||
    !surrenderButton
  ) {
    console.error("[Game] Could not find all game controls");
    return;
  }

  startButton.disabled = true;

  try {
    await initializeGame();
    console.log(gameState);
    startBackgroundAudio();

    drawButton.disabled = false;
    mainPhaseButton.disabled = true;
    battlePhaseButton.disabled = true;
    endTurnButton.disabled = false;
    surrenderButton.disabled = false;
    gameState.phase = "TURN STARTED";
    setGameMessage(`${gameState.currentPlayer} started the game.`);
    updateHeader();
    drawButton.onclick = () => {
      if (gameState.gameOver) return;
      drawPhase();
      drawButton.disabled = true;
      mainPhaseButton.disabled = false;
      endTurnButton.disabled = false;
      updateHeader();
    };

    mainPhaseButton.onclick = () => {
      if (gameState.gameOver) return;
      mainPhase();
      mainPhaseButton.disabled = true;
      if (gameState.turn > 1) battlePhaseButton.disabled = false;
      endTurnButton.disabled = false;
      updateHeader();
    };

    battlePhaseButton.onclick = () => {
      if (gameState.gameOver) return;
      battlePhase();
      battlePhaseButton.disabled = true;
      endTurnButton.disabled = false;
      updateHeader();
    };

    endTurnButton.onclick = () => {
      if (gameState.gameOver) return;
      endPhase();
      if (gameState.currentPlayer === "opponent") {
        aiTurn();
        return;
      }
      mainPhaseButton.disabled = true;
      battlePhaseButton.disabled = true;
      endTurnButton.disabled = false;
      drawButton.disabled = false;
      updateHeader();
    };

    surrenderButton.onclick = () => {
      console.log(`[Game] ${gameState.currentPlayer} surrendered`);
      endGame(`${gameState.currentPlayer}`, "surrender");
    };

    console.log("[Game] Start controls ready");
    if (gameState.currentPlayer === "opponent") {
      aiTurn();
    }
  } catch (error) {
    startButton.disabled = false;
    console.error("[Game] Initialization failed:", error);
  }
}

function startNewGame() {
  if (gameOverModal) gameOverModal.hidden = true;
  startButton.disabled = false;
  surrenderButton.disabled = true;
  drawButton.disabled = true;
  endTurnButton.disabled = true;
  gameState = {
    turn: 1,
    currentPlayer: "player",
    phase: "WAITING...",
    gameOver: false,

    players: {
      player: {
        lp: 8000,
        deck: [],
        hand: [],
        field: [],
        graveyard: false,
        normalSummonUsed: false,
      },

      opponent: {
        lp: 8000,
        deck: [],
        hand: [],
        field: [],
        graveyard: false,
        normalSummonUsed: false,
      },
    },
  };
  renderHand(gameState.currentPlayer);
  renderHand(gameState.currentPlayer === "player" ? "opponent" : "player");
  renderDeck("player");
  renderDeck("opponent");
  renderGraveYard("player");
  renderGraveYard("opponent");
  renderField("player");
  renderField("opponent");
  clickable("player", false);
  clickable("opponent", false);
  updateLP();
  setGameMessage("Start a new game to begin.");
  updateHeader();
}

newGameButton.onclick = startNewGame;
modalNewGameButton.onclick = startNewGame;
backToStartingPageButton.onclick = () => {
  startNewGame();
  hideGamePage();
};
