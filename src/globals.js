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

// Generator functions https://www.w3schools.com/js/js_generators.asp
// Code ported from https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm#All_cases
// Expects tile coordinate integers, returns tile coordinate integers
function* tracePixelLine(x0, y0, x1, y1) {
    // sanitize inputs to be integers
    x0 = Math.floor(x0);
    x1 = Math.floor(x1);
    y0 = Math.floor(y0);
    y1 = Math.floor(y1);

    // Deltas
    const dX = Math.abs(x1 - x0);
    const dY = Math.abs(y1 - y0);
    
    // Steps
    const sX = x0 < x1 ? 1 : -1;
    const sY = y0 < y1 ? 1 : -1;

    let error = dX - dY;
    // Output
    let x = x0;
    let y = y0;

    while (true) {
        yield({ x: x, y: y });

        const e2 = 2 * error;

        if (-e2 <= dY) {
            if (x == x1) break;
            error = error - dY;
            x = x + sX;
        }
        if (e2 <= dX) {
            if (y == y1) break;
            error = error + dX;
            y = y + sY;
        }
    }
}
