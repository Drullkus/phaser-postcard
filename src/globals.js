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
    return [canvasX(fractX), canvasY(fractY)]
}
