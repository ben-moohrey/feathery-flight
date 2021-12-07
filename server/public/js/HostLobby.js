// HOST user
// Phaser Scene instance that handles the logic for a host createdlobby
// Should just be called lobby - SOON TO IMPLEMENT maybe..
class HostLobby extends Phaser.Scene {
    constructor() {
        super("hostLobby");
    }

    preload() {
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });  
        this.load.image('bird', 'assets/bird.png');
    }
    
    create() {

        // TODO: Setup lobby scoreboard
        

        // Connect to server
        var self = this; 
        this.game.socket = io();
        this.socket = this.game.socket;
        console.log("socketid before scene change: "+ this.socket.id);
        console.log("Connected to Server");
        console.log(self)

        // Get nickname from mainMenu scene
        this.nickname = this.scene.get('mainMenu').nickname;

        // Connect to lobby
        this.socket.emit('createNewLobby');
        this.socket.on('lobbyInitialized', (iD) => {
            this.roomID = iD;
            console.log("roomID:"+iD);
            this.socket.emit('joinGame',this.roomID,this.nickname);
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
            console.log('Leaderboard update');
            console.log(leaderboard);

        });
        
        // On players need to add set this.players = new players
        this.socket.on('currentPlayers', function (players) {
            // Object.keys(players).forEach(function (id) {
            //     if (players[id].playerID === self.socket.id) {
            //         displayPlayers(self, players[id], 'bird');
            //     } else {
            //         displayPlayers(self, players[id], 'bird');
            //     }
            // });
            // this.players
        });
        

        this.socket.on('currentPlayers', function (players) {
            console.log('receiving current players');
        });


        this.socket.on('joinSuccess', (a)=> {
            self.okayToStart = true;
        });

        var mainMenuDialog = CreateHostLobbyDialog(this, {
            x: 400,
            y: 300,
            title: '',
            username: '',
        })
            .on('hostStartGame', function (lobbyID) {
                if(self.okayToStart) {
                    console.log('starting game')
                    console.log(lobbyID);
                    self.lobbyID = lobbyID;
                  
                    self.scene.start('playGame');
                }
                
            })
            //.drawBounds(this.add.graphics(), 0xff0000);
            .popUp(500);

        function addPlayersToLocalPlayers(players) {

        }



    }
    
    update() {
        
    }
    
}

var CreateHostLobbyDialog = function (scene, config, onSubmit) {
    var username = GetValue(config, 'username', '');
    // var password = GetValue(config, 'password', '');
    var title = GetValue(config, 'title', 'Welcome');
    var x = GetValue(config, 'x', 0);
    var y = GetValue(config, 'y', 0);
    var width = GetValue(config, 'width', undefined);
    var height = GetValue(config, 'height', undefined);
    
    var background = scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_PRIMARY);
    var titleField = scene.add.text(0, 0, title);
    var userNameField = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10).setStrokeStyle(2, COLOR_LIGHT),
        // icon: scene.add.image(0, 0, 'user'),
        text: scene.rexUI.add.BBCodeText(0, 0, username, { fixedWidth: 150, fixedHeight: 36, valign: 'center' }),
        space: { top: 5, bottom: 5, left: 5, right: 5, icon: 10, }
    })
        .setInteractive()
        .on('pointerdown', function () {
            var config = {
                onTextChanged: function(textObject, text) {
                    username = text;
                    textObject.text = text;
                }
            }
            scene.rexUI.edit(userNameField.getElement('text'), config);
        });
    
    var startGameButton = scene.rexUI.add.label({
        orientation: 'x',
        background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_LIGHT),
        text: scene.add.text(0, 0, 'Start Game'),
        space: { top: 8, bottom: 8, left: 8, right: 8 }
    })
        .setInteractive()
        .on('pointerdown', function () {
            loginDialog.emit('hostStartGame', username);
        });
    
    
    var loginDialog = scene.rexUI.add.sizer({
        orientation: 'y',
        x: x,
        y: y,
        width: width,
        height: height,
    })
        .addBackground(background)
        .add(titleField, 0, 'center', { top: 10, bottom: 10, left: 10, right: 10 }, false)
        .add(userNameField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
        // .add(passwordField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
        .add(startGameButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
        // .add(backButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
        .layout();
    return loginDialog;
    };
