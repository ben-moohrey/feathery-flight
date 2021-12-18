

// store key=socket.id, value = roomID
const clientRooms = {}


const games = {} // Store phaser game instances
const ROOM_CAPACITY = 20; // Max users in room
const ROOM_TIMEOUT = 100; // Room timeout in secconds



io.on("connection", socket => {
    const self = this; // Create reference to this
    console.log('User: '+ socket.id +' connected to server'); // Log new socket connection

    socket.on('createNewLobby', handleNewLobby);
    socket.on('joinGame', handleJoinGame);


    // Function to handle creation of new game lobby
    function handleNewLobby() {
        console.log("Spawing a new game!");
        let roomID = makeid(6); 

        // Create a new roomID (that doesnt already exist)
        while (roomID in games) {
            roomID = makeid(6);
        }
        
        // Spawn a new (headless) phaser instance.  (config file, roomID, hostSocket)
        games[roomID] = new CustomGame(config,roomID,socket); 
        console.log(games);
    }

  
    // Function to handle a new user trying to join a specific game lobby
    function handleJoinGame(roomID,nickname) {
        console.log(socket.id+' attemping to join lobby: ' + roomID);

        // Make sure game exists
        var game = games[roomID];
        if (!game) {
            console.log('Lobby' + roomID +' does not exist!');
            socket.emit('joinLobbyStatus',roomID,'not-a-room');
            return;
        }

        // Get room 
        const room = io.sockets.adapter.rooms.get(roomID);

        // Check if the room is full 
        if(room && room.size>ROOM_CAPACITY) {
            console.log('Lobby' + roomID +' is full! :(');
            socket.emit('joinLobbyStatus',roomID,'room-full');
            return;
        }

        // Join room
        clientRooms[socket.id] = roomID;
        socket.join(roomID);

        // Check if game has already been started
        if(game.scene.scenes[0].started) {
            console.log('Game in lobby ' + roomID + ' has already begun :(');
            socket.leave(roomID);
            socket.emit('joinLobbyStatus',roomID,'game-begun');
            return;
        }

        // JOIN SUCCESS

        // emit join success
        game.addPlayer(socket,nickname);
     
        // Send updated leaderboard to room
        io.to(roomID).emit('updateLeaderBoard', game.scene.scenes[0].leaderboard); // game.scene.scene[0].players

        // Completely done joining
        socket.emit('joinLobbyStatus', roomID, 'join-successful');
        
    }


    // Listener that waits for start game responses from the hosts of games
    socket.on('startGameLobby', () => { 
        // Check that room exists
        if (!games[clientRooms[socket.id]]) { return; }

        var game = games[clientRooms[socket.id]];

        // Check if user is host
        if(game.hostSocket.id !== socket.id) { return; }

        console.log('GAME STARTING');

        // Tell all players waiting in lobby that game is about to start
        socket.broadcast.to(clientRooms[socket.id]).emit('gameStartingNow');
        
        // start game
        game.startGame();
    });


    // Listener for player input
    socket.on('playerInput', function(inputData) {
        if (!clientRooms[socket.id]) { return; }
        var localRoomName = clientRooms[socket.id];

        handlePlayerInput(self, socket.id, inputData, localRoomName);
    });

  
    // Helper function for playerInput listener
    function handlePlayerInput(self, playerID, input, rn) {
        // Get game (rn = roomName/roomID)
        if (!games[rn]) { return; }
        var game = games[rn];

        // Check if player has been removed from game
        if (!game.players[playerID]) {return; }
        game.scene.scenes[0].physicsPlayers.getChildren().forEach((player) => {
            if (playerID === player.playerID) {
                game.scene.scenes[0].players[player.playerID].input = input;
            }
        });
    }

    // Listener for socket disconnect
    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        var game = games[clientRooms[socket.id]];
        if (game) {
            game.removePlayer(socket.id); // Remove player from serverside game
            io.to(clientRooms[socket.id]).emit('updateLeaderBoard', game.scene.scenes[0].leaderboard); // Send list of players (leaderboard) to client room
            console.log(game.players); // Log the players
            delete clientRooms[socket.id]; // Delete the room-client reference from clientRooms

            if (game.leaderboard<=0) {
                game.endGame();
                return;
            }
        }
    });
});

