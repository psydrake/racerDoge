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

// 2 - On document load 
window.onload = function() {
	// 3 - Starting point
	doCustomActions(); // run from custom.js

	var game = new Game(screenWidth, screenHeight);

	// 4 - Preload resources
	game.preload('img/gameBg.png', 'img/dogeCarSheet.png', 'img/dogecoin64.png', 'img/pandacoin64.png',
		'img/greenCarSheet.png', 'img/blueCarSheet.png', 'img/greyCarSheet.png', 'img/yellowCarSheet.png', 
		'img/jeepSheet.png', 'img/summerTree60.png', 'img/summerPineTree60.png', 'img/whiteLaneStripe8x40.png'); //, 'snd/Hit.mp3', 'snd/bgm.mp3');

	if (!usingDevice) { // only load sounds for browser game - phonegap freezes up otherwise
		game.preload('snd/Hit.mp3', 'snd/bgm.mp3');
	}

	// 5 - Game settings
	game.fps = 30;
	if (screenSize.width > screenWidth && screenSize.height > screenHeight) {
		game.scale = 1;
	}
	else {
		//game.scale = .462
		var scale1 = screenSize.width / screenWidth;
		var scale2 = screenSize.height / screenHeight;
		game.scale = (scale1 > scale2 ? scale2 : scale1) * .99;
	}

	console.log('before game.onload');
	game.onload = function() {
		console.log('in game.onload');
		// Once Game finishes loading
		var scene = new SceneGameOver(0);
		//var scene = new SceneGame();
		game.pushScene(scene);
	}

	// 7 - Start
	game.start();   

	var SceneGame = Class.create(Scene, {
		// The main gameplay scene.     
		initialize: function() {
			console.log('START');
			trackPage('start');

			var game, label, bg, car;
			
			// 1 - Call superclass constructor
			Scene.apply(this);
			// 2 - Access to the game singleton instance
			game = Game.instance;
			// 3 - Create child nodes
			// Label
			label = new Label('SCORE<br/>0');
			label.x = 9;
			label.y = 32;        
			label.color = 'white';
			label.font = '32px Comic Sans MS';
			label.textAlign = 'center';
			label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.scoreLabel = label;

			//bg = new Sprite(320,440);
			bg = new Sprite(screenWidth, screenHeight);
			bg.image = game.assets['img/gameBg.png'];

			// Car
			car = new DogeCar();
			car.x = game.width/2 - car.width/2;
			//car.y = 280;
			car.y = topBorder;
			this.car = car;

			// object groups
			this.stripeGroup = new Group();
			this.enemyGroup = new Group();
			this.coinGroup = new Group();
			this.sceneryGroup = new Group();

			// 4 - Add child nodes        
			this.addChild(bg);
			this.addChild(this.stripeGroup);
			this.addChild(this.sceneryGroup);
			this.addChild(this.coinGroup);
			this.addChild(this.enemyGroup);
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
			this.generateSimpleCarTimer = 0;
			this.scoreTimer = 0;
			this.score = 0;

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
		    this.score = value;
		    this.scoreLabel.text = 'SCORE<br/>' + this.score;
		},

		update: function(evt) {
			// Score increase as time passes
			this.scoreTimer += evt.elapsed * 0.001;
			if (this.scoreTimer >= 0.5) {
				this.setScore(this.score + 1);
				this.scoreTimer -= 0.5;
			}

			// Check if it's time to create a new lane stripe
			this.generateStripeTimer += evt.elapsed * 0.001;
			var  timeBeforeNext = .5; // increase to make enemy cars more rare
			if (this.generateStripeTimer >= timeBeforeNext) { 
				this.generateStripeTimer -= timeBeforeNext;

				var stripe = new Stripe('img/whiteLaneStripe8x40.png');
				this.stripeGroup.addChild(stripe);
			}

			// Check if it's time to create a new set of obstacles
			this.generateSimpleCarTimer += evt.elapsed * 0.001;
			timeBeforeNext = 8 + Math.floor(Math.random() * 6); // increase to make enemy cars more rare
			if (this.generateSimpleCarTimer >= timeBeforeNext) { 
				this.generateSimpleCarTimer -= timeBeforeNext;

				var car = null;
				var carChoice = Math.floor(Math.random() * 7);
				switch (carChoice) {
					case 0:
					case 1:
						car = new NPCVehicle(Math.floor(Math.random()*3), 'img/greenCarSheet.png', 60, 126, 6);
						break;
					case 2:
					case 3:
						car = new NPCVehicle(Math.floor(Math.random()*3), 'img/blueCarSheet.png', 60, 126, 6);
						break;
					case 4:
						car = new NPCVehicle(Math.floor(Math.random()*3), 'img/yellowCarSheet.png', 76, 120, 8);
						break;
					case 5:
						car = new NPCVehicle(Math.floor(Math.random()*3), 'img/greyCarSheet.png', 77, 120, 8);
						break;
					default:
						car = new NPCVehicle(Math.floor(Math.random()*3), 'img/jeepSheet.png', 76, 105, 9);

				}
				this.enemyGroup.addChild(car);
			}
			// Check collision
			for (var i = this.enemyGroup.childNodes.length - 1; i >= 0; i--) {
				var car = this.enemyGroup.childNodes[i];

				if (car.intersect(this.car)){
					var game = Game.instance;
					if (usingDevice) {
						if (typeof snd['hit'] !== 'undefined') {
							snd['hit'].play();
						}
					}
					else {
						game.assets['snd/Hit.mp3'].play();
					}
					this.enemyGroup.removeChild(car);
					// Game over
				    //this.bgm.stop();
					game.replaceScene(new SceneGameOver(this.score));        
				    break;
				}
			}

			// Check if it's time to create a new set of coins
			this.generateCoinTimer += evt.elapsed * 0.001;
			timeBeforeNext = 9 + Math.floor(Math.random() * 5); // increase to make coins more rare
			if (this.generateCoinTimer >= timeBeforeNext) { 
				this.generateCoinTimer -= timeBeforeNext;
				var xpos = leftBorder + 10 + Math.floor(Math.random() * (rightBorder - leftBorder - 10));
				var coin = Math.floor(Math.random() * 5) === 0 ? new Coin(xpos, 'pandacoin') : new Coin(xpos, 'dogecoin');
				this.coinGroup.addChild(coin);
			}
			// Check collision
			for (var i = this.coinGroup.childNodes.length - 1; i >= 0; i--) {
				var coin = this.coinGroup.childNodes[i];

				if (coin.intersect(this.car)) {
					var game = Game.instance;
					if (usingDevice) {
						if (typeof snd['hit'] !== 'undefined') {
							snd['hit'].play();
						}
					}
					else {
						game.assets['snd/Hit.mp3'].play();
					}
					this.coinGroup.removeChild(coin);    
					this.score += coin.name === 'dogecoin' ? 5 : 10;
				}
				// Enemy cars can pick up coins too
				for (var j = this.enemyGroup.childNodes.length - 1; j >= 0; j--) {
					var enemy = this.enemyGroup.childNodes[j];
					if (coin.intersect(enemy)) {
						var game = Game.instance;
						if (usingDevice) {
							if (typeof snd['hit'] !== 'undefined') {
						        snd['hit'].play();
							}
						}
						else {
							game.assets['snd/Hit.mp3'].play();
						}
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

			this.animationDuration = 0;
			this.animationTimeIncrement = .50;
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
		},

		updateAnimation: function(evt) {
			this.animationDuration += evt.elapsed * 0.001;
			if (this.animationDuration >= this.animationTimeIncrement) {
				this.frame = (this.frame + 1) % 2;
				this.animationDuration -= this.animationTimeIncrement;
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
		initialize: function(lane, imgPath, width, height, crazyConstant) {
			// Call superclass constructor
			Vehicle.call(this, width, height, imgPath); 

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
			//this.rotationSpeed = Math.random() * 100 - 50;
			//this.rotationSpeed = 0;
			
			this.x = game.width/2 - this.width/2 + (lane - 1) * distance;
			this.y = -this.height;    
			//this.rotation = Math.floor(Math.random() * 360);
			this.lane = lane;
		},

		update: function(evt) { 
			var game = Game.instance;
			var ySpeed = 100;
			//ySpeed = 150;
			
			this.y += ySpeed * evt.elapsed * 0.001;
			//this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
			if (this.y > game.height) {
				this.parentNode.removeChild(this);        
			}

			// NPC car can move left and right as well
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

	// Abstract Coin class
	var Coin = Class.create(StationaryObject, {
		initialize: function(xpos, name) {
			this.name = name;
			var imgPath = 'img/' + name + '64.png';
			//var ypos = -this.height;    
			// Call superclass constructor
			StationaryObject.call(this, 64, 64, imgPath, xpos, null); 
		}
	});

	// Side of the road scenery
	var Scenery = Class.create(StationaryObject, {
		initialize: function(imgPath) {
			// Call superclass constructor
			var game = Game.instance;
			//var ypos = -this.height;    
			StationaryObject.call(this, 64, 64, imgPath, null, null); 
		}
	});

	// Middle of the road stripes
	var Stripe = Class.create(Sprite, {
		initialize: function(imgPath) {
			// Call superclass constructor
			Sprite.apply(this,[8, 40]);
			this.image  = Game.instance.assets[imgPath];

			this.animationDuration = 0;
			this.rotationSpeed = 0;
			var game = Game.instance;        
			this.x = game.width / 2;
			this.y = -this.height;    
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
			var gameOverString = score === 0 ? "Ready to Race?<br/><br/>Tap to Start!" : "GAME OVER<br/><br/>Tap to Restart";
			var gameOverLabel = new Label(gameOverString);
			gameOverLabel.x = 8;
			//gameOverLabel.x = 18;
			gameOverLabel.y = 164;
			//gameOverLabel.y = 278;
			gameOverLabel.color = 'green';
			//gameOverLabel.font = '32px strong';
			gameOverLabel.font = '32px Comic Sans MS';
			gameOverLabel.textAlign = 'center';

			// Score label
			var scoreLabel = new Label('SCORE<br/><br/>' + score);
			scoreLabel.x = 9;
			//scoreLabel.x = 20;
			scoreLabel.y = 32;        
			//scoreLabel.y = 70;        
			scoreLabel.color = 'pink';
			//scoreLabel.font = '32px strong';
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
