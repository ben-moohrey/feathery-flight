// store key=socket.id, value = roomID
const clientRooms = {}


const games = {} // Store phaser game instances
const ROOM_CAPACITY = 20; // Max users in room
const ROOM_TIMEOUT = 100; // Room timeout in secconds
io.on("connection", socket => {
    console.log('a user connected to server');

    socket.on('createNewLobby', handleNewLobby);
    socket.on('joinGame', handleJoinGame);

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        var game = games[clientRooms[socket.id]];
        if (game) {
            game.removePlayer(socket.id);

            io.to(clientRooms[socket.id]).emit('updateLeaderBoard', game.scene.scenes[0].leaderboard);
            io.to(clientRooms[socket.id]).emit('removePlayer',socket.id);
            
            console.log(game.scene.scenes[0].players);
            console.log(game.players);
            // Check if room is empty and if it is begin timer to delete
            if (!io.sockets.adapter.rooms.get(clientRooms[socket.id])) {
                console.log('Lobby '+ clientRooms[socket.id] + ' empty... beginning shutdowm timer');
                var localRoomID = clientRooms[socket.id];
                setTimeout( ()=> {   
                    console.log('DELETING LOBBY: ' + localRoomID);
                    if (!io.sockets.adapter.rooms.get(clientRooms[socket.id])) {
                        delete games[localRoomID];
                    }
                },5 * 1000)
            }

            delete clientRooms[socket.id];

        }
        
    });

    
    function handleNewLobby() {
        console.log("Handling new game");
        let roomID = makeid(6); 

        // Check if roomID already exists
        while (roomID in games) {
            roomID = makeid(6);
        }
        
        // Spawn a new (headless) phaser instance. 
        games[roomID] = new CustomGame(config,roomID,socket); 
    }

  

    function handleJoinGame(roomID) {
        console.log(socket.id+' attemping to join lobby: '+roomID);
        var game = games[roomID];
        if (!game) {
            console.log('Lobby' + roomID +' does not exist!');
            socket.emit('joinLobbyFailed',roomID,'not-a-room');
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
            socket.emit('joinFailed',roomID,'room-full');
            return;
        }

        // Check if game has already been started
        if(game.scene.scenes[0].started) {
            console.log('Game in lobby ' + roomID + ' has already begun :(');
            socket.leave(roomID);
            socket.emit('joinFailed',roomID,'game-begun');
            return;
        }


        // OKAY TO JOIN 

        // emit join success
        socket.emit('joinSuccess',roomID);

        game.addPlayer(socket);
     
        // Send updated leaderboard to room
        io.to(roomID).emit('updateLeaderBoard', game.scene.scenes[0].leaderboard); // game.scene.scene[0].players

        // Send the players object to the player
        console.log(game.scene.scenes[0].players)
        // socket.emit('currentPlayers',game.scene.scenes[0].players);

        console.log('safe here');
        // Update all other players of the new player
        // socket.broadcast.to(roomID).emit('newPlayerJoining');

        // TODO: send tube locations to new player
        
    }
    

    


});

