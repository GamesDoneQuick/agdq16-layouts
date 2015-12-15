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

        {id: 'bg-interview', src: 'img/backgrounds/interview.png'},

        // Console icons
        {id: 'console-3ds', src: 'img/consoles/3ds.png'},
        {id: 'console-arcade', src: 'img/consoles/arcade.png'},
        {id: 'console-ds', src: 'img/consoles/ds.png'},
        {id: 'console-gameboy', src: 'img/consoles/gameboy.png'},
        {id: 'console-gamecube', src: 'img/consoles/gamecube.png'},
        {id: 'console-gba', src: 'img/consoles/gba.png'},
        {id: 'console-genesis', src: 'img/consoles/genesis.png'},
        {id: 'console-n64', src: 'img/consoles/n64.png'},
        {id: 'console-nes', src: 'img/consoles/nes.png'},
        {id: 'console-pc', src: 'img/consoles/pc.png'},
        {id: 'console-ps1', src: 'img/consoles/ps1.png'},
        {id: 'console-ps2', src: 'img/consoles/ps2.png'},
        {id: 'console-ps3', src: 'img/consoles/ps3.png'},
        {id: 'console-ps4', src: 'img/consoles/ps4.png'},
        {id: 'console-snes', src: 'img/consoles/snes.png'},
        {id: 'console-wii', src: 'img/consoles/wii.png'},
        {id: 'console-wiiu', src: 'img/consoles/wiiu.png'},
        {id: 'console-wiivc', src: 'img/consoles/wiivc.png'},
        {id: 'console-xbox', src: 'img/consoles/xbox.png'},
        {id: 'console-xbox360', src: 'img/consoles/xbox360.png'},
        {id: 'console-xboxone', src: 'img/consoles/xboxone.png'},

        // Omnibar
        {id: 'omnibar-logo-gdq', src: 'img/omnibar/logo-gdq.png'},
        {id: 'omnibar-logo-pcf', src: 'img/omnibar/logo-pcf.png'},

        // Nameplates
        {id: 'nameplate-audio-on', src: 'img/nameplate/audio-on.png'},
        {id: 'nameplate-audio-off', src: 'img/nameplate/audio-off.png'},
        {id: 'nameplate-twitch-logo', src: 'img/nameplate/twitch-logo.png'}
    ]);

    return queue;
});

