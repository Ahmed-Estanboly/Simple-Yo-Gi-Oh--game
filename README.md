# Botato Yo-Gi-Oh!

A lightweight, browser-based Yu-Gi-Oh!-inspired duel game. Build a random monster deck from live YGOPRODeck data, summon monsters, attack the opponent, and defeat an AI duelist.

## Features

- Player-versus-AI duels
- Random 40-card decks for the player and opponent
- Normal Monster card data and images loaded from the YGOPRODeck API
- Draw, Main, Battle, and End phases
- Monster summoning and battle damage
- Life Point and deck-out win conditions
- Surrender option
- Card, attack, summon, victory, defeat, and background audio
- Responsive game board with animated duel feedback

## Requirements

- A modern web browser with JavaScript enabled
- Internet access while starting a game, because card data is requested from the YGOPRODeck API
- A local web server. Running the page directly with `file://` may prevent the API request or local assets from working correctly.

## Run Locally

No build step or package installation is required.

### Option 1: Python

From the project folder, run:

```powershell
py -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option 2: VS Code Live Server

Install the **Live Server** extension, open `index.html`, and choose **Open with Live Server**.

## How to Play

1. Open the game and select **Start The Duel**.
2. Select **Start Game** and wait for the decks to load.
3. During your Draw Phase, select your deck or use the **Draw** button.
4. Select **Main Phase**, then select a card in your hand to summon it.
5. Select **Battle Phase**, select one of your monsters, then select an opposing monster to attack it. If the opponent has no monsters, your attack is direct.
6. Select **End Turn**. The AI draws, summons its strongest available monster, and attacks automatically.
7. Reduce the opponent's Life Points to zero, cause the opponent to run out of cards, or use **Surrender** to end the duel.

The duel begins with 8,000 Life Points per player. The first player cannot attack during the first turn.

## Project Structure

```text
.
├── index.html          Game markup and controls
├── css/
│   └── style.css       Game layout, card styling, and animations
├── js/
│   ├── ai.js           Opponent turn logic
│   ├── api.js          YGOPRODeck API requests
│   ├── deck.js         Deck creation and shuffling
│   ├── game.js         Game state, phases, combat, and win conditions
│   └── ui.js            Rendering, audio, navigation, and animations
├── audios/             Duel and interface audio files
└── images/             Local background and card-back images
```

## Data Source

Card information is provided by the [YGOPRODeck API](https://ygoprodeck.com/api-guide/). The game currently requests Normal Monster cards from its public card database at runtime.

## Troubleshooting

- **Cards do not load:** Check the browser console and confirm that the local server has internet access. The game cannot build decks without a successful API response.
- **Audio does not start:** Browsers may block autoplay until you interact with the page. Select a game control first, then try again.
- **The layout looks cramped:** Use the browser in full-screen mode, as requested by the game on startup.

## License

This project is a personal educational/demo project. Yu-Gi-Oh! and related trademarks belong to their respective owners. Card data and images are supplied by the external YGOPRODeck service.

## Creator

Created by Ahmed Estanboly.
E-mail: ahmadestanboly5@gmail.com
