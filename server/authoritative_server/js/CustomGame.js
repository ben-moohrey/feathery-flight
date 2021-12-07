
const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    fps: 60,
    arcade: {
      gravity: { y: 350},
      debug: true
      
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

      // console.log('hm')
      // May have hitbox problem
      // Top pipe 
      // const pipe1 = currScene.physics.add.image(x, y1, 'pipe').setOrigin(0.5, 1).setDisplaySize(80, 600).flipX;
      // const pipe2 = currScene.physics.add.image(x, y2, 'pipe').setOrigin(0.5, 0).setDisplaySize(80, 600);

      // console.log('hmpr2')
      // currScene.physicsTubes.add(pipe1);
      // currScene.physicsTubes.add(pipe2);
      // console.log('its never easy')
      const pipeTop = currScene.physicsTubes.create(x, y1, 'pipe').setOrigin(0.5, 1).setDisplaySize(80, 600);
      pipeTop.body.allowGravity = false;
      


      const pipeBottom = currScene.physicsTubes.create(x, y2, 'pipe').setOrigin(0.5, 0).setDisplaySize(80, 600);
      pipeBottom.body.allowGravity = false
    }
  }

  startGame() {
    var self = this;
    console.log('Game attempting to start');
    if (!self.initialized) { return; }
    // currScene is reference to the scene
    var currScene = this.scene.scenes[0];
    if (currScene.started) { return; }

    // Send the current players in lobby and also the generated tubePoints
    io.to(self.roomID).emit('gameData',currScene.players,currScene.tubePoints);
    currScene.started = true;

    console.log('GAME STARTED');

    console.log('Countdown begin!');
    console.log('3')
    io.to(self.roomID).emit('countdown',3);
    setTimeout( () => {
      console.log('2')
      io.to(self.roomID).emit('countdown',2);
      setTimeout( () => {
        console.log('1');
        io.to(self.roomID).emit('countdown',1);
        setTimeout(() => {
          console.log("GO")
          io.to(self.roomID).emit('countdown',0);
          currScene.physics.resume();
        },1000)
      },1000)
    },1000)

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
    for (var i = 0; i < 20; i++) {
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
  

  // TODO: Create tubes
  // this.physics.add.collider(this.physicsPlayers);

  // Add tube hitbox
  // this.physics.add.overlap(this.physicsPlayers,,function(star,player)=>{

  this.physics.add.collider(this.physicsPlayers, this.physicsTubes, function (player, obstacle) {
    console.log('You hit a tube');

      
  });
  // });
  // generateTubes(min,max,spaceBetween,spaceApart,startingPoint)
  //generateTubes(20,self.canvas.height-20,150,300,self.canvas.width+10);
  this.tubePoints = generateTubes(20,self.canvas.height-20,150,300,self.canvas.width+10); // adding commit tubes
  this.game.addPhysicsTubes(this.tubePoints,this.physicsTubes);



  
  // this.physics.add.overlap(this.players, this.star, function (star, player) {
  //   if (players[player.playerId].team === 'red') {
  //     self.scores.red += 10;
  //   } else {
  //     self.scores.blue += 10;
  //   }
  //   self.star.setPosition(randomPosition(700), randomPosition(500));
  //   io.emit('updateScore', self.scores);
  //   io.emit('starLocation', { x: self.star.x, y: self.star.y });
  // });

  this.game.initialized = true;
  console.log('Lobby '+ this.roomID+ ' initialized!');
  this.hostSocket.emit('lobbyInitialized', this.roomID);
  
}


function update() {
  const self = this;

  // Make sure game is started and initialized
  
  if (this.game.initialized && this.started && Object.keys(self.players).length>0) {
    self.physicsPlayers.getChildren().forEach( (player)=> {
      const input = self.players[player.playerID].input;
      player.setVelocityX(55); // Update players x velocity

      if(input.jump) {
        player.setVelocityY( -300 );
      }
      input.jump = false;
  
      self.players[player.playerID].x = player.x;
      self.players[player.playerID].y = player.y;
      self.players[player.playerID].rotation = player.rotation;
    });
    self.physics.world.wrap(self.physicsPlayers, 5);
    io.to(self.roomID).emit('playerUpdates', self.players);
  }

}





