const aiThinkingTime = 1000;

function scheduleAITurnStep(step) {
  setTimeout(step, aiThinkingTime);
}

function aiTurn() {
  if (gameState.gameOver || gameState.currentPlayer !== "opponent") {
    return;
  }

  const ai = gameState.players.opponent;
  const player = gameState.players.player;

  drawButton.disabled = true;
  mainPhaseButton.disabled = true;
  battlePhaseButton.disabled = true;
  endTurnButton.disabled = true;
  surrenderButton.disabled = true;
  setGameMessage("Opponent is thinking...");
  scheduleAITurnStep(drawStep);

  function drawStep() {
    if (gameState.gameOver) return;

    gameState.phase = "draw";
    updateHeader();
    drawCard("opponent");
    scheduleAITurnStep(mainStep);
  }

  function mainStep() {
    if (gameState.gameOver) return;

    gameState.phase = "main";
    animateMainPhaseHand("opponent");
    updateHeader();
    setGameMessage("Opponent is thinking about its move...");
    scheduleAITurnStep(summonStep);
  }

  function summonStep() {
    if (gameState.gameOver) return;

    if (!ai.normalSummonUsed && ai.hand.length > 0 && ai.field.length < 4) {
      const strongestCard = ai.hand.reduce((strongest, card) =>
        card.atk > strongest.atk ? card : strongest,
      );
      summonMonster("opponent", strongestCard.id);
    }

    scheduleAITurnStep(battleStep);
  }

  function battleStep() {
    if (gameState.gameOver) return;
    if (gameState.turn === 1) {
      setGameMessage("Opponent cannot attack on the first turn.");
      finishAITurn();
      return;
    }

    gameState.phase = "battle";
    animateBattleZones();
    updateHeader();
    setGameMessage("Opponent is choosing an attack...");
    scheduleAITurnStep(attackStep);
  }

  function attackStep() {
    if (gameState.gameOver) return;
    const strongestCard = ai.field.reduce((strongest, card) =>
      card.atk > strongest.atk ? card : strongest,
    );
    const attacker = strongestCard;
    console.log("attaker: ",attacker);
    console.log("ai.field[0]: ",ai.field[0]);
    if (!attacker) {
      finishAITurn();
      return;
    }

    setGameMessage(
      `Opponent is considering an attack with ${attacker.name}...`,
    );
    scheduleAITurnStep(() => resolveAttack(attacker));
  }

  function resolveAttack(attacker) {
    if (gameState.gameOver) return;

    if (player.field.length === 0) {
      playGameAudio("audios/attack.mp3", 0.65);
      animateCard(attacker.id, "is-direct-attack");
      player.lp -= attacker.atk;
      setGameMessage(
        `Opponent attacked directly with ${attacker.name} for ${attacker.atk} damage.`,
      );
      updateLP();
      checkGameEnd();
      finishAITurn();
      return;
    }

    let targetIndex = 0;
    for (let index = 1; index < player.field.length; index++) {
      if (player.field[index].atk < player.field[targetIndex].atk) {
        targetIndex = index;
      }
    }
    console.log("victom card name: ",player.field[targetIndex].name);
    console.log("attacker card name: ",attacker.name);
    console.log("victom card atk: ",player.field[targetIndex].atk);
    console.log("attacker card atk: ",attacker.atk);

    if(player.field[targetIndex].atk > attacker.atk) {
      finishAITurn();
      return;
    }
    const target = player.field[targetIndex];
    const damage = attacker.atk - target.atk;
    setGameMessage(`Opponent's ${attacker.name} attacked ${target.name}.`);
    playGameAudio("audios/attack.mp3", 0.65);
    animateCard(attacker.id, "is-attacking");
    animateCard(target.id, "targeted");
    setTimeout(() => {
      if (damage > 0) {
        player.field.splice(targetIndex, 1);
        player.lp -= damage;
        player.graveyard = true;
        renderField("player");
        renderGraveYard("player");
      }
      else if (damage === 0) {
        player.field.splice(targetIndex, 1);
        renderField("player");
        ai.field.splice(0, 1);
        renderField("opponent");
        player.graveyard = true;
        ai.graveyard = true;
        renderGraveYard("player");
        renderGraveYard("opponent");
      }
       else {
        ai.field.splice(0, 1);
        ai.lp -= Math.abs(damage);
        ai.graveyard = true;
        renderField("opponent");
        renderGraveYard("opponent");
      }

      updateLP();
      checkGameEnd();
      finishAITurn();
    }, 420);
  }

  function finishAITurn() {
    if (gameState.gameOver) return;

    endPhase();
    drawButton.disabled = false;
    mainPhaseButton.disabled = true;
    battlePhaseButton.disabled = true;
    endTurnButton.disabled = false;
    surrenderButton.disabled = false;
    setGameMessage("Your turn!");
    updateHeader();
  }
}
