

// store key=socket.id, value = roomID
const clientRooms = {}


const games = {} // Store phaser game instances
const ROOM_CAPACITY = 20; // Max users in room
const ROOM_TIMEOUT = 100; // Room timeout in secconds



io.on("connection", socket => {
    
    const self = this;
    console.log('a user connected to server');

    socket.on('createNewLobby', handleNewLobby);
    socket.on('joinGame', handleJoinGame);

    function handleNewLobby() {
        console.log("Handling new game");
        self.hostSocketID = socket.id;
        let roomID = makeid(6); 

        // Check if roomID already exists
        while (roomID in games) {
            roomID = makeid(6);
        }
        
        // Spawn a new (headless) phaser instance. 
        games[roomID] = new CustomGame(config,roomID,socket); 
    }

  

    function handleJoinGame(roomID,nickname) {
        console.log(socket.id+' attemping to join lobby: '+roomID);
        var game = games[roomID];
        if (!game) {
            console.log('Lobby' + roomID +' does not exist!');
            socket.emit('joinLobbyStatus',roomID,'not-a-room');
            return;
        }

        // TODO: check for bad username
        clientRooms[socket.id] = roomID;
        socket.join(roomID);
        const room = io.sockets.adapter.rooms.get(roomID);

        // Check if full 
        if(room.size>ROOM_CAPACITY) {
            console.log('Lobby' + roomID +' is full! :(');
            socket.leave(roomID);
            socket.emit('joinLobbyStatus',roomID,'room-full');
            return;
        }

        // Check if game has already been started
        if(game.scene.scenes[0].started) {
            console.log('Game in lobby ' + roomID + ' has already begun :(');
            socket.leave(roomID);
            socket.emit('joinLobbyStatus',roomID,'game-begun');
            return;
        }


        // OKAY TO JOIN 

        // emit join success
        game.addPlayer(socket,nickname);
     
        // Send updated leaderboard to room
        io.to(roomID).emit('updateLeaderBoard', game.scene.scenes[0].leaderboard); // game.scene.scene[0].players

        console.log('User: '+ socket.id +' done joining');
        socket.emit('joinLobbyStatus', roomID, 'join-successful');
        
    }

    socket.on('startGameLobby', () => { 
        // Check that room exists
        if (!games[clientRooms[socket.id]]) { return; }

        game = games[clientRooms[socket.id]];

        // Check if user is host
        if(game.hostSocket.id !== socket.id) { return; }

        console.log('GAME STARTING');

        // Tell all players waiting in lobby that game is about to start
        socket.broadcast.to(clientRooms[socket.id]).emit('gameStartingNow');
        
        // start game
        game.startGame();
    });

    socket.on('playerInput', function(inputData) {
        // TODO: check if game has begun 
        if (!clientRooms[socket.id]) { return; }
        var localRoomName = clientRooms[socket.id];

        handlePlayerInput(self, socket.id, inputData, localRoomName);
    });

  

    function handlePlayerInput(self, playerID, input, rn) {
        if (!games[rn]) { return; }
        var game = games[rn];

        // check if player has been removed from game
        if (!game.players[playerID]) {return; }
        game.scene.scenes[0].physicsPlayers.getChildren().forEach((player) => {
            if (playerID === player.playerID) {
                game.scene.scenes[0].players[player.playerID].input = input;
            }
        });

        
    }

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        var game = games[clientRooms[socket.id]];
        if (game) {
            game.removePlayer(socket.id);

            io.to(clientRooms[socket.id]).emit('updateLeaderBoard', game.scene.scenes[0].leaderboard); // only really used on lobby in client

            
            
            console.log(game.scene.scenes[0].players);
            console.log(game.players);

            // Depreciated: game deletes itself!
            // Check if room is empty and if it is begin timer to delete
            // if (!io.sockets.adapter.rooms.get(clientRooms[socket.id])) {
            //     console.log('Lobby '+ clientRooms[socket.id] + ' empty... beginning shutdowm timer');
            //     var localRoomID = clientRooms[socket.id];
            //     setTimeout( ()=> {   
            //         console.log('DELETING LOBBY: ' + localRoomID);
            //         if (!io.sockets.adapter.rooms.get(clientRooms[socket.id])) {

            //             // TODO: ADD STOP GAME FUNCTION ** ** ** * ** * * ** * ** 
            //             games[localRoomID].endGame();
            //         }
            //     },ROOM_TIMEOUT * 1000)
            // }

            delete clientRooms[socket.id];
        }
        
    });
    

    


});

