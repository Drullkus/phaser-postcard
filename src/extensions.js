// Inspired by "Extension functions" from Kotlin; this file adds functions to object prototypes without modifying the prototype's original js code


Phaser.Scene.prototype.createButton = function createButton(text, posX, posY, style, onDown) {
    const buttonTextObj = this.add.text(posX, posY, text, style);

    buttonTextObj.setOrigin(0.5);
    // TODO textObj.setStroke("#000", 10);
    buttonTextObj.setInteractive();

    buttonTextObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        buttonTextObj.setBackgroundColor(buttonColorOver);
    });

    buttonTextObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        buttonTextObj.setBackgroundColor(buttonColor);
    });

    buttonTextObj.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, onDown, this);

    return buttonTextObj;
};
