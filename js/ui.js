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
};

audioTracks.background.loop = true;
audioTracks.background.volume = 0.18;
audioTracks.intro.volume = 0.55;

alert("Use The Browser's Full screen mode");

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
    audioTracks.background.volume = 0.7;
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
  }, 1200);
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

function animateBattleClash(attackerId, targetId) {
  const attacker = document.querySelector(`.card[data-id='${attackerId}']`);
  const target = document.querySelector(`.card[data-id='${targetId}']`);
  if (!attacker || !target) return;

  const attackerIsPlayer = attacker.closest("#player-area") !== null;
  const targetIsPlayer = target.closest("#player-area") !== null;
  const animationClasses = [
    "is-clashing-player-attacker",
    "is-clashing-opponent-attacker",
    "is-clashing-player-target",
    "is-clashing-opponent-target",
  ];
  const attackerRect = attacker.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const attackerCenter = attackerRect.left + attackerRect.width / 2;
  const targetCenter = targetRect.left + targetRect.width / 2;
  const clashTravel =
    Math.abs(targetCenter - attackerCenter) / 2 + 6;

  [attacker, target].forEach((card) => {
    card.classList.remove(...animationClasses);
    card.style.setProperty("--clash-travel", `${clashTravel}px`);
  });
  void document.body.offsetWidth;
  attacker.classList.add(
    attackerIsPlayer
      ? "is-clashing-player-attacker"
      : "is-clashing-opponent-attacker",
  );
  target.classList.add(
    targetIsPlayer
      ? "is-clashing-player-target"
      : "is-clashing-opponent-target",
  );
}

function animateBattleZones() {
  const playerZones = document.querySelectorAll(
    "#player-monster-zones .monster-zone",
  );
  const opponentZones = document.querySelectorAll(
    "#opponent-monster-zones .monster-zone",
  );

  [...playerZones, ...opponentZones].forEach((zone) => {
    zone.classList.remove("is-battle-player-glow", "is-battle-opponent-glow");
  });

  void document.body.offsetWidth;
  playerZones.forEach((zone) => zone.classList.add("is-battle-player-glow"));
  opponentZones.forEach((zone) =>
    zone.classList.add("is-battle-opponent-glow"),
  );

  setTimeout(() => {
    [...playerZones, ...opponentZones].forEach((zone) => {
      zone.classList.remove(
        "is-battle-player-glow",
        "is-battle-opponent-glow",
      );
    });
  }, 2000);
}

function animateMainPhaseHand(player) {
  const handElement = document.getElementById(`${player}-hand`);
  if (!handElement) return;

  handElement.querySelectorAll(".card.is-drawing").forEach((card) => {
    card.classList.remove("is-drawing");
  });
  handElement.classList.remove("is-main-phase-glow");
  void document.body.offsetWidth;
  handElement.classList.add("is-main-phase-glow");

  setTimeout(() => {
    handElement.classList.remove("is-main-phase-glow");
  }, 1000);
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
  console.log(player);
  // console.log(gameState);
  
  if (!deckElement) {
    return;
  }

  deckElement.classList.toggle(
    "is-draw-phase",
    gameState.phase === "draw" && gameState.currentPlayer === player,
  );

  deckElement.replaceChildren();
  let index = player === "player"?playerCardIndex:opponentCardIndex;
  if (deck.length >= index) {
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
    
    if(deck.length === index)deckElement.textContent = "";
  }
  else{
    deckElement.textContent = "";
  }
}
function renderField(player) {
  const fieldElement = player === "player" ? playerField : opponentField;
  const field = gameState.players[player]?.field;
  const zones = fieldElement?.querySelectorAll(".monster-zone");
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
  document.querySelectorAll(".deck-zone").forEach((deckElement) => {
    const player = deckElement.id === "player-deck" ? "player" : "opponent";
    deckElement.classList.toggle(
      "is-draw-phase",
      gameState.phase === "draw" && gameState.currentPlayer === player,
    );
  });
}
function updateLP() {
  playerLP.textContent = gameState.players.player.lp;
  opponentLP.textContent = gameState.players.opponent.lp;
}
