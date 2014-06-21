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

// 2 - On document load 
window.onload = function() {
	// 3 - Starting point
	//var game = new Game(320, 440);

	console.log('screenSize:', screenSize);
	//var screenWidth = 320;
	var screenWidth = 694;
	//var screenHeight = 440;
	var screenHeight = 954;
	var game = new Game(screenWidth, screenHeight);

	// 4 - Preload resources
	//game.preload('img/BG.png', 'img/penguinSheet.png', 'img/Ice.png'); //, 'snd/Hit.mp3', 'snd/bgm.mp3');
	game.preload('img/gameBg.png', 'img/dogeCarSheet.png', 'img/dogecoin104.png'); //, 'snd/Hit.mp3', 'snd/bgm.mp3');

	// 5 - Game settings
	game.fps = 30;
	//game.scale = 1;
	game.scale = .462
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
			var game, label, bg, penguin, iceGroup;
			
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
			bg = new Sprite(694, 954);
			bg.image = game.assets['img/gameBg.png'];

			// Penguin
			penguin = new Penguin();
			penguin.x = game.width/2 - penguin.width/2;
			//penguin.y = 280;
			penguin.y = 606;
			this.penguin = penguin;

			// Ice group
			iceGroup = new Group();
			this.iceGroup = iceGroup;

			// 4 - Add child nodes        
			this.addChild(bg);        
			this.addChild(iceGroup);
			this.addChild(penguin);
			this.addChild(label);

			// Touch listener
			this.addEventListener(Event.TOUCH_START,this.handleTouchControl);

			// Update
			this.addEventListener(Event.ENTER_FRAME, this.update);

			// Instance variables
			this.generateIceTimer = 0;
			this.scoreTimer = 0;
			this.score = 0;

			// Background music
			//this.bgm = game.assets['snd/bgm.mp3']; // Add this line
			// Start BGM
			//this.bgm.play();
		},

		handleTouchControl: function (evt) {
			var laneWidth, lane;
			//laneWidth = 320/3;
			laneWidth = 694/3;
			lane = Math.floor(evt.x/laneWidth);
			lane = Math.max(Math.min(2,lane),0);
			this.penguin.switchToLaneNumber(lane);
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
			this.generateIceTimer += evt.elapsed * 0.001;
			if (this.generateIceTimer >= 0.5) {
				var ice;
				this.generateIceTimer -= 0.5;
				ice = new Ice(Math.floor(Math.random()*3));
				this.iceGroup.addChild(ice);
			}

			// Check collision
			for (var i = this.iceGroup.childNodes.length - 1; i >= 0; i--) {
				var ice = this.iceGroup.childNodes[i];

				if (ice.intersect(this.penguin)){
					var game = Game.instance;
					//game.assets['snd/Hit.mp3'].play();
					this.iceGroup.removeChild(ice);    

					// Game over
				    //this.bgm.stop();
					game.replaceScene(new SceneGameOver(this.score));        
				    break;
				}
			}
			// Loop BGM
			//if (this.bgm.currentTime >= this.bgm.duration ){
			//	this.bgm.play();
			//}
		}
	});

	// Penguin
	var Penguin = Class.create(Sprite, {
		// The player character.     
		initialize: function() {
			// 1 - Call superclass constructor
			//Sprite.apply(this,[30, 43]);
			Sprite.apply(this,[65, 82]);
			this.image = Game.instance.assets['img/dogeCarSheet.png'];
			// 2 - Animate
			this.animationDuration = 0;
			this.addEventListener(Event.ENTER_FRAME, this.updateAnimation);
		},

		updateAnimation: function (evt) {        
			this.animationDuration += evt.elapsed * 0.001;       
			if (this.animationDuration >= 0.25) {
				this.frame = (this.frame + 1) % 2;
				this.animationDuration -= 0.25;
			}
		},

		switchToLaneNumber: function(lane){     
			//var targetX = 160 - this.width/2 + (lane-1)*90;
			var targetX = (game.width/2) - this.width/2 + (lane-1)*195;
			this.x = targetX;
		}
	});

	// Ice Boulder
	var Ice = Class.create(Sprite, {
		// The obstacle that the penguin must avoid
		initialize: function(lane) {
			// Call superclass constructor
			//Sprite.apply(this,[48, 49]);
			Sprite.apply(this,[104, 104]);
			this.image  = Game.instance.assets['img/dogecoin104.png'];      
			this.rotationSpeed = 0;
			this.setLane(lane);
			this.addEventListener(Event.ENTER_FRAME, this.update);
		},

		setLane: function(lane) {
			var game, distance;
			game = Game.instance;        
			distance = 90;
			
			this.rotationSpeed = Math.random() * 100 - 50;
			
			this.x = game.width/2 - this.width/2 + (lane - 1) * distance;
			this.y = -this.height;    
			this.rotation = Math.floor( Math.random() * 360 );    
		},

		update: function(evt) { 
			var ySpeed, game;
			
			game = Game.instance;
			//ySpeed = 300;
			ySpeed = 150;
			
			this.y += ySpeed * evt.elapsed * 0.001;
			this.rotation += this.rotationSpeed * evt.elapsed * 0.001;           
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
			gameOverLabel = new Label("GAME OVER<br>Tap to Restart");
			//gameOverLabel.x = 8;
			gameOverLabel.x = 18;
			//gameOverLabel.y = 128;
			gameOverLabel.y = 278;
			gameOverLabel.color = 'white';
			gameOverLabel.font = '64px strong';
			gameOverLabel.textAlign = 'center';

			// Score label
			scoreLabel = new Label('SCORE<br>' + score);
			//scoreLabel.x = 9;
			scoreLabel.x = 20;
			//scoreLabel.y = 32;        
			scoreLabel.y = 70;        
			scoreLabel.color = 'white';
			scoreLabel.font = '32px strong';
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
