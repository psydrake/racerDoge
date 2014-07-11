// phonegap / cordova-specific: get path to media files
function getPathMedia() { 
    var path = window.location.pathname;
    var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
	return phoneGapPath;
};

var snd = {};
function doCordovaCustomActions() { // called from custom.js: doCustomActions()
	if (typeof analytics !== "undefined") {
		analytics.startTrackerWithId('UA-52101670-2');
	}
	if (typeof snd !== 'undefined') { // using android device, so use Phonegap audio system
		snd['coin'] = new Media(getPathMedia() + 'snd/170147__timgormly__8-bit-coin.mp3');
		snd['bump'] = new Media(getPathMedia() + 'snd/170141__timgormly__8-bit-bump.mp3');
		snd['bumper'] = new Media(getPathMedia() + 'snd/170140__timgormly__8-bit-bumper.mp3');
		snd['explosion'] = new Media(getPathMedia() + 'snd/170144__timgormly__8-bit-explosion2.mp3');
		snd['powerup'] = new Media(getPathMedia() + 'snd/170155__timgormly__8-bit-powerup1.mp3');
		snd['pickup'] = new Media(getPathMedia() + 'snd/170170__timgormly__8-bit-pickup.mp3');
		snd['laser'] = new Media(getPathMedia() + 'snd/170161__timgormly__8-bit-laser.mp3');
		snd['shimmer'] = new Media(getPathMedia() + 'snd/170159__timgormly__8-bit-shimmer.mp3');
		snd['bgm'] = new Media(getPathMedia() + 'snd/RacerDoge.mp3');
	}
}

// 1 - Start enchant.js
enchant(); 

// first get the size from the window
// if that didn't work, get it from the body
var windowSize = {
  width: window.innerWidth || document.body.clientWidth,
  height: window.innerHeight || document.body.clientHeight
}

var screenWidth = 694;
var screenHeight = 954;
var leftBorder = 112;
var rightBorder = 518;
var topBorder = 606;
var bottomBorder = 870;
var carSpeed = 310; // speed of still objects passing by

// 2 - On document load 
window.onload = function() {
	// 3 - Starting point
	doCustomActions(); // run from custom.js

	var game = new Game(screenWidth, screenHeight);

	// 4 - Preload resources
	game.preload('img/gameBg.png', 'img/dogeCarSheet.png', 'img/dogeCarPowerupSheet.png', 'img/dogecoin64.png', 'img/pandacoin64.png',
		'img/greenCarSheet.png', 'img/blueCarSheet.png', 'img/greyCarSheet.png', 'img/yellowCarSheet.png', 
		'img/jeepSheet.png', 'img/summerTree60.png', 'img/summerPineTree60.png', 'img/whiteLaneStripe8x40.png', 'img/smokeSheet.png',
		'img/bombSheet.png', 'img/laser11x39.png', 'img/fireSheet.png', 'img/bitcoin64.png', 'img/litecoin64.png',
		'img/pixelDoge250.png', 'img/racerDoge256.png'); 

	if (typeof isWebapp !== 'undefined' && isWebapp) { // only load sounds for browser game - phonegap freezes up otherwise
		game.preload('snd/170147__timgormly__8-bit-coin.mp3', 'snd/170141__timgormly__8-bit-bump.mp3', 
				'snd/170140__timgormly__8-bit-bumper.mp3', 'snd/170144__timgormly__8-bit-explosion2.mp3', 
				'snd/170155__timgormly__8-bit-powerup1.mp3', 'snd/170170__timgormly__8-bit-pickup.mp3', 
				'snd/170161__timgormly__8-bit-laser.mp3', 'snd/170159__timgormly__8-bit-shimmer.mp3', 'snd/RacerDoge.mp3');
	}

	// 5 - Game settings
	game.fps = 30;
	if (windowSize.width > screenWidth && windowSize.height > screenHeight) {
		game.scale = 1;
	}
	else {
		var scale1 = windowSize.width / screenWidth;
		var scale2 = windowSize.height / screenHeight;
		game.scale = (scale1 > scale2 ? scale2 : scale1) * .99;
	}

	game.onload = function() {
		// Once Game finishes loading
		// load sounds if user is playing in browser - phonegap freezes up if we let android load game.assets for sound
		if (typeof isWebapp !== 'undefined' && isWebapp) { 
			if (typeof snd !== 'undefined') { // we are playing game in a browser - use enchant.js sound system
				snd['coin'] = game.assets['snd/170147__timgormly__8-bit-coin.mp3']; // player picks up any non PND coin
				snd['bump'] = game.assets['snd/170141__timgormly__8-bit-bump.mp3']; // player gets hit by enemy car
				snd['bumper'] = game.assets['snd/170140__timgormly__8-bit-bumper.mp3']; // jeep drops bomb
				snd['explosion'] = game.assets['snd/170144__timgormly__8-bit-explosion2.mp3']; // player shot hits enemy, or player hits bomb
				snd['powerup'] = game.assets['snd/170155__timgormly__8-bit-powerup1.mp3']; // enemy drops coin
				snd['pickup'] = game.assets['snd/170170__timgormly__8-bit-pickup.mp3']; // player leaves enemy car in the dust
				snd['laser'] = game.assets['snd/170161__timgormly__8-bit-laser.mp3']; // player shoots laser
				snd['shimmer'] = game.assets['snd/170159__timgormly__8-bit-shimmer.mp3']; // player picks up PND - laser powerup!
				snd['bgm'] = game.assets['snd/RacerDoge.mp3']; // player picks up PND - laser powerup!
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
			var label = new Label('SCORE<br/>0');
			label.x = 9;
			label.y = 32;        
			label.color = 'white';
			label.font = '32px Comic Sans MS';
			label.textAlign = 'center';
			label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.scoreLabel = label;

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
			this.smokeGroup = new Group();			
			this.fireGroup = new Group();

			// 4 - Add child nodes        
			this.addChild(bg);
			this.addChild(this.stripeGroup);
			this.addChild(this.bombGroup);
			this.addChild(this.sceneryGroup);
			this.addChild(this.coinGroup);
			this.addChild(this.laserGroup);
			this.addChild(this.enemyGroup);
			this.addChild(this.smokeGroup);
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
			this.generateEnemyCoinTimer = 0;
			this.generateBombTimer = 0;
			this.scoreTimer = 0;
			this.score = 0;
			this.scoreTimeIncrement = .5; // amount of time before score increases

			// Start Background music
			if (typeof snd['bgm'] !== 'undefined') {
				if (typeof isWebapp !== 'undefined' && isWebapp) { // for browser game
					snd['bgm'].play();
				}
				else { // cordova
					snd['bgm'].play({numberOfLoops:"infinite"});
				}
			}
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

		createLabel: function(text, color, xpos, ypos) {
			var label = new Label(text);
			label.color = color;
			label.x = xpos;
			label.y = ypos;
			label.font = '32px Comic Sans MS';
			label.textAlign = 'center';
			label.tick = 0;
			label.addEventListener(Event.ENTER_FRAME, function() {
				label.tick++;
				if (label.tick > 80)  {
					this.parentNode.removeChild(label);
				}
			});
			return label;
		},

		setScore: function (value) {
		    this.score = value;
		    this.scoreLabel.text = 'SCORE<br/>' + this.score;
		},

		update: function(evt) {
			// Score increase as time passes
			this.scoreTimer += evt.elapsed * 0.001;
			if (this.scoreTimer >= this.scoreTimeIncrement) {
				this.setScore(this.score + 1);
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
			for (var i = 0; i < this.enemyGroup.childNodes.length; i++) {
				var car = this.enemyGroup.childNodes[i];

				if (car.intersect(this.car)) { // player car gets hit by enemy car!
					if (this.car.armorTimer < this.car.maxArmorTimer) {
						// if doge car has armor powerup, enemy is destroyed
						if (typeof snd['explosion'] !== 'undefined') {
							snd['explosion'].play();
						}
						var smoke = new Smoke(car.x, car.y);
						this.smokeGroup.addChild(smoke);
						this.enemyGroup.removeChild(car);
						
						this.addChild(this.createLabel('much destruct!', 'orange', car.x, car.y));
                        
						this.setScore(this.score += 50);				
					}
					else { // if no armor powerup, doge car is destroyed. much sad
						if (typeof snd['bump'] !== 'undefined') {
							snd['bump'].play();
						}
						this.car.isDead = true;
						//var fire = new Fire(this.car.x, this.car.y);
						//this.fireGroup.addChild(fire);

						// Game over
						if (typeof snd['bgm'] !== 'undefined') {
						    snd['bgm'].stop();
						}
						Game.instance.replaceScene(new SceneGameOver(this.score));
					    break;
					}
				}

				for (var j = 0; j < this.laserGroup.childNodes.length; j++) {
					var laser = this.laserGroup.childNodes[j];
					if (car.intersect(laser)) { // enemy car is hit by laser
						if (typeof snd['explosion'] !== 'undefined') {
							snd['explosion'].play();
						}
						this.laserGroup.removeChild(laser);
						if (!car.isDead) {
							car.isDead = true;
							var fire = new Fire(car.x + 12, car.y + 10);
							this.fireGroup.addChild(fire);

							this.addChild(this.createLabel('wow such laser!', 'yellow', car.x, car.y));
							this.setScore(this.score += 50);
						}
						else { // car is already dead - remove car wreck
							this.smokeGroup.addChild(new Smoke(car.x, car.y));

							this.addChild(this.createLabel('die moar pls', 'pink', car.x, car.y));
							this.setScore(this.score += 15);

							this.enemyGroup.removeChild(car);
						}
					}
				}

				if (!car.isDead) {
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
					} // grey and yellow cars drop litecoin and bitcoin!
					else if (['grey car', 'yellow car'].indexOf(car.name) >= 0) { 
						this.generateEnemyCoinTimer += evt.elapsed * 0.001;
						timeBeforeNext = 5 + Math.floor(Math.random() * 4); // increase to make bombs more rare
						if (this.generateEnemyCoinTimer >= timeBeforeNext) { 
							this.generateEnemyCoinTimer -= timeBeforeNext;
							var coinName = car.name === 'grey car' ? 'litecoin' : 'bitcoin';
							this.coinGroup.addChild(new Coin(car.x, car.y + 30, coinName));
							if (typeof snd['powerup'] !== 'undefined') {
								snd['powerup'].play();
							}
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
					this.bombGroup.removeChild(bomb);

					if (this.car.armorTimer < this.car.maxArmorTimer) {
						// if doge car has armor powerup, enemy is destroyed
						var smoke = new Smoke(bomb.x, bomb.y);
						this.smokeGroup.addChild(smoke);

						this.setScore(this.score += 15);
					}
					else {
						this.car.isDead = true;
						//var fire = new Fire(this.car.x, this.car.y + 10);
						//this.fireGroup.addChild(fire);

						// Game over
						if (typeof snd['bgm'] !== 'undefined') {
						    snd['bgm'].stop();
						}
						Game.instance.replaceScene(new SceneGameOver(this.score));
					    break;
					}
				}

				// Check laser collision with bomb
				for (var j = 0; j < this.laserGroup.childNodes.length; j++) {
					var laser = this.laserGroup.childNodes[j];

					if (bomb.intersect(laser)) { // laser hits a bomb
						if (typeof snd['explosion'] !== 'undefined') {
							snd['explosion'].play();
						}
						this.bombGroup.removeChild(bomb);
						this.laserGroup.removeChild(laser);
					}
				}
			}

			// Check if it's time to create a new set of coins
			this.generateCoinTimer += evt.elapsed * 0.001;
			timeBeforeNext = 9 + Math.floor(Math.random() * 14); // increase to make coins more rare
			if (this.generateCoinTimer >= timeBeforeNext) { 
				this.generateCoinTimer -= timeBeforeNext;
				var xpos = leftBorder + 10 + Math.floor(Math.random() * (rightBorder - leftBorder - 10));
				var coin = Math.floor(Math.random() * 2) === 0 ? new Coin(xpos, null, 'pandacoin') : new Coin(xpos, null, 'dogecoin');
				this.coinGroup.addChild(coin);
			}
			// Check collision
			for (var i = 0; i < this.coinGroup.childNodes.length; i++) {
				var coin = this.coinGroup.childNodes[i];

				if (coin.intersect(this.car)) { // player car picks up coin
					if (['pandacoin', 'dogecoin'].indexOf(coin.name) >= 0) {
						if (typeof snd['shimmer'] !== 'undefined') {
							snd['shimmer'].play();
						}
						if (coin.name === 'dogecoin') {
							this.car.powerupArmor();
						}
					}
					else { 
						if (typeof snd['coin'] !== 'undefined') {
							snd['coin'].play();
						}
					}
					this.coinGroup.removeChild(coin);
					var scoreIncr = 10;
					switch (coin.name) {
						case 'litecoin':
							scoreIncr = 25;
							break;
						case 'bitcoin':
							scoreIncr = 50;
							break;
					}
					this.setScore(this.score += scoreIncr);
					if (coin.name === 'pandacoin') { // PND gives you lasers!
						this.car.laserTimer = 0;
						this.car.laserShotsTaken = 0; // reset shots taken
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
			if (typeof isWebapp !== 'undefined' && isWebapp && // only need to loop for webapp
				typeof snd['bgm'] !== 'undefined') {
				if (snd['bgm'].currentTime >= snd['bgm'].duration ) {
					snd['bgm'].play();
				}
			}

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

			this.rotationSpeed = 0;
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
		},

		updateAnimation: function(evt) {
			this.animationDuration += evt.elapsed * 0.001;
			if (this.animationDuration >= this.animationTimeIncrement) {
				this.frame = (this.frame + 1) % 2; // which vehicle frame to show from image sheet
				this.animationDuration -= this.animationTimeIncrement; // reset animation
			}
		}
	});

	var DogeCar = Class.create(Vehicle, {
		// The player character.     
		initialize: function() {
			// 1 - Call superclass constructor
			Vehicle.call(this, 65, 82, 'img/dogeCarSheet.png'); 

			this.laserTimeIncrement = 1; // how many seconds between shots
			this.laserTimer = this.laserTimeIncrement + .001; // set to 0 to activate lasers
			this.maxLaserShots = 10; // how many shots you get per powerup
			this.laserShotsTaken = 0; // how many shots have you taken this powerup?

			this.maxArmorTimer = 10; // how long does the armor powerup last?
			this.armorTimer = this.maxArmorTimer + .001; // set to 0 to activate armor powerup

			this.addEventListener(Event.ENTER_FRAME, this.updateDogeCarAnimation);
		},

		updateDogeCarAnimation: function(evt) {
			if (this.laserTimer < this.laserTimeIncrement && this.laserShotsTaken <= this.maxLaserShots) { // lasers are activated
				if (this.laserTimer === 0 && this.laserShotsTaken === 0) {
					if (typeof snd['laser'] !== 'undefined') {
						snd['laser'].play();
					}
				}
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

			if (this.armorTimer <= this.maxArmorTimer) {
				// if armor timer is activated, continue running the timer
				this.armorTimer += evt.elapsed * 0.001;
			}
			else if (this.armorTimer > this.maxArmorTimer) {
				// if armor timer reached the end, stop the powerup
				this.image = Game.instance.assets['img/dogeCarSheet.png'];
			}
		},

		powerupArmor: function() { // start the armor powerup
			this.image = Game.instance.assets['img/dogeCarPowerupSheet.png'];
			this.armorTimer = 0; // 0 starts the timer
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

			this.setLane(lane);
			this.targetLane = lane; // car is moving to a different lane
			this.addEventListener(Event.ENTER_FRAME, this.update);
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
			
			this.y += ySpeed * evt.elapsed * 0.001;
			//this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
			if (this.y > game.height) { // enemy car is left behind for good
				if (typeof snd['pickup'] !== 'undefined') {
					snd['pickup'].play();
				}
				this.parentNode.parentNode.setScore(this.parentNode.parentNode.score += 10);
				this.parentNode.removeChild(this);
				return;
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
					//console.log('changed target lane to:', this.targetLane);
				}
			}
		}
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
		initialize: function(width, height, imgPath, xpos, ypos, frames) {
			// Call superclass constructor
			Sprite.apply(this, [width, height]);
			this.image  = Game.instance.assets[imgPath];
			this.rotationSpeed = 0;
			this.x = xpos ? xpos : Math.floor(Math.random() * 2) === 0 ? this.width / 2 : game.width - (this.width * 1.5);
			this.y = ypos ? ypos : -this.height;
			if (frames  && frames > 1) {
				this.frames = frames;
				this.animationDuration = 0;
				this.animationTimeIncrement = .40;
				this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
			}
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		update: function(evt) { 
			var game = Game.instance;
			var ySpeed = carSpeed;
			
			this.y += ySpeed * evt.elapsed * 0.001;
			if (this.y > game.height) {
				this.parentNode.removeChild(this);        
			}
		},

		updateAnimation: function(evt) {
			this.animationDuration += evt.elapsed * 0.001;
			if (this.animationDuration >= this.animationTimeIncrement) {
				this.frame = (this.frame + 1) % this.frames;
				this.animationDuration -= this.animationTimeIncrement;
			}
		}
	});

	var Smoke = Class.create(StationaryObject, {
		initialize: function(xpos, ypos) {			
			// Call superclass constructor
			StationaryObject.call(this, 70, 70, 'img/smokeSheet.png', xpos, ypos, 3); 
		}
	});

	var Fire = Class.create(StationaryObject, {
		initialize: function(xpos, ypos) {			
			// Call superclass constructor
			StationaryObject.call(this, 48, 48, 'img/fireSheet.png', xpos, ypos, 3); 
		}
	});

	// Coins - e.g. Doge, PND
	var Coin = Class.create(StationaryObject, {
		initialize: function(xpos, ypos, name) {
			this.name = name;
			// Call superclass constructor
			StationaryObject.call(this, 64, 64, 'img/' + name + '64.png', xpos, ypos, 1);
		}
	});

	// Bomb dropped from jeep
	var Bomb = Class.create(StationaryObject, {
		initialize: function(xpos, ypos) {			
			// Call superclass constructor
			StationaryObject.call(this, 40, 40, 'img/bombSheet.png', xpos, ypos, 2);
		}
	});

	// Side of the road scenery
	var Scenery = Class.create(StationaryObject, {
		initialize: function(imgPath) {
			// Call superclass constructor
			StationaryObject.call(this, 64, 64, imgPath, null, null, 1); 
		}
	});

	// Middle of the road stripes
	var Stripe = Class.create(StationaryObject, {
		initialize: function() {			
			xpos = Game.instance.width / 2;
			// Call superclass constructor
			StationaryObject.call(this, 8, 40, 'img/whiteLaneStripe8x40.png', xpos, null, 1); 
		}
	});

	var SceneGameOver = Class.create(Scene, {
		initialize: function(score) {
			if (score === 0) {
				trackPage('open');
			}
			else {
				trackPage('end');
			}

			Scene.apply(this);
			this.backgroundColor = 'black';

			var game = Game.instance;
			var smartDoge = new Sprite(250, 250);
			smartDoge.image = game.assets['img/pixelDoge250.png'];
			smartDoge.x = game.width / 2;
			smartDoge.y = game.height * 2/3;

			// Game Over label
			var gameOverString = score === 0 ? "Ready to Race?<br/><br/>Tap to Start!" : "GAME OVER<br/><br/>Tap to Restart";
			var gameOverLabel = new Label(gameOverString);
			gameOverLabel.x = game.width / 4;
			gameOverLabel.y = game.height / 2;
			gameOverLabel.color = 'green';
			gameOverLabel.font = '32px Comic Sans MS';
			gameOverLabel.textAlign = 'center';

			// Score label
			var scoreLabel = new Label('SCORE<br/><br/>' + score);
			scoreLabel.x = game.width / 4;
			scoreLabel.y = game.height / 3;
			scoreLabel.color = 'pink';
			scoreLabel.font = '32px Comic Sans MS';
			scoreLabel.textAlign = 'center';

			this.addChild(smartDoge);

			// Add labels
			this.addChild(gameOverLabel);
			this.addChild(scoreLabel);

			// Listen for taps
			//gameOverLabel.addEventListener(Event.TOUCH_START, this.touchToRestart);
			this.addEventListener(Event.TOUCH_START, this.touchToRestart);
		},

		touchToRestart: function(evt) {
		    var game = Game.instance;
		    game.replaceScene(new SceneGame());
		}
	});
}
