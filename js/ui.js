let playerHand = document.getElementById('player-hand');
let opponentHand = document.getElementById('opponent-hand');
let turnNumber = document.getElementById('turn-number');
let curPhase = document.getElementById('current-phase');
let curPlayer = document.getElementById('current-player');
let playerField = document.getElementById('player-area');
let opponentField = document.getElementById('opponent-area');
let playerLP = document.getElementById('player-life-points');
let opponentLP = document.getElementById('opponent-life-points');

// alert('Open The Page In Full Screen Mode (Fn + F11)');
function showGamePage(){
    let startingPage = document.getElementById('starting-page');
    document.body.classList.add('game-started');
    startingPage.classList.add('is-exiting');
    setTimeout(() => {
        startingPage.style.display = 'none';
    }, 650);
}

function createCardHoverInfo(card) {
    const infoElement = document.createElement('div');
    infoElement.className = 'card-hover-info';

    const nameElement = document.createElement('strong');
    nameElement.className = 'card-hover-name';
    nameElement.textContent = card.name || 'Monster card';

    const statsElement = document.createElement('span');
    statsElement.className = 'card-hover-stats';
    statsElement.textContent = `ATK ${card.atk ?? 0}`;

    infoElement.appendChild(nameElement);
    infoElement.appendChild(statsElement);
    return infoElement;
}

function animateCard(cardId, animationClass) {
    const cardElement = document.querySelector(`.card[data-id='${cardId}']`);
    if (!cardElement) return;

    cardElement.classList.remove(animationClass);
    void cardElement.offsetWidth;
    cardElement.classList.add(animationClass);
}

function renderHand(player)
{
    const handElement = player === "player" ? playerHand : opponentHand;
    const hand = gameState.players[player]?.hand;

    if (!handElement || !Array.isArray(hand)) {
        return;
    }

    handElement.replaceChildren();
    hand.forEach((card) => {
        console.log(`Rendering card: ${card.name} (ID: ${card.id})`);
        // console.log(card);
        
        const imageUrl = card.imgs[0].image_url_small;
        if (!imageUrl) {
            console.log("no image url found");
            return;
        }

        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        cardElement.draggable = false;
        if (player === "player") {
            cardElement.appendChild(createCardHoverInfo(card));
        }

        const imageElement = document.createElement('img');
        imageElement.className = 'card-image';
        imageElement.src = imageUrl;
        imageElement.style.pointerEvents = 'none';
        imageElement.alt = card.name || 'Monster card';
        cardElement.appendChild(imageElement);
        handElement.appendChild(cardElement);
    });
}
function renderGraveYard(player) {
    const graveyardElement = document.getElementById(`${player}-graveyard`);
    const graveyard = gameState.players[player]?.graveyard;

    if (!graveyardElement) {
        return;
    }

    graveyardElement.replaceChildren();

    if (graveyard) {
        graveyardElement.textContent = "";
        const imageElement = document.createElement('img');
        imageElement.className = 'card-back-image';
        imageElement.src = 'images/card-back.jpg';
        imageElement.alt = 'Graveyard card';
        imageElement.style.pointerEvents = 'none';

        graveyardElement.appendChild(imageElement);

        const labelElement = document.createElement('span');
        labelElement.className = 'zone-label';
        labelElement.textContent = 'GRAVEYARD';
        graveyardElement.appendChild(labelElement);
        graveyardElement.classList.remove('is-receiving-card');
        void graveyardElement.offsetWidth;
        graveyardElement.classList.add('is-receiving-card');
    }
}
function renderDeck(player){
    const deckElement = document.getElementById(`${player}-deck`);
    const deck = gameState.players[player]?.deck;

    if (!deckElement) {
        return;
    }

    deckElement.replaceChildren();
    
    if (deck.length > 0) {
        deckElement.textContent = "";
        const imageElement = document.createElement('img');
        imageElement.className = 'card-back-image';
        imageElement.src = 'images/card-back.jpg';
        imageElement.alt = 'Deck card';
        imageElement.style.pointerEvents = 'none';
        deckElement.appendChild(imageElement);
        

        const labelElement = document.createElement('span');
        labelElement.className = 'zone-label';
        labelElement.textContent = 'DECK';
        deckElement.appendChild(labelElement);
    }
}
function renderField(player){
    const fieldElement = player === "player" ? playerField : opponentField;
    const field = gameState.players[player]?.field;
    const zones = fieldElement?.querySelectorAll('.monster-zone');
    // console.log(fieldElement);
    // console.log(Array.isArray(field));
    // console.log(zones);
    
    if (!fieldElement || !Array.isArray(field) || !zones) {
        return;
    }

    zones.forEach((zone) => zone.replaceChildren());

    field.slice(0, zones.length).forEach((card, index) => {
        const imageUrl = card.imgs?.[0]?.image_url_small;
        if (!imageUrl) {
            console.warn(`[UI] No image URL found for field card ${card.id}`);
            return;
        }

        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.id = card.id;
        cardElement.draggable = false;
        cardElement.appendChild(createCardHoverInfo(card));

        const imageElement = document.createElement('img');
        imageElement.className = 'card-image';
        imageElement.src = imageUrl;
        imageElement.alt = card.name || 'Monster card';
        imageElement.style.pointerEvents = 'none';
        cardElement.appendChild(imageElement);
        zones[index].appendChild(cardElement);
        console.log(`${player}'s Field card are ${field}`);

    });
}
function updateHeader(){
    turnNumber.textContent = gameState.turn;
    curPlayer.textContent = gameState.currentPlayer;
    curPhase.textContent = gameState.phase;
}
function updateLP(){
    playerLP.textContent = gameState.players.player.lp;
    opponentLP.textContent = gameState.players.opponent.lp;
}
