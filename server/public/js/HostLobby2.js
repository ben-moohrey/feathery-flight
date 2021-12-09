


class HostLobby2 extends Phaser.Scene {
    constructor() {
        super('hostLobby2')
    }

    preload() { 
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });      
    }

    create() {
        var scrollMode = 0; // 0:vertical, 1:horizontal
        var gridTable = this.rexUI.add.gridTable({
            x: 400,
            y: 300,
            width: (scrollMode === 0) ? 300 : 420,
            height: (scrollMode === 0) ? 420 : 300,

            scrollMode: scrollMode,

            background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_PRIMARY),

            table: {
                cellWidth: (scrollMode === 0) ? undefined : 60,
                cellHeight: (scrollMode === 0) ? 60 : undefined,

                columns: 1,

                mask: {
                    padding: 2,
                },

                reuseCellContainer: true,
            },

            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_LIGHT),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
            },
          
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },

            // edit this
            header: this.rexUI.add.label({
                width: (scrollMode === 0) ? undefined : 30,
                height: (scrollMode === 0) ? 40 : undefined,
                align: 'center',
                orientation: scrollMode,
                background: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_LIGHT),
                text: this.add.text(0, 0, 'Lobby Code'),
            }),

            footer: GetFooterSizer(this, scrollMode),

            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,

                table: 10,
                header: 10,
                footer: 10,
            },

            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
                        height: height,

                        orientation: scrollMode,
                        background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, COLOR_LIGHT),
                        icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0x0),
                        text: scene.add.text(0, 0, ''),

                        space: {
                            icon: 10,
                            left: (scrollMode === 0) ? 15 : 0,
                            top: (scrollMode === 0) ? 0 : 15,
                        }
                    });
                    console.log(cell.index + ': create new cell-container');
                } else {
                    console.log(cell.index + ': reuse cell-container');
                }

                // Set properties from item value
                cellContainer.setMinSize(width, height); // Size might changed in this demo
                cellContainer.getElement('text').setText(item.id); // Set text of text object
                cellContainer.getElement('icon').setFillStyle(item.color); // Set fill color of round rectangle object
                cellContainer.getElement('background').setStrokeStyle(2, COLOR_LIGHT).setDepth(0);
                return cellContainer;
            }

        })
            .layout()
        //.drawBounds(this.add.graphics(), 0xff0000);

      





        var self = this; 
        // var mainMenuDialog = CreateHostLobbyDialog(this, {
        //     x: 400,
        //     y: 300,
        //     width: 400,
        //     title: '',
        //     username: '',
        // })
        //     .on('hostStartGame', function (lobbyID) {
        //         if(self.okayToStart) {
        //             console.log('starting game')
                  
        //             self.socket.emit('startGameLobby');
        //             self.scene.start('playGame');
        //         }
                
        //     })
        //     .on('updateTitle',function(roomID) {
        //         console.log('well all be')
        //         self.rexUI.edit(mainMenuDialog.getElement('titleField'), roomID);
        //     })
        //     //.drawBounds(this.add.graphics(), 0xff0000);
        //     .popUp(500);

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
                // mainMenuDialog.emit('updateTitle',(roomID));
            }
        })
 
        // Update leaderboard
        this.socket.on('updateLeaderBoard', (leaderboard) => {
            console.log('Leaderboard update');
            console.log(leaderboard);

            var formattedLeaderboard = [{id: leaderboard[0][1], color: 0xffffff}]
            for (var i = 1; i < leaderboard.length; i++) {
                formattedLeaderboard.push({id:leaderboard[i][1], color: 0xffffff})
            }
            gridTable.setItems(formattedLeaderboard);
        });









        var scrollMode = 0; // 0:vertical, 1:horizontal
        var gridTable = this.rexUI.add.gridTable({
            x: 400,
            y: 300,
            width: (scrollMode === 0) ? 300 : 420,
            height: (scrollMode === 0) ? 420 : 300,

            scrollMode: scrollMode,

            background: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_PRIMARY),

            table: {
                cellWidth: (scrollMode === 0) ? undefined : 60,
                cellHeight: (scrollMode === 0) ? 60 : undefined,

                columns: 1,

                mask: {
                    padding: 2,
                },

                reuseCellContainer: true,
            },

            slider: {
                track: this.rexUI.add.roundRectangle(0, 0, 20, 10, 10, COLOR_LIGHT),
                thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 13, COLOR_LIGHT),
            },
          
            mouseWheelScroller: {
                focus: false,
                speed: 0.1
            },

            // edit this
            header: this.rexUI.add.label({
                width: (scrollMode === 0) ? undefined : 30,
                height: (scrollMode === 0) ? 40 : undefined,
                align: 'center',
                orientation: scrollMode,
                background: this.rexUI.add.roundRectangle(0, 0, 20, 20, 0, COLOR_LIGHT),
                text: this.add.text(0, 0, 'Lobby Code'),
            }),

            footer: GetFooterSizer(this, scrollMode),

            space: {
                left: 20,
                right: 20,
                top: 20,
                bottom: 20,

                table: 10,
                header: 10,
                footer: 10,
            },

            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
                        height: height,

                        orientation: scrollMode,
                        background: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 0).setStrokeStyle(2, COLOR_LIGHT),
                        icon: scene.rexUI.add.roundRectangle(0, 0, 20, 20, 10, 0x0),
                        text: scene.add.text(0, 0, ''),

                        space: {
                            icon: 10,
                            left: (scrollMode === 0) ? 15 : 0,
                            top: (scrollMode === 0) ? 0 : 15,
                        }
                    });
                    console.log(cell.index + ': create new cell-container');
                } else {
                    console.log(cell.index + ': reuse cell-container');
                }

                // Set properties from item value
                cellContainer.setMinSize(width, height); // Size might changed in this demo
                cellContainer.getElement('text').setText(item.id); // Set text of text object
                cellContainer.getElement('icon').setFillStyle(item.color); // Set fill color of round rectangle object
                cellContainer.getElement('background').setStrokeStyle(2, COLOR_LIGHT).setDepth(0);
                return cellContainer;
            }

        })
            .layout()
        //.drawBounds(this.add.graphics(), 0xff0000);

      
      
    }

    update() { }
}


var GetFooterSizer = function (scene, orientation) {
    return scene.rexUI.add.sizer({
        orientation: orientation
    })
        .add(
            CreateFooterButton(scene, 'Reset', orientation),   // child
            1,         // proportion
            'center'   // align
        )
        .add(
            CreateFooterButton(scene, 'Exit', orientation),    // child
            1,         // proportion
            'center'   // align
        )
}

var CreateFooterButton = function (scene, text, orientation) {
    return scene.rexUI.add.label({
        height: (orientation === 0) ? 40 : undefined,
        width: (orientation === 0) ? undefined : 40,
        orientation: orientation,
        background: scene.rexUI.add.roundRectangle(0, 0, 2, 2, 20, COLOR_LIGHT),
        text: scene.add.text(0, 0, text),
        align: 'center',
        space: {           
            icon: 10
        }
    })
        .setInteractive()
        .on('pointerdown', function () {
            console.log(`Pointer down ${text}`)
        })
}
