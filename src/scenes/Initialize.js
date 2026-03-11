class Initialize extends Phaser.Scene {
    constructor(queryMode) {
        super('initializeScene');
        this.queryMode = queryMode ?? 'mainMenuScene';
    }

    preload() {
        this.load.path = './assets/';

        this.load.image('tilesetImage', 'temp/postcardtiles.png');
        this.load.tilemapTiledJSON('tilemapJSON', 'temp/postcardtiles.json');

        this.load.image('koboldFace', 'temp/kobold-crop.png');

        this.load.spritesheet('hero', 'temp/hero-sheet.png', { frameWidth: 32 });

        this.load.spritesheet('debris', 'temp/debris.png', { frameWidth: 16 });

        this.load.audio('strikeHit', 'temp/strike-hit.wav');
    }

    create() {
        // hero animations (walking)
        this.anims.create({
            key: 'walk-down',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', { start: 0, end: 3 }),
        });
        this.anims.create({
            key: 'walk-right',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', { start: 4, end: 7 }),
        });
        this.anims.create({
            key: 'walk-up',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', { start: 8, end: 11 }),
        });
        this.anims.create({
            key: 'walk-left',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('hero', { start: 12, end: 15 }),
        });

        // hero animations (swinging)
        this.anims.create({
            key: 'swing-down',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', { start: 16, end: 19 }),
        });
        this.anims.create({
            key: 'swing-up',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', { start: 20, end: 23 }),
        });
        this.anims.create({
            key: 'swing-right',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', { start: 24, end: 27 }),
        });
        this.anims.create({
            key: 'swing-left',
            frameRate: 8,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', { start: 28, end: 31 }),
        });

        this.anims.create({
            key: 'circular-attack',
            frameRate: 24,
            repeat: 0,
            frames: this.anims.generateFrameNumbers('hero', {
                frames: [ 16, 16, 16, 17, 18, 24, 25, 26, 21, 22, 30, 29, 28, 18, 19, 19, 19 ]
            })
        });

        [0, 1, 2, 3].forEach((columnIndex, _index, list) => this.anims.create({
            key: `debris-${columnIndex}`,
            frames: this.anims.generateFrameNumbers('debris', {
                frames: [1, 0, 1, 2, 3].map(rowIndex => rowIndex * list.length + columnIndex)
            }),
            frameRate: 20
        }))

        this.scene.start(this.queryMode);
    }
}
