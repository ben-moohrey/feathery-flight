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
        var self = this; 
        var mainMenuDialog = CreateHostLobbyDialog(this, {
            x: 400,
            y: 300,
            width: 400,
            title: '',
            username: '',
        })
            .on('hostStartGame', function (lobbyID) {
                if(self.okayToStart) {
                    console.log('starting game')
                  
                    self.socket.emit('startGameLobby');
                    self.scene.start('playGame');
                }
                
            })
            .on('updateTitle',function(roomID) {
                console.log('well all be')
                self.rexUI.edit(mainMenuDialog.getElement('titleField'), roomID);
            })
            //.drawBounds(this.add.graphics(), 0xff0000);
            .popUp(500);

        // Connect to server
        this.game.socket = io();
        this.socket = this.game.socket;
        console.log("Connected to Server");

        // Get nickname from mainMenu scene
        this.nickname = this.scene.get('mainMenu').nickname;

        // Connect to lobby
        this.socket.emit('createNewLobby');
        this.socket.on('lobbyInitialized', (iD) => {
            this.roomID = iD;
            console.log("roomID:"+iD);
            this.socket.emit('joinGame',this.roomID,this.nickname);
        })

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
                mainMenuDialog.emit('updateTitle',(roomID));
            }
        })
 
        // Update leaderboard
        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log('Leaderboard update');
            console.log(leaderboard);
        });
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
    var titleField = scene.add.text(0, 0, title).on('updateTitle', (roomID)=>{
        console.log('llookyhere')
        scene.rexUI.edit(textField.getElement('text'), roomID);
    })

    var scrollablePanel = scene.rexUI.add.scrollablePanel({
        x: x,
        y: y,
        width: width,
        height: height,

        scrollMode: 0,

        background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 10, COLOR_PRIMARY),

        panel: {
            child: scene.rexUI.add.fixWidthSizer({
                space: {
                    left: 3,
                    right: 3,
                    top: 3,
                    bottom: 3,
                    item: 8,
                    line: 8,
                }
            }),


            mask: {
                padding: 1
            },
        },

        slider: {
            track: scene.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_DARK),
            thumb: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
        },
    
        // scroller: true,
        scroller: {
            // pointerOutRelease: false
        },
    
        mouseWheelScroller: {
            focus: false,
            speed: 0.1
        },

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10,

            panel: 10,
        }
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
        .add(scrollablePanel, 0, 'center', { top: 10, bottom: 10, left: 10, right: 10 }, false)
        // .add(passwordField, 0, 'left', { bottom: 10, left: 10, right: 10 }, true)
        .add(startGameButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
        // .add(backButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
        
        .layout();
    return loginDialog;
    };
