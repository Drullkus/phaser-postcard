// http://127.0.0.1:5500/?mode=creditsScene
class Credits extends Phaser.Scene {
    constructor() {
        super('creditsScene');
    }

    create() {
        this.createCreditsText();

        this.createButton("RETURN TO MENU", ...canvasPos(0.5, 0.9), {
            ...menuTextStyle,
            backgroundColor: buttonColor,
            padding: 10
        }, this.mainMenuClicked);
    }

    createCreditsText() {
        // What did the developer make?
        const smallCreditsStyle = {
            ...menuTextStyle,
            fontSize: `30px`,
        };

        this.infoText = this.add.text(...canvasPos(0.5, 0.4), 'Code\nArt\nDesign\nSound Effects\nproduced by\nDRULLKUS', smallCreditsStyle);
        this.infoText.setStroke("#000", 8);
        this.infoText.setOrigin(0.5);
    }

    mainMenuClicked() {
        this.scene.start('mainMenuScene');
    }
}
