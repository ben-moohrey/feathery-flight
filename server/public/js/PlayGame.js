class PlayGame extends Phaser.Scene {
    constructor() {
        super('playGame')
    }

    preload() {
        // get socket from game object  
        this.load.image('pipe', 'assets/pipe.png');
        this.load.image('bird', 'assets/bird.png');
        this.load.image('bg', 'assets/background.png')
        this.cameras.main.setBounds(0, 0, this.game.canvas.width*10, this.game.canvas.height);
        
    }

    create() {
        this.camera = this.cameras.main;
        console.log('Play Game Scene Begun'
        )
        this.socket = this.game.socket;

        var self = this;
        this.players = this.add.group();
        this.tubes = this.add.group();


        // Get game data
        this.socket.on('gameData', function (players,tubePoints) {
            // display players
            Object.keys(players).forEach(function (id) {
                //Camera
                // if (id==self.socket.id) {
                //     self.camera.centerOn(players[id].x,self.game.canvas.height/2);
                // }

                if (players[id].playerID === self.socket.id) {
                    self.displayPlayers(self, players[id], 'bird', true);
                } else {
                    self.displayPlayers(self, players[id], 'bird', false);
                }
            });
            // Display tubes
            console.log(tubePoints);
            self.displayTubes(self, tubePoints)

        });

        this.socket.on('playerUpdates', function (players) {
            Object.keys(players).forEach(function (id) {
                
                self.players.getChildren().forEach(function (player) {
                    if (players[id].playerID === player.playerID) {
                        player.setRotation(players[id].rotation);
                        player.setPosition(players[id].x, players[id].y);
                    } 
                });
            });
        });

        this.socket.on('playerDisconnect', (playerID) => {
            self.players.getChildren().forEach(function (player) {
                if (playerID === player.playerID) {
                    player.destroy();
                }
            });

        });

        this.socket.on('countdown', (num) => {

        });

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
    
    displayPlayers(self, playerInfo, sprite, visible) {
        const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        if (!visible) {
            player.alpha = 0.2;
        }
        else {
            self.camera.startFollow(player);
        }
        player.playerID = playerInfo.playerID;
        self.players.add(player);
        
    }
    displayTubes(self, tubePoints) {
        for(var i = 0; i < tubePoints.length; i++) {
            var multipoint = tubePoints[i];
            var x = multipoint[0];
            var y1 = multipoint[1][0];
            var y2 = multipoint[1][1];

            const pipeTop = self.tubes.create(x, y1, 'pipe').setOrigin(0.5, 1).setDisplaySize(80, 600);
            pipeTop.setFlip(false,true) 
            const pipeBottom = self.tubes.create(x, y2, 'pipe').setOrigin(0.5, 0).setDisplaySize(80, 600);
        }
    }
    
}