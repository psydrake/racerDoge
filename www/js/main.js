// 1 - Start enchant.js
enchant(); 
/*
var bgm = new Media("/android_asset/bgm.mp3",
    function() {
        alert("playAudio():Audio Success");
    },
    function(err) {
        alert(err);
    }
);
*/
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
var carSpeed = 300; // speed of still objects passing by
var firstSceneryMoment = true; // game is just started, no scenery has been shown yet

// 2 - On document load 
window.onload = function() {
	// 3 - Starting point
	//var game = new Game(320, 440);
	console.log('screenSize:', screenSize);
	//var screenWidth = 320;
	//var screenHeight = 440;

	var game = new Game(screenWidth, screenHeight);

	// 4 - Preload resources
	//game.preload('img/BG.png', 'img/penguinSheet.png', 'img/Ice.png'); //, 'snd/Hit.mp3', 'snd/bgm.mp3');
	game.preload('img/gameBg.png', 'img/dogeCarSheet.png', 'img/dogecoin64.png', 'img/pandacoin64.png',
		'img/greenCarSheet.png', 'img/blueCarSheet.png', 'img/greyCar60x93.png', 'img/yellowCar60x93.png', 
		'img/jeep60x83.png', 'img/summerTree60.png', 'img/summerPineTree60.png'); //, 'snd/Hit.mp3', 'snd/bgm.mp3');

	// 5 - Game settings
	game.fps = 30;
	//game.scale = 1;
	if (screenSize.width > 694 && screenSize.height > screenHeight) {
		game.scale = 1;
	}
	else {
		//game.scale = .462
		var scale1 = screenSize.width / screenWidth;
		var scale2 = screenSize.height / screenHeight;
		game.scale = scale1 > scale2 ? scale2 : scale1;
	}
	game.onload = function() {
		// Once Game finishes loading
		var scene = new SceneGame();
		game.pushScene(scene);
	}
	// 7 - Start
	game.start();   

	// SceneGame  
	var SceneGame = Class.create(Scene, {
		// The main gameplay scene.     
		initialize: function() {
			var game, label, bg, car;
			
			// 1 - Call superclass constructor
			Scene.apply(this);
			// 2 - Access to the game singleton instance
			game = Game.instance;
			// 3 - Create child nodes
			// Label
			label = new Label('SCORE<br>0');
			label.x = 9;
			label.y = 32;        
			label.color = 'white';
			label.font = '32px strong';
			label.textAlign = 'center';
			label._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.scoreLabel = label;

			//bg = new Sprite(320,440);
			bg = new Sprite(screenWidth, screenHeight);
			bg.image = game.assets['img/gameBg.png'];

			// Car
			car = new Car();
			car.x = game.width/2 - car.width/2;
			//car.y = 280;
			car.y = 606;
			this.car = car;

			// object groups
			this.enemyGroup = new Group();
			this.coinGroup = new Group();
			this.sceneryGroup = new Group();

			// 4 - Add child nodes        
			this.addChild(bg);
			this.addChild(this.sceneryGroup);
			this.addChild(this.coinGroup);
			this.addChild(this.enemyGroup);
			this.addChild(car);
			this.addChild(label);

			// Touch listener
			this.addEventListener(Event.TOUCH_MOVE, this.handleTouchMove);
			this.addEventListener(Event.TOUCH_START, this.handleTouchStart);
			this.addEventListener(Event.TOUCH_END, this.handleTouchStop);

			// Update
			this.addEventListener(Event.ENTER_FRAME, this.update);

			// Instance variables
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
			console.log('START');
			//laneWidth = 320/3;
			//var laneWidth = screenWidth/3;
			//var laneWidth = screenWidth/2;
			//var direction = Math.floor(evt.x / laneWidth);
			//direction = Math.max(Math.min(2,direction),0);
			this.car.isSteering = true;
			this.keepSteering(evt);
		},

		keepSteering: function(evt) {
			//var direction = evt.x < this.car.x ? 0 : 1;
			//this.car.move(direction, 10);

			if (this.car.isSteering) {
				window.setTimeout(function() {
					//console.log('evt:', evt, ', this.car:', this.car);
					if (this.car) {
						var direction = evt.x < this.car.x ? 0 : 1;
						this.car.move(direction, 5);
						this.keepSteering();
					}
				}, 500);
			}
		},

		handleTouchStop: function(evt) {
			console.log('STOP');
			this.car.isSteering = false;
		},

		// user drags car
		handleTouchMove: function(evt) {
			console.log('MOVE');
			var direction = evt.x < this.car.x ? 0 : 1;
			this.car.move(direction, 5);
			//this.handleTouchStart(evt);
		},

		setScore: function (value) {
		    this.score = value;
		    this.scoreLabel.text = 'SCORE<br>' + this.score;
		},

		update: function(evt) {
			// Score increase as time passes
			this.scoreTimer += evt.elapsed * 0.001;
			if (this.scoreTimer >= 0.5) {
				this.setScore(this.score + 1);
				this.scoreTimer -= 0.5;
			}

			// Check if it's time to create a new set of obstacles
			this.generateSimpleCarTimer += evt.elapsed * 0.001;
			var  timeBeforeNext = 5 + Math.floor(Math.random() * 5); // increase to make enemy cars more rare
			if (this.generateSimpleCarTimer >= timeBeforeNext) { 
				this.generateSimpleCarTimer -= timeBeforeNext;

				var simpleCar = Math.floor(Math.random() * 2) === 0 ? new NPCVehicle(Math.floor(Math.random()*3), 'img/greenCarSheet.png') : new NPCVehicle(Math.floor(Math.random()*3), 'img/blueCarSheet.png');
				this.enemyGroup.addChild(simpleCar);
			}
			// Check collision
			for (var i = this.enemyGroup.childNodes.length - 1; i >= 0; i--) {
				var simpleCar = this.enemyGroup.childNodes[i];

				if (simpleCar.intersect(this.car)){
					var game = Game.instance;
					//game.assets['snd/Hit.mp3'].play();
					this.enemyGroup.removeChild(simpleCar);    
					// Game over
				    //this.bgm.stop();
					game.replaceScene(new SceneGameOver(this.score));        
				    break;
				}
			}

			// Check if it's time to create a new set of coins
			this.generateCoinTimer += evt.elapsed * 0.001;
			var  timeBeforeNext = 10 + Math.floor(Math.random() * 5); // increase to make coins more rare
			if (this.generateCoinTimer >= timeBeforeNext) { 
				this.generateCoinTimer -= timeBeforeNext;
				var coin = Math.floor(Math.random() * 5) === 0 ? new Coin(Math.floor(Math.random()*3), 'pandacoin') : new Coin(Math.floor(Math.random()*3), 'dogecoin');
				this.coinGroup.addChild(coin);
			}
			// Check collision
			for (var i = this.coinGroup.childNodes.length - 1; i >= 0; i--) {
				var coin = this.coinGroup.childNodes[i];

				if (coin.intersect(this.car)){
					var game = Game.instance;
					//game.assets['snd/Hit.mp3'].play();
					this.coinGroup.removeChild(coin);    
					this.score += coin.name === 'dogecoin' ? 5 : 10;
				}

				// Enemy cars can pick up coins too
				for (var j = this.enemyGroup.childNodes.length - 1; j >= 0; j--) {
					var enemy = this.enemyGroup.childNodes[j];
					if (coin.intersect(enemy)) {
						var game = Game.instance;
						//game.assets['snd/Hit.mp3'].play();
						this.coinGroup.removeChild(coin);    
					}
				}

			}

			// Check if it's time to create a new set of scenery
			this.generateSceneryTimer += evt.elapsed * 0.001;
			var  timeBeforeNext = firstSceneryMoment === true ? Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 3); // increase to make scenery more rare
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
		}
	});

	// Car
	var Car = Class.create(Sprite, {
		// The player character.     
		initialize: function() {
			// 1 - Call superclass constructor
			//Sprite.apply(this,[30, 43]);
			Sprite.apply(this,[65, 82]);
			this.image = Game.instance.assets['img/dogeCarSheet.png'];
			// 2 - Animate
			this.animationDuration = 0;
			this.isSteering = false;
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
		},

		updateAnimation: function (evt) {        
			this.animationDuration += evt.elapsed * 0.001;       
			if (this.animationDuration >= 0.25) {
				this.frame = (this.frame + 1) % 2;
				this.animationDuration -= 0.25;
			}
		},

		/*switchToLaneNumber: function(lane){     
			//var targetX = 160 - this.width/2 + (lane-1)*90;
			var targetX = (game.width/2) - this.width/2 + (lane-1)*195;
			this.x = targetX;
		},*/
		move: function(direction, increment) {
			//console.log('moving:', direction, ', amount:', increment);
			//var targetX = 160 - this.width/2 + (lane-1)*90;
			//var targetX = (game.width/2) - this.width/2 + (lane-1)*195;
			if (direction === 0) {
				//this.x = targetX;
				if (this.x >= leftBorder) {
					this.x -= increment;
				}
			}
			else {
				if (this.x <= rightBorder) {
					this.x += increment;
				}
			}
		}
	});

	// Abstract Non-player-character Car class
	var NPCVehicle = Class.create(Sprite, {
		initialize: function(lane, imgPath) {
			console.log('LANE:', lane);
			// Call superclass constructor
			Sprite.apply(this,[60, 126]);
			this.image  = Game.instance.assets[imgPath];

			this.animationDuration = 0;
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
			if (this.lane !== this.targetLane && this.x > targetLaneXPos - 5 && this.x < targetLaneXPos + 5) {
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
				if (Math.floor(Math.random() * 10) === 0) {
					// car wants to move to a different lane
					this.targetLane = Math.floor(Math.random() * 3);
					console.log('changed target lane to:', this.targetLane);
				}
			}
		},

		updateAnimation: function (evt) {        
			this.animationDuration += evt.elapsed * 0.001;       
			if (this.animationDuration >= 0.25) {
				this.frame = (this.frame + 1) % 2;
				this.animationDuration -= 0.25;
			}
		}
	});
/*
	Var BlueCar = Class.create(NPCVehicle, {
		initialize: function(lane, 'img/blueCarSheet.png') {
			// Call superclass constructor
			//Sprite.apply(this,[48, 49]);
			Sprite.apply(this,[60, 126]);
			this.image  = Game.instance.assets['img/blueCarSheet.png'];
		},
	});
*/
	// Abstract Coin class
	var Coin = Class.create(Sprite, {
		initialize: function(lane, name) {
			// Call superclass constructor
			//Sprite.apply(this,[48, 49]);
			this.name = name;
			Sprite.apply(this,[64, 64]);
			this.image  = Game.instance.assets['img/' + name + '64.png'];
			this.rotationSpeed = 0;
			this.setLane(lane);
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		setLane: function(lane) {
			var game = Game.instance;        
			//distance = 90; // multiply by 2.166 to get 195
			var distance = 195;
			
			this.rotationSpeed = Math.random() * 100 - 50;
			
			this.x = game.width/2 - this.width/2 + (lane - 1) * distance;
			this.y = -this.height;    
			this.rotation = Math.floor(Math.random() * 360);
		},

		update: function(evt) { 
			var ySpeed, game;
			
			game = Game.instance;
			ySpeed = carSpeed;
			//ySpeed = 150;
			
			this.y += ySpeed * evt.elapsed * 0.001;
			this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
			if (this.y > game.height) {
				this.parentNode.removeChild(this);        
			}
		}
	});

	// Abstract Non-player-character Car class
	var Scenery = Class.create(Sprite, {
		initialize: function(imgPath) {
			// Call superclass constructor
			Sprite.apply(this,[64, 64]);
			this.image  = Game.instance.assets[imgPath];

			this.animationDuration = 0;
			this.rotationSpeed = 0;
			this.setXPos();
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		setXPos: function() {
			var game = Game.instance;        
			//var distance = 195;
			//this.x = game.width/2 - this.width/2 + (Math.floor(Math.random() * 3) - 1) * distance;
			this.x = Math.floor(Math.random() * 2) === 0 ? this.width / 2 : game.width - (this.width * 1.5);
			this.y = -this.height;    
			//console.log('set xpos to:', this.x);
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

	// SceneGameOver  
	var SceneGameOver = Class.create(Scene, {
		initialize: function(score) {
			var gameOverLabel, scoreLabel;
			Scene.apply(this);
			this.backgroundColor = 'black';
			//	this.backgroundColor = '#000000'; // Hex Color Code version
			//	this.backgroundColor = 'rgb(0,0,0)'; // RGB value version

			// Game Over label
			gameOverLabel = new Label("GAME OVER<br/><br/>Tap to Restart");
			gameOverLabel.x = 8;
			//gameOverLabel.x = 18;
			gameOverLabel.y = 128;
			//gameOverLabel.y = 278;
			gameOverLabel.color = 'white';
			gameOverLabel.font = '32px strong';
			gameOverLabel.textAlign = 'center';

			// Score label
			scoreLabel = new Label('SCORE<br/><br/>' + score);
			scoreLabel.x = 9;
			//scoreLabel.x = 20;
			scoreLabel.y = 32;        
			//scoreLabel.y = 70;        
			scoreLabel.color = 'white';
			scoreLabel.font = '16px strong';
			scoreLabel.textAlign = 'center';

			// Add labels
			this.addChild(gameOverLabel);
			this.addChild(scoreLabel);

			// Listen for taps
			this.addEventListener(Event.TOUCH_START, this.touchToRestart);
		},

		touchToRestart: function(evt) {
		    var game = Game.instance;
		    game.replaceScene(new SceneGame());
		}
	});
}
