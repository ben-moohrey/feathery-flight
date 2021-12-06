// HOST user
// Phaser Scene instance that handles the logic for a host createdlobby
// Should just be called lobby - SOON TO IMPLEMENT
class CreateLobby extends Phaser.Scene {
    constructor() {
        super("hostLobby");
    }

    preload() {
        this.load.image('bird', 'assets/bird.png');
    }
    
    create() {

        // TODO: Setup lobby scoreboard

        // Connect to server
        var self = this; 
        this.socket = io();
        console.log("Connected to Server");

        // Get nickname from mainMenu scene
        this.nickname = this.scene.get('mainMenu').nickname;
        this.socket.nickname = this.nickname;

        // Connect to lobby
        this.socket.emit('createNewLobby');
        this.socket.on('lobbyInitialized', (iD) => {
            this.roomID = iD;
            console.log("roomID:"+iD);
            this.socket.emit('joinGame',this.roomID);
        })

        // Join lobby failed
        this.socket.on('joinLobbyFailed', (failCode)=> {
            if (failCode==='room-full') {
                // TODO: Handle full room
            }
            else if (failCode==='not-a-room') {
                // TODO: Handle not a room
            }
        })

        this.players = this.add.group();

        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log('hey')
            console.log(leaderboard)
            console.log('hey')
        });
        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log('BRUH')
            console.log(leaderboard)
            console.log('BRUH')
        });

        this.socket.on('currentPlayers', function (players) {
            console.log('receiving current players');
        })


    }
    
    update() {
        
    }
    displayPlayers(self, playerInfo, sprite, tint) {
        const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        player.setTint(tint);
        player.playerId = playerInfo.playerId;
        self.players.add(player);
    }
}

