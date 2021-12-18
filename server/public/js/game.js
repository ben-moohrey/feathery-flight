var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    dom: {
      createContainer: true
    },
    width: 800,
    height: 600,
    backgroundColor: '#35adf2',
    scene: [MainMenu, HostLobby, JoinLobbyInput, JoinLobby, PlayGame, LeaderBoard]
  };

  var game = new Phaser.Game(config);

  