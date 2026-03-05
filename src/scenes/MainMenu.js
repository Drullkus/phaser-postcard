class MainMenu extends Phaser.Scene {
    constructor() {
        super('mainMenuScene');
    }

    create() {
        this.createTitle();

        this.playButton = this.createButton("PLAY", ...canvasPos(0.5, 0.6), {
            ...menuTextStyle,
            fontSize: `30px`,
            backgroundColor: buttonColor,
            padding: 10
        }, this.playClicked);

        this.creditsButton = this.createButton("CREDITS", ...canvasPos(0.5, 0.9), {
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

    playClicked() {
        this.scene.start('crawlerScene');
    }

    creditsClicked() {
        this.scene.start('creditsScene');
    }
}
