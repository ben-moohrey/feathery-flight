// HOST user
class CreateLobby extends Phaser.Scene {
    constructor() {
        super("hostLobby");
    }

    
    
    preload() {
        this.load.image('ship', 'assets/playerShip1_blue.png');
        this.load.image('otherPlayer', 'assets/playerShip1_blue.png');
        this.load.image('star', 'assets/star_gold.png');
        this.load.image('bird', 'assets/bird.png');
    }
    
    create() {
        var self = this; 
        this.socket = io();
        console.log("Connected to Server");

        this.nickname = this.scene.get('mainMenu').nickname;
        this.socket.nickname = this.nickname;

        var roomID = '';
        this.socket.emit('createNewLobby');


        this.socket.on('lobbyInitialized', (iD) => {
            this.roomID = iD;
            console.log("roomID:"+iD);
            this.socket.emit('joinGame',this.roomID);
        })

        

        
        this.players = this.add.group();


        this.socket.on('currentPlayers', function (players) {
            // if (players[id].playerId === self.socket.id) {
            //     displayPlayers(self, players[id], 'bird');
            // } else {
            //     displayPlayers(self, players[id], 'otherPlayer');
            // }
            console.log('receiving current players');
        })

        // this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
        // this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

        // this.socket.on('currentPlayers', function (players) {
        // Object.keys(players).forEach(function (id) {
        //     if (players[id].playerId === self.socket.id) {
        //     displayPlayers(self, players[id], 'ship');
        //     } else {
        //     displayPlayers(self, players[id], 'otherPlayer');
        //     }
        // });
        // });
        // this.socket.on('newPlayer', function (playerInfo) {
        // displayPlayers(self, playerInfo, 'otherPlayer');
        // });
        // this.socket.on('player_disconnect', function (playerId) {
        // self.players.getChildren().forEach(function (player) {
        //     if (playerId === player.playerId) {
        //     player.destroy();
        //     }
        // });
        // });

        // this.socket.on('playerUpdates', function (players) {
        // Object.keys(players).forEach(function (id) {
        //     self.players.getChildren().forEach(function (player) {
        //     if (players[id].playerId === player.playerId) {
        //         player.setRotation(players[id].rotation);
        //         player.setPosition(players[id].x, players[id].y);
        //     }
        //     });
        // });
        // });
        
        // this.socket.on('updateScore', function (scores) {
        // self.blueScoreText.setText('Blue: ' + scores.blue);
        // self.redScoreText.setText('Red: ' + scores.red);
        // });
        // this.socket.on('starLocation', function (starLocation) {
        // if (!self.star) {
        //     self.star = self.add.image(starLocation.x, starLocation.y, 'star');
        // } else {
        //     self.star.setPosition(starLocation.x, starLocation.y);
        // }
        // });

        // this.cursors = this.input.keyboard.createCursorKeys();
        // this.leftKeyPressed = false;
        // this.rightKeyPressed = false;
        // this.upKeyPressed = false;
    

    }
    
    update() {
        // const left = this.leftKeyPressed;
        // const right = this.rightKeyPressed;
        // const up = this.spaceKeyPressed;
        // if (this.cursors.left.isDown) {
        //     this.leftKeyPressed = true;
        // } else if (this.cursors.right.isDown) {
        //     this.rightKeyPressed = true;
        // } else {
        //     this.leftKeyPressed = false;
        //     this.rightKeyPressed = false;
        // }
        // if (this.cursors.up.isDown) {
        //     this.upKeyPressed = true;
        // } else {
        //     this.upKeyPressed = false;
        // }
        // if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed) {
        //     this.socket.emit('playerInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed });
        //     console.log("PLAYER TRYING TO MOVE")
        // }
    }
    displayPlayers(self, playerInfo, sprite, tint) {
        const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        player.setTint(tint);
        player.playerId = playerInfo.playerId;
        self.players.add(player);
    }
}

