class JoinLobby extends Phaser.Scene {
    constructor() {
        super('joinLobby');
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });  
    }
    create() {
        // Connect to server
        var self = this; 
        this.game.socket = io();
        this.socket = this.game.socket;
        console.log('Connected to server!');

        // Get lobbyID and nickname
        this.lobbyID = this.scene.get('joinLobbyInput').lobbyID;
        this.nickname = this.scene.get('mainMenu').nickname;

        // Try to join lobby
        console.log(this.lobbyID);
        
        this.socket.emit('joinGame',this.lobbyID,this.nickname);

        // Join lobby status 
        this.socket.on('joinLobbyStatus', (roomID,code)=> {
            if (code==='room-full') {
                // TODO: Handle full room
            }
            else if (code==='not-a-room') {
                // TODO: Handle not a room
            }
            else if (code==='game-begun') {
                // TODO: Handle game-begun
            }
            else if (code==='join-successful') {
                self.okayToStart = true;
            }
        })


        // Update leaderboard
        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log('Leaderboard update');
            console.log(leaderboard);
        });
        
        this.socket.on('gameStartingNow', () => {
            self.scene.start('playGame');
        })

    }
}



