const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 350},
      debug: false
      
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  autoFocus: false
};

class CustomGame extends Phaser.Game {
  constructor(config, roomID, hostSocket) {
    super(config);
    this.roomID = roomID;
    this.hostSocket = hostSocket;
    this.players = {}
    this.leaderboard = [];
    this.winners = [];
    this.gameTime = 100 * 1000; // Time in ms
  }

  // All function below refer to self as game object (Phaser advises against lols)
  addPlayer(socket, nickname) {
    var self = this;
    if (!self.initialized) {return;}
    var currScene = this.scene.scenes[0];
    if (currScene.players[socket.id]) { return; }
    console.log("User: "+ socket.id +" joined lobby: "+self.roomID);
    currScene.leaderboard.push([socket.id,nickname, 0]); // Leaderboard sorted by join order
    currScene.players[socket.id] = {
      rotation: 0,
      x: self.canvas.width/2,
      y: self.canvas.height/2,
      playerID: socket.id,
      nickname: nickname,
      input: {
        jump: false
      },
      dead: false
    }

    self.addPhysicsPlayer(self, currScene.players[socket.id]);

    console.log('-Current players-')
    console.log(currScene.players)
  }

  // Function for removing players
  removePlayer(playerID) {
    var self = this;
    if(!self.initialized) return; 
    const currScene = this.scene.scenes[0]; // Get current scene

    // Remove player from players object
    delete currScene.players[playerID];

    // Remove player from physics object
    currScene.physicsPlayers.getChildren().forEach((player) => {
      if (playerID === player.playerID) {
        player.destroy();
      }
    });
    
    // Remove player from leaderboard object
    for(var i = 0; i < currScene.leaderboard.length; i++) {
      if (currScene.leaderboard[i][0] === playerID) {
        currScene.leaderboard.splice(i,1);
      }
    }

    console.log('Player: ' +  playerID + ' has been removed from game: ' + this.roomID)

    io.to(self.roomID).emit('playerDisconnect', playerID); // Tell room of player disconnect so they can stop rendering them
  }

  
  // Adds a new player object to the physicsPlayers object
  addPhysicsPlayer(self, playerInfo) {
    var self = this;
    if(!self.initialized) return;
    var currScene = this.scene.scenes[0];
    const player = currScene.physics.add.image(playerInfo.x, playerInfo.y, 'bird').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    player.setDrag(100);
    player.setAngularDrag(100);
    player.setMaxVelocity(200);
    // player.setGravityY(100);
    player.playerID = playerInfo.playerID;
    currScene.physicsPlayers.add(player);

  }

  // Adds the obstacles to the scene
  addPhysicsTubes(tubePoints, physicsObj) {
    var self = this;
    var currScene = this.scene.scenes[0];
    for(var i = 0; i < tubePoints.length; i++) {
      var multipoint = tubePoints[i];
      var x = multipoint[0];
      var y1 = multipoint[1][0];
      var y2 = multipoint[1][1];

      const pipeTop = currScene.physicsTubes.create(x, y1, 'pipe').setOrigin(0.5, 1).setDisplaySize(80, 600);
      pipeTop.body.allowGravity = false;
      pipeTop.body.immovable = true;
      
      const pipeBottom = currScene.physicsTubes.create(x, y2, 'pipe').setOrigin(0.5, 0).setDisplaySize(80, 600);
      pipeBottom.body.allowGravity = false
      pipeBottom.body.immovable = true;
    }
  }

  // Function for starting the game
  startGame() {
    var self = this;
    console.log('Game attempting to start');
    if (!self.initialized) { return; }
    // currScene is reference to the scene
    var currScene = this.scene.scenes[0];
    if (currScene.started) { return; }
    if (currScene.countingDown) { return; }

    // Send the current players in lobby and also the generated tubePoints
    currScene.countingDown = true;

    console.log('GAME ABOUT TO START');

    console.log('Countdown begin!');

    // Countdown timer
    timer(5);
    function timer (count) {
      let timer = setInterval(()=>{
        console.log(count)
        io.to(self.roomID).emit('countdown',count);
        if(count==0) { 
          clearInterval(timer); 
          currScene.started = true;
          currScene.countingDown = false;
          io.to(self.roomID).emit('gameData',currScene.players,currScene.tubePoints);
          currScene.physics.resume();

          // Start game timer
          currScene.time.addEvent({delay:100,callback: () => {
            self.gameTime -= 100;
          }, callbackScope: self, loop: true});
        }
        count--;
      }, 1000);
      
    }

  }


  // Once game finishes this method is called to delete itself.
  endGame() {
    // Delete game
    console.log('Deleteing game '+ this.roomID);
    const ID = this.roomID;
    games[ID].destroy(true,false);
    games[ID] = null;
    delete games[ID];
  }
}

function preload() {
  this.canvas = this.sys.game.canvas;
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
}
function create() {
  const self = this;
  this.started = false;
  this.physics.pause();

  // Pass in (game) variable to the (Scene) instance
  this.hostSocket = this.game.hostSocket;
  this.roomID = this.game.roomID; // Take room ID from passed in value

  // Three objects holding player data
  this.physicsPlayers = this.physics.add.group();
  this.physicsTubes = this.physics.add.group();

  this.leaderboard = this.game.leaderboard;
  this.players = this.game.players;

  this.physics.world.setBounds(0, 0, self.canvas.width*2, self.canvas.height);


  // Min: min value, max: max (y) value, spaceApart: distance between pipe openings
  // spaceApart: distance between sets of pipes
  function generateTubes(min,max,spaceBetween,spaceApart,startingPoint) {
    const tubes = [];
    for (var i = 0; i < 10; i++) {
      var x = startingPoint + (i * spaceApart);
      var y1 = randomPosition(min,max-spaceBetween);
      var y2 = y1 + spaceBetween;
      tubes.push([x,[y1,y2]]); // X position
    }
    return tubes;
  }

  // Helper to get random value from min to max
  function randomPosition(min,max) {
    return Math.floor(Math.random() * max) + min;
  }

  
  // Obstacle and player physics collider
  this.physics.add.collider(this.physicsPlayers, this.physicsTubes, function (player, obstacle) {
    player.x = self.game.canvas.width/2;
    player.y = self.game.canvas.height/2;
    self.players[player.playerID].x = self.game.canvas.width/2;
    self.players[player.playerID].y = self.game.canvas.height/2;  
  });

  this.tubePoints = generateTubes(20,self.canvas.height-20,250,300,self.canvas.width+10); // adding commit tubes
  this.game.addPhysicsTubes(this.tubePoints,this.physicsTubes);

  this.physics.world.setBounds(0, 0, this.tubePoints[this.tubePoints.length-1][0]+100, self.canvas.height);

  this.game.initialized = true;
  console.log('Lobby '+ this.roomID+ ' initialized!');
  this.hostSocket.emit('lobbyInitialized', this.roomID); // Tell the host that the lobby is ready to join
}


function update() {

  // Make sure game is started and initialized
  if (this.game.initialized && this.started) {

    // END GAME 
    if (this.game.gameTime<=0 || this.game.leaderboard.length===0) {
      console.log('Game Over!');
      io.to(this.roomID).emit('gameOver', (this.game.winners));
      this.game.endGame();
    }

    this.physicsPlayers.getChildren().forEach( (player)=> {
      // Check if player has got to finish line
      if (player.x >= this.tubePoints[this.tubePoints.length-1][0]+10) {
        console.log('Player ' + player.playerID + ' has reached the finish line!');

        this.game.winners.push(this.players[player.playerID].nickname);

        // Tell the player they have won
        io.to(player.playerID).emit('playerWin', (this.game.winners));

        // Send winners to clients
        io.to(this.roomID).emit('winners', (this.game.winners));

        // Remove player from game but keep in lobby
        this.game.removePlayer(player.playerID);

      } else if (this.players[player.playerID]) {

        const input = this.players[player.playerID].input;
      
        // Update Player Movement
        player.setVelocityX(55);
        if(input.jump) {
          player.setVelocityY( -275 );
        }
        input.jump = false;
        
        // Update players object
        this.players[player.playerID].x = player.x;
        this.players[player.playerID].y = player.y;

        // Wrap physics world (so you can fall through the ground and end up at the top)
        this.physics.world.wrap(this.physicsPlayers, 5);

        // Emit player updates to the players
        io.to(this.roomID).emit('playerUpdates', this.players,this.game.gameTime);
      }
    });  
  }
}







