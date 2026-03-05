class Initialize extends Phaser.Scene {
    constructor(queryMode) {
        super('initializeScene');
        this.queryMode = queryMode ?? 'mainMenuScene';
    }

    preload() {
        this.load.path = './assets/';

        this.load.image('tilesetImage', 'temp/tileset.png');
        this.load.tilemapTiledJSON('tilemapJSON', 'temp/overworld.json');
    }

    create() {
        this.scene.start(this.queryMode);
    }
}
