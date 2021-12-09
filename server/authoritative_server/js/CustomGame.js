
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

  removePlayer(playerId) {
    var self = this;
    if(!self.initialized) return; 
    const currScene = this.scene.scenes[0];
    delete currScene.players[playerId];
    currScene.physicsPlayers.getChildren().forEach((player) => {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
    
    

    for(var i = 0; i < currScene.leaderboard.length; i++) {
      if (currScene.leaderboard[i][0] === playerId) {
        currScene.leaderboard.splice(i,1);
      }
    }

  }

  

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
        }
        count--;
      }, 1000);
      
    }

  }

  // endGame() {
  //   this.render.destroy();
  //   this.loop.stop();
  //   this.canvas.remove();
  // }


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
  console.log('New game lobby being created')

  // Pass in (game) variable to the (Scene) instance
  this.hostSocket = this.game.hostSocket;
  this.roomID = this.game.roomID; // Take room ID from passed in value

  // Three objects holding player data
  this.physicsPlayers = this.physics.add.group();
  this.physicsTubes = this.physics.add.group();

  this.leaderboard = this.game.leaderboard;
  this.players = this.game.players;

  this.physics.world.setBounds( 0, 0, self.canvas.width*2, self.canvas.height);


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
  function randomPosition(min,max) {
    return Math.floor(Math.random() * max) + min;
  }

  

  this.physics.add.collider(this.physicsPlayers, this.physicsTubes, function (player, obstacle) {
    console.log('You hit a tube');

    player.x = self.game.canvas.width/2;
    player.y = self.game.canvas.height/2;
    self.players[player.playerID].x = self.game.canvas.width/2;
    self.players[player.playerID].y = self.game.canvas.height/2;

      
  });

  this.tubePoints = generateTubes(20,self.canvas.height-20,250,300,self.canvas.width+10); // adding commit tubes
  this.game.addPhysicsTubes(this.tubePoints,this.physicsTubes);

  console.log(this.tubePoints) //this.tubePoints[20][0]

  this.physics.world.setBounds(0, 0, this.tubePoints[this.tubePoints.length-1][0]+100, self.canvas.height);


  this.game.initialized = true;
  console.log('Lobby '+ this.roomID+ ' initialized!');
  this.hostSocket.emit('lobbyInitialized', this.roomID);

}


function update() {
  const self = this;

  // END GAME crappy logic - fix this shit
  // if (self.game.leaderboard.length === 0 ) {
  //   console.log('game over');
  //   self.game.endGame();
  // }
  // Make sure game is started and initialized
  if (this.game.initialized && this.started) {

    try {
      self.physicsPlayers.getChildren().forEach( (player)=> {
        // Check if player has got to finish line
        if (player.x >= this.tubePoints[this.tubePoints.length-1][0]+10) {
          console.log('Player ' + player.playerID + ' has reached the finish line!');

          // Remove player from game but keep in lobby
          self.game.removePlayer(player.playerID);

          // Tell the player they have won
          io.to(player.ID).emit('playerWin');

          // Send winners to clients
          self.game.winners.push(self.players[player.playerID].nickname);
          io.to(self.roomID).emit('winners', (self.game.winners));


          
        } else if (self.players[player.playerID]) {
          
          const input = self.players[player.playerID].input;
          


          player.setVelocityX(55); // Update players x velocity
          if(input.jump) {
            player.setVelocityY( -300 );
          }
          input.jump = false;
          
          self.players[player.playerID].x = player.x;
          self.players[player.playerID].y = player.y;
   
        }
        self.physics.world.wrap(self.physicsPlayers, 5);
        io.to(self.roomID).emit('playerUpdates', self.players);

      });
    }
    catch (error) {
      console.log('Player no longer exist!')
    }
    
  }
  

}





