class PlayGame extends Phaser.Scene {
    constructor() {
        super('playGame')
    }

    preload() {
        // get socket from game object  
        this.load.image('bird', 'assets/bird.png');
        
    }

    create() {
        console.log('Play Game Scene Begun')
        this.socket = this.game.socket;

        var self = this;
        this.players = this.add.group();
        this.socket.emit('startGameLobby');
        
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKeyPressed = false;
        
    }

    update() {
        const up = this.spaceKeyPressed;
        if (this.cursors.up.isDown) {
            this.upKeyPressed = true;
        } else {
            this.upKeyPressed = false;
        }

        if (up !== this.upKeyPressed) {
            this.socket.emit('playerInput', { jump: this.upKeyPressed });
            console.log("PLAYER TRYING TO MOVE")
        }
    }
    
    displayPlayers(self, playerInfo, sprite, tint) {
        const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        player.setTint(tint);
        player.playerID = playerInfo.playerID;
        self.players.add(player);
    }
}