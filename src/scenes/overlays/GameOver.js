// http://127.0.0.1:5500/?mode=gameOverScene
// https://drullkus.github.io/phaser-postcard/?mode=gameOverScene
class GameOver extends Phaser.Scene {
    constructor() {
        super('gameOverScene');
    }

    create() {
        const gameOverStyle = {
            ...menuTextStyle,
            fontSize: `30px`,
        };

        this.infoText = this.add.text(...canvasPos(0.5, 0.4), 'YOU DIED', gameOverStyle);
        this.infoText.setStroke("#000", 8);
        this.infoText.setOrigin(0.5);

        this.createButton("RETURN TO MENU", ...canvasPos(0.5, 0.9), {
            ...menuTextStyle,
            backgroundColor: buttonColor,
            padding: 10
        }, this.mainMenuClicked);
    }

    mainMenuClicked() {
        this.scene.stop('crawlerScene');
        this.scene.start('mainMenuScene');
    }
}
