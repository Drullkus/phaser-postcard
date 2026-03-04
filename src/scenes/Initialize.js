class Initialize extends Phaser.Scene {
    constructor(queryMode) {
        super('initializeScene');
        this.queryMode = queryMode ?? 'mainMenuScene';
    }

    preload() {
    }

    create() {
        this.scene.start(this.queryMode);
    }
}
