let playerDeck = [];
let opponentDeck = [];
let availableCards = [];

getMonsterData().then((u) => (availableCards = u));

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));

    // Swap elements array[i] and array[j] using destructuring assignment
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function buildDecks() {
  playerDeck = [];
  opponentDeck = [];
  console.log("[Deck] Building player and opponent decks");
  await getMonsterData().then((u) => (availableCards = u));
  console.log(`[Deck] Available cards: ${availableCards.length}`);
  availableCards = shuffle(availableCards);
  for (let i = 0; i < 40; i++) playerDeck.push(availableCards[i]);
  for (let i = 40; i < 80; i++) opponentDeck.push(availableCards[i]);
  console.log(
    `[Deck] Decks built: player=${playerDeck.length}, opponent=${opponentDeck.length}`,
  );
  return { player: playerDeck, opponent: opponentDeck };
}
