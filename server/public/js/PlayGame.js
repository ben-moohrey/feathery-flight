class PlayGame extends Phaser.Scene {
    constructor() {
        super('playGame')
    }

    preload() {
        // get socket from game object  
        this.load.image('pipe', 'assets/pipe.png');
        this.load.image('bird', 'assets/bird.png');
        this.load.image('bg', 'assets/background.png');
        this.load.audio('winSound','assets/audio/win.mp3');
        this.load.audio('song2','assets/audio/song2.mp3');

        this.cameras.main.setBounds(0, 0, this.game.canvas.width*10, this.game.canvas.height);

        
    }

    create() {
        console.log('Play Game Scene Begun');
        this.sound.play('song2'); // start the song

        // Make camera reference
        this.camera = this.cameras.main;
        this.socket = this.game.socket;

        var self = this;

        // Create players object
        this.players = this.add.group();
        this.tubes = this.add.group();


        // Font styles
        const style = { font: "bold 100px Arial", fill: "#fff" };
        const style2 = { font: "bold 60px Arial", fill: "#fff" };

        // Timers
        this.preGameTimerText = this.add.text(self.game.canvas.width/2,self.game.canvas.height/2,'',style).setOrigin(.5,.5);
        this.gameTimeText = this.add.text(self.game.canvas.width/2,100,'',style).setOrigin(.5,.5);
        this.gameTimeText.visible = false;
        this.gameTimeText.depth=20;
        this.lobbyIDText = this.add.text(self.game.canvas.width/2,100, self.game.lobbyID, style2).setOrigin(.5,.5);

        // Once game starts, game data will be received
        this.socket.on('gameData', function (players, tubePoints) {
            // display players
            Object.keys(players).forEach(function (id) {
                if (players[id].playerID === self.socket.id) {
                    self.displayPlayers(self, players[id], 'bird', true);
                } else {
                    self.displayPlayers(self, players[id], 'bird', false);
                }
            });

            // Display tubes
            console.log(tubePoints);
            self.displayTubes(self, tubePoints);

            // Display game timer
            self.gameTimeText.visible = true;

            // Hide lobbyID text
            self.lobbyIDText.visible = false;

        });

        // listener for playerUpdates
        this.socket.on('playerUpdates', function (players,gameTime) {
            Object.keys(players).forEach(function (id) {
                self.players.getChildren().forEach(function (player) {
                    if (players[id].playerID === player.playerID) {
                        player.setRotation(players[id].rotation);
                        player.setPosition(players[id].x, players[id].y);
                    } 
                });
            });

            // Update game timer
            self.updateTimer(self,gameTime);
        });

        // Delete player when they disconnect from game
        this.socket.on('playerDisconnect', (playerID) => {
            self.players.getChildren().forEach(function (player) {
                if (playerID === player.playerID) {
                    player.destroy();
                }
            });
        });

        // Countdown listener. Displays countdown timer before game starts
        this.socket.on('countdown', (num) => {
            if(num===0) {
                self.preGameTimerText.setText('Go!!');
                // self.time.delayedCall(1000,self.preGameTimerText.visible=false,null,self); // Hide timer
                setTimeout(()=>{
                    self.preGameTimerText.visible=false;
                },500)
            } else {
                self.preGameTimerText.setText(num);
            }
        });

        // Player has lost... did not make it to finish line
        this.socket.on('gameOver', (winners)=>{
            self.game.winners = winners;
            self.scene.start('leaderBoard');
            self.scene.stop();
        });

        // Player has won
        this.socket.on('playerWin', (winners)=> {
            console.log('User has reached the finish line: attempting to move to next scene');

            this.sound.play('winSound');
            // Stop listening for gametime updates
            this.socket.off('playerUpdates');
            this.socket.off('gameData');
            this.socket.off('playerDisconnect');
            this.socket.off('gameOver');
            this.socket.off('countdown');
            
            // Start leaderboard scene
            self.game.winners = winners;
            self.scene.start('leaderBoard');
            self.scene.stop();
        });

        
        // Get game cursors
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKeyPressed = false;
        
    }

    // Update function (mostly checking for game input)
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

    // Update game timer
    updateTimer(self, gameTime) {
        console.log(gameTime);

        var secconds = Math.floor(gameTime / 1000);
        var tenthSeccond = (gameTime % 1000)/100
        console.log(tenthSeccond)

        if (secconds<=0) {
            self.gameTimeText.setText('Out of Time!');
        } else {
            self.gameTimeText.setText(secconds+'.'+tenthSeccond);
        }
        if (self.userPlayer) {
            self.gameTimeText.setX(self.userPlayer.x);
        }
    }

    // Function to render players when game starts
    displayPlayers(self, playerInfo, sprite, visible) {
        const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5).setDisplaySize(53, 40);
        if (!visible) {
            // Other player
            player.alpha = 0.2;
        }
        else {
            // Player
            self.userPlayer = player;
            player.depth = 15;
            self.camera.startFollow(player);
        }
        player.playerID = playerInfo.playerID;
        self.players.add(player);
        
    }

    // Function to render obstacles when game starts
    displayTubes(self, tubePoints) {
        for(var i = 0; i < tubePoints.length; i++) {
            var multipoint = tubePoints[i];
            var x = multipoint[0];
            var y1 = multipoint[1][0];
            var y2 = multipoint[1][1];

            const pipeTop = self.tubes.create(x, y1, 'pipe').setOrigin(0.5, 1).setDisplaySize(80, 600);
            pipeTop.setFlip(false,true) 
            const pipeBottom = self.tubes.create(x, y2, 'pipe').setOrigin(0.5, 0).setDisplaySize(80, 600);

            pipeTop.depth=5;
            pipeBottom.depth=5;
        }
    }
    
}