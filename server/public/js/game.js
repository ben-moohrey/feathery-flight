var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    dom: {
      createContainer: true
    },
    width: 800,
    height: 600,
    scene: [MainMenu, HostLobby, JoinLobbyInput, JoinLobby, PlayGame]
  };

  var game = new Phaser.Game(config);

  