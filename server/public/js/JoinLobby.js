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
        console.log(this.nickname);
        
        this.socket.emit('joinGame',this.lobbyID,this.nickname);

        // Join lobby status 
        this.socket.on('joinLobbyStatus', (roomID,code)=> {
            if (code==='room-full') {
                // TODO: Handle full room
                console.log('Room if full');
                this.socket.disconnect();
                self.scene.start('joinLobbyInput');
            }
            else if (code==='not-a-room') {
                // TODO: Handle not a room
                console.log('Room doesnt exist');
                this.socket.disconnect();
                self.scene.start('joinLobbyInput');
            }
            else if (code==='game-begun') {
                // TODO: Handle game-begun
                console.log('Game already begun');
                this.socket.disconnect();
                self.scene.start('joinLobbyInput');
            }
            else if (code==='join-successful') {
                self.okayToStart = true;
                this.game.lobbyID = this.lobbyID;
                self.scene.start('playGame');
            }
        });


        // Update leaderboard
        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log('Leaderboard update');
            console.log(leaderboard);
        });
    }
}



