// store key=socket.id, value = roomID
const clientRooms = {}

// store phaser instances
const games = {}
const ROOM_CAPACITY = 20;
io.on("connection", socket => {
    console.log('a user connected to server');

    socket.on('createNewLobby', handleNewLobby);
    socket.on('joinGame', handleJoinGame);

    socket.on('disconnect', () => {
        console.log(socket.id + ' disconnected');
        var game = games[clientRooms[socket.id]];
        if (game) {
            game.removePlayer(socket.id);

            io.to(clientRooms[socket.id]).emit('removePlayer',socket.id);

    
            console.log(game.scene.scenes[0].players);
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
        let roomID = makeid(6); // IMPORTANT: need to check if already a client room name
        
        clientRooms[socket.id] = roomID;
        games[roomID] = new CustomGame(config,roomID,socket); // Spawn a new headless phaser instance
        // console.log(games);


        // socket.join(roomID);
        // var game = games[roomID];
        // console.log(game);
        // game.addPlayer(socket);;
        
    }

  

    function handleJoinGame(roomID) {
        console.log(socket.id+' attemping to join lobby: '+roomID);
        var game = games[roomID];
        if (!game) {
            console.log('Lobby' + roomID +' does not exist!');
            socket.emit('joinFailed',roomID,'not-a-room');
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
        
        socket.emit('joinSuccess',roomID);
        socket = game.addPlayer(socket);
     
        
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

