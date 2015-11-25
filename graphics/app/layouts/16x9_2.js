/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = '16x9_2';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(0, 447, 420, 218, {
            nameY: 41,
            categoryY: 133
        });
    };
});
