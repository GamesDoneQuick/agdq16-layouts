/* global define, createjs */
define(function () {
    'use strict';

    // Preload images
    var queue = new createjs.LoadQueue();
    queue.setMaxConnections(10);
    queue.loadManifest([
        // Backgrounds
        {id: 'bg-3ds', src: 'img/backgrounds/3ds.png'},

        {id: 'bg-3x2_1', src: 'img/backgrounds/3x2_1.png'},
        {id: 'bg-3x2_2', src: 'img/backgrounds/3x2_2.png'},
        {id: 'bg-3x2_3', src: 'img/backgrounds/4x3_3.png'},
        {id: 'bg-3x2_4', src: 'img/backgrounds/4x3_4.png'},

        {id: 'bg-4x3_1', src: 'img/backgrounds/4x3_1.png'},
        {id: 'bg-4x3_2', src: 'img/backgrounds/4x3_2.png'},
        {id: 'bg-4x3_3', src: 'img/backgrounds/4x3_3.png'},
        {id: 'bg-4x3_4', src: 'img/backgrounds/4x3_4.png'},

        {id: 'bg-16x9_1', src: 'img/backgrounds/16x9_1.png'},
        {id: 'bg-16x9_2', src: 'img/backgrounds/16x9_2.png'},

        {id: 'bg-break', src: 'img/backgrounds/break.png'},

        {id: 'bg-ds', src: 'img/backgrounds/ds.png'},
        {id: 'bg-ds_portrait', src: 'img/backgrounds/ds_portrait.png'},

        // Console icons
        {id: 'console-psp', src: 'img/consoles/psp.png'},

        // Omnibar
        {id: 'omnibar-logo-gdq', src: 'img/omnibar/logo-gdq.png'},
        {id: 'omnibar-logo-pcf', src: 'img/omnibar/logo-pcf.png'},

        // Nameplates
        {id: 'nameplate-music-note', src: 'img/nameplate/music-note.png'},
        {id: 'nameplate-twitch-logo', src: 'img/nameplate/twitch-logo.png'}
    ]);

    return queue;
});

