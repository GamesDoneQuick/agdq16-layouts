/* global requirejs */
(function() {
    'use strict';

    requirejs.config({
        baseUrl: 'app',
        shim: {
            easel: {
                exports: 'createjs'
            }
        },
        paths: {
            easel: '../components/EaselJS/lib/easeljs-0.8.1.min',
            classes: './classes',
            components: './components',
            layouts: './layouts'
        }
    });

    requirejs(['preloader', 'easel'], function (preloader, createjs) {
        preloader.on('complete', function() {
            requirejs(
                [
                    'components/background',
                    'components/speedrun',
                    'layout'
                ], function(bg, speedrun, layout) {
                    layout('4x3_4');
                }
            );
        });

        createjs.Ticker.timingMode = createjs.Ticker.RAF;
    });
})();

