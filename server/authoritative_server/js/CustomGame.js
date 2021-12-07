
const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 300 }
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
  }

  // All function below refer to self as game object (Phaser advises against lols)
  addPlayer(socket) {
    var self = this;
    if (!self.initialized) {return;}
    var currScene = this.scene.scenes[0];
    if (currScene.players[socket.id]) { return; }
    console.log("User: "+ socket.id +" joined lobby: "+self.roomID);
    currScene.leaderboard.push([socket.id,socket.nickname, 0]); // Leaderboard sorted by join order
    currScene.players[socket.id] = {
      rotation: 0,
      x: self.canvas.width/2,
      y: self.canvas.height/2,
      playerID: socket.id,
      nickname: socket.nickname,
      input: {
        jump: false
      }
    }

    self.addPhysicsPlayer(self, currScene.players[socket.id]);

    console.log('-Current players-')
    console.log(currScene.players)
  }

  removePlayer(playerId) {
    var self = this;
    if(!self.initialized) return; 
    const currScene = this.scene.scenes[0];
    currScene.physicsPlayers.getChildren().forEach((player) => {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
    
    delete currScene.players[playerId];

    for(var i = 0; i < currScene.leaderboard.length; i++) {
      if (currScene.leaderboard[i][0] === playerId) {
        currScene.leaderboard.splice(i,1);
      }
    }

  }

  generateTubes(edgeJustify,spaceBetweenY,spaceBetweenX,startingPoint) {
    const min = edgeJustify;
    const max = edgeJustify-min;
    const tubes = new Array(20);
    for (var i = 0; i < tubes.length; i++) {
      tubes[i][0] = startingPoint + (i * spaceBetweenX);
      tubes[i][1] = this.randomPosition(min,max);
    }
  }
  randomPosition(min,max) {
    return Math.floor(Math.random() * max) + min;
  }

  addPhysicsPlayer(self, playerInfo) {
    if(!self.initialized) return;
    var currScene = this.scene.scenes[0];
    const player = currScene.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    player.setDrag(100);
    player.setAngularDrag(100);
    player.setMaxVelocity(200);
    player.playerId = playerInfo.playerId;
    currScene.physicsPlayers.add(player);
  }

}

function preload() {
  this.canvas = this.sys.game.canvas;
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
}
function create() {
  const self = this;
  var started = false;
  console.log('New game lobby being created')

  // Pass in (game) variable to the (Scene) instance
  this.hostSocket = this.game.hostSocket;
  this.roomID = this.game.roomID; // Take room ID from passed in value

  // Three objects holding player data
  this.physicsPlayers = this.physics.add.group();
  this.leaderboard = this.game.leaderboard;
  this.players = this.game.players;

  // TODO: Create tubes
  this.physics.add.collider(this.physicsPlayers);

  // Add tube hitbox
  // this.physics.add.overlap(this.physicsPlayers,,function(star,player)=>{

  // });

  this.game.initialized = true;
  console.log('Lobby '+ this.roomID+ ' initialized!');
  this.hostSocket.emit('lobbyInitialized', this.roomID);

  function startGame() {
    if (!self.game.initialized) { return; }
    self.gameStarted = true; 

  }
}

function update() {
  const self = this;

  // Make sure game is initialized
  if (this.initialized) {
    this.physicsPlayers.getChildren().forEach( (player)=> {
      const input = self.players[player.playerID].input;
      player.setVelocityX(100); // Update players x velocity
      if(input.jump) {
        player.setVelocityY(120);
      }
      else {
        player.setAcceleration(0);
      }
  
      self.players[player.playerID].x = player.x;
      self.players[player.playerID].y = player.y;
      self.players[player.playerID].rotation = player.rotation;
    });
    this.physics.world.wrap(this.players, 5);
    io.to(this.roomID).emit('playerUpdates', players);
  }

}





