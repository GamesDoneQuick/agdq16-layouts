/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = '16x9_2';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.configure(0, 447, 420, 218, {
                nameY: 41,
                categoryY: 133,
                nameMaxHeight: 100
            });
        }
    };
});
