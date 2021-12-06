
function makeGameTest() {
  console.log("Making Game Test");
  return {
    player: "jimmy"
  }
}
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
    //this.leaderboard = [];

  }

  addPlayer(socket) {
    var self = this;
    if (!self.initialized) {return;}
    var currScene = this.scene.scenes[0];
    if (currScene.players[socket.id]) { return; }
    console.log("User: "+ socket.id +" joined lobby: "+self.roomID);
    currScene.leaderboard.push([socket.id,0]); // Leaderboard sorted by join order
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
    console.log('curr scene players')
    console.log(currScene.players[playerId])
    console.log('end')


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

  // Emits player updates to room
  // emitPlayerUpdates(io) {
  //   if(!self.initialized) return;
  //   io.to(this.roomID).emit('playerUpdates', players);
  // }

  

}

function preload() {
  this.canvas = this.sys.game.canvas;
  this.load.image('bird', 'assets/bird.png');
  this.load.image('pipe', 'assets/pipe.png');
}
function create() {
  const self = this;
  console.log('new game lobby being created')
  console.log(self)

  this.hostSocket = this.game.hostSocket;
  this.roomID = this.game.roomID; // Take room ID from passed in value

  // three objects holding player data
  this.physicsPlayers = this.physics.add.group();
  this.leaderboard = this.game.leaderboard;
  this.players = this.game.players;


  // Create tubes

  this.physics.add.collider(this.physicsPlayers);

  // Add tube hitbox
  // this.physics.add.overlap(this.physicsPlayers,,function(star,player)=>{

  // });



  this.game.initialized = true;
  console.log('Lobby '+ this.roomID+ ' initialized!');
  this.hostSocket.emit('lobbyInitialized', this.roomID);
}

function update() {
  const self = this;
  // if (!this.initialized) return;
  // if (this.test === true) {
  //   console.log("single and ready to mingle")
  //   console.log(self)
  //   this.test = false;
  //   return
  // }
  if (this.initialized) {
    this.physicsPlayers.getChildren().forEach( (player)=> {
      console.log('check')
      const input = self.players[player.playerID].input;
      player.setVelocityX(100); // update players x velocity
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






// Makes a new phaser instance passing in a socketIO room


// function makeGame(roomID) {
//   const players = {};
  


//   function preload() {
//     this.load.image('ship', 'assets/playerShip1_blue.png');
//     this.load.image('star', 'assets/star_gold.png');
//   }
//   function create() {
//     const self = this;
//     this.players = this.physics.add.group();


//     io.on('connect-room-roomID', function (socket) {
//       console.log('a user connected to room');
//       // // create a new player and add it to our players object
//       // players[socket.id] = {
//       //   rotation: 0,
//       //   x: Math.floor(Math.random() * 700) + 50,
//       //   y: Math.floor(Math.random() * 500) + 50,
//       //   playerId: socket.id,
//       //   team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',

//       //   input: {
//       //     left: false,
//       //     right: false,
//       //     up: false
//       //   }
//       // };
//       // console.log(players)
//       // // add player to server
//       // addPlayer(self, players[socket.id]);
//       // // send the players object to the new player
//       // socket.emit('currentPlayers', players);
//       // // update all other players of the new player
//       // socket.broadcast.emit('newPlayer', players[socket.id]);
//       // // send the star object to the new player
//       // socket.emit('starLocation', { x: self.star.x, y: self.star.y });
//       // // send the current scores
//       // socket.emit('updateScore', self.scores);

      
//       // socket.on('disconnect', function () {
//       //   console.log('user disconnected');
//       //   // remove player from server
//       //   removePlayer(self, socket.id);
//       //   // remove this player from our players object
//       //   delete players[socket.id];

//       //   // emit a message to all players to remove this player
//       //   io.emit('player_disconnect', socket.id);
//       // });

//       // // when a player moves, update the player data
//       // socket.on('playerInput', function (inputData) {
//       //   handlePlayerInput(self, socket.id, inputData);
//       // });
      
//     });

//     // this.scores = {
//     //   blue: 0,
//     //   red: 0
//     // };
//     // this.star = this.physics.add.image(randomPosition(700), randomPosition(500), 'star');
//     // this.physics.add.collider(this.players);
//     // this.physics.add.overlap(this.players, this.star, function (star, player) {
//     //   if (players[player.playerId].team === 'red') {
//     //     self.scores.red += 10;
//     //   } else {
//     //     self.scores.blue += 10;
//     //   }
//     //   self.star.setPosition(randomPosition(700), randomPosition(500));
//     //   io.emit('updateScore', self.scores);
//     //   io.emit('starLocation', { x: self.star.x, y: self.star.y });
//     // });

//   }

  // function update() {
    
  //   // this.players.getChildren().forEach((player) => {
  //   //   const input = players[player.playerId].input;
  //   //   if (input.left) {
  //   //     player.setAngularVelocity(-300);
  //   //   } else if (input.right) {
  //   //     player.setAngularVelocity(300);
  //   //   } else {
  //   //     player.setAngularVelocity(0);
  //   //   }
  //   //   if (input.up) {
  //   //     this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
  //   //   } else {
  //   //     player.setAcceleration(0);
  //   //   }
  //   //   players[player.playerId].x = player.x;
  //   //   players[player.playerId].y = player.y;
  //   //   players[player.playerId].rotation = player.rotation;
  //   // });
  //   // this.physics.world.wrap(this.players, 5);
  //   // io.emit('playerUpdates', players);

  // }

//   function randomPosition(max) {
//     return Math.floor(Math.random() * max) + 50;
//   }

//   function handlePlayerInput(self, playerId, input) {
//     self.players.getChildren().forEach((player) => {
//       if (playerId === player.playerId) {
//         players[player.playerId].input = input;
//       }
//     });
//   }

//   function addPlayer(self, playerInfo) {
//     const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
//     player.setDrag(100);
//     player.setAngularDrag(100);
//     player.setMaxVelocity(200);
//     player.playerId = playerInfo.playerId;
//     self.players.add(player);
//   }
//   function removePlayer(self, playerId) {
//     self.players.getChildren().forEach((player) => {
//       if (playerId === player.playerId) {
//         player.destroy();
//       }
//     });
//   }
//   const game = new Phaser.Game(config);
//   // const game2 = new Phaser.Game(config);
//   window.gameLoaded();
//   return game;
// }
