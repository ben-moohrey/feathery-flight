var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    dom: {
      createContainer: true
    },
    width: 800,
    height: 600,
    scene: [MainMenu, CreateLobby, JoinLobbyInput, JoinLobby]
  };

  var game = new Phaser.Game(config);

  