class PlayGame extends Phaser.Scene {
    constructor() {
        super('playGame')
    }

    preload() {

    }

    create() {
        // get socket from JoinLobby
        this.socket = this.scene.get('mainMenu').nickname;
    }

    update() {
        const up = this.spaceKeyPressed;
        if (this.cursors.left.isDown) {
            this.leftKeyPressed = true;
        } else if (this.cursors.right.isDown) {
            this.rightKeyPressed = true;
        } else {
            this.leftKeyPressed = false;
            this.rightKeyPressed = false;
        }
        if (this.cursors.up.isDown) {
            this.upKeyPressed = true;
        } else {
            this.upKeyPressed = false;
        }
        if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed) {
            this.socket.emit('playerInput', { left: this.leftKeyPressed , right: this.rightKeyPressed, up: this.upKeyPressed });
            console.log("PLAYER TRYING TO MOVE")
        }
    }
}