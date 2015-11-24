/* global requirejs, Typekit */
(function() {
    'use strict';

    // Wait until Typekit fonts are loaded before setting up the graphic.
    try {
        Typekit.load({active: init});
    } catch (e) {
        console.error(e);
    }

    function init() {
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
                        layout('3ds');
                        window.layout = layout;
                    }
                );
            });

            createjs.Ticker.timingMode = createjs.Ticker.RAF;
        });
    }
})();
