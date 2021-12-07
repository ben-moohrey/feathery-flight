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






        
        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log(leaderboard)
        });
        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log('BRUH')
            console.log(leaderboard)
            console.log('BRUH')
        });



        // this.socket.on('joinSuccess', ()=> {
        //     var mainMenuDialog = CreateLobbyDialog(this, {
        //         x: 400,
        //         y: 300,
        //         title: '',
        //         username: '',
        //     })
        //         .on('joinLobby', function (lobbyID) {
        //             console.log(lobbyID);
        //             self.lobbyID = lobbyID;
                
        //             self.scene.start('playGame');
        //             self.scene.get('playGame').socket = socket; // Inject socket into play game 

        //             console.log(self)
        //         })
        //         .on('backToMainMenu', () => {
        //             self.scene.start('mainMenu');

        //         })
        //         //.drawBounds(this.add.graphics(), 0xff0000);
        //         .popUp(500);
        // });


        

    }
}




var CreateLobbyDialog = function (scene, config, onSubmit) {
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

var joinLobbyButton = scene.rexUI.add.label({
    orientation: 'x',
    background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_LIGHT),
    text: scene.add.text(0, 0, 'Join Lobby'),
    space: { top: 8, bottom: 8, left: 8, right: 8 }
})
    .setInteractive()
    .on('pointerdown', function () {
        loginDialog.emit('joinLobby', username);
    });

var backButton = scene.rexUI.add.label({
    orientation: 'x',
    background: scene.rexUI.add.roundRectangle(0, 0, 10, 10, 10, COLOR_LIGHT),
    text: scene.add.text(0, 0, 'Back'),
    space: { top: 8, bottom: 8, left: 8, right: 8 }
})
    .setInteractive()
    .on('pointerdown', function () {
        loginDialog.emit('backToMainMenu');
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
    .add(joinLobbyButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
    .add(backButton, 0, 'center', { bottom: 10, left: 10, right: 10 }, false)
    .layout();
return loginDialog;
};
