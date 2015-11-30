/* global requirejs, Typekit, TweenLite */
(function() {
    'use strict';

    var layoutState = nodecg.Replicant('layoutState');

    // Hack to prevent other instances of the layout from breaking the layoutState.
    // They have a brief window in which to change it before singleInstance kicks them off.
    layoutState.on('declared', function(rep) {
        if (rep.value === 'closed') {
            layoutState.value = 'preloading';

            // Prevent NodeCG restarts from breaking the layoutState.
            layoutState.on('change', function(oldVal, newVal) {
                if (newVal === 'closed') {
                    layoutState.value = 'open';
                }
            });
        }
    });

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

            preloader.on('complete', handlePreloadComplete);

            function handlePreloadComplete() {
                preloader.removeAllEventListeners('complete');
                preloaderDone = true;
                console.log('preloading complete');
                checkReplicantsAndPreloader();
            }

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
                        'obs',
                        'advertisements'
                    ], function(bg, speedrun, omnibar, layout) {
                        layout('3ds');
                        window.layout = layout;
                        layoutState.value = 'open';

                        // Fade up the body once everything is loaded
                        TweenLite.to(document.body, 0.5, {delay: 0.2, opacity: 1, ease: Power1.easeInOut});
                    }
                );
            }
        });
    }
})();
