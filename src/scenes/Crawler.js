// http://127.0.0.1:5500/?mode=crawlerScene
// https://drullkus.github.io/phaser-postcard/?mode=crawlerScene
class Crawler extends Phaser.Scene {
    constructor() {
        super('crawlerScene');
    }

    create() {
        this.createMap();

        this.createCharacter();

        this.createEnemies();

        this.setupCamera();

        this.debrisEmitter = this.add.particles(0, 0, 'debris', {
            anim: [0, 1, 2, 3].map(index => `debris-${index}`),
            lifespan: { min: 50, max: 150 },
            speed: { min: 10, max: 100 },
            scale: { min: 0.5, max: 2 },
            rotate: { start: 0, end: 90 },
            emitting: false,
            particleBringToTop: false
        });
    }
    
    createMap() {
        this.map = this.add.tilemap('tilemapJSON');

        this.tileset = this.map.addTilesetImage('postcardtiles', 'tilesetImage');
        this.tileLayer = this.map.createLayer('TileLayer', this.tileset, 0, 0);

        this.initializeFinder();
    }

    initializeFinder() {
        // Adapted from https://www.dynetisgames.com/2018/03/06/pathfinding-easystar-phaser-3/
        var grid = [];
        for (var y = 0; y < this.map.height; y++) {
            var col = [];
            for (var x = 0; x < this.map.width; x++) {
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)
                col.push(this.tileLayer.getTileAt(x, y).index);
            }
            grid.push(col);
        }

        game.finder.setGrid(grid);

        // Setup finder rules
        const tileset = this.tileset;
        const properties = tileset.tileProperties;
        const acceptableTiles = [];

        for (let i = tileset.firstgid-1; i < tileset.total; i++) { // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
            if (!properties.hasOwnProperty(i)) {
                // If there is no property indicated at all, it means it's a walkable tile
                acceptableTiles.push(i+1);
                continue;
            }
            if(!properties[i].collide) acceptableTiles.push(i + 1);
        }
        game.finder.setAcceptableTiles(acceptableTiles);
    }

    createCharacter() {
        // setup keyboard input
        this.keys = this.input.keyboard.createCursorKeys();

        const heroMarker = this.map.findObject('GameObjects', obj => obj.name === 'Player');
        this.hero = new Hero(this, heroMarker.x, heroMarker.y, 'hero', 0, 'down');
    }

    createEnemies() {
        this.enemies = this.map.filterObjects('GameObjects', obj => obj.name === 'Enemy').map(({ x, y }) => new Enemy(this, x, y, 'hero', 4, 'right'));
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(this.hero, true, 0.25, 0.25);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.tileLayer.setCollisionByProperty({ collides: true });
        this.physics.add.collider(this.hero, this.tileLayer);
        this.enemies.forEach(enemy => this.physics.add.collider(enemy, this.tileLayer));
    }

    update() {
        this.hero.update();
        this.enemies.forEach(enemy => enemy.update());
    }

    playerKilled() {
        // TODO game over
    }
}
