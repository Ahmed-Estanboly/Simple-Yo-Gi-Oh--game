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

async function initializeGame(){
    let decks = {...await buildDecks()};
    gameState.players.player.deck = decks.player;
    gameState.players.opponent.deck = decks.opponent;
    
    gameState.players.player.hand = gameState.players.player.deck.slice(0, 4);
    gameState.players.opponent.hand = gameState.players.opponent.deck.slice(0, 4);
    playerCardIndex+=4;
    opponentCardIndex+=4;

    gameState.players.player.lp = 8000;
    gameState.players.opponent.lp = 8000;

    gameState.turn = 1;
    gameState.phase = "draw";
    gameState.gameOver = false;
    gameState.players.player.normalSummonUsed = false;
    gameState.players.opponent.normalSummonUsed = false;
    gameState.players.player.graveyard = false;
    gameState.players.opponent.graveyard = false;
    if(Math.floor(Math.random() * 10)%2) {
        gameState.currentPlayer = "opponent";
    }
    else{
        gameState.currentPlayer = "player";
    }
    renderHand(gameState.currentPlayer);
    renderDeck("player");
    renderDeck("opponent");
    renderGraveYard("player");
    renderGraveYard("opponent");
}

function drawCard(player) {
    if (playerCardIndex >= gameState.players[player].deck.length) {
        let message = `${player} has no more cards to draw.`;
        document.getElementById('game-message').textContent = message;
        return;
    }
    if (player === "player") {
        gameState.players.player.hand.push(gameState.players.player.deck[playerCardIndex]);
        playerCardIndex++;
    } else if (player === "opponent") {
        gameState.players.opponent.hand.push(gameState.players.opponent.deck[opponentCardIndex]);
        opponentCardIndex++;
    }
    renderHand(player);
}
function summonMonster(player, cardId) {
    if (gameState.players[player].normalSummonUsed) {
        console.log(player + " has already used their normal summon this turn.");
        return;
    }
    gameState.players[player].normalSummonUsed = true;
    if (gameState.players[player].hand.length === 0) {
        let message = `${player} has no cards in hand to summon.`;
        document.getElementById('game-message').textContent = message;
        return;
    }
    if(gameState.players[player].field.length >= 5) {
        let message = `${player} has no space on the field to summon a monster.`;
        document.getElementById('game-message').textContent = message;
        return;
    }
    let index = gameState.players[player].hand.findIndex(card => card.id == cardId);
    let card = gameState.players[player].hand.splice(index, 1)[0];
    gameState.players[player].field.push(card);
}   
function turnSwitch(){
    if (gameState.currentPlayer === "player") {
        gameState.currentPlayer = "opponent";
    } else {
        gameState.currentPlayer = "player";
    }
    gameState.players[gameState.currentPlayer].normalSummonUsed = false;
    gameState.turn++;
    gameState.phase = "draw";
}
function drawPhase() {
    drawCard(gameState.currentPlayer);
    gameState.phase = "main";
}
function mainPhase() {
    for (let i = 0; i < gameState.players[gameState.currentPlayer].hand.length; i++) {
        let card = gameState.players[gameState.currentPlayer].hand[i];
        let cardElement = document.querySelector(`.card[data-id='${card.id}']`);
        cardElement.addEventListener('click', () => {
            summonMonster(gameState.currentPlayer, card.id);
            renderHand(gameState.currentPlayer);
        });
    }
    gameState.phase = "battle";
}
function battlePhase() {
    for (let i = 0; i < gameState.players[gameState.currentPlayer].field.length; i++) {
        
        let card = gameState.players[gameState.currentPlayer].field[i];
        let cardElement = document.querySelector(`.card[data-id='${card.id}']`);

        cardElement.addEventListener('click', () => {
            //turn off clicking
            for (let j = 0; j < gameState.players[gameState.currentPlayer].field.length; j++) {
                let currentCard = gameState.players[gameState.currentPlayer].field[j];
                let currentCardElement = document.querySelector(`.card[data-id='${currentCard.id}']`);
                currentCardElement.style.pointerEvents = 'none';
            }
            let opponent = gameState.currentPlayer === "player" ? "opponent" : "player";
            
            for (let j = 0; j < gameState.players[opponent].field.length; j++) {
            
                let opponentCard = gameState.players[opponent].field[j];
                let opponentCardElement = document.querySelector(`.card[data-id='${opponentCard.id}']`);
                opponentCardElement.addEventListener('click', () => {
                    //turn off clicking
                    for (let j = 0; j < gameState.players[opponent].field.length; j++) {
                        let currentCard = gameState.players[opponent].field[j];
                        let currentCardElement = document.querySelector(`.card[data-id='${currentCard.id}']`);
                        currentCardElement.style.pointerEvents = 'none';
                    }
                    let damage = card.atk - opponentCard.atk;
                    if (damage >= 0) {
                        gameState.players[opponent].field.splice(j, 1);
                        gameState.players[opponent].lp -= damage;
                        gameState.players[opponent].graveyard = true;
                        renderGraveYard(opponent);
                    }
                    else{
                        gameState.players[gameState.currentPlayer].field.splice(i, 1);
                        gameState.players[gameState.currentPlayer].graveyard = true;
                        renderGraveYard(gameState.currentPlayer);
                    }
                    gameState.phase = "end";
                    return;
                });
            }
        });
    }
}
function endPhase() {
    //turn on clicking and remove event listners
    for (let j = 0; j < gameState.players.player.field.length; j++) {
        let currentCard = gameState.players.player.field[j];
        let currentCardElement = document.querySelector(`.card[data-id='${currentCard.id}']`);
        currentCardElement.style.pointerEvents = 'auto';
        currentCardElement.removeEventListener('click', () => {});
    }
    for (let j = 0; j < gameState.players.opponent.field.length; j++) {
        let currentCard = gameState.players.opponent.field[j];
        let currentCardElement = document.querySelector(`.card[data-id='${currentCard.id}']`);
        currentCardElement.style.pointerEvents = 'auto';
        currentCardElement.removeEventListener('click', () => {});
    }
    turnSwitch();
}
function mainGame(){
    initializeGame();
    while(!gameState.gameOver)
    {
        drawPhase();
        mainPhase();
        battlePhase();
        endPhase();
    }
}
mainGame();
