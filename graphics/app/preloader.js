/* global define, createjs */
define(function () {
    'use strict';

    // Preload images
    var queue = new createjs.LoadQueue();
    queue.loadManifest([
        {id: 'bg-4x3_1', src: 'img/backgrounds/4x3_1.png'},
        {id: 'bg-4x3_2', src: 'img/backgrounds/4x3_2.png'},
        {id: 'bg-4x3_3', src: 'img/backgrounds/4x3_3.png'},
        {id: 'bg-4x3_4', src: 'img/backgrounds/4x3_4.png'}
    ]);

    return queue;
});

