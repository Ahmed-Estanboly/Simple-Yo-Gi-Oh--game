let playerDeck = [];
let opponentDeck = [];
let availableCards = [];

getMonsterData().then(u=>availableCards=u);

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    // Pick a random index from 0 to i
    const j = Math.floor(Math.random() * (i + 1));
    
    // Swap elements array[i] and array[j] using destructuring assignment
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function buildDecks()
{
    await getMonsterData().then(u=>availableCards=u);
    availableCards = shuffle(availableCards);
    for(let i=0;i<40;i++)playerDeck.push(availableCards[i]);
    for(let i=40;i<80;i++)opponentDeck.push(availableCards[i]);
    return {player:playerDeck, opponent:opponentDeck};    
}
