var thisAppName = 'racerDoge';

// store value in local storage
function setObject(key, value) {
	if (typeof(Storage) !== "undefined") {
	    // Code for localStorage/sessionStorage.
		localStorage.setItem(thisAppName + '.' + key, value);
	} 
	else {
		console.warn('Sorry! No Web Storage support');
	}
}

// retrieve value from local storage
function getObject(key) {
	if (typeof(Storage) !== "undefined") {
	    // Code for localStorage/sessionStorage.
		return localStorage.getItem(thisAppName + '.' + key);
	} 
	else {
		console.warn('Sorry! No Web Storage support');
	}
}

// phonegap / cordova-specific: get path to media files
function getPathMedia() { 
    var path = window.location.pathname;
    var phoneGapPath = path.substring(0, path.lastIndexOf('/') + 1);
	return phoneGapPath;
};

var snd = {};
var musicOn = true;
var fxOn = true;

// for Android - onStatus Callback for background music
function onBgmStatus(status) {
    if (musicOn && status === Media.MEDIA_STOPPED) {
        startMusic('bgm');
    }
}

// for Android - onStatus Callback for intro music
function onIntroStatus(status) {
    if (musicOn && status === Media.MEDIA_STOPPED) {
        startMusic('intro');
    }
}

function stopMusic(song) { // use to stop looped music
	if (typeof snd[song] !== 'undefined') {
		if (typeof isWebapp !== 'undefined' && isWebapp) { // webapp only
			if (snd[song].currentTime < snd[song].duration) {
				snd[song].stop();
			}
		}
		else { // cordova
			snd[song].stop();
		}
	}
}

// use to start looped music
function startMusic(song) {
	if (musicOn && typeof snd[song] !== 'undefined') {
		if (typeof isWebapp !== 'undefined' && isWebapp) { // for browser game
			snd[song].play();
		}
		else { // cordova
			snd[song].play({numberOfLoops:-1});
		}
	}
}

// called in update methods of scenes that have looping music
function loopMusicIfNeeded(song) {
	if (musicOn && typeof isWebapp !== 'undefined' && isWebapp && // only need to loop for webapp
		typeof snd[song] !== 'undefined') {
		if (snd[song].currentTime >= snd[song].duration) {
			snd[song].play();
		}
	}
}

function doCordovaCustomActions() { // called from custom.js: doCustomActions()
	if (typeof analytics !== "undefined") {
		analytics.startTrackerWithId('UA-52101670-2');
	}
	if (typeof snd !== 'undefined') { // using mobile device, so use Phonegap audio system
		snd['coin'] = new Media(getPathMedia() + 'snd/170147__timgormly__8-bit-coin.mp3');
		snd['bump'] = new Media(getPathMedia() + 'snd/170141__timgormly__8-bit-bump.mp3');
		snd['bumper'] = new Media(getPathMedia() + 'snd/170140__timgormly__8-bit-bumper.mp3');
		snd['explosion'] = new Media(getPathMedia() + 'snd/170144__timgormly__8-bit-explosion2.mp3');
		snd['powerup'] = new Media(getPathMedia() + 'snd/170155__timgormly__8-bit-powerup1.mp3');
		snd['pickup'] = new Media(getPathMedia() + 'snd/170170__timgormly__8-bit-pickup.mp3');
		snd['laser'] = new Media(getPathMedia() + 'snd/170161__timgormly__8-bit-laser.mp3');
		snd['shimmer'] = new Media(getPathMedia() + 'snd/170159__timgormly__8-bit-shimmer.mp3');
		if (typeof isAndroidApp !== 'undefined' && isAndroidApp) {
			// for android, Medial.play({numberOfLoops:-1}) doesn't work, so we have to loop with callback
			snd['intro'] = new Media(getPathMedia() + 'snd/RacerDogeIntro.mp3', onIntroStatus);
			snd['bgm'] = new Media(getPathMedia() + 'snd/RacerDoge.mp3', onBgmStatus);
		}
		else {
			snd['intro'] = new Media(getPathMedia() + 'snd/RacerDogeIntro.mp3');
			snd['bgm'] = new Media(getPathMedia() + 'snd/RacerDoge.mp3');
		}
		snd['death'] = new Media(getPathMedia() + 'snd/deathDogeMusic.mp3');
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
var carSpeed = 315; // speed of still objects passing by

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
		'img/pixelDoge250.png', 'img/racerDoge256.png', 'img/play.png', 'img/pause.png'); 

	if (typeof isWebapp !== 'undefined' && isWebapp) { // only load sounds for browser game - phonegap freezes up otherwise
		game.preload('snd/170147__timgormly__8-bit-coin.mp3', 'snd/170141__timgormly__8-bit-bump.mp3', 
				'snd/170140__timgormly__8-bit-bumper.mp3', 'snd/170144__timgormly__8-bit-explosion2.mp3', 
				'snd/170155__timgormly__8-bit-powerup1.mp3', 'snd/170170__timgormly__8-bit-pickup.mp3', 
				'snd/170161__timgormly__8-bit-laser.mp3', 'snd/170159__timgormly__8-bit-shimmer.mp3', 
				'snd/RacerDoge.mp3', 'snd/RacerDogeIntro.mp3', 'snd/deathDogeMusic.mp3');
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

	game.onload = function() { // Once Game finishes loading
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
				snd['intro'] = game.assets['snd/RacerDogeIntro.mp3']; // intro screen music
				snd['bgm'] = game.assets['snd/RacerDoge.mp3']; // background music during game
				snd['death'] = game.assets['snd/deathDogeMusic.mp3']; // player dies, such woe!
			}
		}

		// goto intro screen
		var scene = new SceneGameOver(0);
		game.pushScene(scene);
	}

	// 7 - Start
	game.start();   

	var SceneGame = Class.create(Scene, {
		// The main gameplay scene.     
		initialize: function() {
			trackPage('start');

			// start background music
			startMusic('bgm');

			// 1 - Call superclass constructor
			Scene.apply(this);
			// 2 - Access to the game singleton instance
			var game = Game.instance;
			// 3 - Create child nodes

			this.score = 0;

			// Label
			var scoreLabel = new Label('SCORE<br>' + this.score);
			scoreLabel.x = 9;
			scoreLabel.y = 32;        
			scoreLabel.color = 'white';
			scoreLabel.font = '32px Comic Sans MS';
			scoreLabel.textAlign = 'center';
			scoreLabel._style.textShadow ="-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black";
			this.scoreLabel = scoreLabel;

			this.STATE_PAUSE = 0;
			this.STATE_PLAY = 1;
			this.playState = this.STATE_PLAY;

			var PauseButton = Class.create(Sprite, {
				initialize: function() {
					Sprite.apply(this, [32, 32]);
					this.image = Game.instance.assets['img/pause.png'];
					this.x = game.width * 3.75/5;
					this.y = 38;
					this.rotationSpeed = 0;
					this.addEventListener(Event.TOUCH_START, this.togglePause);
				},
	
				togglePause: function(evt) {
					if (this.parentNode.playState === this.parentNode.STATE_PLAY) { // pause it
						this.parentNode.playState = this.parentNode.STATE_PAUSE;
						this.image = Game.instance.assets['img/play.png'];
						stopMusic('bgm'); // stop looping any background music
					}
					else { // play from paused state
						this.parentNode.playState = this.parentNode.STATE_PLAY;
						this.image = Game.instance.assets['img/pause.png'];
						startMusic('bgm'); // start looping any background music
					}
				}
			});
			this.pauseButton = new PauseButton();
			//game.keybind(32, 'a'); // bind spacebar to "A" button - which will be pause
			//this.addEventListener(Event.A_BUTTON_DOWN, this.pauseButton.togglePause);

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
			this.addChild(scoreLabel);
			this.addChild(this.pauseButton);

			// Touch listener
			this.addEventListener(Event.TOUCH_MOVE, this.handleTouchMove);
			this.addEventListener(Event.TOUCH_START, this.handleTouchStart);
			//this.addEventListener(Event.TOUCH_END, this.handleTouchStop);
	
			// Update
			this.addEventListener(Event.ENTER_FRAME, this.update);

			// Instance variables
			this.timedObjects = {
				stripe: {timer: 0, timeBeforeNext: 0},
				score: {timer: 0, timeBeforeNext: 0},
				scenery: {timer: 0, timeBeforeNext: 0},
				coin: {timer: 0, timeBeforeNext: 0},
				enemy: {timer: 0, timeBeforeNext: 0},
				enemyCoin: {timer: 0, timeBeforeNext: 0},
				bomb: {timer: 0, timeBeforeNext: 0}
			}
								
			// start of race welcome message
			var welcomeText = this.chooseExclamationText(["It's Race Time!", 'Start Racing!', 'Ready Set Go!']);
			this.addChild(this.createLabel(welcomeText, this.chooseColor(['yellow', 'pink', 'cyan', 'white', 'green']), game.width / 4, game.height - 400));
		},

		getTimeBeforeNext: function(type) {
			// if timeBeforeNext has been generated, return that value
			if (this.timedObjects[type].timeBeforeNext > 0) {
				return this.timedObjects[type].timeBeforeNext;
			}
			// timeBeforeNext has never been generated yet, let's do it now
			this.timedObjects[type].timeBeforeNext = this.generateTimeBeforeNext(type);
			return this.timedObjects[type].timeBeforeNext;
		},

		generateTimeBeforeNext: function(type) {
			switch (type) { // item is more rare the higher the returned value
				case 'stripe':
					return .7;

				case 'score':
					return 1;

				case 'scenery':
					return 5 + Math.floor(Math.random() * 3);

				case 'coin':
					return 10 + Math.floor(Math.random() * 14);

				case 'enemy':
					return 8 + Math.floor(Math.random() * 6); 

				case 'enemyCoin':
					return 3 + Math.floor(Math.random() * 4);

				case 'bomb':
					return 3 + Math.floor(Math.random() * 3);
			}
		},

		// after timed object appears, call this to reset timer and get new timeBeforeNext
		resetTimedObject: function(type) {
			this.timedObjects[type].timer = 0; // reset timer
			this.timedObjects[type].timeBeforeNext = this.generateTimeBeforeNext(type); // create a new timeBeforeNext value
		},

		// user clicks on area of screen
		handleTouchStart: function(evt) {
			this.handleTouchMove(evt);
		},

		// user drags car
		handleTouchMove: function(evt) {
			if (this.car.isDead || this.playState === this.STATE_PAUSE) {
				return;
			}

			//console.log('MOVE');
			var xdir = 0;
			if (evt.x < this.car.x - 5) {
				xdir = -1;
			}
			else if (evt.x > this.car.x + 5) {
				 xdir = 1;
			}

			var ydir = 0;
			if (evt.y < this.car.y - 5) {
				ydir = -1;
			}
			else if (evt.y > this.car.y + 5) {
				ydir = 1;
			}

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
				if (label.tick > 60)  {
					this.parentNode.removeChild(label);
				}
			});
			return label;
		},

		chooseExclamationText: function(textList, plusScore) {
			var index = Math.floor(Math.random() * textList.length);
			var text = textList[index];
			return  text + (plusScore ? '<br><br>+' + plusScore : '');
		},

		chooseColor: function(colorList) {
			var index = Math.floor(Math.random() * colorList.length);
			return colorList[index];
		},

		// return an x position (for exclamation labels) that will fit on screen
		getSafeXCoord: function(x) { 
			var maxX = Game.instance.width * 3/5;
			return (x < maxX) ? x : maxX;
			
		},

		setScore: function(value) {
		    this.score = value;
		    this.scoreLabel.text = 'SCORE<br>' + this.score;
		},

		getRandomEnemy: function() {
			var carChoice = Math.floor(Math.random() * 7);
			switch (carChoice) {
				case 0:
				case 1:
					return new NPCVehicle('green car', Math.floor(Math.random()*3), 'img/greenCarSheet.png', 60, 126, 6);

				case 2:
				case 3:
					return new NPCVehicle('blue car', Math.floor(Math.random()*3), 'img/blueCarSheet.png', 60, 126, 6);

				case 4:
					return new NPCVehicle('yellow car', Math.floor(Math.random()*3), 'img/yellowCarSheet.png', 76, 120, 8);

				case 5:
					return new NPCVehicle('grey car', Math.floor(Math.random()*3), 'img/greyCarSheet.png', 77, 120, 8);

				default:
					return new NPCVehicle('jeep', Math.floor(Math.random()*3), 'img/jeepSheet.png', 76, 105, 9);
			}
		},

		doGameOver: function(score) {
			this.car.isDead = true;

			var game = Game.instance;
			var text = this.chooseExclamationText(['very crash', 'such dead!', 'much dead...', 'game over wow', 'so scared']);
			this.addChild(this.createLabel(text, 'red', this.getSafeXCoord(this.car.x - 20), this.car.y - 250));

			stopMusic('bgm'); // stop looping any background music

			// start death music (oh noes!)
			setTimeout(function() {
				if (musicOn && typeof snd['death'] !== 'undefined') {
					snd['death'].play();
				}

				setTimeout(function() {
					game.replaceScene(new SceneGameOver(score));
				}, 2500);

			}, 500);
		},

		update: function(evt) {
			// if dogecar is dead, don't bother with anything below
			if (this.car.isDead || this.playState === this.STATE_PAUSE) {
				return;
			}

			var elapsedTime = evt.elapsed * 0.001;

			// Score increase as time passes
			this.timedObjects['score'].timer += elapsedTime;
			if (this.timedObjects['score'].timer >= this.getTimeBeforeNext('score')) {
				this.setScore(this.score + 1);
				this.resetTimedObject('score');
			}

			// Check if it's time to create a new lane stripe
			this.timedObjects['stripe'].timer += elapsedTime;
			if (this.timedObjects['stripe'].timer >= this.getTimeBeforeNext('stripe')) { 
				this.stripeGroup.addChild(new Stripe());
				this.resetTimedObject('stripe');
			}

			// Check if it's time to create a new set of obstacles
			this.timedObjects['enemy'].timer += elapsedTime;
			if (this.timedObjects['enemy'].timer >= this.getTimeBeforeNext('enemy')) { 
				this.enemyGroup.addChild(this.getRandomEnemy());
				this.resetTimedObject('enemy');
			}

			// Check enemy car collision
			for (var i = 0; i < this.enemyGroup.childNodes.length; i++) {
				var car = this.enemyGroup.childNodes[i];

				if (car.intersect(this.car)) { // player car gets hit by enemy car!
					if (this.car.armorTimer < this.car.maxArmorTimer) {
						// if doge car has armor powerup, enemy is destroyed
						if (fxOn && typeof snd['explosion'] !== 'undefined') {
							snd['explosion'].play();
						}
						var smoke = new Smoke(car.x, car.y);
						this.smokeGroup.addChild(smoke);

						var plusScore = 25;
						var text = this.chooseExclamationText(['much destruct!', 'very indestruct', 'no stress'], plusScore);
						this.addChild(this.createLabel(text, 'orange', this.getSafeXCoord(car.x), car.y));

						this.setScore(this.score += plusScore);
						this.enemyGroup.removeChild(car);
					}
					else { // if no armor powerup, doge car is destroyed. much sad
						if (fxOn && typeof snd['bump'] !== 'undefined') {
							snd['bump'].play();
						}

						this.doGameOver(this.score);
					    break;
					}
				}

				for (var j = 0; j < this.laserGroup.childNodes.length; j++) {
					var laser = this.laserGroup.childNodes[j];
					if (car.intersect(laser)) { // enemy car is hit by laser
						if (fxOn && typeof snd['explosion'] !== 'undefined') {
							snd['explosion'].play();
						}
						this.laserGroup.removeChild(laser);
						if (!car.isDead) {
							car.isDead = true;
							var fire = new Fire(car.x + 12, car.y + 10);
							this.fireGroup.addChild(fire);

							var plusScore = 25;
							var text = this.chooseExclamationText(['wow such laser!', 'so laser!', 'such amaze!'], plusScore);
							this.addChild(this.createLabel(text, 'yellow', this.getSafeXCoord(car.x), car.y));
							this.setScore(this.score += plusScore);
						}
						else { // car is already dead - remove car wreck
							this.smokeGroup.addChild(new Smoke(car.x, car.y));

							var plusScore = 10;
							var text = this.chooseExclamationText(['die moar pls', 'so begone!', 'such shoot!'], plusScore);
							this.addChild(this.createLabel(text, this.chooseColor(['pink', 'orange', 'cyan', 'red']), this.getSafeXCoord(car.x), car.y));
							this.setScore(this.score += plusScore);

							this.enemyGroup.removeChild(car);
						}
					}
				}

				if (!car.isDead) {
					// Check if it's time to create a new bomb
					if (car.name === 'jeep') { // jeeps can drop bombs
						this.timedObjects['bomb'].timer += elapsedTime;

						if (this.timedObjects['bomb'].timer >= this.getTimeBeforeNext('bomb')) {
							if (fxOn && typeof snd['bumper'] !== 'undefined') {
								snd['bumper'].play();
							}

							this.bombGroup.addChild(new Bomb(car.x, car.y + 30));
							this.resetTimedObject('bomb');
						}
					} // grey and yellow cars drop litecoin and bitcoin!
					else if (['grey car', 'yellow car'].indexOf(car.name) >= 0) { 
						this.timedObjects['enemyCoin'].timer += elapsedTime;

						if (this.timedObjects['enemyCoin'].timer >= this.getTimeBeforeNext('enemyCoin')) {
							if (fxOn && typeof snd['powerup'] !== 'undefined') {
								snd['powerup'].play();
							}

							var coinName = car.name === 'grey car' ? 'litecoin' : 'bitcoin';
							this.coinGroup.addChild(new Coin(car.x, car.y + 30, coinName));
							this.resetTimedObject('enemyCoin');
						}
					}
				}
			}

			// Check bomb collision
			for (var i = 0; i < this.bombGroup.childNodes.length; i++) {
				var bomb = this.bombGroup.childNodes[i];

				if (bomb.intersect(this.car)) { // player car gets hit by bomb!
					if (fxOn && typeof snd['explosion'] !== 'undefined') {
						snd['explosion'].play();
					}
					this.bombGroup.removeChild(bomb);

					if (this.car.armorTimer < this.car.maxArmorTimer) {
						// if doge car has armor powerup, bomb is destroyed
						var smoke = new Smoke(bomb.x, bomb.y);
						this.smokeGroup.addChild(smoke);

						var plusScore = 10;
						var text = this.chooseExclamationText(['very bomb', 'such indestruct', 'no scared!'], plusScore);
						this.addChild(this.createLabel(text, 'blue', this.getSafeXCoord(bomb.x), bomb.y));
						this.setScore(this.score += plusScore);
					}
					else {
						this.doGameOver(this.score);
					    break;
					}
				}

				// Check laser collision with bomb
				for (var j = 0; j < this.laserGroup.childNodes.length; j++) {
					var laser = this.laserGroup.childNodes[j];

					if (bomb.intersect(laser)) { // laser hits a bomb
						if (fxOn && typeof snd['explosion'] !== 'undefined') {
							snd['explosion'].play();
						}

						var plusScore = 10;
						var text = this.chooseExclamationText(['die bomb!', 'such aim', 'so explode!'], plusScore);
						this.addChild(this.createLabel(text, 'pink', this.getSafeXCoord(bomb.x), bomb.y));
						this.setScore(this.score += plusScore);

						this.bombGroup.removeChild(bomb);
						this.laserGroup.removeChild(laser);
					}
				}
			}

			// Check if it's time to create a new set of coins
			this.timedObjects['coin'].timer += elapsedTime;
			if (this.timedObjects['coin'].timer >= this.getTimeBeforeNext('coin')) {
				var xpos = leftBorder + 10 + Math.floor(Math.random() * (rightBorder - leftBorder - 10));

				var coin = Math.floor(Math.random() * 2) === 0 ? new Coin(xpos, null, 'pandacoin') : new Coin(xpos, null, 'dogecoin');
				this.coinGroup.addChild(coin);
				this.resetTimedObject('coin');
			}

			// Check collision
			for (var i = 0; i < this.coinGroup.childNodes.length; i++) {
				var coin = this.coinGroup.childNodes[i];

				if (coin.intersect(this.car)) { // player car picks up coin
					if (['pandacoin', 'dogecoin'].indexOf(coin.name) >= 0) {
						if (fxOn && typeof snd['shimmer'] !== 'undefined') {
							snd['shimmer'].play();
						}
					}
					else { 
						if (fxOn && typeof snd['coin'] !== 'undefined') {
							snd['coin'].play();
						}
					}

					var plusScore = 10;
					switch (coin.name) {
						case 'litecoin':
							plusScore = 25;
							break;
						case 'bitcoin':
							plusScore = 50;
							break;
						case 'dogecoin':
							this.car.powerupArmor();
							this.addChild(this.createLabel('armor powerup!', 'green', Game.instance.width / 3, coin.y - 400));
							break;
						case 'pandacoin':
							this.car.powerupLaser();
							this.addChild(this.createLabel('laser powerup!', 'red', Game.instance.width / 3, coin.y - 400));
							break;
					}

					var coinText = coin.name + (coin.name === 'pandacoin' ? ' pnd' : '');
					var text = this.chooseExclamationText(['such ' + coinText + '!', 'very ' + coinText, 'wow ' + coinText + '!'], plusScore);
					this.addChild(this.createLabel(text, this.chooseColor(['pink', 'cyan']), this.getSafeXCoord(coin.x), coin.y - 100));
					this.setScore(this.score += plusScore);

					this.coinGroup.removeChild(coin);
				}
			}

			// Check if it's time to create a new set of scenery
			this.timedObjects['scenery'].timer += elapsedTime;
			if (this.timedObjects['scenery'].timer >= this.getTimeBeforeNext('scenery')) {
				var scenery = Math.floor(Math.random() * 2) === 0 ? new Scenery('img/summerTree60.png') : new Scenery('img/summerPineTree60.png');

				this.sceneryGroup.addChild(scenery);
				this.resetTimedObject('scenery');

				firstSceneryMoment = false;
			}

			// Loop BGM
			loopMusicIfNeeded('bgm');

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
			if (this.isDead || (this.parentNode && this.parentNode.playState === this.parentNode.STATE_PAUSE)) {
				return; // no more animation if car is dead
			}
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
			this.maxLaserShots = 9; // how many shots you get per powerup
			this.laserShotsTaken = 0; // how many shots have you taken this powerup?

			this.maxArmorTimer = 8; // how long does the armor powerup last?
			this.armorTimer = this.maxArmorTimer + .001; // set to 0 to activate armor powerup

			this.addEventListener(Event.ENTER_FRAME, this.updateDogeCarAnimation);
		},

		updateDogeCarAnimation: function(evt) {
			if (this.isDead || this.parentNode.playState === this.parentNode.STATE_PAUSE) {
				return;
			}

			if (this.laserTimer < this.laserTimeIncrement && this.laserShotsTaken <= this.maxLaserShots) { 
				// lasers are activated
				if (this.laserTimer === 0 && this.laserShotsTaken === 0) {
					if (fxOn && typeof snd['laser'] !== 'undefined') {
						snd['laser'].play();
					}
				}
				this.laserTimer += evt.elapsed * 0.001;
				if (this.laserTimer >= this.laserTimeIncrement) { // laser time!
					var laser = new Laser(this.x, this.y - 30);
					this.parentNode.laserGroup.addChild(laser);
					if (fxOn && typeof snd['laser'] !== 'undefined') {
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

		powerupLaser: function() { // start the laser powerup
			this.laserTimer = 0; // 0 starts the timer
			this.laserShotsTaken = 0; // reset shots taken
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
			if (this.parentNode.parentNode.car.isDead || this.parentNode.parentNode.playState === this.parentNode.parentNode.STATE_PAUSE) {
				return;
			}

			var game = Game.instance;
			var ySpeed = this.isDead ? carSpeed : 100;
			
			this.y += ySpeed * evt.elapsed * 0.001;
			if (this.y > game.height) { // enemy car is left behind for good
				if (fxOn && typeof snd['pickup'] !== 'undefined') {
					snd['pickup'].play();
				}

				var plusScore = 15;
				var text = this.parentNode.parentNode.chooseExclamationText(['many speed!', 'very bye!', 'such fast doge!', 'to the moon!'], plusScore);
				this.parentNode.parentNode.addChild(this.parentNode.parentNode.createLabel(text, 'white', 
					this.parentNode.parentNode.getSafeXCoord(this.x - 50), this.parentNode.parentNode.car.y - 300));

				this.parentNode.parentNode.setScore(this.parentNode.parentNode.score += plusScore);
				this.parentNode.removeChild(this);
				return;
			}

			// NPC car can move left and right as well
			if (this.isDead || this.parentNode.parentNode.playState === this.parentNode.parentNode.STATE_PAUSE) {
				return; // no need to calculate x position
			}

			var targetLaneXPos = game.width/2 - this.width/2 + (this.targetLane - 1) * 195;
			if (this.lane !== this.targetLane && this.x > targetLaneXPos - 5 && 
					this.x < targetLaneXPos + 5) {
				this.lane = this.targetLane;
			}
			else if (this.targetLane < this.lane) { // car is moving to a different lane
				if (this.x <= leftBorder + 10) {
					this.lane = this.targetLane;
				}
				else {
					this.x -= 5;
				}
			}
			else if (this.targetLane > this.lane) {
				if (this.x >= rightBorder - 10) {
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
			this.x = xpos;
			this.y = ypos;
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		update: function(evt) { 
			if (this.parentNode.parentNode.car.isDead || this.parentNode.parentNode.playState === this.parentNode.parentNode.STATE_PAUSE) {
				return;
			}

			var ySpeed = carSpeed;
			this.y -= ySpeed * evt.elapsed * 0.001;

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
			if (this.parentNode.parentNode.car.isDead || this.parentNode.parentNode.playState === this.parentNode.parentNode.STATE_PAUSE) {
				return;
			}

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

			var musicOnStored = getObject('musicOn'); // any stored music preference
			if (typeof musicOnStored === 'undefined' || musicOnStored === null) {
				musicOn = true;
				setObject('musicOn', musicOn);
			}
			else {
				musicOn = musicOnStored === 'true' ? true : false;
			}

			var fxOnStored = getObject('fxOn'); // any stored music preference
			if (typeof fxOnStored === 'undefined' || fxOnStored === null) {
				fxOn = true;
				setObject('fxOn', fxOn);
			}
			else {
				fxOn = fxOnStored === 'true' ? true : false;
			}

			var wowScore = getObject('wowScore'); // high score, for you know, a doge
			if (!wowScore) { 
				wowScore = 0;
			}
			if (score > wowScore) {
				wowScore = score;
				setObject('wowScore', wowScore);
			}

			// start intro music
			startMusic('intro');

			Scene.apply(this);
			this.backgroundColor = 'black';

			var game = Game.instance;

			// Racer Doge label
			var titleLabel = new Label('Racer Doge');
			titleLabel.x = game.width / 4;
			titleLabel.y = game.height / 8;
			titleLabel.color = 'red';
			titleLabel.font = '32px Comic Sans MS';
			titleLabel.textAlign = 'center';
			
			// Score label
			var scoreText = 'SCORE<br><br>' + score;
			if (score > 0 && score === wowScore) {
				scoreText += ' <- wow!'
			}
			var scoreLabel = new Label(scoreText);
			scoreLabel.x = game.width / 10;
			scoreLabel.y = game.height / 4;
			scoreLabel.color = 'white';
			scoreLabel.font = '28px Comic Sans MS';
			scoreLabel.textAlign = 'center';

			// High score label
			var wowScoreLabel = new Label('WOW SCORE<br><br>' + wowScore);
			wowScoreLabel.x = game.width / 2;
			wowScoreLabel.y = game.height / 4;
			wowScoreLabel.color = 'pink';
			wowScoreLabel.font = '28px Comic Sans MS';
			wowScoreLabel.textAlign = 'center';

			// firefox marketplace desktop app doesn't seem to allow user to open links
			var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

			// Information Text label
			var infoString = 'by Drake Emko<br><br>music by Clayton Meador';
			var donateString = isFirefox ? 'Donate DOGE: bit.ly/1oVmeg3<br><br>@DrakeEmko (such generous!)' : 'Click to donate DOGE<br><br>(such generous)!';
			var learnString = isFirefox ? 'Learn about DOGE<br><br>dogecoin.com (so educate!)' : 'Click to learn about DOGE<br><br>(so educate!)';
			var infoLabel = new Label(infoString);
			infoLabel.textList = [infoString, infoString,
				donateString, donateString,
				'Asset credits: such thank!<br><br>Doge sprite: Pavlos8 (pavlos8.deviantart.com)',
				'Sound fx: timgormly (www.freesound.org/people/timgormly)<br><br>Car sprites: skorpio (opengameart.org/users/skorpio)',
				'Car sprites: SpriteLand (www.spriteland.com/sprites)<br><br>Jeep sprite: yd (opengameart.org/users/yd)',
				'Bomb sprite: digit1024 (opengameart.org/users/digit1024)<br><br>Laser sprite: Master484 (m484games.ucoz.com)',
				'Fire sprite: XenosNS (opengameart.org/users/xenosns)<br><br>Tree sprites: David Gervais (pousse.rapiere.free.fr)',
				'Smoke sprites: MrBeast (opengameart.org/users/mrbeast)<br><br>Car sprite: lowpoly (www.my-bestgames.com/lowpoly.html)',
				learnString, learnString];
			infoLabel.x = game.width / 6;
			infoLabel.y = game.height / 2.25;
			infoLabel.color = 'cyan';
			infoLabel.font = '24px Comic Sans MS';
			infoLabel.textAlign = 'left';
			infoLabel.tick = 0;
			infoLabel.tickModulus = 50;
			infoLabel.addEventListener(Event.ENTER_FRAME, function() {
				infoLabel.tick++;
				if (infoLabel.tick % infoLabel.tickModulus === 0)  {
					infoLabel.text = infoLabel.textList[infoLabel.tick / infoLabel.tickModulus];
					if (infoLabel.tick >= infoLabel.textList.length * infoLabel.tickModulus) {
						infoLabel.tick = -1;
					}
				}
			});
			infoLabel.addEventListener(Event.TOUCH_START, function() {
				var index = Math.floor(infoLabel.tick / infoLabel.tickModulus);
				if (index === 2 || index === 3) { // donate link
					openLink('http://djv2mmq1jocj7.cloudfront.net/support.html#donate')
				}
				else if (index === 10 || index === 11) { // learn about DOGE and PND
					openLink('http://djv2mmq1jocj7.cloudfront.net/support.html#learn')
				}
				else { // asset credits
					openLink('http://djv2mmq1jocj7.cloudfront.net/support.html#credits')
				}
			});

			var tunesYesText = 'Music: Yes';
			var tunesNoText = 'Music: No';
			var musicToggleLabel = new Label(musicOn ? tunesYesText : tunesNoText);
			musicToggleLabel.x = game.width / 2;
			musicToggleLabel.y = game.height / 2.25;
			musicToggleLabel.color = 'yellow';
			musicToggleLabel.font = '24px Comic Sans MS';
			musicToggleLabel.textAlign = 'right';
			musicToggleLabel.addEventListener(Event.TOUCH_START, function() {
				if (musicOn) {
					musicToggleLabel.text = tunesNoText;
					musicOn = false;
					stopMusic('intro');	// turn off intro music
				}
				else {
					musicToggleLabel.text = tunesYesText;
					musicOn = true;
					startMusic('intro');
				}
				setObject('musicOn', musicOn);
			});

			var fxYesText = 'Sound FX: Yes';
			var fxNoText = 'Sound FX: No';
			var fxToggleLabel = new Label(fxOn ? fxYesText : fxNoText);
			fxToggleLabel.x = game.width / 2;
			fxToggleLabel.y = game.height / 2; //(game.height / 2.25) + 100;
			fxToggleLabel.color = 'yellow';
			fxToggleLabel.font = '24px Comic Sans MS';
			fxToggleLabel.textAlign = 'right';
			fxToggleLabel.addEventListener(Event.TOUCH_START, function() {
				if (fxOn) {
					fxToggleLabel.text = fxNoText;
					fxOn = false;
				}
				else {
					fxToggleLabel.text = fxYesText;
					fxOn = true;
				}
				setObject('fxOn', fxOn);
			});

			// Game Over label
			var gameOverString = "Tap to Start<br><br>" + (score === 0 ? "When Ready!" : "GAME OVER");
			var gameOverLabel = new Label(gameOverString);
			gameOverLabel.x = game.width / 8;
			gameOverLabel.y = game.height * 3/4;
			gameOverLabel.color = 'green';
			gameOverLabel.font = '28px Comic Sans MS';
			gameOverLabel.textAlign = 'left';

			var smartDoge = new Sprite(250, 250);
			smartDoge.image = game.assets['img/pixelDoge250.png'];
			smartDoge.x = game.width / 2;
			smartDoge.y = game.height * 2/3;

			// add Sprite Doge picture
			this.addChild(smartDoge);

			// Add labels
			this.addChild(titleLabel);
			this.addChild(scoreLabel);
			this.addChild(wowScoreLabel);
			this.addChild(infoLabel);
			this.addChild(musicToggleLabel);
			this.addChild(fxToggleLabel);
			this.addChild(gameOverLabel);

			// Listen for taps
			titleLabel.addEventListener(Event.TOUCH_START, this.touchToRestart);
			scoreLabel.addEventListener(Event.TOUCH_START, this.touchToRestart);
			wowScoreLabel.addEventListener(Event.TOUCH_START, this.touchToRestart);
			smartDoge.addEventListener(Event.TOUCH_START, this.touchToRestart);
			gameOverLabel.addEventListener(Event.TOUCH_START, this.touchToRestart);
	
			// make sure intro music loops
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		touchToRestart: function(evt) {
			stopMusic('intro');	// stop looping any intro music
			Game.instance.replaceScene(new SceneGame());
		},

		update: function(evt) {
			loopMusicIfNeeded('intro');
		}
	});
}
