// http://127.0.0.1:5500/?mode=crawlerScene
// https://drullkus.github.io/phaser-postcard/?mode=crawlerScene
class Crawler extends Phaser.Scene {
    constructor() {
        super('crawlerScene');
    }

    init() {
        this.VEL = 100  // slime velocity constant
    }

    create() {
        this.createMap();

        this.createCharacter();

        this.setupCamera();
    }
    
    createMap() {
        this.map = this.add.tilemap('tilemapJSON');

        this.tileset = this.map.addTilesetImage('tileset', 'tilesetImage');
        this.bgLayer = this.map.createLayer('Background', this.tileset, 0, 0);
        this.terrainLayer = this.map.createLayer('Terrain', this.tileset, 0, 0);
        this.treeLayer = this.map.createLayer('Trees', this.tileset, 0, 0);
    }

    createCharacter() {
        // this.character = this.physics.add.sprite(...canvasPos(0.5), 'koboldFace');
        // this.character.setScale(0.125);
        // this.character.body.setCollideWorldBounds(true);

        // setup keyboard input
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.HKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H);
        this.keys.FKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        
        this.character = new Hero(this, ...canvasPos(0.5), 'hero', 0, 'down');
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.character, true, 0.25, 0.25);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.terrainLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.character, this.terrainLayer);
        this.treeLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.character, this.treeLayer);
    }

    update() {
        this.character.update();
    }
}
