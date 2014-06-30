// 1 - Start enchant.js
enchant(); 

// first get the size from the window
// if that didn't work, get it from the body
var screenSize = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var screenWidth = 694;
var screenHeight = 954;
var leftBorder = 112;
var rightBorder = 518;
var topBorder = 606;
var bottomBorder = 870;
var carSpeed = 300; // speed of still objects passing by
var gameScore = 0;

// 2 - On document load 
window.onload = function() {
	// 3 - Starting point
	doCustomActions(); // run from custom.js

	var game = new Game(screenWidth, screenHeight);

	// 4 - Preload resources
	game.preload('img/gameBg.png', 'img/dogeCarSheet.png', 'img/dogecoin64.png', 'img/pandacoin64.png',
		'img/greenCarSheet.png', 'img/blueCarSheet.png', 'img/greyCarSheet.png', 'img/yellowCarSheet.png', 
		'img/jeepSheet.png', 'img/summerTree60.png', 'img/summerPineTree60.png', 'img/whiteLaneStripe8x40.png',
		'img/bomb40.gif', 'img/laser11x39.png', 'img/fire48.gif'); 

	if (typeof isWebapp !== 'undefined' && isWebapp) { // only load sounds for browser game - phonegap freezes up otherwise
		game.preload('snd/170147__timgormly__8-bit-coin.mp3', 'snd/170141__timgormly__8-bit-bump.mp3', 
				'snd/170140__timgormly__8-bit-bumper.mp3', 'snd/170144__timgormly__8-bit-explosion2.mp3', 
				'snd/170169__timgormly__8-bit-powerup.mp3', 'snd/170170__timgormly__8-bit-pickup.mp3', 
				'snd/170161__timgormly__8-bit-laser.mp3', 'snd/bgm.mp3');
	}

	// 5 - Game settings
	game.fps = 30;
	if (screenSize.width > screenWidth && screenSize.height > screenHeight) {
		game.scale = 1;
	}
	else {
		var scale1 = screenSize.width / screenWidth;
		var scale2 = screenSize.height / screenHeight;
		game.scale = (scale1 > scale2 ? scale2 : scale1) * .99;
	}

	game.onload = function() {
		// Once Game finishes loading
		// load sounds if user is playing in browser - phonegap freezes up if we let android load game.assets for sound
		if (typeof isWebapp !== 'undefined' && isWebapp) { 
			if (typeof snd !== 'undefined') { // we are playing game in a browser - use enchant.js sound system
				snd['coin'] = game.assets['snd/170147__timgormly__8-bit-coin.mp3']; // player picks up coin
				snd['bump'] = game.assets['snd/170141__timgormly__8-bit-bump.mp3']; // player gets hit by enemy car
				snd['bumper'] = game.assets['snd/170140__timgormly__8-bit-bumper.mp3']; // jeep drops bomb
				snd['explosion'] = game.assets['snd/170144__timgormly__8-bit-explosion2.mp3']; // player shot hits enemy, or player hits bomb
				snd['powerup'] = game.assets['snd/170169__timgormly__8-bit-powerup.mp3']; 
				snd['pickup'] = game.assets['snd/170170__timgormly__8-bit-pickup.mp3']; // player leaves enemy car in the dust
				snd['laser'] = game.assets['snd/170161__timgormly__8-bit-laser.mp3']; // player shoots laser
			}
		}

		var scene = new SceneGameOver(0);
		game.pushScene(scene);
	}

	// 7 - Start
	game.start();   

	var SceneGame = Class.create(Scene, {
		// The main gameplay scene.     
		initialize: function() {
			trackPage('start');

			// 1 - Call superclass constructor
			Scene.apply(this);
			// 2 - Access to the game singleton instance
			var game = Game.instance;
			// 3 - Create child nodes
			// Label
			var label = new Label('SCORE<br/><br/>0');
			label.x = 9;
			label.y = 32;        
			label.color = 'white';
			label.font = '32px Comic Sans MS';
			label.textAlign = 'center';
			label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.scoreLabel = label;

			//bg = new Sprite(320,440);
			var bg = new Sprite(screenWidth, screenHeight);
			bg.image = game.assets['img/gameBg.png'];

			// Car
			var car = new DogeCar();
			car.x = game.width/2 - car.width/2;
			//car.y = 280;
			car.y = topBorder + 100;
			this.car = car;

			// object groups
			this.stripeGroup = new Group();
			this.bombGroup = new Group();
			this.sceneryGroup = new Group();
			this.coinGroup = new Group();
			this.laserGroup = new Group();
			this.enemyGroup = new Group();
			this.fireGroup = new Group();

			// 4 - Add child nodes        
			this.addChild(bg);
			this.addChild(this.stripeGroup);
			this.addChild(this.bombGroup);
			this.addChild(this.sceneryGroup);
			this.addChild(this.coinGroup);
			this.addChild(this.laserGroup);
			this.addChild(this.enemyGroup);
			this.addChild(this.fireGroup);
			this.addChild(car);
			this.addChild(label);

			// Touch listener
			this.addEventListener(Event.TOUCH_MOVE, this.handleTouchMove);
			this.addEventListener(Event.TOUCH_START, this.handleTouchStart);
			//this.addEventListener(Event.TOUCH_END, this.handleTouchStop);
	
			// Update
			this.addEventListener(Event.ENTER_FRAME, this.update);

			// Instance variables
			this.generateStripeTimer = 0;
			this.generateSceneryTimer = 0;
			this.generateCoinTimer = 0;
			this.generateEnemyTimer = 0;
			this.generateBombTimer = 0;
			this.scoreTimer = 0;
			gameScore = 0;

			// Background music
			//this.bgm = game.assets['snd/bgm.mp3']; // Add this line
			// Start BGM
			//this.bgm.play();
		},

		// user clicks on area of screen
		handleTouchStart: function (evt) {
			this.handleTouchMove(evt);
		},

		// user drags car
		handleTouchMove: function(evt) {
			//console.log('MOVE');
			var xdir = 0;
			if (evt.x < this.car.x - 5) {
				xdir = -1;
			}
			else if (evt.x > this.car.x + 5) {
				 xdir = 1;
			}

			//console.log('evt.y:', evt.y, 'this.car.y:', this.car.y);
			var ydir = 0;
			if (evt.y < this.car.y - 5) {
				ydir = -1;
			}
			else if (evt.y > this.car.y + 5) {
				ydir = 1;
			}

			//var direction = evt.x < this.car.x ? 0 : 1;
			this.car.move(xdir, ydir, 2);
		},

		setScore: function (value) {
		    gameScore = value;
		    this.scoreLabel.text = 'SCORE<br/>' + gameScore;
		},

		scoreTimeIncrement: .5, // amount of time before score increases

		update: function(evt) {
			// Score increase as time passes
			this.scoreTimer += evt.elapsed * 0.001;
			if (this.scoreTimer >= this.scoreTimeIncrement) {
				this.setScore(gameScore + 1);
				this.scoreTimer -= this.scoreTimeIncrement;
			}

			// Check if it's time to create a new lane stripe
			this.generateStripeTimer += evt.elapsed * 0.001;
			var  timeBeforeNext = .7; // increase to make enemy cars more rare
			if (this.generateStripeTimer >= timeBeforeNext) { 
				this.generateStripeTimer -= timeBeforeNext;
				this.stripeGroup.addChild(new Stripe());
			}

			// Check if it's time to create a new set of obstacles
			this.generateEnemyTimer += evt.elapsed * 0.001;
			timeBeforeNext = 8 + Math.floor(Math.random() * 6); // increase to make enemy cars more rare
			if (this.generateEnemyTimer >= timeBeforeNext) { 
				this.generateEnemyTimer -= timeBeforeNext;

				var car = null;
				var carChoice = Math.floor(Math.random() * 7);
				switch (carChoice) {
					case 0:
					case 1:
						car = new NPCVehicle('green car', Math.floor(Math.random()*3), 'img/greenCarSheet.png', 60, 126, 6);
						break;
					case 2:
					case 3:
						car = new NPCVehicle('blue car', Math.floor(Math.random()*3), 'img/blueCarSheet.png', 60, 126, 6);
						break;
					case 4:
						car = new NPCVehicle('yellow car', Math.floor(Math.random()*3), 'img/yellowCarSheet.png', 76, 120, 8);
						break;
					case 5:
						car = new NPCVehicle('grey car', Math.floor(Math.random()*3), 'img/greyCarSheet.png', 77, 120, 8);
						break;
					default:
						car = new NPCVehicle('jeep', Math.floor(Math.random()*3), 'img/jeepSheet.png', 76, 105, 9);

				}
				this.enemyGroup.addChild(car);
			}

			// Check enemy car collision
			for (var i = this.enemyGroup.childNodes.length - 1; i >= 0; i--) {
				var car = this.enemyGroup.childNodes[i];

				if (car.intersect(this.car)) { // player car gets hit!
					if (typeof snd['bump'] !== 'undefined') {
						snd['bump'].play();
					}
					//this.enemyGroup.removeChild(car);
					this.car.isDead = true;
					var fire = new Fire(this.car.x, this.car.y);
					this.fireGroup.addChild(fire);

					// Game over
				    //this.bgm.stop();
					Game.instance.replaceScene(new SceneGameOver(gameScore));
				    break;
				}

				for (var j = 0; j < this.laserGroup.childNodes.length; j++) {
					var laser = this.laserGroup.childNodes[j];
					if (car.intersect(laser)) {
						if (typeof snd['explosion'] !== 'undefined') {
							snd['explosion'].play();
						}
						this.laserGroup.removeChild(laser);
						//this.enemyGroup.removeChild(car);
						car.isDead = true;
						var fire = new Fire(car.x, car.y);
						this.fireGroup.addChild(fire);

						this.setScore(gameScore += 50);
					}
				}

				// Check if it's time to create a new bomb
				if (car.name === 'jeep') { // jeeps can drop bombs
					this.generateBombTimer += evt.elapsed * 0.001;
					timeBeforeNext = 3 + Math.floor(Math.random() * 3); // increase to make bombs more rare
					if (this.generateBombTimer >= timeBeforeNext) { 
						this.generateBombTimer -= timeBeforeNext;
						var bomb = new Bomb(car.x, car.y + 30);
						this.bombGroup.addChild(bomb);
						if (typeof snd['bumper'] !== 'undefined') {
							snd['bumper'].play();
						}
					}
				}
			}

			// Check bomb collision
			for (var i = this.bombGroup.childNodes.length - 1; i >= 0; i--) {
				var bomb = this.bombGroup.childNodes[i];

				if (bomb.intersect(this.car)) { // player car gets hit by bomb!
					if (typeof snd['explosion'] !== 'undefined') {
						snd['explosion'].play();
					}
					this.enemyGroup.removeChild(bomb);

					this.car.isDead = true;
					var fire = new Fire(this.car.x, this.car.y);
					this.fireGroup.addChild(fire);

					// Game over
				    //this.bgm.stop();
					Game.instance.replaceScene(new SceneGameOver(gameScore));
				    break;
				}
			}

			// Check if it's time to create a new set of coins
			this.generateCoinTimer += evt.elapsed * 0.001;
			timeBeforeNext = 8 + Math.floor(Math.random() * 5); // increase to make coins more rare
			if (this.generateCoinTimer >= timeBeforeNext) { 
				this.generateCoinTimer -= timeBeforeNext;
				var xpos = leftBorder + 10 + Math.floor(Math.random() * (rightBorder - leftBorder - 10));
				var coin = Math.floor(Math.random() * 4) === 0 ? new Coin(xpos, 'pandacoin') : new Coin(xpos, 'dogecoin');
				this.coinGroup.addChild(coin);
			}
			// Check collision
			for (var i = this.coinGroup.childNodes.length - 1; i >= 0; i--) {
				var coin = this.coinGroup.childNodes[i];

				if (coin.intersect(this.car)) { // player car picks up coin
					if (typeof snd['coin'] !== 'undefined') {
						snd['coin'].play();
					}
					this.coinGroup.removeChild(coin);    
					this.setScore(gameScore += coin.name === 'dogecoin' ? 5 : 10);
					if (coin.name === 'pandacoin') { // PND gives you lasers!
						this.car.laserTimer = 0;
						this.car.laserShotsTaken = 0; // reset shots taken
					}
				}
				// Enemy cars can pick up coins too
				for (var j = this.enemyGroup.childNodes.length - 1; j >= 0; j--) {
					var enemy = this.enemyGroup.childNodes[j];
					if (coin.intersect(enemy)) {
						this.coinGroup.removeChild(coin);    
					}
				}
			}

			// Check if it's time to create a new set of scenery
			this.generateSceneryTimer += evt.elapsed * 0.001;
			timeBeforeNext = 5 + Math.floor(Math.random() * 3); // increase to make scenery more rare
			if (this.generateSceneryTimer >= timeBeforeNext) { 
				this.generateSceneryTimer -= timeBeforeNext;

				var scenery = Math.floor(Math.random() * 2) === 0 ? new Scenery('img/summerTree60.png') : new Scenery('img/summerPineTree60.png');
				this.sceneryGroup.addChild(scenery);
				firstSceneryMoment = false;
			}
			// Loop BGM
			//if (this.bgm.currentTime >= this.bgm.duration ){
			//	this.bgm.play();
			//}

			var game = Game.instance;
			if (game.input.left && !game.input.right) {
    			this.car.move(-1, 0, 3);
			}
			else if (game.input.right && !game.input.left) {
			    this.car.move(1, 0, 3);
			}
			else if (game.input.up && !game.input.down) {
			    this.car.move(0, -1, 3);
			}
			else if (game.input.down && !game.input.up) {
				this.car.move(0, 1, 3);
			}			
		}
	});

	// Generic vehicle superclass
	var Vehicle = Class.create(Sprite, {
		initialize: function(width, height, imagePath) {
			Sprite.apply(this, [width, height]);
			this.image = Game.instance.assets[imagePath];

			this.isDead = false;
			this.animationDuration = 0;
			this.animationTimeIncrement = .50;
			this.laserTimeIncrement = 1; // how many seconds between shots
			this.laserTimer = this.laserTimeIncrement + .001; // set to 0 to activate lasers
			this.maxLaserShots = 8; // how many shots you get per powerup
			this.laserShotsTaken = 0; // how many shots have you taken this powerup?
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
		},

		updateAnimation: function(evt) {
			this.animationDuration += evt.elapsed * 0.001;
			if (this.animationDuration >= this.animationTimeIncrement) {
				this.frame = (this.frame + 1) % 2;
				this.animationDuration -= this.animationTimeIncrement;
			}

			if (this.laserTimer < this.laserTimeIncrement && this.laserShotsTaken <= this.maxLaserShots) { // lasers are activated
				this.laserTimer += evt.elapsed * 0.001;
				if (this.laserTimer >= this.laserTimeIncrement) { // laser time!
					var laser = new Laser(this.x, this.y - 30);
					this.parentNode.laserGroup.addChild(laser);
					if (typeof snd['laser'] !== 'undefined') {
						snd['laser'].play();
					}
					this.laserShotsTaken += 1;
					if (this.laserShotsTaken <= this.maxLaserShots) {
						this.laserTimer = 0; // reset laser timer
					}
				}
			}
		}
	});

	var DogeCar = Class.create(Vehicle, {
		// The player character.     
		initialize: function() {
			// 1 - Call superclass constructor
			Vehicle.call(this, 65, 82, 'img/dogeCarSheet.png'); 
		},

		move: function(xdir, ydir, increment) {
			if (xdir < 0) { // left
				if (this.x >= leftBorder) {
					this.x -= increment;
				}
			}
			else if (xdir > 0) { // right
				if (this.x <= rightBorder) {
					this.x += increment;
				}
			}

			if (ydir < 0) { // up
				if (this.y >= topBorder) {
					this.y -= increment;
				}
			}
			else if (ydir > 0) { //down
				if (this.y <= bottomBorder) {
					this.y += increment;
				}
			}
		}
	});

	// Abstract Non-player-character Car class
	var NPCVehicle = Class.create(Vehicle, {
		initialize: function(name, lane, imgPath, width, height, crazyConstant) {
			// Call superclass constructor
			Vehicle.call(this, width, height, imgPath); 

			this.name = name;
			this.crazyConstant = crazyConstant; // how crazy is the driver? number between 1-10 
			this.ySpeed = 95 + Math.floor(Math.random() * 10);

			this.rotationSpeed = 0;
			this.setLane(lane);
			this.targetLane = lane; // car is moving to a different lane
			this.addEventListener(Event.ENTER_FRAME, this.update);
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
		},

		setLane: function(lane) {
			var	game = Game.instance;        
			//distance = 90; // multiply by 2.166 to get 195
			var distance = 195;
			
			this.x = game.width/2 - this.width/2 + (lane - 1) * distance;
			this.y = -this.height;    
			this.lane = lane;
		},

		update: function(evt) { 
			var game = Game.instance;
			var ySpeed = this.isDead ? carSpeed : 100;
			//ySpeed = 150;
			
			this.y += ySpeed * evt.elapsed * 0.001;
			//this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
			if (this.y > game.height) { // enemy car is left behind for good
				if (typeof snd['pickup'] !== 'undefined') {
					snd['pickup'].play();
				}
				this.parentNode.removeChild(this);
				gameScore += 10;
			}

			// NPC car can move left and right as well
			if (this.isDead) {
				return; // no need to calculate x position
			}

			var targetLaneXPos = game.width/2 - this.width/2 + (this.targetLane - 1) * 195;
			if (this.lane !== this.targetLane && this.x > targetLaneXPos - 5 && 
					this.x < targetLaneXPos + 5) {
				this.lane = this.targetLane;
			}
			else if (this.targetLane < this.lane) { // car is moving to a different lane
				if (this.x <= leftBorder + 10) {
					//this.targetLane = 0;
					this.lane = this.targetLane;
				}
				else {
					this.x -= 5;
				}
			}
			else if (this.targetLane > this.lane) {
				if (this.x >= rightBorder - 10) {
					//this.targetLane = 2;
					this.lane = this.targetLane;
				}
				else {
					this.x += 5;
				}
			}
			else {  // car is in the lane it wants to be
				if (Math.floor(Math.random() * (100 / this.crazyConstant)) === 0) {
					// car wants to move to a different lane
					this.targetLane = Math.floor(Math.random() * 3);
					console.log('changed target lane to:', this.targetLane);
				}
			}
		},
	});

	// Laser from powerup
	var Laser = Class.create(Sprite, {
		initialize: function(xpos, ypos) {
			var imgPath = 'img/laser11x39.png';
			// Call superclass constructor
			Sprite.apply(this, [11, 39]);
			this.image  = Game.instance.assets[imgPath];
			this.rotationSpeed = 0;
			this.x = xpos;
			this.y = ypos;
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		update: function(evt) { 
			var ySpeed = carSpeed;
			
			this.y -= ySpeed * evt.elapsed * 0.001;
			//this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
			if (this.y < 1) {
				this.parentNode.removeChild(this);
			}
		}
	});

	// Abstract class for non-moving objects - scenery, coins, landmines
	var StationaryObject = Class.create(Sprite, {
		initialize: function(width, height, imgPath, xpos, ypos) {
			// Call superclass constructor
			Sprite.apply(this, [width, height]);
			this.image  = Game.instance.assets[imgPath];
			this.rotationSpeed = 0;
			this.x = xpos ? xpos : Math.floor(Math.random() * 2) === 0 ? this.width / 2 : game.width - (this.width * 1.5);
			this.y = ypos ? ypos : -this.height;
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		update: function(evt) { 
			var game = Game.instance;
			var ySpeed = carSpeed;
			
			this.y += ySpeed * evt.elapsed * 0.001;
			//this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
			if (this.y > game.height) {
				this.parentNode.removeChild(this);        
			}
		}
	});

	var Fire = Class.create(StationaryObject, {
		initialize: function(xpos, ypos) {
			var imgPath = 'img/fire48.gif';
			// Call superclass constructor
			StationaryObject.call(this, 48, 48, imgPath, xpos, ypos); 
		}
	});

	// Coins - e.g. Doge, PND
	var Coin = Class.create(StationaryObject, {
		initialize: function(xpos, name) {
			this.name = name;
			var imgPath = 'img/' + name + '64.png';
			//var ypos = -this.height;    
			// Call superclass constructor
			StationaryObject.call(this, 64, 64, imgPath, xpos, null); 
		}
	});

	// Bomb dropped from jeep
	var Bomb = Class.create(StationaryObject, {
		initialize: function(xpos, ypos) {
			var imgPath = 'img/bomb40.gif';
			// Call superclass constructor
			StationaryObject.call(this, 40, 40, imgPath, xpos, ypos); 
		}
	});

	// Side of the road scenery
	var Scenery = Class.create(StationaryObject, {
		initialize: function(imgPath) {
			// Call superclass constructor
			StationaryObject.call(this, 64, 64, imgPath, null, null); 
		}
	});

	// Middle of the road stripes
	var Stripe = Class.create(StationaryObject, {
		initialize: function() {			
			xpos = Game.instance.width / 2;
			// Call superclass constructor
			StationaryObject.call(this, 8, 40, 'img/whiteLaneStripe8x40.png', xpos, null); 
		}
	});

	var SceneGameOver = Class.create(Scene, {
		initialize: function(score) {
			if (score === 0) {
				console.log('OPEN');
				trackPage('open');
			}
			else {
				console.log('END');
				trackPage('end');
			}

			Scene.apply(this);
			this.backgroundColor = 'black';
			//	this.backgroundColor = '#000000'; // Hex Color Code version
			//	this.backgroundColor = 'rgb(0,0,0)'; // RGB value version

			// Game Over label
			var gameOverString = gameScore === 0 ? "Ready to Race?<br/><br/>Tap to Start!" : "GAME OVER<br/><br/>Tap to Restart";
			var gameOverLabel = new Label(gameOverString);
			//gameOverLabel.x = 8;
			gameOverLabel.x = game.width / 3;
			//gameOverLabel.y = 164;
			gameOverLabel.y = game.height / 2;
			gameOverLabel.color = 'green';
			gameOverLabel.font = '32px Comic Sans MS';
			gameOverLabel.textAlign = 'center';

			// Score label
			var scoreLabel = new Label('SCORE<br/><br/>' + gameScore);
			scoreLabel.x = game.width / 3;
			scoreLabel.y = game.height / 3;
			scoreLabel.color = 'pink';
			scoreLabel.font = '32px Comic Sans MS';
			scoreLabel.textAlign = 'center';

			// Add labels
			this.addChild(gameOverLabel);
			this.addChild(scoreLabel);

			// Listen for taps
			//this.addEventListener(Event.TOUCH_START, this.touchToRestart);
			gameOverLabel.addEventListener(Event.TOUCH_START, this.touchToRestart);
		},

		touchToRestart: function(evt) {
		    var game = Game.instance;
		    game.replaceScene(new SceneGame());
		}
	});
}
