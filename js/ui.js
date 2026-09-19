let playerHand = document.getElementById("player-hand");
let opponentHand = document.getElementById("opponent-hand");
let turnNumber = document.getElementById("turn-number");
let curPhase = document.getElementById("current-phase");
let curPlayer = document.getElementById("current-player");
let playerField = document.getElementById("player-area");
let opponentField = document.getElementById("opponent-area");
let playerLP = document.getElementById("player-life-points");
let opponentLP = document.getElementById("opponent-life-points");
let turnPopup = document.getElementById("turn-popup");

const audioTracks = {
  intro: new Audio("audios/yu_gi_oh_intro.mp3"),
  background: new Audio("audios/Yo-Gi-Oh! background soundtrack.mp3"),
  attack: "audios/attack.mp3",
  deal: "audios/dealing-one-card.mp3",
  defeat: "audios/lost.mp3",
  summon: "audios/summoning.mp3",
  surrender: "audios/surrender.mp3",
  victory: "audios/flawless_victory.mp3",
};

audioTracks.background.loop = true;
audioTracks.background.volume = 0.18;
audioTracks.intro.volume = 0.55;

function playGameAudio(track, volume = 0.6) {
  const source = typeof track === "string" ? track : track.src;
  const audio = typeof track === "string" ? new Audio(source) : track;
  audio.volume = volume;
  audio.currentTime = 0;
  audio.play().catch(() => {});
  return audio;
}

function startBackgroundAudio() {
  if (audioTracks.background.paused) {
    audioTracks.background.play().catch(() => {});
  }
}

function stopBackgroundAudio() {
  audioTracks.background.pause();
  audioTracks.background.currentTime = 0;
}

function startIntroAudio() {
  const startingPage = document.getElementById("starting-page");
  if (!startingPage || document.body.classList.contains("game-started")) return;

  playGameAudio(audioTracks.intro, 0.55);
}

window.addEventListener("load", startIntroAudio);

let turnPopupTimeout;

function showPlayerTurnPopup() {
  if (!turnPopup) return;

  clearTimeout(turnPopupTimeout);
  turnPopup.setAttribute("aria-hidden", "false");
  turnPopup.classList.remove("is-visible");
  void turnPopup.offsetWidth;
  turnPopup.classList.add("is-visible");
  turnPopupTimeout = setTimeout(() => {
    turnPopup.classList.remove("is-visible");
    turnPopup.setAttribute("aria-hidden", "true");
  }, 1000);
}

function showGamePage() {
  let startingPage = document.getElementById("starting-page");
  document.body.classList.add("game-started");
  startingPage.classList.add("is-exiting");
  setTimeout(() => {
    startingPage.style.display = "none";
  }, 650);
}
function hideGamePage() {
  let startingPage = document.getElementById("starting-page");
  stopBackgroundAudio();
  document.body.classList.remove("game-started");
  startingPage.classList.remove("is-exiting");
  startingPage.classList.add("is-entering");
  startingPage.style.display = "block";
  requestAnimationFrame(() => {
    startingPage.classList.remove("is-entering");
  });
  startIntroAudio();
}
function createCardHoverInfo(card) {
  const infoElement = document.createElement("div");
  infoElement.className = "card-hover-info";

  const nameElement = document.createElement("strong");
  nameElement.className = "card-hover-name";
  nameElement.textContent = card.name || "Monster card";

  const statsElement = document.createElement("span");
  statsElement.className = "card-hover-stats";
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

function renderHand(player) {
  const handElement = player === "player" ? playerHand : opponentHand;
  const hand = gameState.players[player]?.hand;

  if (!handElement || !Array.isArray(hand)) {
    return;
  }

  handElement.replaceChildren();
  hand.forEach((card) => {
    console.log(`Rendering card: ${card.name} (ID: ${card.id})`);
    // console.log(card);

    let imageUrl = card.imgs[0].image_url_small;
    if (player === "opponent") {
      imageUrl = "images/card-back.jpg";
    }
    if (!imageUrl) {
      console.log("no image url found");
      return;
    }

    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.dataset.id = card.id;
    cardElement.draggable = false;
    if (player === "player") {
      cardElement.appendChild(createCardHoverInfo(card));
    }

    const imageElement = document.createElement("img");
    imageElement.className = "card-image";
    imageElement.src = imageUrl;
    imageElement.style.pointerEvents = "none";
    imageElement.alt = card.name || "Monster card";
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
    const imageElement = document.createElement("img");
    imageElement.className = "card-back-image";
    imageElement.src = "images/card-back.jpg";
    imageElement.alt = "Graveyard card";
    imageElement.style.pointerEvents = "none";

    graveyardElement.appendChild(imageElement);

    const labelElement = document.createElement("span");
    labelElement.className = "zone-label";
    labelElement.textContent = "GRAVEYARD";
    graveyardElement.appendChild(labelElement);
    graveyardElement.classList.remove("is-receiving-card");
    void graveyardElement.offsetWidth;
    graveyardElement.classList.add("is-receiving-card");
  }
}
function renderDeck(player) {
  const deckElement = document.getElementById(`${player}-deck`);
  const deck = gameState.players[player]?.deck;

  if (!deckElement) {
    return;
  }

  deckElement.replaceChildren();

  if (deck.length > 0) {
    deckElement.textContent = "";
    const imageElement = document.createElement("img");
    imageElement.className = "card-back-image";
    imageElement.src = "images/card-back.jpg";
    imageElement.alt = "Deck card";
    imageElement.style.pointerEvents = "none";
    deckElement.appendChild(imageElement);

    const labelElement = document.createElement("span");
    labelElement.className = "zone-label";
    labelElement.textContent = "DECK";
    deckElement.appendChild(labelElement);
  }
}
function renderField(player) {
  const fieldElement = player === "player" ? playerField : opponentField;
  const field = gameState.players[player]?.field;
  const zones = fieldElement?.querySelectorAll(".monster-zone");
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

    const cardElement = document.createElement("div");
    cardElement.className = "card";
    cardElement.dataset.id = card.id;
    cardElement.draggable = false;
    cardElement.appendChild(createCardHoverInfo(card));

    const imageElement = document.createElement("img");
    imageElement.className = "card-image";
    imageElement.src = imageUrl;
    imageElement.alt = card.name || "Monster card";
    imageElement.style.pointerEvents = "none";
    cardElement.appendChild(imageElement);
    zones[index].appendChild(cardElement);
    console.log(`${player}'s Field card are ${field}`);
  });
}
function updateHeader() {
  turnNumber.textContent = gameState.turn;
  curPlayer.textContent = gameState.currentPlayer;
  curPhase.textContent = gameState.phase;
}
function updateLP() {
  playerLP.textContent = gameState.players.player.lp;
  opponentLP.textContent = gameState.players.opponent.lp;
}
alert('Open The Page In Full Screen Mode (Fn + F11)');
