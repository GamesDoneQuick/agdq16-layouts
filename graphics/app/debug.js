/* global define */
define(function() {
    'use strict';

    var ret = {
        log: function() {
            if (nodecg.bundleConfig.debug) {
                console.debug.apply(console, arguments);
            }
        },
        time: function() {
            if (nodecg.bundleConfig.debug) {
                console.time.apply(console, arguments);
            }
        },
        timeEnd: function() {
            if (nodecg.bundleConfig.debug) {
                console.timeEnd.apply(console, arguments);
            }
        }
    };

    window.debug = ret;

    return ret;
});
