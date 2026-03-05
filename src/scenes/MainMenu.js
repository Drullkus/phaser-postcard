class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenuScene');
    }

    create() {
        this.createTitle();

        this.createButton("CREDITS", ...canvasPos(0.5, 0.9), {
            ...menuTextStyle,
            backgroundColor: buttonColor,
            padding: 10
        }, this.creditsClicked);
    }

    createTitle() {
        const titleStyle = {
            ...menuTextStyle,
            fontSize: `81px`,
        };

        this.titleText = this.add.text(...canvasPos(0.5, 0.333), "GAME TITLE", titleStyle);
        this.titleText.setOrigin(0.5);
    }

    creditsClicked() {
        this.scene.start('creditsScene');
    }
}
