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
		updateHeader();
		setGameMessage("Opponent is choosing an attack...");
		scheduleAITurnStep(attackStep);
	}

	function attackStep() {
		if (gameState.gameOver) return;

		const attacker = ai.field[0];
		if (!attacker) {
			finishAITurn();
			return;
		}

		setGameMessage(`Opponent is considering an attack with ${attacker.name}...`);
		scheduleAITurnStep(() => resolveAttack(attacker));
	}

	function resolveAttack(attacker) {
		if (gameState.gameOver) return;

		if (player.field.length === 0) {
			animateCard(attacker.id, "is-direct-attack");
			player.lp -= attacker.atk;
			setGameMessage(`Opponent attacked directly with ${attacker.name} for ${attacker.atk} damage.`);
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

		const target = player.field[targetIndex];
		const damage = attacker.atk - target.atk;
		setGameMessage(`Opponent's ${attacker.name} attacked ${target.name}.`);
		animateCard(attacker.id, "is-attacking");
		animateCard(target.id, "targeted");
		setTimeout(() => {
			if (damage >= 0) {
				player.field.splice(targetIndex, 1);
				player.lp -= damage;
				player.graveyard = true;
				renderField("player");
				renderGraveYard("player");
			} else {
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
		updateHeader();
	}
}