const config = {
    type: Phaser.WEBGL,
    width: 600,
    height: 400,
    useTicker: true,
    scene: [ new Initialize(urlQueryParams.get('mode')), MainMenu, Credits ],
    parent: 'postcard-game',
    // For some reason there's a gap between the bottom of Phaser Canvas and bottom of its parent div.
    canvasStyle: 'margin-bottom: -6px;', // Nasty hack to seal the gap.
};

const game = new Phaser.Game(config);
