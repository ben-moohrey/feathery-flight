var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    dom: {
      createContainer: true
    },
    width: 800,
    height: 600,
    backgroundColor: '#35adf2',
    scene: [MainMenu, HostLobby, HostLobby2, JoinLobbyInput, JoinLobby, PlayGame]
  };

  var game = new Phaser.Game(config);

  