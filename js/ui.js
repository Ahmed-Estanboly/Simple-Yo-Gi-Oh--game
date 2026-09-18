let playerHand = document.getElementById('player-hand');
let opponentHand = document.getElementById('opponent-hand');

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

        const imageElement = document.createElement('img');
        imageElement.className = 'card-image';
        imageElement.src = imageUrl;
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
        graveyardElement.appendChild(imageElement);

        const labelElement = document.createElement('span');
        labelElement.className = 'zone-label';
        labelElement.textContent = 'GRAVEYARD';
        graveyardElement.appendChild(labelElement);
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
        deckElement.appendChild(imageElement);

        const labelElement = document.createElement('span');
        labelElement.className = 'zone-label';
        labelElement.textContent = 'DECK';
        deckElement.appendChild(labelElement);
    }
}