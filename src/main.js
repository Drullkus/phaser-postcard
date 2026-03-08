const config = {
    parent: 'postcard-game',
    canvasStyle: 'display: block;', // Set to block, as otherwise it will have a 6-pixel gap underneath

    type: Phaser.WEBGL,
    width: 750, height: 500, // 3:2 ratio
    useTicker: true,
    scene: [ new Initialize(urlQueryParams.get('mode')), MainMenu, Crawler, Credits ],

    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    },
};

const game = new Phaser.Game(config);
