// http://127.0.0.1:5500/?mode=crawlerScene
// https://drullkus.github.io/phaser-postcard/?mode=crawlerScene
class Crawler extends Phaser.Scene {
    constructor() {
        super('crawlerScene');
    }

    create() {
        this.createMap();

        this.createCharacter();

        this.createEnemy();

        this.setupCamera();
    }
    
    createMap() {
        this.map = this.add.tilemap('tilemapJSON');

        this.tileset = this.map.addTilesetImage('postcardtiles', 'tilesetImage');
        this.tileLayer = this.map.createLayer('TileLayer', this.tileset, 0, 0);
    }

    createCharacter() {
        // setup keyboard input
        this.keys = this.input.keyboard.createCursorKeys();

        const heroMarker = this.map.findObject('GameObjects', obj => obj.name === 'Player');
        this.hero = new Hero(this, heroMarker.x, heroMarker.y, 'hero', 0, 'down');
    }

    createEnemy() {
        this.map.filterObjects('GameObjects', obj => obj.name === 'Enemy').forEach(({ x, y }) => {
            this.enemy = new Enemy(this, x, y, 'hero', 4, 'right');
        });
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.hero, true, 0.25, 0.25);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.tileLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.hero, this.tileLayer);
        this.physics.add.collider(this.enemy, this.tileLayer);
    }

    update() {
        this.hero.update();
    }

    playerKilled() {
        // TODO game over
    }
}
