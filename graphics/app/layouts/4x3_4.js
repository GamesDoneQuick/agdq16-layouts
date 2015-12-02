/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = '4x3_4';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.configure(442, 154, 396, 170, {
                nameY: 20,
                categoryY: 81,
                nameMaxHeight: 70,
                showEstimate: true
            });
        }
    };
});
