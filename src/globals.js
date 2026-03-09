"use strict";

const urlQueryParams = new URLSearchParams(window.location.search);

const buttonColor = '#2d2d2d';
const buttonColorOver = '#8d8d8d';

const menuTextStyle = {
    fontFamily: 'Helvetica', // FIXME custom font
    color: '#FFF',
    align: 'center'
};

function canvasX(fractX) {
    return game.config.width * fractX;
}

function canvasY(fractY) {
    return game.config.height * fractY;
}

function canvasPos(fractX, fractY) {
    if (fractY == null) {
        fractY = fractX;
    }

    return [canvasX(fractX), canvasY(fractY)]
}

function normalFromDirection(direction) {
    switch (direction) {
        case 'up':
            return new Phaser.Math.Vector2(0, -1);
        case 'right':
            return new Phaser.Math.Vector2(1, 0);
        case 'down':
            return new Phaser.Math.Vector2(0, 1);
        case 'left':
            return new Phaser.Math.Vector2(-1, 0);
    }
    return new Phaser.Math.Vector2(0, 0);
}
