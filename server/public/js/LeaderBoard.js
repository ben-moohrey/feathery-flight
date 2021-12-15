


class LeaderBoard extends Phaser.Scene {
    constructor() {
        super('leaderBoard')
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
                text: this.add.text(0, 0, 'Leaderboard'),
            }),

            footer: GetFooterSizer2(this, scrollMode),

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

        

        this.socket = this.game.socket;
        
        // Set leaderboard from last scene
        var winners = self.game.winners;
        console.log('WINNERS');
        console.log(winners);
        var formattedLeaderboard = [{id: winners[0], color: 0xffffff}]
        for (var i = 1; i < winners.length; i++) {
            formattedLeaderboard.push({id:winners[i], color: 0xffffff})
        }
        gridTable.setItems(formattedLeaderboard);

        // Update leaderboard
        this.socket.on('winners', (leaderboard) => {
            console.log('Leaderboard Update');
            console.log(leaderboard);

            formattedLeaderboard = [{id: leaderboard[0], color: 0xffffff}]
            for (var i = 1; i < leaderboard.length; i++) {
                formattedLeaderboard.push({id:leaderboard[i], color: 0xffffff})
            }
            gridTable.setItems(formattedLeaderboard);
        });
    }

    update() { }
}


var GetFooterSizer2 = function (scene, orientation) {
    return scene.rexUI.add.sizer({
        orientation: orientation
    })
        .add(
            createQuitButton(scene, 'Quit', orientation),   // child
            1,         // proportion
            'center'   // align
        )
}

var createQuitButton = function (scene, text, orientation) {
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
            console.log(`About to do action: ${text}`);
            if(scene.socket){scene.socket.disconnect();}
            scene.scene.start('mainMenu');
        })
}

