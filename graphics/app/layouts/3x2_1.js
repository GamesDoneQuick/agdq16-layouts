/* global define */
define([
    'components/background',
    'components/speedrun'
], function(setBackground, setSpeedRunDimensions) {
    'use strict';

    var LAYOUT_NAME = '3x2_1';

    return function() {
        setBackground(LAYOUT_NAME);
        setSpeedRunDimensions(950, 0, 330, 146);
    };
});
