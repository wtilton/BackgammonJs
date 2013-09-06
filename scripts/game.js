var game = function () {
	this.width = 768;
	this.height = 768;
	this.dice = [];
	this.pips = [];
	this.blackCheckers = [];
	this.whiteCheckers = [];
	this.currentPositions = [];
	this.cubeValue = 1;
	this.turn = 'White';
	this.start = function () {
		Crafty.init(this.width, this.height);
		Crafty.background('#fafaf2');
		Crafty.scene('Loading');
	};
	this.newGame = function () {
		this.blackOff = 0;
		this.whiteOff = 0;
		//Crafty.scene('RollToSeeWhoGoesFirst');
		Crafty.scene('Game');
	};
	this.startGame = function () {
		Crafty.scene('Game');
	};
	this.rollDice = function () {
		var di1 = Crafty.math.randomInt(1, 6);
		var di2 = Crafty.math.randomInt(1, 6);
		this.dice.push(di1);
		this.dice.push(di2);
		if (di1 == di2) { // handle doubles
			this.dice.push(di1);
			this.dice.push(di2);
		}
	};
	this.getPositionsPieceCouldMoveTo = function (fromPos) {
		var positionsPieceCouldMoveTo = [];

		var direction = this.turn == 'White' ? 1 : -1;

		for (var j = 0; j < this.dice.length; j++) {
			var endingPosition = fromPos + (direction * this.dice[j]);
			if (endingPosition > 23) {
				if (this.turn == 'White' && _.min(this.currentPositions) > 17) {
					positionsPieceCouldMoveTo.push(24);
				}
				else if (this.turn == 'Black' && _.max(this.currentPositions) < 6) {
					positionsPieceCouldMoveTo.push(0);
				}
			}
			else {
				var endingPip = this.pips[endingPosition];
				if (endingPip.checkers.length < 2 || _.first(_.pluck(endingPip.checkers, 'side')) == this.turn) {
					positionsPieceCouldMoveTo.push(endingPosition);
				}
			}
		}
		return positionsPieceCouldMoveTo;
	};

	this.highlightPiecesThatCanMove = function () {
		var pieces = this.turn == 'White' ? this.whiteCheckers : this.blackCheckers;
		this.currentPositions = _.uniq(_.pluck(pieces, 'position'));

		for (var i = 0; i < this.currentPositions.length; i++) {
			var currentPosition = this.currentPositions[i];
			var positions = this.getPositionsPieceCouldMoveTo(currentPosition);
			if (positions.length > 0) {
				this.pips[currentPosition].activateChecker();
			}
		}
	};

	this.addChecker = function (side, pos) {
		var checker = Crafty.e(side);
		checker.position = pos;
		this.pips[pos].addChecker(checker);
		if (side == 'WhiteChecker') {
			this.whiteCheckers.push(checker);
		}
		else {
			this.blackCheckers.push(checker);
		}
	};

	this.moveChecker = function (fromPos, toPos) {
		this.pips[fromPos].redraw = true;
		this.pips[fromPos].removeChecker();

		if (toPos < 24 || toPos > -1) {
			this.addChecker(this.turn + 'Checker', toPos);
			_.each(_.where(this.pips, { active: true }), function (pip) { pip.deactivate(); });
			this.pips[toPos].redraw = true;
		}
		else {
			// move off board
		}
		var index = _.indexOf(this.dice, Math.abs(toPos - fromPos));
		this.dice.splice(index, 1);
		this.drawCheckers();
	};

	this.drawCheckers = function () {
		for (var i = 0; i < this.pips.length; i++) {
			if (this.pips[i].redraw) {
				this.pips[i].drawCheckers();
				this.pips[i].redraw = false;
			}
		}
	}

	var movement = {
		checkerSelected: false,
		fromPosition: 0
	};
	Crafty.bind('PipClicked', function (atPos) {
		Game.moveChecker(movement.fromPosition, atPos);
	});

	Crafty.bind('CheckerClicked', function (atPos) {
		if (movement.checkerSelected) {
			movement.checkerSelected = false;
			for (var i = 0; i < Game.currentPositions.length; i++) {
				if (Game.currentPositions[i] != atPos) {
					Game.pips[Game.currentPositions[i]].activateChecker();
				}
			}
			var positions = Game.getPositionsPieceCouldMoveTo(atPos);
			for (var i = 0; i < positions.length; i++) {
				Game.pips[positions[i]].deactivate();
			}
		}
		else {
			movement.checkerSelected = true;
			movement.fromPosition = atPos;
			for (var i = 0; i < Game.currentPositions.length; i++) {
				if (Game.currentPositions[i] != atPos) {
					Game.pips[Game.currentPositions[i]].deactivateChecker();
				}
			}
			var positions = Game.getPositionsPieceCouldMoveTo(atPos);
			for (var i = 0; i < positions.length; i++) {
				Game.pips[positions[i]].activate();
			}
		}

	});
};
var Game = new game();