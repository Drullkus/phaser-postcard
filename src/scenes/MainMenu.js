class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenuScene');
    }

    create() {
        this.createTitle();
    }

    createTitle() {
        const titleStyle = {
            fontSize: `100px`,
            color: '#FFF',
            align: 'center'
        };

        this.titleText = this.add.text(0, 0, "GAME TITLE", titleStyle).setOrigin(0);
    }
}
