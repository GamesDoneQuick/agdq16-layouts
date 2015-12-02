/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, speedrun) {
    'use strict';

    var LAYOUT_NAME = '4x3_3';

    return {
        attached: function() {
            setBackground(LAYOUT_NAME);
            speedrun.configure(442, 154, 396, 179, {
                nameY: 17,
                categoryY: 84,
                showEstimate: true,
                nameMaxHeight: 80
            });
        }
    };
});
