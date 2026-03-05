// Inspired by "Extension functions" from Kotlin; this file adds functions to object prototypes without modifying the prototype's original js code


Phaser.Scene.prototype.createButton = function createButton(text, posX, posY, style, onDown) {
    const textObj = this.add.text(posX, posY, text, style);

    textObj.setOrigin(0.5);
    // TODO textObj.setStroke("#000", 10);
    textObj.setInteractive();

    textObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        textObj.setBackgroundColor(buttonColorOver);
    });

    textObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        textObj.setBackgroundColor(buttonColor);
    });

    textObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, onDown, this);

    return textObj;
};
