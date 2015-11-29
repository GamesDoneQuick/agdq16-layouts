/* global requirejs, Typekit */
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

    // Wait until Typekit fonts are loaded before setting up the graphic.
    try {
        Typekit.load({active: init});
    } catch (e) {
        console.error(e);
    }

    function init() {
        requirejs(['preloader', 'globals', 'easel'], function (preloader, globals, createjs) {
            var preloaderDone = false;
            var replicantsDone = false;

            preloader.on('complete', function() {
                preloaderDone = true;
                console.log('preloading complete');
                checkReplicantsAndPreloader();
            });

            if (window.replicantsDeclared) {
                replicantsDone = true;
                console.log('replicants declared');
                checkReplicantsAndPreloader();
            } else {
                document.addEventListener('replicantsDeclared', function() {
                    replicantsDone = true;
                    console.log('replicants declared');
                    checkReplicantsAndPreloader();
                });
            }


            createjs.Ticker.timingMode = createjs.Ticker.RAF;

            function checkReplicantsAndPreloader() {
                if (!preloaderDone || !replicantsDone) return;

                requirejs(
                    [
                        'components/background',
                        'components/speedrun',
                        'components/omnibar',
                        'layout',
                        'obs'
                    ], function(bg, speedrun, omnibar, layout) {
                        layout('3ds');
                        window.layout = layout;
                    }
                );
            }
        });
    }
})();
