/*
Title: Game Title
Author: Drullkus

Approximate hours spent: 20

EasyStarJS: https://easystarjs.com
EasyStar initialization: https://www.dynetisgames.com/2018/03/06/pathfinding-easystar-phaser-3/
More EasyStar example (used for debugging) https://github.com/ourcade/phaser3-vs-kaboomjs/blob/master/src/astar/phaser/scenes/AStar.ts
Generator functions https://www.w3schools.com/js/js_generators.asp
tracePixelLine https://en.wikipedia.org/wiki/Bresenham%27s_line_algorithm#All_cases
True modulo https://stackoverflow.com/a/4467559
*/

const config = {
    parent: 'postcard-game',
    canvasStyle: 'display: block;', // Set to block, as otherwise it will have a 6-pixel gap underneath

    type: Phaser.WEBGL,
    width: 750, height: 500, // 3:2 ratio
    antialias: true,

    useTicker: true,
    scene: [ new Initialize(urlQueryParams.get('mode')), MainMenu, Crawler, Credits ],

    physics: {
        default: "arcade",
        arcade: {
            debug: true
        }
    },
};

const game = new Phaser.Game(config);
game.finder = new EasyStar.js();
// game.finder.disableDiagonals();

// For easy access via terminal. Access scenes without typing `game.scene.keys.` every time
game.events.once('ready', () => Object.assign(window, game.scene.keys));
